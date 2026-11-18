---
title: "Concepts Don't Talk to Each Other — The Sync Engine"
description: 'Post 4 of 8 in Building Legible Software — a series on Concept Design and the WYSIWID pattern'
date: 2026-04-29
series: 'wysiwid-petstore'
order: 4
originalUrl: 'https://medium.com/@daveelkins/concepts-dont-talk-to-each-other-the-sync-engine-ded09cf2f777'
source: 'medium'
tags: []
draft: false
---

_Post 4 of 8 in **Building Legible Software** — a series on Concept Design and the WYSIWID pattern_

---

At the end of [Post 3](/writing/first-concept-pet/) we had a working `Pet` concept: clean, isolated, fully testable.
Zero imports from anything outside its own folder.

Now we need to add `Adoption`.
And immediately we hit the wall.

When an adoption is processed, three things need to happen:

1. The adoption record is created
2. The pet is marked unavailable
3. A confirmation notification is sent to the adopter

But `Adoption` can't call `Pet`.
And it can't call `Notification`.
Concepts don't talk to each other — that's the rule.

The answer is the **sync engine**: a small, explicit coordinator that lives outside all the concepts and wires them together.
This post builds it from scratch.

The full code is on the [companion GitHub repo](https://github.com/dave-elkins/wysiwid-petstore-py/tree/04-sync-engine), branch `04-sync-engine`.

---

## First, the Adoption Concept

Before we can wire things together, we need something to wire.
Let's build `Adoption` following exactly the same shape as `Pet`.

```python
# concepts/adoption/models.py
import uuid
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime
from pydantic import BaseModel
from database import Base

class AdoptionDB(Base):
    __tablename__ = "adoptions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    pet_id: Mapped[str] = mapped_column(String, nullable=False)   # uninterpreted atom
    adopter_name: Mapped[str] = mapped_column(String, nullable=False)
    adopter_email: Mapped[str] = mapped_column(String, nullable=False)
    adopted_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

class AdoptionIn(BaseModel):
    pet_id: str
    adopter_name: str
    adopter_email: str

class AdoptionOut(BaseModel):
    id: str
    pet_id: str
    adopter_name: str
    adopter_email: str
    adopted_at: datetime

    model_config = {"from_attributes": True}

class ActionRecord(BaseModel):
    concept: str
    action: str
    payload: Any

    @classmethod
    def make(cls, concept: str, action: str, payload: Any) -> "ActionRecord":
        return cls(concept=concept, action=action, payload=payload)
```

Notice `pet_id: str`.
Adoption holds a UUID that points to a Pet.
It does not import `PetDB`.
It does not join against the pets table.
It doesn't know what fields a Pet has.
It stores an opaque identifier — an uninterpreted atom — and that's all.

```python
# concepts/adoption/store.py
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from .models import AdoptionDB

def create_adoption(db: Session, pet_id: str, adopter_name: str, adopter_email: str) -> AdoptionDB:
    adoption = AdoptionDB(
        id=str(uuid.uuid4()),
        pet_id=pet_id,
        adopter_name=adopter_name,
        adopter_email=adopter_email,
        adopted_at=datetime.now(timezone.utc),
    )
    db.add(adoption)
    db.commit()
    db.refresh(adoption)
    return adoption

def get_adoption(db: Session, adoption_id: str) -> AdoptionDB | None:
    return db.query(AdoptionDB).filter(AdoptionDB.id == adoption_id).first()
```

And the actions:

```python
# concepts/adoption/actions.py
from sqlalchemy.orm import Session
from .models import AdoptionIn, AdoptionOut, ActionRecord
from . import store

class AdoptionAlreadyExists(Exception):
    pass

async def process(db: Session, data: AdoptionIn) -> ActionRecord:
    """Record a pet adoption."""
    # Adoption's operational principle: one adoption per pet_id.
    # We enforce this here — not in the DB, not in Pet.
    existing = db.query(store.AdoptionDB).filter(
        store.AdoptionDB.pet_id == data.pet_id
    ).first()
    if existing:
        raise AdoptionAlreadyExists(f"Pet {data.pet_id} has already been adopted")

    adoption_db = store.create_adoption(
        db,
        pet_id=data.pet_id,
        adopter_name=data.adopter_name,
        adopter_email=data.adopter_email,
    )
    adoption_out = AdoptionOut.model_validate(adoption_db)
    return ActionRecord.make("adoption", "process", adoption_out)
```

That's it.
`Adoption.process` creates an adoption record and returns an `ActionRecord`.
It does **not** touch Pet.
It does **not** call Notification.
It is completely unaware that either concept exists.

This is where most engineers get uncomfortable.
_"But the pet is still marked available in the database.
That's a bug."_

Yes.
Right now it is.
We're about to fix that — not by modifying `Adoption`, but by building the sync engine.

---

## The ActionRecord (Shared)

In [Post 3](/writing/first-concept-pet/) we put `ActionRecord` inside `concepts/pet/models.py`.
Now that we have two concepts emitting records, it needs to move to shared ground:

```python
# core.py
from pydantic import BaseModel
from typing import Any

class ActionRecord(BaseModel):
    concept: str
    action: str
    payload: Any

    @classmethod
    def make(cls, concept: str, action: str, payload: Any) -> "ActionRecord":
        return cls(concept=concept, action=action, payload=payload)
```

Update `concepts/pet/actions.py` and `concepts/adoption/actions.py` to import from `core` instead of their local `models.py`.
Each concept's `ActionRecord.make()` call now passes its own concept name as the first argument:

```python
# In pet/actions.py
from core import ActionRecord
# ...
return ActionRecord.make("pet", "add", pet_out)

# In adoption/actions.py
from core import ActionRecord
# ...
return ActionRecord.make("adoption", "process", adoption_out)
```

---

## Building the Sync Engine

The sync engine is a small object that:

1. Lets you register **sync rules** — "when concept X fires action Y, call this function"
2. Provides a single `fire()` method that executes an action and triggers any registered rules
3. Handles rule execution after the primary action succeeds

Here it is, in full:

```python
# engine.py
from typing import Callable, Awaitable
from sqlalchemy.orm import Session
from core import ActionRecord

# Type alias for a sync rule handler
SyncHandler = Callable[[Session, ActionRecord], Awaitable[ActionRecord | None]]

class SyncRule:
    def __init__(self, concept: str, action: str, handler: SyncHandler):
        self.concept = concept
        self.action = action
        self.handler = handler

class SyncEngine:
    def __init__(self):
        self._rules: list[SyncRule] = []

    def on(self, concept: str, action: str):
        """Decorator to register a sync rule for a given concept+action pair."""
        def decorator(handler: SyncHandler):
            self._rules.append(SyncRule(concept, action, handler))
            return handler
        return decorator

    async def fire(
        self,
        db: Session,
        action_fn: Callable,
        *args,
        **kwargs
    ) -> ActionRecord:
        """
        Execute an action function, then trigger any sync rules
        registered for the resulting ActionRecord.
        """
        # Execute the primary action
        record = await action_fn(db, *args, **kwargs)

        # Find and execute matching sync rules
        for rule in self._rules:
            if rule.concept == record.concept and rule.action == record.action:
                await rule.handler(db, record)

        return record

# The global engine instance — imported by syncs/ and routers
engine = SyncEngine()
```

That's the entire engine: 40 lines.
No magic.
An `on()` decorator registers a handler for a concept+action pair.
`fire()` executes an action and then calls any matching handlers with the resulting `ActionRecord`.

The key design decision: **sync rules run after the primary action succeeds**.
If `adoption.process` raises an exception, no sync rules fire.
The concepts stay consistent.
(Post 5 covers what happens when a sync rule itself fails — that's where compensating actions come in.)

---

## Writing the Sync Rules

Now we write the actual wiring.
This lives in `syncs/adoption_syncs.py` — outside all concepts, in its own layer:

```python
# syncs/adoption_syncs.py
from sqlalchemy.orm import Session
from core import ActionRecord
from engine import engine
from concepts.pet import actions as pet_actions
from concepts.notification import actions as notification_actions

@engine.on("adoption", "process")
async def sync_mark_pet_unavailable(db: Session, record: ActionRecord) -> None:
    """When an adoption is processed, mark the pet as unavailable."""
    pet_id = record.payload.pet_id
    await pet_actions.mark_unavailable(db, pet_id, reason="adopted")

@engine.on("adoption", "process")
async def sync_send_adoption_confirmation(db: Session, record: ActionRecord) -> None:
    """When an adoption is processed, send a confirmation to the adopter."""
    await notification_actions.send(
        db,
        recipient_email=record.payload.adopter_email,
        subject="Adoption confirmed!",
        body=f"Hi {record.payload.adopter_name}, your adoption has been confirmed.",
    )
```

Read this out loud: _"When adoption.process fires, mark the pet unavailable.
When adoption.process fires, send a confirmation notification."_

That's what the code says.
Literally.
You don't need to trace through service classes or chase imports.
The entire story of what happens when an adoption is processed lives in this file, in plain English.

Notice what the sync rules import: `concepts.pet.actions` and `concepts.notification.actions`.
The sync layer **is allowed** to import from concepts — it's the one place where cross-concept knowledge is permitted, because that's its entire job.
Concepts import nothing outside themselves.
The sync layer imports only action modules.
That's the full dependency rule for the system.

```python
concepts/*  →  imports nothing outside their own folder
syncs/*     →  imports from concepts/*/actions.py only
routers/*   →  imports from concepts/*/actions.py and engine.py
engine.py   →  imports from core.py only
```

---

## Updating the Router to Use fire()

The adoption router now calls `engine.fire()` instead of calling actions directly.
This is what triggers the sync rules:

```python
# concepts/adoption/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from engine import engine
from .models import AdoptionIn, AdoptionOut
from . import actions

router = APIRouter(prefix="/adoptions", tags=["adoptions"])

@router.post("/", response_model=AdoptionOut, status_code=201)
async def process_adoption(data: AdoptionIn, db: Session = Depends(get_db)):
    try:
        record = await engine.fire(db, actions.process, data)
        return record.payload
    except actions.AdoptionAlreadyExists:
        raise HTTPException(status_code=409, detail="This pet has already been adopted")
```

The router calls `engine.fire(db, actions.process, data)` instead of `actions.process(db, data)` directly.
That single change is what activates the sync rules.
Everything else stays the same.

---

## Wire Everything Together

Update `main.py` to register the routers and — critically — import the sync rules so they register themselves with the engine:

```python
# main.py
from fastapi import FastAPI
from database import engine as db_engine, Base
from concepts.pet.router import router as pet_router
from concepts.adoption.router import router as adoption_router

# Import syncs to register them with the engine
import syncs.adoption_syncs  # noqa: F401

Base.metadata.create_all(bind=db_engine)

app = FastAPI(title="Pet Store")
app.include_router(pet_router)
app.include_router(adoption_router)
```

The `import syncs.adoption_syncs` line is the registration mechanism.
When this module is imported, the `@engine.on(...)` decorators run and register their handlers.
No explicit registration call needed — the decorator handles it.
The `# noqa: F401` suppresses linter warnings about an "unused" import.

---

## What We Have Now

Let's trace what happens when `POST /adoptions/` is called:

```python
1. Router receives request, calls engine.fire(db, adoption.process, data)
2. engine.fire() calls adoption.process(db, data)
3. adoption.process() creates the adoption record, returns ActionRecord("adoption", "process", adoption_out)
4. engine.fire() finds two registered rules for ("adoption", "process")
5. Rule 1: sync_mark_pet_unavailable() calls pet.mark_unavailable(db, pet_id)
6. Rule 2: sync_send_adoption_confirmation() calls notification.send(db, ...)
7. engine.fire() returns the original ActionRecord to the router
8. Router returns the adoption payload to the caller
```

The pet is now marked unavailable.
The notification is sent.
The adoption is recorded.
And `Adoption` never knew any of it happened.

The project structure now looks like this:

```python
petstore/
  concepts/
    pet/
      actions.py, models.py, store.py, router.py
    adoption/
      actions.py, models.py, store.py, router.py
    notification/
      actions.py, models.py, store.py, router.py
  syncs/
    adoption_syncs.py    ← "when adoption fires, then..."
  core.py                ← ActionRecord
  engine.py              ← SyncEngine
  database.py
  main.py
```

Adding a new feature that reacts to adoptions?
You add a new `@engine.on("adoption", "process")` handler in `syncs/adoption_syncs.py`.
You do not touch `Adoption`.
You do not touch `Pet`.
You do not touch any existing sync rule.
The existing system is not modified — it's extended.

That's the promise of this architecture.
And now you can see exactly how it's kept.

---

## What's Next

Right now, if `sync_mark_pet_unavailable` succeeds but `sync_send_adoption_confirmation` raises an exception, the pet is marked unavailable but no email goes out.
The system is in an inconsistent state.

Post 5 introduces **guards** and **compensating actions** — the mechanisms for preventing invalid operations before they happen, and for rolling back cleanly when a sync chain fails partway through.

---

Next up: Post 5 — Guards, Prohibitions, and Business Rules That Actually Live Somewhere

## References

- Daniel Jackson, [The Essence of Software](https://essenceofsoftware.com)
- Meng & Jackson, ["What You See Is What It Does"](https://arxiv.org/html/2508.14511v2)
