---
title: 'Your First WYSIWID Concept — Pet in Python'
description: 'Post 3 of 8 in Building Legible Software — a series on Concept Design and the WYSIWID pattern'
date: 2026-05-15
series: 'wysiwid-petstore'
order: 3
originalUrl: 'https://medium.com/@daveelkins/your-first-wysiwid-concept-pet-in-python-1ad4e62a9375'
source: 'medium'
tags: []
draft: false
---

_Post 3 of 8 in **Building Legible Software** — a series on Concept Design and the WYSIWID pattern_

---

In Post 2 we designed the pet store on paper — five concepts, each with a clear purpose, operational principle, and list of actions.
Now we build the first one.

We're starting with `Pet` because it's the simplest concept in the system: no coordination with other concepts, no sync rules yet, just pure state and actions.
By the end of this post you'll have a fully working, tested `Pet` concept wired into FastAPI with a real SQLite database.

More importantly, you'll understand the folder structure and code shape that every concept in the system will follow.
Posts 4–7 add concepts and sync rules on top of exactly this foundation.

The full code is on the [companion GitHub repo](https://github.com/dave-elkins/wysiwid-petstore-py/tree/03-first-concept-pet), branch `03-first-concept-pet`.

---

## The Folder Structure

Here's the project layout we're building toward:

```python
petstore/
  concepts/
    pet/
      __init__.py
      actions.py      ← the concept's public interface
      models.py       ← Pydantic models (in, out, DB row)
      store.py        ← database operations (private to the concept)
      router.py       ← FastAPI routes (thin wrapper over actions)
  syncs/              ← empty for now, populated in Post 4
  database.py         ← SQLAlchemy engine and session setup
  main.py             ← FastAPI app wiring
```

The key discipline: **everything inside `concepts/pet/` is private to Pet**.
Nothing outside this folder imports from `store.py` or touches the Pet database table directly.
The only public surface is `actions.py`.

---

## Database Setup

First, the boilerplate.
SQLAlchemy with SQLite, nothing unusual here:

```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

SQLALCHEMY_DATABASE_URL = "sqlite:///./petstore.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # needed for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## The Models

Every concept has three model types.
This is the WYSIWID pattern's convention, and it's worth being strict about:

- **DB model** — the SQLAlchemy row. Private to the concept's `store.py`. Never returned from an action directly.
- **Input model (In)** — what callers pass to an action. Validated by Pydantic.
- **Output model (Out)** — what an action returns. The concept's public data shape.

```python
# concepts/pet/models.py
import uuid
from enum import Enum
from sqlalchemy import Column, String
from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel, Field
from database import Base

class PetStatus(str, Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"

# --- DB Model (private to store.py) ---

class PetDB(Base):
    __tablename__ = "pets"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    species: Mapped[str] = mapped_column(String, nullable=False)
    breed: Mapped[str] = mapped_column(String, nullable=True)
    age_years: Mapped[float] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(String, default=PetStatus.AVAILABLE)

# --- Pydantic Models (public) ---

class PetIn(BaseModel):
    name: str
    species: str
    breed: str | None = None
    age_years: float | None = None

class PetOut(BaseModel):
    id: str
    name: str
    species: str
    breed: str | None
    age_years: float | None
    status: PetStatus

    model_config = {"from_attributes": True}

class PetStatusUpdate(BaseModel):
    reason: str | None = None
```

A few things worth noting:

`PetDB` never leaves `concepts/pet/`.
The rest of the system — routes, sync rules, other concepts — only ever sees `PetOut`.
This matters because it means you can change the database schema for Pet without breaking anything outside the concept boundary, as long as `PetOut` stays stable.

`PetOut` has `model_config = {"from_attributes": True}` so Pydantic can construct it directly from a SQLAlchemy row.
This is the bridge between the DB layer and the public layer — and it lives inside the concept, not outside it.

---

## The Store

The store is the concept's private data layer.
It knows about `PetDB` and talks to the database.
Nothing outside `concepts/pet/` should ever call store functions directly.

```python
# concepts/pet/store.py
import uuid
from sqlalchemy.orm import Session
from .models import PetDB, PetStatus

def create_pet(db: Session, name: str, species: str, breed: str | None, age_years: float | None) -> PetDB:
    pet = PetDB(
        id=str(uuid.uuid4()),
        name=name,
        species=species,
        breed=breed,
        age_years=age_years,
        status=PetStatus.AVAILABLE,
    )
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet

def get_pet(db: Session, pet_id: str) -> PetDB | None:
    return db.query(PetDB).filter(PetDB.id == pet_id).first()

def get_all_pets(db: Session, status: PetStatus | None = None) -> list[PetDB]:
    query = db.query(PetDB)
    if status:
        query = query.filter(PetDB.status == status)
    return query.all()

def set_pet_status(db: Session, pet_id: str, status: PetStatus) -> PetDB | None:
    pet = get_pet(db, pet_id)
    if pet:
        pet.status = status
        db.commit()
        db.refresh(pet)
    return pet

def delete_pet(db: Session, pet_id: str) -> bool:
    pet = get_pet(db, pet_id)
    if not pet:
        return False
    db.delete(pet)
    db.commit()
    return True
```

This is deliberately boring.
No business logic lives here — just database operations.
Business logic lives in `actions.py`.

---

## The ActionRecord

Before we write the actions, we need to introduce one key concept from the WYSIWID pattern: the **ActionRecord**.

Every action returns an `ActionRecord` — a typed record of what happened.
This isn't just a response payload for the API.
It's the mechanism the sync layer uses to know that something occurred and react to it.
When Post 4 introduces sync rules, those rules will listen for specific `ActionRecord` types and trigger downstream actions in response.

For now, think of it as a structured event that an action emits when it completes:

```python
# concepts/pet/models.py (add to the bottom)
from pydantic import BaseModel
from typing import Any

class ActionRecord(BaseModel):
    concept: str
    action: str
    payload: Any

    @classmethod
    def make(cls, action: str, payload: Any) -> "ActionRecord":
        return cls(concept="pet", action=action, payload=payload)
```

Every concept will have its own `ActionRecord.make()` helper.
The `concept` and `action` fields are what the sync engine uses to route events.
The `payload` carries the data — typically the `Out` model of whatever was affected.

---

## The Actions

This is the concept's public interface.
Actions are the only thing the outside world calls.
Each action:

1. Validates its inputs (via Pydantic, done before the call)
2. Enforces the concept's operational principle (raises if invariants would be violated)
3. Calls the store to mutate state
4. Returns an `ActionRecord`

```python
# concepts/pet/actions.py
from sqlalchemy.orm import Session
from .models import PetIn, PetOut, PetStatus, ActionRecord
from . import store

class PetNotFound(Exception):
    pass

class PetNotAvailable(Exception):
    pass

async def add(db: Session, data: PetIn) -> ActionRecord:
    """Add a new pet to the store inventory."""
    pet_db = store.create_pet(
        db,
        name=data.name,
        species=data.species,
        breed=data.breed,
        age_years=data.age_years,
    )
    pet_out = PetOut.model_validate(pet_db)
    return ActionRecord.make("add", pet_out)

async def remove(db: Session, pet_id: str) -> ActionRecord:
    """Remove a pet from the store entirely."""
    pet_db = store.get_pet(db, pet_id)
    if not pet_db:
        raise PetNotFound(f"Pet {pet_id} not found")

    pet_out = PetOut.model_validate(pet_db)  # capture before deletion
    store.delete_pet(db, pet_id)
    return ActionRecord.make("remove", pet_out)

async def mark_unavailable(db: Session, pet_id: str, reason: str | None = None) -> ActionRecord:
    """Mark a pet as unavailable (adopted, sick, reserved, etc.)."""
    pet_db = store.get_pet(db, pet_id)
    if not pet_db:
        raise PetNotFound(f"Pet {pet_id} not found")
    if pet_db.status == PetStatus.UNAVAILABLE:
        raise PetNotAvailable(f"Pet {pet_id} is already unavailable")

    updated = store.set_pet_status(db, pet_id, PetStatus.UNAVAILABLE)
    pet_out = PetOut.model_validate(updated)
    return ActionRecord.make("mark_unavailable", pet_out)

async def mark_available(db: Session, pet_id: str) -> ActionRecord:
    """Mark a previously unavailable pet as available again."""
    pet_db = store.get_pet(db, pet_id)
    if not pet_db:
        raise PetNotFound(f"Pet {pet_id} not found")

    updated = store.set_pet_status(db, pet_id, PetStatus.AVAILABLE)
    pet_out = PetOut.model_validate(updated)
    return ActionRecord.make("mark_available", pet_out)

async def get(db: Session, pet_id: str) -> PetOut:
    """Get a single pet by ID. Not an action — no ActionRecord."""
    pet_db = store.get_pet(db, pet_id)
    if not pet_db:
        raise PetNotFound(f"Pet {pet_id} not found")
    return PetOut.model_validate(pet_db)

async def list_all(db: Session, status: PetStatus | None = None) -> list[PetOut]:
    """List pets, optionally filtered by status. Not an action — no ActionRecord."""
    pets = store.get_all_pets(db, status)
    return [PetOut.model_validate(p) for p in pets]
```

A few things worth pausing on:

**Only state-mutating operations return `ActionRecord`.** Read operations (`get`, `list_all`) return the data directly.
The sync layer only needs to react to mutations — reads don't change state, so nothing needs to listen for them.

**Exceptions are concept-specific.** `PetNotFound` and `PetNotAvailable` are defined in this module.
The router will catch them and translate them to HTTP responses.
Other concepts never see these exceptions — if they need to handle the absence of a pet, they work through the sync layer, not by catching Pet's exceptions directly.

**The operational principle lives here.** The check `if pet_db.status == PetStatus.UNAVAILABLE: raise PetNotAvailable` in `mark_unavailable` is the concept enforcing its own invariant.
A pet cannot be double-marked unavailable.
That rule lives in one place and is tested in one place.

---

## The Router

The router is a thin HTTP wrapper over the actions.
It does three things: parse the request, call the action, handle errors.
No business logic.

```python
# concepts/pet/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from .models import PetIn, PetOut, PetStatus, PetStatusUpdate
from . import actions

router = APIRouter(prefix="/pets", tags=["pets"])

@router.post("/", response_model=PetOut, status_code=201)
async def add_pet(data: PetIn, db: Session = Depends(get_db)):
    record = await actions.add(db, data)
    return record.payload

@router.delete("/{pet_id}", status_code=204)
async def remove_pet(pet_id: str, db: Session = Depends(get_db)):
    try:
        await actions.remove(db, pet_id)
    except actions.PetNotFound:
        raise HTTPException(status_code=404, detail="Pet not found")

@router.patch("/{pet_id}/unavailable", response_model=PetOut)
async def mark_unavailable(pet_id: str, data: PetStatusUpdate, db: Session = Depends(get_db)):
    try:
        record = await actions.mark_unavailable(db, pet_id, data.reason)
        return record.payload
    except actions.PetNotFound:
        raise HTTPException(status_code=404, detail="Pet not found")
    except actions.PetNotAvailable:
        raise HTTPException(status_code=409, detail="Pet is already unavailable")

@router.patch("/{pet_id}/available", response_model=PetOut)
async def mark_available(pet_id: str, db: Session = Depends(get_db)):
    try:
        record = await actions.mark_available(db, pet_id)
        return record.payload
    except actions.PetNotFound:
        raise HTTPException(status_code=404, detail="Pet not found")

@router.get("/{pet_id}", response_model=PetOut)
async def get_pet(pet_id: str, db: Session = Depends(get_db)):
    try:
        return await actions.get(db, pet_id)
    except actions.PetNotFound:
        raise HTTPException(status_code=404, detail="Pet not found")

@router.get("/", response_model=list[PetOut])
async def list_pets(status: PetStatus | None = None, db: Session = Depends(get_db)):
    return await actions.list_all(db, status)
```

Notice the router never imports `store.py`.
It doesn't know Pet has a database.
It doesn't know what `PetDB` looks like.
It calls actions, handles their exceptions, and returns their payloads.
That's it.

---

## Wiring It Together

```python
# main.py
from fastapi import FastAPI
from database import engine, Base
from concepts.pet.router import router as pet_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pet Store")
app.include_router(pet_router)
```

Run it:

```bash
pip install fastapi sqlalchemy uvicorn pydantic
uvicorn main:app --reload
```

Visit `http://localhost:8000/docs` and you have a working, interactive pet inventory API.

---

## A Note on Uninterpreted Atoms

Look back at the `Adoption` concept from Post 2.
Its state includes `pet_id: str`.
That's it — just a string UUID.
Adoption doesn't import `PetDB`.
It doesn't join against the pets table.
It doesn't know what fields a Pet has.

This is what Jackson calls an **uninterpreted atom** — a reference to an entity from another concept that the referencing concept treats as an opaque identifier.
It doesn't interpret it.
It doesn't look it up.
It just stores it and passes it around.

This is how concept independence is maintained across the database layer.
Each concept has its own tables.
Cross-concept references are foreign keys in the logical sense (one concept refers to another's IDs) but not in the database sense — we don't declare `FOREIGN KEY (pet_id) REFERENCES pets(id)` in the Adoption table.
Referential integrity across concepts is the sync layer's responsibility, not the database's.

This will feel wrong to anyone who's spent years designing normalized relational schemas.
But it's the right tradeoff: you get genuine independence between concepts, and the sync layer becomes the explicit, auditable place where cross-concept consistency is maintained.

---

## What We Have Now

A `Pet` concept that:

- Owns its own state in its own database table
- Exposes four named actions, each enforcing the operational principle
- Returns `ActionRecord` from every mutation — ready for the sync layer
- Has zero imports from any other concept
- Is fully testable in isolation

The folder:

```python
concepts/pet/
  __init__.py
  actions.py     ← public interface
  models.py      ← PetIn, PetOut, PetDB, ActionRecord
  store.py       ← private DB operations
  router.py      ← HTTP wrapper
```

In the next post, we add the `Adoption` concept and then confront the misfit we identified in Post 2: when an adoption is processed, Pet needs to be marked unavailable — but Adoption can't call Pet.
That's where the sync engine comes in.

---

Next up: Post 4 — Concepts Don't Talk to Each Other: The Sync Engine

## References

- Daniel Jackson, [The Essence of Software](https://essenceofsoftware.com)
- Meng & Jackson, ["What You See Is What It Does"](https://arxiv.org/html/2508.14511v2)
