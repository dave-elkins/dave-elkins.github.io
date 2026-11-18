---
title: 'Refactoring With Design Moves — Split, Merge, Lift'
description: 'Post 7 of 8 in Building Legible Software — a series on Concept Design and the WYSIWID pattern'
date: 2026-04-29
series: 'wysiwid-petstore'
order: 7
tags: []
draft: false
---

_Post 7 of 8 in **Building Legible Software** — a series on Concept Design and the WYSIWID pattern_

---

Six posts in, the pet store is working.
Five concepts, a sync engine, guards, compensating actions, two view concepts.
Clean, testable, every feature in its own folder.

Then a product requirement arrives.

The store wants to introduce a **reservation** flow.
Customers should be able to reserve a pet for 48 hours — holding it off the market while they arrange their home inspection or talk to their family — before committing to a full adoption.
If they don't complete the adoption within 48 hours, the reservation expires and the pet becomes available again.

Right now, `Adoption` handles everything: a pet either gets adopted or it doesn't.
There's no intermediate state.
The new flow has three stages: available → reserved → adopted.
Or available → reserved → expired → available again.

This doesn't fit in `Adoption`.
`Adoption` records permanent transfers.
A reservation is temporary, tentative, and reversible.
It violates `Adoption`'s operational principle to jam it in there.

This is exactly the situation the **Split** design move exists for.

