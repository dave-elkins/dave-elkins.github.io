---
title: 'What Is a Concept? Designing the Pet Store Before Writing a Line'
description: 'Post 2 of 8 in Building Legible Software — a series on Concept Design and the WYSIWID pattern'
date: 2026-04-29
series: 'wysiwid-petstore'
order: 2
originalUrl: 'https://medium.com/@daveelkins/what-is-a-concept-designing-the-pet-store-before-writing-a-line-2471163067e1'
source: 'medium'
tags: []
draft: false
---

_Post 2 of 8 in **Building Legible Software** — a series on Concept Design and the WYSIWID pattern_

---

Most software projects start the same way: someone opens a new file and starts typing.

Maybe you scaffold a model first.
Maybe you sketch some routes.
Maybe you reach for the framework boilerplate.
Either way, you're in the code before you've really understood what you're building.
And the decisions you make in those first few hours — how to split up your models, what goes in which service, what depends on what — quietly shape everything that comes after.

Concept Design asks you to do something different: **design the software before you build it**.
Not in the sense of writing a 40-page spec.
In the sense of spending 30 minutes with a whiteboard (or a napkin, or a markdown file) answering a specific set of questions about what your system actually does.

In this post we'll do that exercise for the pet store.
No code.
Just design.

---

## What Is a Concept?

A **concept** is a unit of functionality that makes sense to a user on its own.

This definition is simple, but its implications run deep.
Let’s break that down.

"Makes sense to a user on its own" means a concept has a coherent purpose that doesn't depend on understanding anything else about the system.
A user can hold the concept in their head, understand what it does, and know when it's working correctly — without knowing that any other concept exists.

