---
title: 'Why Your Features Keep Breaking Each Other'
description: 'Post 1 of 8 in Building Legible Software, a series on Concept Design and the WYSIWID pattern'
date: 2026-04-29
series: 'wysiwid-petstore'
order: 1
originalUrl: 'https://medium.com/@daveelkins/why-your-features-keep-breaking-each-other-0a3412cfa20a'
source: 'medium'
tags: []
draft: false
---

_Post 1 of 8 in **Building Legible Software**, a series on Concept Design and the WYSIWID pattern_

---

Most developers have been here before.

A bug comes in.
They open the codebase, find the offending line, fix it in five minutes.
They ship it.
Two days later, a different bug comes in.
They look at the stacktrace and their stomach drops: it's in a different feature.
One they didn't touch.
One that was working fine before their fix.

They didn't break it on purpose.
They didn't even know it depended on the thing they changed.
That dependency wasn't documented anywhere.
It wasn't in the function signature.
The dependency was merely implied.
Somewhere in the guts of a shared service class that six different features quietly route through.

This is not a discipline problem.
This is a structural problem.
And the structure most of us are using (layered architecture, shared services, everything calling everything) makes it essentially inevitable.

---

## The Pet Store

Here's a concrete example using a small pet store app.
The core features are:

- **Inventory** — track which pets are in the store and available
- **Adoption** — process adoptions, marking pets as no longer available
- **Notification** — email customers interested in a pet when it gets adopted

Here's how most of us would build this.
A services layer, some models, the usual:

```python
# models.py
from sqlalchemy import Column, String, Boolean
from database import Base

class Pet(Base):
    __tablename__ = "pets"
    id = Column(String, primary_key=True)
    name = Column(String)
    species = Column(String)
    available = Column(Boolean, default=True)

class Adoption(Base):
    __tablename__ = "adoptions"
    id = Column(String, primary_key=True)
    pet_id = Column(String)
    adopter_name = Column(String)
    adopter_email = Column(String)
```

```python
# services/adoption_service.py
from models import Pet, Adoption
from services.notification_service import NotificationService
from database import SessionLocal

class AdoptionService:
    def __init__(self):
        self.db = SessionLocal()
        self.notifications = NotificationService()

    def process_adoption(self, pet_id: str, adopter_name: str, adopter_email: str):
        # Get the pet
        pet = self.db.query(Pet).filter(Pet.id == pet_id).first()
        if not pet:
            raise ValueError(f"Pet {pet_id} not found")
        if not pet.available:
            raise ValueError(f"Pet {pet_id} is already adopted")

        # Create adoption record
        adoption = Adoption(
            id=generate_id(),
            pet_id=pet_id,
            adopter_name=adopter_name,
            adopter_email=adopter_email
        )
        self.db.add(adoption)

        # Update inventory — AdoptionService directly mutates Pet state
        pet.available = False
        self.db.commit()

        # Send notification — AdoptionService directly calls NotificationService
        self.notifications.send_adoption_confirmation(
            to=adopter_email,
            pet_name=pet.name
        )

        return adoption
```

The feature ships, and everyone's happy with the result.

Now a new request comes in: **mark a pet unavailable for medical reasons and notify waitlist customers.**

A junior dev handles it.
They add a `mark_unavailable()` method to `InventoryService`:

```python
# services/inventory_service.py
from models import Pet
from database import SessionLocal

class InventoryService:
    def __init__(self):
        self.db = SessionLocal()

    def mark_unavailable(self, pet_id: str, reason: str):
        pet = self.db.query(Pet).filter(Pet.id == pet_id).first()
        pet.available = False
        self.db.commit()
        # Notify waitlist... but how? InventoryService doesn't have NotificationService
        # So they add it:
        from services.notification_service import NotificationService
        NotificationService().send_waitlist_notification(pet_id=pet_id, reason=reason)
```

On the surface, this still works.
But let's examine the dependency graph we've created:

