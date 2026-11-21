---
title: 'View Concepts — Reading Across Features Without Coupling Them'
description: 'Post 6 of 8 in Building Legible Software — a series on Concept Design and the WYSIWID (What You See Is What It Does) pattern'
date: 2026-07-07
series: 'wysiwid-petstore'
order: 6
tags: []
draft: false
---

_Post 6 of 8 in **Building Legible Software** — a series on Concept Design and the WYSIWID (What You See Is What It Does) pattern_

---

Up to now, every post has been about writes: [creating adoptions and firing sync rules](/writing/sync-engine/), [marking pets unavailable](/writing/first-concept-pet/), [handling failures](/writing/guards-and-compensation/).
But software isn't just writes.
A product manager walks over and asks for a dashboard.
Two of them, actually:

1. **Store Overview** — available pets, upcoming appointments, recent adoptions. The front page of the app.
2. **Waitlist Summary** — for each pet that has waitlisted customers, how many are waiting and who joined most recently.

Your first instinct might be to write a query that joins across the pets, appointments, adoptions, and waitlist tables.
Four lines of SQL, done in ten minutes.

But that join is a coupling.
The dashboard now depends on the internal table structure of four different concepts.
When Pet adds a column, or Adoption changes its schema, the dashboard query might silently break — or worse, silently return wrong data.
You've created exactly the kind of invisible dependency that Concept Design is designed to eliminate.

The solution is a **view concept**: a dedicated concept whose sole purpose is to serve a specific read need, optionally maintained by sync rules so it never queries across concept internals directly.

There are two ways to build one.
This post covers both, and tells you when to use each.

