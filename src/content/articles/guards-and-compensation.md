---
title: 'Guards, Prohibitions, and Business Rules That Actually Live Somewhere'
description: 'Post 5 of 8 in Building Legible Software — a series on Concept Design and the WYSIWID pattern'
date: 2026-06-30
series: 'wysiwid-petstore'
order: 5
originalUrl: 'https://medium.com/@daveelkins/guards-prohibitions-and-business-rules-that-actually-live-somewhere-b263fdaacf42'
source: 'medium'
tags: [concept-design, sync, wysiwid, python]
draft: false
---

_Post 5 of 8 in **Building Legible Software** — a series on Concept Design and the WYSIWID pattern_

---

[Post 4](/writing/sync-engine/) ended with an honest admission: the sync engine as built has a partial-failure problem.
If `sync_mark_pet_unavailable` succeeds but `sync_send_adoption_confirmation` raises an exception, the pet is marked unavailable but the adopter never gets their email.
The system is in an inconsistent state with no way to recover.

We'll fix that in this post with **compensating actions**.

But first we need to talk about a different class of problem: operations that should never have been allowed to start.
That's the job of **guards**.

Guards and compensating actions are two sides of the same coin.
Guards are pre-conditions — they prevent invalid operations before state changes.
Compensating actions are post-conditions — they restore consistency when something goes wrong mid-chain.
Together they're how you make a sync-based architecture robust.