- `AdoptionService` imports `Pet` (a model owned by Inventory)
- `AdoptionService` imports `NotificationService`
- `InventoryService` imports `NotificationService`
- `NotificationService` is now called from two different places with subtly different assumptions

Three weeks later, the notification team refactors `NotificationService` to be async.
They update `AdoptionService` to `await` the call.
They forget about `InventoryService` because nobody told them it also calls notifications.
The medical unavailability flow silently stops sending emails.
Nobody notices for two weeks because it's a low-traffic path.

This is the bug.
Not in any one file, but in the **structure**.

---

## The Real Problem: Everything Knows About Everything

The dependency graph for this system looks like:

```text
AdoptionService ──► Pet (model)
AdoptionService ──► NotificationService
InventoryService ──► Pet (model)
InventoryService ──► NotificationService
API routes ──► AdoptionService
API routes ──► InventoryService
```

Every service is a node in a web of implicit dependencies.
When a developer changes any node, they have to mentally trace all the edges to understand what else might break.
In a small system like this one, that's manageable, if a bit annoying.
In a real codebase with 40 services, this approach breaks down.

The shared `Pet` model is the worst offender.
It's a God Object that every feature touches directly.
When Inventory wants to add a `last_health_check` field, they add it to `Pet`.
When Adoption wants to add an `adoption_fee`, they add it to `Pet`.
Eventually `Pet` is a 30-column table that reflects every feature that's ever brushed up against it.
Nobody owns it.
Everybody modifies it.

This is sometimes called **feature entanglement**: the logic for one feature is physically spread across separate files, and the logic for many features is physically mixed inside the same files.
It's not a moral failing.
It's just what naturally happens when one organizes code by technical layer (models, services, routes) instead of by feature.

---

## What We Actually Want

What if each feature was a **sealed module**?
It owns its own state.
It exposes only named actions.
It cannot reach into another feature's internals.
It has no idea what other features exist.

The pet store, redesigned:

```text
concepts/
  pet/          ← owns Pet state, exposes: add, remove, mark_unavailable
  adoption/     ← owns Adoption state, exposes: process
  notification/ ← owns Notification state, exposes: send
syncs/
  adoption_syncs.py  ← "when adoption.process fires, then pet.mark_unavailable and notification.send"
```

The features don't call each other.
The `syncs/` layer wires them together.
When the notification team makes their breaking async change, there's exactly one place to update it: the sync rule.
Every feature that sends notifications goes through the same path.

This is the core idea behind **Concept Design**, introduced by Daniel Jackson in _The Essence of Software_, and the **WYSIWID** (What You See Is What It Does) structural pattern described by Meng & Jackson in their 2024 Onward!
paper.

The core idea is straightforward, if unconventional: **the features your users understand should map 1:1 to the modules in your code.** Not layers.
Not services.
Features.

---

## What's Coming in This Series

Over the next seven posts, we're going to build the pet store the right way, from scratch:

- **Post 2** — Design before you code: identifying concepts and their operational principles
- **Post 3** — Build your first concept end-to-end in Python
- **Post 4** — The Sync Engine: how features coordinate without coupling
- **Post 5** — Guards, prohibitions, and business rules with a real address
- **Post 6** — View Concepts: reading across features without tangling them
- **Post 7** — Evolving the design with Split, Merge, and Lift
- **Post 8** — What makes this code legible to AI, future teammates, and yourself

All code lives in the [dave-elkins/wysiwid-petstore-py](https://github.com/dave-elkins/wysiwid-petstore-py).
Each post has its own tag: check out `01-why-features-break`, `03-first-concept-pet`, etc. to follow along at each step.

If you've ever looked at a codebase and thought _I understand every individual file but I have no idea how this thing actually works as a system_, this series is for you.

---

Designing the Pet Store Before Writing a Line_

## References

- Daniel Jackson, [The Essence of Software](https://essenceofsoftware.com)
- Meng & Jackson, ["What You See Is What It Does"](https://arxiv.org/html/2508.14511v2)
