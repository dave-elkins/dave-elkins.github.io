---
title: 'What Makes This Code Legible to AI, Future Teammates, and Yourself'
description: 'Post 8 of 8 in Building Legible Software — a series on Concept Design and the WYSIWID pattern'
date: 2026-04-29
series: 'wysiwid-petstore'
order: 8
tags: []
draft: false
---

_Post 8 of 8 in **Building Legible Software** — a series on Concept Design and the WYSIWID pattern_

---

We've spent seven posts building a pet store.
Six concepts, a sync engine, guards, compensating actions, two view concepts, and a full design refactor.
The codebase is complete.
Before closing the series, let's step back and ask the question the whole thing was really about:

**Why does any of this make the code easier to work with?**

Not in a hand-wavy "separation of concerns" way.
In a specific, mechanical way that you can point at.

---

## The 1:1 Mapping

The core claim of Concept Design — and the thing the WYSIWID pattern is structurally enforcing — is that **the features your users understand should map 1:1 to the modules in your code.**

Let's check whether we achieved that.

A user of the pet store understands these things: pets, adoptions, reservations, appointments, notifications, waitlists.
They can describe each one in a sentence.
They know when each one is working correctly and when it isn't.

Open the codebase:

```python
concepts/
  pet/
  adoption/
  reservation/
  appointments/
  notification/
  waitlist/
```

Six folders.
Six user-visible features.
One folder per feature, one feature per folder.
No feature logic scattered across multiple folders.
No folder containing logic for multiple features.

That's the 1:1 mapping.
It sounds simple.
It is simple.
And it's rare in real codebases, because the natural entropy of software development — adding things where they're convenient, not where they're correct — pulls constantly against it.

The WYSIWID pattern doesn't just recommend this structure.
It enforces it through the independence rule: concepts don't import each other, so logic literally cannot leak between them.
The mapping is maintained by constraint, not discipline.

---

## What "Legible" Actually Means

Legibility is a word Jackson uses deliberately.
A legible text is one where the meaning is clear from the form.
You don't need to decode it, trace it, or hold a lot of context in your head to understand what it says.

Most codebases are not legible in this sense.
They're _readable_ — the individual lines make sense — but not _legible_, because understanding what the system does requires tracing execution across many files, inferring implicit contracts between classes, and reconstructing the author's intent from code that doesn't express it directly.

The pet store, as built, is legible in a specific sense: **you can answer most questions about the system by reading exactly one file.**

- "What happens when an adoption is processed?" → `syncs/adoption_syncs.py`
- "What invariants does Reservation enforce?" → `concepts/reservation/actions.py`
- "What cross-concept rules govern the adoption flow?" → `syncs/adoption_syncs.py`
- "What does the store overview dashboard show?" → `views/store_overview/actions.py`
- "What is Pet responsible for?" → `concepts/pet/actions.py`

One question, one file.
That's legibility.
It's not a property that emerges naturally from good intentions.
It's a property that's engineered through a specific structural constraint: every piece of behavior has exactly one home.

---

## Why AI Tools Work Better on Legible Code

This post makes a concrete claim rather than waving at the future.

When you ask an AI coding assistant to add a feature, fix a bug, or explain a system, it works by reading your code and reasoning about it.
The quality of its output is bounded by the quality of its understanding.
And its understanding is bounded by how much context it needs to hold to answer your question.

A codebase where "what happens when an adoption is processed" requires reading six service classes, two middleware files, and a model mixin to answer is a codebase that will regularly produce confused, incomplete, or wrong AI responses.
Not because the AI is bad at reading code — it's quite good at that.
But because the information needed to answer the question is genuinely distributed across many files, and assembling it correctly requires the kind of implicit contextual knowledge that humans build up over months and AI tools don't have.

A codebase where the same question is answered by reading one file — `syncs/adoption_syncs.py`, 40 lines — gives an AI tool everything it needs in a single context window.
The response will be better, not because the AI changed, but because the code stopped hiding the answer.

Let's make this concrete.
Here's what a question about the pet store looks like against our codebase:

**Prompt:**

```python
I need to add a feature: when a reservation expires, any appointments
the customer had for that pet should be automatically cancelled.
Where does this change go and what does it look like?
```

Because the codebase is legible, a well-grounded answer is straightforward:

```python
This is a sync rule. Reservation expiry already fires an ActionRecord
("reservation", "expire") — you can see this in concepts/reservation/actions.py.

Add this to syncs/reservation_syncs.py:

@engine.on("reservation", "expire")
async def sync_cancel_appointments_on_expiry(db: Session, record: ActionRecord) -> None:
    """When a reservation expires, cancel any appointments for that pet
    booked by the same customer."""
    from app.concepts.appointments import actions as appt_actions
    from app.concepts.appointments import store as appt_store

    appointments = appt_store.get_active_for_pet_and_customer(
        db,
        pet_id=record.payload.pet_id,
        customer_email=record.payload.customer_email,
    )
    for appt in appointments:
        await engine.fire(
            db, "appointment", "cancel",
            appt_actions.cancel,
            appointment_id=appt.id,
        )

You'll also need to add get_active_for_pet_and_customer() to
concepts/appointments/store.py — a simple filtered query.

No other files need to change.
```