The full code is on the companion [GitHub repo](https://github.com/dave-elkins/wysiwid-petstore-py/tree/05-guards-and-compensation), branch `05-guards-and-compensation`.

---

## The Problem Guards Solve

Right now, nothing stops a caller from submitting an adoption for a pet that's already unavailable.
The `Adoption` concept enforces its own operational principle — one adoption per `pet_id` — but it has no way to check whether the pet is actually available.
It can't.
It doesn't know what Pet is.

This sequence is currently possible:

```python
POST /adoptions/  { pet_id: "abc-123", ... }  → 201 Created
POST /adoptions/  { pet_id: "abc-123", ... }  → 409 (AdoptionAlreadyExists — caught by Adoption)
PATCH /pets/abc-123/unavailable               → 200 (pet marked unavailable directly)
POST /adoptions/  { pet_id: "xyz-789", ... }  → 201 Created  ← but xyz-789 is already sick!
```

The third scenario is the bad one.
A pet marked unavailable via the Pet concept's own `mark_unavailable` action — maybe it's sick, maybe it's reserved — can still be adopted, because Adoption only checks its own records, not Pet's status.

This is a **misfit**: a constraint that spans two concepts, which means neither concept can enforce it alone.
The sync layer is where cross-concept constraints live — including the ones that prevent operations, not just the ones that react to them.

---

## Adding Guards to the Engine

A guard is a function that runs before an action fires.
If it raises, the action is blocked.
If it passes, the action proceeds normally.

Let's extend the engine:

```python
# engine.py
from typing import Callable, Awaitable
from sqlalchemy.orm import Session
from core import ActionRecord

SyncHandler = Callable[[Session, ActionRecord], Awaitable[None]]
GuardHandler = Callable[[Session, dict], Awaitable[None]]

class SyncRule:
    def __init__(self, concept: str, action: str, handler: SyncHandler):
        self.concept = concept
        self.action = action
        self.handler = handler

class GuardRule:
    def __init__(self, concept: str, action: str, handler: GuardHandler):
        self.concept = concept
        self.action = action
        self.handler = handler

class SyncEngine:
    def __init__(self):
        self._rules: list[SyncRule] = []
        self._guards: list[GuardRule] = []

    def on(self, concept: str, action: str):
        """Register a sync rule — runs after action succeeds."""
        def decorator(handler: SyncHandler):
            self._rules.append(SyncRule(concept, action, handler))
            return handler
        return decorator

    def guard(self, concept: str, action: str):
        """Register a guard — runs before action, blocks it if it raises."""
        def decorator(handler: GuardHandler):
            self._guards.append(GuardRule(concept, action, handler))
            return handler
        return decorator

    async def fire(
        self,
        db: Session,
        concept: str,
        action: str,
        action_fn: Callable,
        *args,
        **kwargs
    ) -> ActionRecord:
        # Run guards first — any exception blocks the action
        for guard in self._guards:
            if guard.concept == concept and guard.action == action:
                await guard.handler(db, kwargs)

        # Execute the primary action
        record = await action_fn(db, *args, **kwargs)

        # Run sync rules
        for rule in self._rules:
            if rule.concept == record.concept and rule.action == record.action:
                await rule.handler(db, record)

        return record

engine = SyncEngine()
```

Two changes: a `guard()` decorator that registers pre-action handlers, and `fire()` now takes `concept` and `action` strings explicitly so guards can be matched before the `ActionRecord` exists.
Guards receive the raw kwargs — the input data — because they run before the action has produced any output.

---

## A Within-Concept Guard: Appointment Double-Booking

Before tackling the cross-concept case, let's look at a guard that lives within a single concept.
The `Appointment` concept's operational principle says no two appointments for the same pet can overlap.
This is enforced inside Appointment itself — no cross-concept knowledge needed.

```python
# concepts/appointment/actions.py
from sqlalchemy.orm import Session
from .models import AppointmentIn, AppointmentOut, AppointmentDB, ActionRecord
from . import store
from datetime import datetime, timedelta

class SlotNotAvailable(Exception):
    pass

async def book(db: Session, data: AppointmentIn) -> ActionRecord:
    """Book an appointment for a customer to meet a pet."""
    # Check for overlapping appointments — within-concept guard logic
    slot_end = data.timeslot + timedelta(hours=1)
    overlapping = db.query(AppointmentDB).filter(
        AppointmentDB.pet_id == data.pet_id,
        AppointmentDB.timeslot >= data.timeslot,
        AppointmentDB.timeslot < slot_end,
        AppointmentDB.status == "booked",
    ).first()

    if overlapping:
        raise SlotNotAvailable(
            f"Pet {data.pet_id} already has an appointment at {data.timeslot}"
        )

    appt_db = store.create_appointment(db, data)
    appt_out = AppointmentOut.model_validate(appt_db)
    return ActionRecord.make("appointment", "book", appt_out)
```

This guard lives directly in `actions.py` because it only touches `Appointment`'s own state.
It doesn't need the engine — it's just a check before the mutation.
This is the right place for within-concept constraints: inside the action, before the store call.

The rule of thumb: **if a guard only reads from one concept's own state, put it in the action.
If it needs to read from another concept's state, put it in the sync layer via `engine.guard()`.**

---

## A Cross-Concept Guard: Preventing Adoption of Unavailable Pets

Now the harder case.
We want to prevent `adoption.process` from firing if the target pet is unavailable.
But `Adoption` can't check Pet's status.
The guard lives in the sync layer:

```python
# syncs/adoption_syncs.py
from sqlalchemy.orm import Session
from core import ActionRecord
from engine import engine
from concepts.pet import actions as pet_actions
from concepts.pet.models import PetStatus
from concepts.pet import store as pet_store
from concepts.adoption.models import AdoptionIn
from concepts.notification import actions as notification_actions

class PetNotAvailableForAdoption(Exception):
    pass

@engine.guard("adoption", "process")
async def guard_pet_must_be_available(db: Session, kwargs: dict) -> None:
    """Block adoption.process if the target pet is not available."""
    data: AdoptionIn = kwargs.get("data")
    pet = pet_store.get_pet(db, data.pet_id)

    if not pet:
        raise PetNotAvailableForAdoption(
            f"Pet {data.pet_id} does not exist"
        )
    if pet.status != PetStatus.AVAILABLE:
        raise PetNotAvailableForAdoption(
            f"Pet {data.pet_id} is not available for adoption"
        )

@engine.on("adoption", "process")
async def sync_mark_pet_unavailable(db: Session, record: ActionRecord) -> None:
    """When an adoption is processed, mark the pet as unavailable."""
    await pet_actions.mark_unavailable(db, record.payload.pet_id, reason="adopted")

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

Now `adoption.process` is guarded at the sync layer.
Before the adoption is created, the engine checks Pet's status.
If the pet doesn't exist or isn't available, the guard raises `PetNotAvailableForAdoption` and the action never fires.

Update the router to handle the new exception:

```python
# concepts/adoption/router.py
from syncs.adoption_syncs import PetNotAvailableForAdoption

@router.post("/", response_model=AdoptionOut, status_code=201)
async def process_adoption(data: AdoptionIn, db: Session = Depends(get_db)):
    try:
        record = await engine.fire(db, "adoption", "process", actions.process, data=data)
        return record.payload
    except actions.AdoptionAlreadyExists:
        raise HTTPException(status_code=409, detail="This pet has already been adopted")
    except PetNotAvailableForAdoption as e:
        raise HTTPException(status_code=409, detail=str(e))
```

The cross-concept constraint now has a home.
It's not buried in `AdoptionService`.
It's not duplicated across three controllers.
It's in `syncs/adoption_syncs.py`, directly next to the sync rules it protects.

---

## Compensating Actions: When the Sync Chain Fails Mid-Flight

Now for the partial-failure problem from Post 4.
Our sync chain for `adoption.process` is:

```python
1. adoption.process         ← primary action
2. pet.mark_unavailable     ← sync rule 1
3. notification.send        ← sync rule 2
```

If step 2 succeeds and step 3 raises, we have an adoption record and an unavailable pet but no confirmation email.
The system is inconsistent.

The solution is a **compensating action** — a function that undoes a sync rule's effects if something downstream fails.
We extend the engine to support them:

```python
# engine.py (updated SyncRule and fire())

class SyncRule:
    def __init__(
        self,
        concept: str,
        action: str,
        handler: SyncHandler,
        compensate: SyncHandler | None = None,   # ← new
    ):
        self.concept = concept
        self.action = action
        self.handler = handler
        self.compensate = compensate

class SyncEngine:
    # ... (guards and on() decorator unchanged)

    def on(self, concept: str, action: str, compensate: SyncHandler | None = None):
        """Register a sync rule with an optional compensating action."""
        def decorator(handler: SyncHandler):
            self._rules.append(SyncRule(concept, action, handler, compensate))
            return handler
        return decorator

    async def fire(self, db: Session, concept: str, action: str, action_fn, *args, **kwargs) -> ActionRecord:
        # Run guards
        for guard in self._guards:
            if guard.concept == concept and guard.action == action:
                await guard.handler(db, kwargs)

        # Execute primary action
        record = await action_fn(db, *args, **kwargs)

        # Execute sync rules with compensation on failure
        executed: list[SyncRule] = []
        try:
            for rule in self._rules:
                if rule.concept == record.concept and rule.action == record.action:
                    await rule.handler(db, record)
                    executed.append(rule)
        except Exception as sync_error:
            # A sync rule failed — compensate in reverse order
            for completed_rule in reversed(executed):
                if completed_rule.compensate:
                    try:
                        await completed_rule.compensate(db, record)
                    except Exception as comp_error:
                        # Log but don't swallow — compensation itself failed
                        print(f"Compensation failed for {completed_rule.handler.__name__}: {comp_error}")
            raise sync_error  # re-raise the original error

        return record
```

When a sync rule fails, the engine walks backwards through the rules that already succeeded and calls their compensating functions.
It's a simplified saga pattern — local to this request, no distributed transaction needed.

Now we attach a compensating action to the pet unavailability sync rule:

```python
# syncs/adoption_syncs.py

async def _undo_mark_pet_unavailable(db: Session, record: ActionRecord) -> None:
    """Compensate: if the adoption sync chain fails, re-mark the pet as available."""
    await pet_actions.mark_available(db, record.payload.pet_id)

@engine.on(
    "adoption",
    "process",
    compensate=_undo_mark_pet_unavailable   # ← attach the compensator
)
async def sync_mark_pet_unavailable(db: Session, record: ActionRecord) -> None:
    """When an adoption is processed, mark the pet as unavailable."""
    await pet_actions.mark_unavailable(db, record.payload.pet_id, reason="adopted")

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

Now trace the failure scenario:

```python
1. adoption.process                     ✓  adoption record created
2. sync_mark_pet_unavailable            ✓  pet marked unavailable, added to executed[]
3. sync_send_adoption_confirmation      ✗  notification service is down, raises
4. Engine walks executed[] in reverse
5. _undo_mark_pet_unavailable           ✓  pet re-marked available
6. Original exception re-raised to router
7. Router returns 500 to caller
```

The system stays consistent.
No orphaned unavailable pet.
The caller gets an error and can retry.

A few honest caveats before you ship this in production:

**Compensating actions are not transactions.** Between step 2 succeeding and step 5 running, there's a window where the pet is unavailable and the adoption hasn't been confirmed.
Another concurrent request could see that state.
If you need strict consistency, you want a database transaction wrapping the whole chain — but that trades off the concepts' database independence.
For most applications, the compensation window is acceptable.
For financial or inventory-critical systems, you'll want to think harder.

**Compensation can fail.** The engine logs and continues if `_undo_mark_pet_unavailable` itself raises.
In production, you'd send this to an alerting system and queue a background retry.
The code above is the right structure — just replace the `print` with your observability stack.

**Not everything needs a compensating action.** `sync_send_adoption_confirmation` doesn't need one — you can't un-send an email.
If notification fails, the right response is to retry it, not to undo the adoption.
Compensation is for side effects you can actually reverse.

---

## What the Sync Layer Looks Like Now

```python
# syncs/adoption_syncs.py — the full picture

@engine.guard("adoption", "process")
async def guard_pet_must_be_available(db, kwargs): ...

@engine.on("adoption", "process", compensate=_undo_mark_pet_unavailable)
async def sync_mark_pet_unavailable(db, record): ...

@engine.on("adoption", "process")
async def sync_send_adoption_confirmation(db, record): ...
```

Three decorated functions.
The complete story of what happens around `adoption.process` — what's prevented, what's triggered, and what's undone if things go wrong — in one file, in reading order, with no service classes to hunt through.

That's the business logic having a real address.

---

## What's Next

Post 6 tackles the read side of the architecture.
We have five independent concepts with their own tables.
Now a product manager asks for a dashboard showing available pets, upcoming appointments, and recent adoptions on one screen.
Querying across concepts directly would couple them — so instead we build a **View Concept**: a dedicated read model maintained by sync rules.

---

Next up: Post 6 — View Concepts: Reading Across Features Without Coupling Them

## References

- Daniel Jackson, [The Essence of Software](https://essenceofsoftware.com)
- Meng & Jackson, ["What You See Is What It Does"](https://arxiv.org/html/2508.14511v2)