The full code is on the [companion GitHub repo](https://github.com/dave-elkins/wysiwid-petstore-py/tree/07-design-moves), branch `07-design-moves`.

---

## What Is a Design Move?

Daniel Jackson describes three fundamental refactoring operations for concept designs:

- **Split** — one concept becomes two, each with a cleaner, tighter operational principle
- **Merge** — two concepts that have drifted toward each other collapse into one
- **Lift** — logic that crept into a concept action gets moved up into the sync layer where it belongs

These aren't just code refactors.
They're design refactors — changes to the concept map itself, which then drive changes to the code.
The direction is always: design first, then implement.
You don't start moving files around and hope the design emerges.
You draw the new concept map, verify the operational principles are clean, and then execute.

---

## The Split: Adoption Becomes Reservation + Adoption

Let's draw the new concept map before touching any code.

**Before:**

```python
ADOPTION
  Purpose: record permanent transfers of pets to adopters
  Actions: process, cancel
  State: id, pet_id, adopter_name, adopter_email, adopted_at
```

**After:**

```python
RESERVATION
  Purpose: temporarily hold a pet for a specific customer
  Operational principle: a reserved pet is unavailable to others for 48 hours;
    if not converted to an adoption, the reservation expires and the pet
    becomes available again
  Actions: create, convert_to_adoption, expire, cancel
  State: id, pet_id, customer_email, customer_name, created_at, expires_at, status

ADOPTION
  Purpose: record permanent transfers of pets to adopters
  Operational principle: an adoption records a confirmed, permanent transfer;
    it can only be created from a completed reservation
  Actions: process (requires reservation_id), cancel (cooling-off period only)
  State: id, reservation_id, pet_id, adopter_name, adopter_email, adopted_at
```

Notice what changed in `Adoption`: it now requires a `reservation_id`.
You can't create an adoption without a prior reservation.
This tightens `Adoption`'s operational principle — it no longer needs to check pet availability itself, because that was already enforced when the reservation was created.

`Reservation` absorbs all the availability-checking and time-bounding logic.
`Adoption` becomes what it always wanted to be: a simple, permanent record.

Now draw the new misfit list:

```python
reservation.create      → pet.mark_unavailable
reservation.expire      → pet.mark_available
reservation.cancel      → pet.mark_available
reservation.convert     → adoption.process (triggers existing adoption syncs)
adoption.process        → notification.send (confirmation) ← unchanged
```

The sync layer gains three new rules and loses none.
Existing behavior is preserved.
New behavior is additive.

That's the Split design move working correctly.
When a split is clean, the existing sync rules don't need to change — you're adding a new concept on top of existing infrastructure, not rewiring the middle of it.

---

## Step 1: Build the Reservation Concept

Following exactly the same shape as every other concept:

```python
# concepts/reservation/models.py
from datetime import datetime
from enum import StrEnum

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime
from pydantic import BaseModel
from database import Base

class ReservationStatus(StrEnum):
    ACTIVE = "active"
    CONVERTED = "converted"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class ReservationDB(Base):
    __tablename__ = "reservations"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    pet_id: Mapped[str] = mapped_column(String, nullable=False)
    customer_name: Mapped[str] = mapped_column(String, nullable=False)
    customer_email: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String, default=ReservationStatus.ACTIVE.value)

class ReservationIn(BaseModel):
    pet_id: str
    customer_name: str
    customer_email: str

class ReservationOut(BaseModel):
    id: str
    pet_id: str
    customer_name: str
    customer_email: str
    created_at: datetime
    expires_at: datetime
    status: ReservationStatus

    model_config = {"from_attributes": True}
```

```python
# concepts/reservation/store.py
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from .models import ReservationDB, ReservationStatus

RESERVATION_WINDOW_HOURS = 48

def create_reservation(
    db: Session, pet_id: str, customer_name: str, customer_email: str
) -> ReservationDB:
    now = datetime.now(timezone.utc)
    reservation = ReservationDB(
        id=str(uuid.uuid4()),
        pet_id=pet_id,
        customer_name=customer_name,
        customer_email=customer_email,
        created_at=now,
        expires_at=now + timedelta(hours=RESERVATION_WINDOW_HOURS),
        status=ReservationStatus.ACTIVE.value,
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation

def get_reservation(db: Session, reservation_id: str) -> ReservationDB | None:
    return db.query(ReservationDB).filter(
        ReservationDB.id == reservation_id
    ).first()

def get_active_reservation_for_pet(db: Session, pet_id: str) -> ReservationDB | None:
    return db.query(ReservationDB).filter(
        ReservationDB.pet_id == pet_id,
        ReservationDB.status == ReservationStatus.ACTIVE.value,
    ).first()

def set_status(db: Session, reservation_id: str, status: ReservationStatus) -> ReservationDB | None:
    reservation = get_reservation(db, reservation_id)
    if reservation:
        reservation.status = status.value
        db.commit()
        db.refresh(reservation)
    return reservation
```

Now the actions — the concept's public interface:

```python
# concepts/reservation/actions.py
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from core import ActionRecord

from . import store
from .models import ReservationIn, ReservationOut, ReservationStatus

class ReservationNotFoundError(Exception):
    pass

class ReservationNotActiveError(Exception):
    pass

class PetAlreadyReservedError(Exception):
    pass

async def create(db: Session, data: ReservationIn) -> ActionRecord:
    """Reserve a pet for 48 hours."""
    existing = store.get_active_reservation_for_pet(db, data.pet_id)
    if existing:
        raise PetAlreadyReservedError(
            f"Pet {data.pet_id} already has an active reservation"
        )

    reservation_db = store.create_reservation(
        db,
        pet_id=data.pet_id,
        customer_name=data.customer_name,
        customer_email=data.customer_email,
    )
    reservation_out = ReservationOut.model_validate(reservation_db)
    return ActionRecord.make("reservation", "create", reservation_out)

async def convert_to_adoption(db: Session, reservation_id: str) -> ActionRecord:
    """Mark a reservation as converted — it became a full adoption."""
    reservation_db = store.get_reservation(db, reservation_id)
    if not reservation_db:
        raise ReservationNotFoundError(f"Reservation {reservation_id} not found")
    if reservation_db.status != ReservationStatus.ACTIVE.value:
        raise ReservationNotActiveError(
            f"Reservation {reservation_id} is {reservation_db.status}, not active"
        )

    updated = store.set_status(db, reservation_id, ReservationStatus.CONVERTED)
    reservation_out = ReservationOut.model_validate(updated)
    return ActionRecord.make("reservation", "convert_to_adoption", reservation_out)

async def expire(db: Session, reservation_id: str) -> ActionRecord:
    """Expire a reservation whose 48hr window has passed."""
    reservation_db = store.get_reservation(db, reservation_id)
    if not reservation_db:
        raise ReservationNotFoundError(f"Reservation {reservation_id} not found")

    now = datetime.now(UTC)
    if reservation_db.expires_at.replace(tzinfo=UTC) > now:
        raise ReservationNotActiveError(
            f"Reservation {reservation_id} has not yet expired"
        )

    updated = store.set_status(db, reservation_id, ReservationStatus.EXPIRED)
    reservation_out = ReservationOut.model_validate(updated)
    return ActionRecord.make("reservation", "expire", reservation_out)

async def cancel(db: Session, reservation_id: str) -> ActionRecord:
    """Customer-initiated cancellation of an active reservation."""
    reservation_db = store.get_reservation(db, reservation_id)
    if not reservation_db:
        raise ReservationNotFoundError(f"Reservation {reservation_id} not found")
    if reservation_db.status != ReservationStatus.ACTIVE.value:
        raise ReservationNotActiveError(
            f"Reservation {reservation_id} is not active"
        )

    updated = store.set_status(db, reservation_id, ReservationStatus.CANCELLED)
    reservation_out = ReservationOut.model_validate(updated)
    return ActionRecord.make("reservation", "cancel", reservation_out)
```

---

## Step 2: Update Adoption to Require a Reservation

`Adoption` needs one change: it now takes a `reservation_id` and stores it.
This makes the dependency between Reservation and Adoption explicit in the data model — every adoption traces back to a reservation.

```python
# concepts/adoption/models.py (updated)
class AdoptionDB(Base):
    __tablename__ = "adoptions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    reservation_id: Mapped[str] = mapped_column(String, nullable=False)  # ← new
    pet_id: Mapped[str] = mapped_column(String, nullable=False)
    adopter_name: Mapped[str] = mapped_column(String, nullable=False)
    adopter_email: Mapped[str] = mapped_column(String, nullable=False)
    adopted_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

class AdoptionIn(BaseModel):
    reservation_id: str    # ← replaces pet_id as the entry point
    adopter_name: str
    adopter_email: str

class AdoptionOut(BaseModel):
    id: str
    reservation_id: str
    pet_id: str
    adopter_name: str
    adopter_email: str
    adopted_at: datetime

    model_config = {"from_attributes": True}
```

The `AdoptionIn` model no longer takes a `pet_id` directly — it takes a `reservation_id`.
The `pet_id` will be threaded through from the reservation by the sync layer.
`Adoption` still stores `pet_id` for its own records, but callers no longer supply it directly.

```python
# concepts/adoption/actions.py (updated process())
async def process(db: Session, data: AdoptionIn, pet_id: str) -> ActionRecord:
    """
    Record a pet adoption. pet_id is supplied by the sync layer, not the caller,
    since it comes from the reservation record.
    """
    existing = db.query(store.AdoptionDB).filter(
        store.AdoptionDB.reservation_id == data.reservation_id
    ).first()
    if existing:
        raise AdoptionAlreadyExistsError(
            f"Reservation {data.reservation_id} has already been converted to an adoption"
        )

    adoption_db = store.create_adoption(
        db,
        reservation_id=data.reservation_id,
        pet_id=pet_id,
        adopter_name=data.adopter_name,
        adopter_email=data.adopter_email,
    )
    adoption_out = AdoptionOut.model_validate(adoption_db)
    return ActionRecord.make("adoption", "process", adoption_out)
```

The router also needs a small update — it now looks up the reservation to retrieve `pet_id` before firing through the engine:

```python
# concepts/adoption/router.py (updated)
@router.post("/", response_model=AdoptionOut, status_code=201)
async def process_adoption(
    data: AdoptionIn, db: Session = Depends(get_db)
) -> AdoptionOut:
    from concepts.reservation import store as reservation_store

    reservation = reservation_store.get_reservation(db, data.reservation_id)
    if not reservation:
        raise HTTPException(
            status_code=404, detail=f"Reservation {data.reservation_id} not found"
        )

    try:
        record = await engine.fire(
            db,
            "adoption",
            "process",
            actions.process,
            data=data,
            pet_id=reservation.pet_id,
        )
    except actions.AdoptionAlreadyExistsError:
        raise HTTPException(
            status_code=409,
            detail="This reservation has already been converted to an adoption",
        ) from None
    except PetNotAvailableForAdoptionError as e:
        raise HTTPException(status_code=409, detail=str(e)) from None

    return cast(AdoptionOut, record.payload)
```

---

## Step 3: Write the Reservation Sync Rules

New file in the sync layer — new concept, new sync file:

```python
# syncs/reservation_syncs.py
from typing import Any

from sqlalchemy.orm import Session

from core import ActionRecord
from engine import engine
from concepts.notification import actions as notification_actions
from concepts.notification.models import NotificationIn
from concepts.pet import actions as pet_actions
from concepts.pet import store as pet_store
from concepts.pet.models import PetStatus

# --- Guard: can't reserve an already-unavailable pet ---

@engine.guard("reservation", "create")
async def guard_pet_must_be_available_for_reservation(
    db: Session, kwargs: dict[str, Any]
) -> None:
    """Block reservation.create if the pet is not available."""
    from concepts.reservation.models import ReservationIn

    data = kwargs.get("data")
    if not isinstance(data, ReservationIn):
        raise TypeError("Expected ReservationIn")

    pet = pet_store.get_pet(db, data.pet_id)
    if not pet:
        raise ValueError(f"Pet {data.pet_id} does not exist")
    if pet.status != PetStatus.AVAILABLE.value:
        raise ValueError(f"Pet {data.pet_id} is not available for reservation")

# --- Sync: reservation created → pet held ---

async def _undo_pet_hold(db: Session, record: ActionRecord) -> None:
    """Compensate: if reservation sync chain fails, re-mark pet available."""
    await pet_actions.mark_available(db, record.payload.pet_id)

@engine.on("reservation", "create", compensate=_undo_pet_hold)
async def sync_hold_pet_on_reservation(db: Session, record: ActionRecord) -> None:
    """When a reservation is created, mark the pet unavailable."""
    await pet_actions.mark_unavailable(
        db, record.payload.pet_id, reason="reserved"
    )

@engine.on("reservation", "create")
async def sync_notify_reservation_created(db: Session, record: ActionRecord) -> None:
    """Notify the customer their reservation is confirmed."""
    notification_data = NotificationIn(
        recipient_email=record.payload.customer_email,
        subject="Your reservation is confirmed",
        body=(
            f"Hi {record.payload.customer_name}, your pet is reserved for 48 hours. "
            f"Complete your adoption before {record.payload.expires_at.strftime('%b %d at %I:%M %p')}."
        ),
    )
    await notification_actions.send(db, notification_data)

# --- Sync: reservation expired or cancelled → pet released ---

@engine.on("reservation", "expire")
@engine.on("reservation", "cancel")
async def sync_release_pet_on_reservation_end(
    db: Session, record: ActionRecord
) -> None:
    """When a reservation expires or is cancelled, release the pet."""
    await pet_actions.mark_available(db, record.payload.pet_id)

@engine.on("reservation", "expire")
async def sync_notify_reservation_expired(db: Session, record: ActionRecord) -> None:
    """Notify the customer their reservation expired."""
    notification_data = NotificationIn(
        recipient_email=record.payload.customer_email,
        subject="Your reservation has expired",
        body=(
            f"Hi {record.payload.customer_name}, your reservation for pet "
            f"{record.payload.pet_id} has expired and the pet is now available again."
        ),
    )
    await notification_actions.send(db, notification_data)

# --- Sync: reservation converted → adoption processed ---

@engine.on("reservation", "convert_to_adoption")
async def sync_create_adoption_from_reservation(
    db: Session, record: ActionRecord
) -> None:
    """
    When a reservation is converted, trigger adoption.process via the engine.
    The pet_id comes from the reservation record — Adoption doesn't need to know it.
    """
    from concepts.adoption import actions as adoption_actions
    from concepts.adoption.models import AdoptionIn

    data = AdoptionIn(
        reservation_id=record.payload.id,
        adopter_name=record.payload.customer_name,
        adopter_email=record.payload.customer_email,
    )
    await engine.fire(
        db,
        "adoption",
        "process",
        adoption_actions.process,
        data=data,
        pet_id=record.payload.pet_id,
    )
```

Read `sync_create_adoption_from_reservation` carefully.
When a reservation is converted, the sync rule fires `adoption.process` via the engine — which means all the existing `adoption.process` sync rules fire too: `sync_mark_pet_unavailable` (already unavailable, idempotent), `sync_send_adoption_confirmation`.
The entire existing adoption chain runs, untouched, off the back of the reservation conversion.

This is the architecture compounding.
New behavior plugs into existing infrastructure.
Existing sync rules don't know or care that a reservation triggered them.

---

## Step 4: Update the Guard on Adoption

The old guard `guard_pet_must_be_available` in `adoption_syncs.py` checked pet availability before an adoption.
Now that adoptions can only come from reservations, and reservations already hold the pet, this guard needs updating — a pet being adopted will always be unavailable (it's reserved).
Replace it with a reservation-validity check:

```python
# syncs/adoption_syncs.py (updated guard)

class PetNotAvailableForAdoptionError(Exception):
    pass

@engine.guard("adoption", "process")
async def guard_reservation_must_be_valid(
    db: Session, kwargs: dict[str, Any]
) -> None:
    """Block adoption.process if the reservation is not in a valid status."""
    from concepts.adoption.models import AdoptionIn
    from concepts.reservation import store as reservation_store
    from concepts.reservation.models import ReservationStatus

    data = kwargs.get("data")
    if not isinstance(data, AdoptionIn):
        raise TypeError("Expected AdoptionIn")

    reservation = reservation_store.get_reservation(db, data.reservation_id)
    if not reservation:
        raise PetNotAvailableForAdoptionError(
            f"Reservation {data.reservation_id} does not exist"
        )
    # Note: status will be CONVERTED when called from
    # sync_create_adoption_from_reservation, but ACTIVE is also
    # allowed as a safety net for direct API calls.
    if reservation.status not in (
        ReservationStatus.CONVERTED.value,
        ReservationStatus.ACTIVE.value,
    ):
        raise PetNotAvailableForAdoptionError(
            f"Reservation {data.reservation_id} cannot be converted: "
            f"status is {reservation.status}"
        )
```

One guard replaced with another.
The `adoption_syncs.py` file otherwise doesn't change — `sync_mark_pet_unavailable` and `sync_send_adoption_confirmation` are untouched.

---

## The Merge Move (Brief)

The Split was the main event.
Let's briefly sketch the other two moves so you know what to reach for.

A **Merge** is the reverse: two concepts that shouldn't be separate collapse into one.
The signal is when two concepts always change together, always appear in the same sync rules, and have no meaningful independent existence.

In our pet store, imagine the `Notification` concept and a `NotificationPreference` concept — one stores sent messages, the other stores whether a customer wants email vs SMS.
If every sync rule that calls `notification.send` also has to check `notification_preference.get`, the two concepts are not really independent.
They're one concept (`CustomerMessaging`) split into two for no good reason.
The Merge move collapses them: one concept, one folder, one set of actions, preferences stored alongside messages.

The code change is mechanical: combine the two `models.py` files, combine the two `store.py` files, update callers.
The sync rules simplify.

---

## The Lift Move (Brief)

A **Lift** happens when you find logic inside a concept action that doesn't belong there — usually because it's making decisions that depend on cross-concept context that the concept shouldn't have.

Imagine `adoption.process` had grown to include this:

```python
# Bad: adoption.process checking waitlist — it shouldn't know about Waitlist
async def process(db: Session, data: AdoptionIn, pet_id: str) -> ActionRecord:
    ...
    # Notify waitlisted customers that the pet was adopted (not available anymore)
    waitlisted = waitlist_store.get_for_pet(db, pet_id)  # ← concept importing another concept
    for entry in waitlisted:
        await notification_actions.send(db, recipient_email=entry.customer_email, ...)
    ...
```

This violates concept independence.
`Adoption` is reaching into `Waitlist`.
The fix is a Lift: remove the waitlist logic from `adoption.process` entirely and move it to a sync rule:

```python
# Good: lifted to the sync layer where cross-concept logic belongs
@engine.on("adoption", "process")
async def sync_notify_waitlist_on_adoption(db: Session, record: ActionRecord) -> None:
    """When a pet is adopted, notify waitlisted customers it's no longer available."""
    waitlisted = waitlist_store.get_for_pet(db, record.payload.pet_id)
    for entry in waitlisted:
        await notification_actions.send(
            db,
            recipient_email=entry.customer_email,
            subject="Update on a pet you were watching",
            body=f"The pet you waitlisted has been adopted.",
        )
```

`adoption.process` shrinks.
The sync layer grows by one rule.
Concept independence is restored.
The Lift move is the most common of the three — it's the refactor you reach for whenever you catch a concept importing another concept.

---

## What Didn't Change

Step back and look at what the Split left untouched:

- `concepts/pet/` — zero changes
- `concepts/notification/` — zero changes
- `concepts/appointment/` — zero changes
- `concepts/waitlist/` — zero changes
- `syncs/adoption_syncs.py` — one guard replaced, sync rules unchanged
- `views/` — zero changes

A significant new feature — a full reservation flow with a 48-hour window, expiry, cancellation, conversion, and notifications — was added by:

1. Creating one new concept (`concepts/reservation/`)
2. Adding one new sync file (`syncs/reservation_syncs.py`)
3. Making three small changes to `Adoption` (adding `reservation_id`, updating the guard, updating the router to look up `pet_id` from the reservation)
4. Wiring in `main.py` (register the reservation router) and `overview_syncs.py` (reservation event handlers)

Nothing else touched.
No existing tests broken.
No existing behavior changed.

That's the promise this architecture makes.
Post 8 looks at why it keeps it.

---

## References

- Daniel Jackson, [The Essence of Software](https://essenceofsoftware.com)
- Meng & Jackson, ["What You See Is What It Does"](https://arxiv.org/html/2508.14511v2)