The full code is on the [companion GitHub repo](https://github.com/dave-elkins/wysiwid-petstore-py/tree/06-view-concepts), branch `06-view-concepts`.

---

## Two Strategies, One Decision

Before writing any code, you need to choose an implementation strategy:

**Computed projection** — the view concept has no database table of its own.
When queried, it reads from each concept's store directly and assembles the result in Python.
Simple to build, always fresh, but adds read-time latency and still touches concept internals.

**Materialized view** — the view concept has its own database table, populated and kept current by sync rules.
Fast to read, fully decoupled from source concepts, but adds write-time complexity and eventual consistency.

The right choice depends on two questions: how often is this view read, and how stale can it be?

|                  | Computed Projection                | Materialized View                                |
| ---------------- | ---------------------------------- | ------------------------------------------------ |
| Read performance | Slower (assembles at query time)   | Fast (pre-computed)                              |
| Data freshness   | Always current                     | Eventually consistent                            |
| Write complexity | None                               | Sync rules required                              |
| Schema coupling  | Reads concept stores directly      | Isolated — only updated via sync rules           |
| Best for         | Low-traffic, internal, admin views | High-traffic, customer-facing, latency-sensitive |

We'll build the Waitlist Summary as a computed projection (simpler, lower traffic) and the Store Overview as a materialized view (higher traffic, needs to be fast).

---

## Part 1: Waitlist Summary as a Computed Projection

The Waitlist Summary shows, for each pet with waitlisted customers: the pet's ID, how many customers are waiting, and who joined most recently.
This is an admin view — low traffic, staleness is fine, and we'd rather keep the code simple.

A computed projection is a view concept with no DB table of its own.
It imports from concept stores — which is the one controlled exception to the ["concepts don't talk to each other" rule](/writing/sync-engine/).
View concepts are allowed to read from concept stores, because their entire job is to assemble cross-concept data.
They never write to concept stores directly.

```python
# views/waitlist_summary.py
from collections import defaultdict

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.concepts.pet import store as pet_store
from app.concepts.waitlist import store as waitlist_store
from app.concepts.waitlist.models import WaitlistEntryDB

class WaitlistSummaryItem(BaseModel):
    pet_id: str
    pet_name: str | None
    customer_count: int
    most_recent_join: str

class WaitlistSummaryOut(BaseModel):
    items: list[WaitlistSummaryItem]
    total_pets_with_waitlist: int

async def get_summary(db: Session) -> WaitlistSummaryOut:
    all_entries = waitlist_store.get_all(db)

    grouped: dict[str, list[WaitlistEntryDB]] = defaultdict(list)
    for entry in all_entries:
        grouped[entry.pet_id].append(entry)

    items: list[WaitlistSummaryItem] = []
    for pet_id, entries in grouped.items():
        pet = pet_store.get_pet(db, pet_id)
        most_recent = max(entries, key=lambda e: e.joined_at)

        items.append(
            WaitlistSummaryItem(
                pet_id=pet_id,
                pet_name=pet.name if pet else None,
                customer_count=len(entries),
                most_recent_join=most_recent.joined_at.isoformat(),
            )
        )

    items.sort(key=lambda x: x.customer_count, reverse=True)

    return WaitlistSummaryOut(
        items=items,
        total_pets_with_waitlist=len(items),
    )
```

And the router:

```python
# views/waitlist_summary_router.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from . import waitlist_summary

router = APIRouter(prefix="/views", tags=["views"])

@router.get("/waitlist-summary", response_model=waitlist_summary.WaitlistSummaryOut)
async def get_waitlist_summary(
    db: Session = Depends(get_db),
) -> waitlist_summary.WaitlistSummaryOut:
    return await waitlist_summary.get_summary(db)
```

Clean.
No join.
No raw SQL.
The projection reads from two concept stores and assembles the result in Python.
When Waitlist changes its internal schema, only `waitlist_store` needs updating — the view's logic stays the same.

Both dashboard views live under the `/views` prefix, keeping them separate from concept endpoints.

The honest downside: `get_summary` runs two queries and does grouping in Python.
For a thousand waitlist entries across a hundred pets, this is fine.
For a hundred thousand entries, you'd want to move to a materialized view.
That's the tradeoff — and it's a trivial refactor when the time comes, because the view's public interface (`WaitlistSummaryOut`) doesn't change.

---

## Part 2: Store Overview as a Materialized View

The Store Overview is the front page of the app: available pets, upcoming appointments, recent adoptions.
It gets hit on every page load.
We can't afford to assemble it at query time.

A materialized view concept has its own database table.
Sync rules keep it current as the source concepts change.
Reads are a single fast query against one table.

### The Model

```python
# views/store_overview/models.py
from collections.abc import Sequence
from typing import Any

from pydantic import BaseModel
from sqlalchemy import JSON, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

class StoreOverviewDB(Base):
    __tablename__ = "store_overview"

    id: Mapped[str] = mapped_column(String, primary_key=True, default="singleton")
    available_pet_count: Mapped[int] = mapped_column(Integer, default=0)
    upcoming_appointment_count: Mapped[int] = mapped_column(Integer, default=0)
    recent_adoptions: Mapped[Sequence[dict[str, Any]]] = mapped_column(
        JSON, default=list
    )
    available_pets: Mapped[Sequence[dict[str, Any]]] = mapped_column(
        JSON, default=list
    )

class StoreOverviewOut(BaseModel):
    available_pet_count: int
    upcoming_appointment_count: int
    recent_adoptions: list[dict[str, Any]]
    available_pets: list[dict[str, Any]]

    model_config = {"from_attributes": True}
```

This is a single-row table.
The overview is a singleton — there's one store, one dashboard.
We upsert the row with `id="singleton"` every time the view is refreshed.

### The Store and Actions

```python
# views/store_overview/store.py
from typing import Any

from sqlalchemy.orm import Session

from .models import StoreOverviewDB

def get_overview(db: Session) -> StoreOverviewDB | None:
    return (
        db.query(StoreOverviewDB)
        .filter(StoreOverviewDB.id == "singleton")
        .first()
    )

def upsert_overview(db: Session, **fields: Any) -> StoreOverviewDB:
    overview = get_overview(db)
    if not overview:
        overview = StoreOverviewDB(id="singleton", **fields)
        db.add(overview)
    else:
        for key, value in fields.items():
            setattr(overview, key, value)
    db.commit()
    db.refresh(overview)
    return overview
```

```python
# views/store_overview/actions.py
from sqlalchemy.orm import Session

from app.concepts.adoption import store as adoption_store
from app.concepts.adoption.models import AdoptionOut
from app.concepts.appointments import store as appointment_store
from app.concepts.pet import store as pet_store
from app.concepts.pet.models import PetOut, PetStatus

from . import store as overview_store
from .models import StoreOverviewOut

async def refresh(db: Session) -> StoreOverviewOut:
    """Recompute the store overview from source concept stores and persist it."""
    available_pets = pet_store.get_all_pets(db, status=PetStatus.AVAILABLE)
    upcoming_appts = appointment_store.get_upcoming(db)
    recent_adoptions = adoption_store.get_recent(db, limit=5)

    available_pets_data = [
        PetOut.model_validate(p).model_dump(mode="json") for p in available_pets[:10]
    ]
    recent_adoptions_data = [
        AdoptionOut.model_validate(a).model_dump(mode="json") for a in recent_adoptions
    ]

    overview_db = overview_store.upsert_overview(
        db,
        available_pet_count=len(available_pets),
        upcoming_appointment_count=len(upcoming_appts),
        available_pets=available_pets_data,
        recent_adoptions=recent_adoptions_data,
    )

    return StoreOverviewOut.model_validate(overview_db)

async def get(db: Session) -> StoreOverviewOut | None:
    """Read the current materialized overview. No recomputation."""
    overview_db = overview_store.get_overview(db)
    if not overview_db:
        return None
    return StoreOverviewOut.model_validate(overview_db)
```

The key separation: `refresh()` recomputes and persists the view.
`get()` just reads it.
Reads are fast.
The cost of assembly is paid at write time, not read time.

### The Sync Rules

Now we wire sync rules to keep the overview current.
Whenever Pet, Adoption, or Appointment changes in a relevant way, the overview refreshes:

```python
# syncs/overview_syncs.py
from sqlalchemy.orm import Session

from app.core import ActionRecord
from app.engine import engine
from app.views.store_overview import actions as overview_actions

@engine.on("pet", "add")
@engine.on("pet", "remove")
@engine.on("pet", "mark_unavailable")
@engine.on("pet", "mark_available")
async def sync_refresh_on_pet_change(db: Session, record: ActionRecord) -> None:
    await overview_actions.refresh(db)

@engine.on("adoption", "process")
async def sync_refresh_on_adoption(db: Session, record: ActionRecord) -> None:
    await overview_actions.refresh(db)

@engine.on("appointment", "book")
@engine.on("appointment", "cancel")
@engine.on("appointment", "mark_completed")
async def sync_refresh_on_appointment_change(
    db: Session, record: ActionRecord
) -> None:
    await overview_actions.refresh(db)
```

And the read router — a single fast query:

```python
# views/store_overview/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from . import actions
from .models import StoreOverviewOut

router = APIRouter(prefix="/views", tags=["views"])

@router.get("/store-overview", response_model=StoreOverviewOut)
async def get_store_overview(db: Session = Depends(get_db)) -> StoreOverviewOut:
    overview = await actions.get(db)
    if not overview:
        raise HTTPException(status_code=503, detail="Overview not yet initialized")
    return overview
```

The `GET /views/store-overview` endpoint does one thing: read a single row from `store_overview`.
No joins.
No cross-concept queries.
Sub-millisecond.

---

## The Tradeoff in Practice

Let's be concrete about what you're trading:

**With a computed projection (Waitlist Summary):**

- Every read triggers N queries across concept stores
- Data is always exactly current
- Schema coupling is contained to the view's module — one file to update when a concept changes
- Zero sync rules required

**With a materialized view (Store Overview):**

- Every read is one fast query
- Data may be slightly stale (refreshed after writes, not during reads)
- Fully decoupled — reads never touch concept internals
- Sync rules required — more moving parts, more places to miss a trigger

The stale data point deserves a moment.
In our setup, `GET /views/store-overview` reflects the world as of the last write that triggered a sync refresh.
The sync handler runs in the same request as the originating action — so by the time the write returns, the overview is already refreshed.
Staleness only happens for **concurrent reads**: a `GET /views/store-overview` arriving between the action's commit and the sync handler's commit could see the previous snapshot.
That window is microseconds, but it exists.
For most dashboards this is completely acceptable.
For financial ledgers or inventory reservation systems, it isn't — and you'd want to design accordingly.

---

## The Updated Project Structure

```text
app/
  concepts/
    pet/
    adoption/
    appointment/
    notification/
    waitlist/
  views/
    waitlist_summary.py            ← computed projection
    waitlist_summary_router.py
    store_overview/
      actions.py                   ← refresh() and get()
      models.py                    ← StoreOverviewDB, StoreOverviewOut
      store.py                     ← upsert_overview()
      router.py
  syncs/
    adoption_syncs.py
    overview_syncs.py              ← new: keeps materialized view current
  core.py
  engine.py
  database.py
  main.py
```

Views live in their own top-level directory, separate from concepts.
They have the same internal shape as concepts — models, store, actions, router — but they're not concepts.
They don't have operational principles.
They don't emit `ActionRecord`.
They exist purely to serve reads.

---

## What's Next

Posts [3](/writing/first-concept-pet/), [4](/writing/sync-engine/), [5](/writing/guards-and-compensation/), and 6 have been additive: each adds new concepts, new sync rules, or new views.
The system has grown outward cleanly.
Post 8 will wrap up the series by examining what makes this code legible — to AI, future teammates, and yourself.

Post 7 is about something different: what happens when a requirement forces you to _change_ the design.
A new feature arrives that doesn't fit neatly into the existing concept boundaries.
We'll use Jackson's design moves — Split, Merge, and Lift — to refactor the concept map without breaking the system.
This is where the architecture proves its promise.

---

## References

- Daniel Jackson, [The Essence of Software](https://essenceofsoftware.com)
- Meng & Jackson, ["What You See Is What It Does"](https://arxiv.org/html/2508.14511v2)