That answer is correct, complete, and located precisely.
It's correct because the structure made it obvious: new cross-concept behavior goes in `syncs/`, triggered by an existing `ActionRecord`.
The AI didn't need to guess where the feature belongs.
The architecture told it.

Now imagine asking the same question about the [original layered codebase from Post 1](/writing/why-features-break/) — the one with `AdoptionService` calling `NotificationService` calling shared models.
The answer would require understanding which service owns appointments, whether there's a shared session, whether the transaction boundary wraps both services, and what side effects other callers of the appointment cancellation path might have.
The AI might get it right.
It might not.
The code isn't lying to it exactly — but it's not helping it either.

Legible code helps AI tools the same way it helps humans: by making the answer to "where does this go?"
unambiguous.

---

## The Harder Argument

One more claim is worth sitting with.

Software is usually treated as a product — something you build and ship.
But it's also, and maybe more fundamentally, a **medium for expressing ideas about a domain**.
A codebase is a theory of how a business works, encoded in a form a computer can execute.

Most codebases are bad theories.
Not because the engineers were careless, but because the dominant structuring principle — layers, services, shared models — doesn't reflect how users think about the domain at all.
Users think in concepts: pets, adoptions, reservations.
The code thinks in layers: models, services, controllers.
The gap between those two mental models is where most of the complexity, confusion, and bugs live.

Concept Design closes that gap.
When the code's structure matches the domain's structure — when the concepts users understand map directly to the modules engineers maintain — the code becomes a good theory.
It's easier to reason about because it's reasoning about the right things.
It's easier to change because the things that change together in the world also live together in the code.
It's easier to explain to a new engineer, or a product manager, or an AI assistant, because the explanation and the implementation use the same vocabulary.

This is what "legibility" means at the deepest level.
Not just readability.
Not just clean code.
A codebase where the map matches the territory.

---

## The Finished Codebase

Here's what we built over eight posts:

```python
petstore/
  concepts/
    pet/            actions, models, store, router
    adoption/       actions, models, store, router
    reservation/    actions, models, store, router
    appointments/       actions, models, store, router
    notification/   actions, models, store, router
    waitlist/       actions, models, store, router
  views/
    waitlist_summary.py
    waitlist_summary_router.py
    store_overview/  actions, models, store, router
  syncs/
    adoption_syncs.py
    appointment_syncs.py
    reservation_syncs.py
    overview_syncs.py
  core.py
  engine.py
  database.py
  main.py
```

Every feature has a folder.
Every folder has the same shape.
Every cross-feature interaction lives in `syncs/`.
Every read optimisation lives in `views/`.
The engine is 60 lines.
The whole system is navigable by someone who has never seen it before, because the structure is self-describing.

The full code, with tests, is on the [companion GitHub repo](https://github.com/dave-elkins/wysiwid-petstore-py/tree/08-legibility), branch `08-legibility`.
Each post has its own branch.
Clone it, read it, break it, and build something with it.

---

## Where to Go From Here

If this series sparked something, here's where to take it deeper:

**Daniel Jackson, _The Essence of Software_** (essenceofsoftware.com) — the foundational text.
Everything in this series traces back to it.
Read Part I for concepts and operational principles, Part II for design moves.
The writing is clear and the examples are strong.

**Meng & Jackson, "What You See Is What It Does"** (Onward!
2024) — the academic paper that formalises the structural pattern this series implements.
Shorter than the book, more technically precise.
Search: "What You See Is What It Does" Meng Jackson Onward 2024.

**The Essence of Software forum** (forum.essenceofsoftware.com) — practitioners applying concept design in real projects, in real languages.
Good for questions like "how do I map this to Django?"
or "what's the right concept boundary here?"

**Behavioral Programming** (Harel et al.)
— the closest academic relative to WYSIWID.
If you want to understand the theoretical foundations of coordinated-independence patterns, this is the lineage.
Search: "Behavioral Programming" Harel b-threads.

---

## A Final Note

The pet store in this series is deliberately small.
Six concepts, a few sync rules, two views.
Real systems are larger — dozens of concepts, hundreds of sync rules, views nested on views.

The architecture scales, but the discipline has to scale with it.
The independence rule gets harder to maintain as the system grows and the pressure to "just import this one thing" intensifies.
The sync layer can get crowded if you don't keep the files focused.
View concepts can drift toward being mini-applications if you're not careful about their scope.

None of these are arguments against the pattern.
They're arguments for taking the design moves seriously — splitting concepts that have grown too broad, lifting logic that has crept into the wrong layer, merging concepts that have drifted together.
The design moves aren't a one-time refactor.
They're a practice.

The goal, always, is a codebase that a new person — or a future version of yourself, or an AI assistant working at your side — can read and immediately understand.
Not just the lines.
The system.
What it does, why it does it, and where to go when it needs to change.

That's legible software.
That's what we built.

---

## References

- Daniel Jackson, [The Essence of Software](https://essenceofsoftware.com)
- Meng & Jackson, ["What You See Is What It Does"](https://arxiv.org/html/2508.14511v2)