Daniel Jackson, who developed Concept Design in [_The Essence of Software_](https://essenceofsoftware.com), puts it this way: a concept is like a small app within your app.
It has its own state.
It has its own actions.
It has a purpose that stands alone.

Some things that are **not** concepts:

- A database table
- A service class
- A controller
- A helper function

These are implementation details.
They don't map to anything a user understands or cares about.
A user understands _Adoption_.
They don't understand `AdoptionService`.

Some things that **are** concepts for the pet store:

- **Pet** — the store's inventory of animals available for adoption
- **Adoption** — the process of a customer taking a pet home
- **Appointment** — a scheduled visit to meet a pet
- **Notification** — a message sent to a customer about something they care about
- **Waitlist** — a customer expressing interest in a pet that isn't available yet

Notice that each of these is something you could explain to a non-technical stakeholder in one sentence.
That's a useful test: if you can't explain the concept without mentioning implementation details, it's probably not a concept yet.

---

## The Operational Principle

Every concept has an **operational principle** — the invariant it's responsible for maintaining.
It's the contract the concept makes with the rest of the system (and with users).
It answers the question: _what is this concept for, and how do you know it's working?_

Operational principles are written as short "if-then" or "when-then" statements.
Here are the ones for our pet store:

### Pet

> A pet added to the store stays available for adoption until marked unavailable or removed. A pet cannot be in two states at once — available and unavailable.

### Adoption

> An adoption records a permanent transfer of an available pet to an adopter. Once recorded, the pet becomes unavailable, and the adoption record is immutable.

### Appointment

> Appointments reserve time for customers to meet pets. No two appointments for the same pet may overlap. Customers can cancel appointments but not modify them — they must cancel and rebook.

### Notification

> A notification is a message sent to a customer. Once delivered, it cannot be recalled. Read status is tracked.

### Waitlist

> Waitlisted customers get notified when their pet becomes available. Being on the waitlist does not guarantee adoption — only notification.

Writing these down is more valuable than it sounds.
You’ll immediately spot gaps and ambiguities in how you understand the domain:

- What happens to appointments when a pet is adopted? (That's a _synchronization_ question — we'll handle it in Post 4.)
- Can a customer be on the waitlist for multiple pets? (Yes — Waitlist is a relation, not a 1:1.)
- What does "unavailable" mean for Pet — is it the same state for "adopted," "sick," and "sold to someone else"? (Probably not. That might mean Pet needs to be split into finer-grained states, or Adoption needs to own "adopted" status separately.)

These are the questions to answer _before_ building a 15-table database on incorrect assumptions.

---

## The Independence Rule

Concept Design differs from vague "good service" design because of one hard constraint:

**Concepts are independent.
A concept never imports, calls, or knows about any other concept.**

This is not a guideline.
It's the rule.
If you find yourself writing `from concepts.adoption import Adoption` inside `concepts/pet/`, you've violated concept independence, and your design needs to change.

This rule feels counterintuitive at first.
How does Adoption know to mark a Pet as unavailable if it can't talk to Pet?
How does the Waitlist know to trigger Notifications?

The answer is: it doesn't.
That's not Adoption's job.
That coordination is handled by a separate layer — the sync layer — which we'll build in Post 4.
For now, the key insight is:

> Each concept only knows about its own state. Cross-concept coordination lives somewhere else, explicitly, where you can see it.

This is what makes the code legible.
When you want to understand what happens when an adoption is processed, you look in two places: `concepts/adoption/` (what does Adoption itself do?)
and `syncs/adoption_syncs.py` (what else happens as a result?).
There's no hunting through six different service classes wondering what calls what.

---

## Identifying Concepts in Practice

How do you find the concepts in your own system?
A few heuristics that work:

**Start with the nouns users actually use.** If your users say "I want to make an appointment" and "I want to join the waitlist," those are probably concepts.
If they never say "I want to interact with the InventoryManagementSubsystem," that's not a concept.

**Look for things with their own lifecycle.** A concept has a beginning (it's created), a middle (it changes), and an end (it's deleted or resolved).
Pets are added, become unavailable, and are removed.
Adoptions are created and finalized.
Appointments are booked, kept or missed, and closed.
If something doesn't have its own lifecycle, it's probably state inside another concept.

**Watch for the word "and" in a concept's purpose.** If you find yourself saying "Pet manages the inventory _and_ tracks adoption status _and_ handles waitlist membership," that's three concepts jammed into one.
Split them.

**A concept that can only exist in terms of another concept probably isn't independent.** "AdoptionRecord" only makes sense in terms of Adoption — it's not a concept, it's state.
"Notification" makes sense on its own (you can imagine a Notification system in a completely different app) — it is a concept.

---

## The Pet Store Concept Map

After this exercise, we have five clear concepts, each with a clear purpose and operational principle:

```text
┌─────────────────────────────────────────────────────────────┐
│  PET                                                        │
│  Purpose: track animals available for adoption              │
│  State: id, name, species, breed, age, status               │
│  Actions: add, remove, mark_unavailable, mark_available     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ADOPTION                                                   │
│  Purpose: record permanent transfers of pets to adopters    │
│  State: id, pet_id, adopter_name, adopter_email, date       │
│  Actions: process, cancel (within cooling-off period)       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  APPOINTMENT                                                │
│  Purpose: schedule visits between customers and pets        │
│  State: id, pet_id, customer_email, timeslot, status        │
│  Actions: book, cancel, mark_completed, mark_missed         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  NOTIFICATION                                               │
│  Purpose: deliver messages to customers                     │
│  State: id, recipient_email, subject, body, sent_at, read   │
│  Actions: send, mark_read                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  WAITLIST                                                   │
│  Purpose: track customer interest in unavailable pets       │
│  State: id, pet_id, customer_email, joined_at               │
│  Actions: join, leave                                       │
└─────────────────────────────────────────────────────────────┘
```

The cross-concept interactions — what Jackson calls misfits — for our pet store are:

```text
1. adoption.process → pet.mark_unavailable
2. adoption.process → notification.send (confirmation to adopter)
3. adoption.process → appointment.cancel_all_for_pet
4. pet.mark_available → waitlist.notify_all (which triggers notification.send)
5. appointment.book → notification.send (confirmation to customer)
```

We'll implement every one of these in Post 4.
For now, just writing them down is the point.

---

## The Payoff of Designing First

Spending thirty minutes on this exercise yields:

- A clear list of what you're building, named the way users name it
- Explicit ownership boundaries — every piece of state belongs to exactly one concept
- A list of invariants to write tests against
- A sync backlog that tells you exactly what cross-feature coordination you need to implement
- Zero surprise dependencies when you sit down to write code

In the next post, we'll translate this design directly into code — starting with the `Pet` concept — its own state models, action methods, and zero imports from anywhere else.

---

Next up: Post 3 — Your First WYSIWID Concept: Pet in Python

## References

- Daniel Jackson, [The Essence of Software](https://essenceofsoftware.com)
- Meng & Jackson, ["What You See Is What It Does"](https://arxiv.org/html/2508.14511v2)
