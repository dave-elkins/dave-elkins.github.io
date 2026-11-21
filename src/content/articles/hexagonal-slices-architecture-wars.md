---
title: 'Hexagonal, Slices, and the Architecture Wars'
description: 'Every architecture you have worked in was a reaction to the one before it. Layers gave way to hexagons. Hexagons gave way to slices. Each one solved a real problem and left a…'
date: 2026-10-05
series: 'legible-by-design-the-long-search'
order: 8
originalUrl: 'https://medium.com/@daveelkins/hexagonal-slices-and-the-architecture-wars-1a117fe839e8'
source: 'medium'
tags: [architecture, software-history]
draft: false
---

Every architecture you have worked in was a reaction to the one before it.
Layers gave way to hexagons.
Hexagons gave way to slices.
Each one solved a real problem and left a different one unsolved.

By the 2000s, the software industry had developed a curious habit.
Declare the previous architectural orthodoxy wrong, propose a new one, and then watch the new one calcify into the same problems it was meant to solve.

Layered architecture produced the Big Ball of Mud.
MVC produced fat models.
OOP produced inheritance hierarchies.
Each generation of architects looked at the wreckage left by the previous generation and proposed a cleaner abstraction.
Some of those abstractions were insightful.
Two of them — Hexagonal Architecture and Vertical Slice Architecture — got closer to the right answer than anything that came before.

Neither went far enough.
But understanding why is important.

---

## Layered Architecture and Its Discontents

Before hexagonal architecture, the dominant architectural pattern was layered: Presentation, Business Logic, Data Access.
Three tiers, stacked.
The UI calls the service layer; the service layer calls the repository layer; the repository layer talks to the database.

The appeal was obvious.
Separation of concerns.
Testability.
Replaceability — swap out the database without touching the business logic.
In theory, each layer was independent of the others above and below it.

In practice, the layers leaked.
Business logic migrated into the presentation layer because it was convenient.
Database concepts — row shapes, query structures — leaked upward into the service layer.
The "business logic layer" became a thin pass-through that did little more than shuffle data between the UI and the database.

Worse, the layered architecture created a particular kind of coupling that was invisible until it was painful: everything depended on the database.
The database schema was the de facto definition of the domain model.
Change the schema and you changed everything.
The database, supposedly an implementation detail hidden behind the data access layer, was in practice the gravitational center of the entire system.

---

## Cockburn's Insight: The Core Should Be Ignorant

In September 2005, Alistair Cockburn published a technical report, [_The Hexagonal (Ports & Adapters) Architecture_](https://alistair.cockburn.us/hexagonal-architecture/).

The central insight was sharp and correct: your application's core business logic should know nothing about the outside world.
Not the web framework.
Not the database.
Not the message queue.
Not the test harness.
The core is pure domain logic, and everything external to it is an adapter — a translation layer that speaks the language of the outside world on one side and the language of the core on the other.

The "hexagon" was not meant to be taken literally.
Cockburn chose it to get away from the one-dimensional layered picture and to leave room in the drawing for as many ports as the application needed.
HTTP is one adapter.
The database is another adapter.
A command-line interface is a third.
The core does not know which adapters are attached; it only knows its own ports.

This was a genuine advance.
It severed the dependency that had been quietly breaking layered architectures: the core no longer depended on the database.
You could test the core in isolation, without a running database, because the core had no idea a database existed.
You could swap the database for a different persistence mechanism without touching a line of business logic.

Hexagonal architecture is still good advice today.
The framework-agnostic core is a pattern that ages well.

But notice what it does and does not do.
Hexagonal architecture tells you how to structure the _boundary_ between your application and the outside world.
The pattern says almost nothing about how to structure the _inside_ of the application.
What goes in the core?
How is it organized?
Its implicit answer was: that is your problem.
The pattern draws a clean line at the perimeter and leaves the interior unconstrained.
A clean line — and an empty interior.

The interior, in most implementations, reverted to layered architecture or fat domain objects.
Hexagonal architecture solved the framework-coupling problem without solving the domain-structure problem.

---

## Bogard and the Vertical Slice

Thirteen years later, Jimmy Bogard proposed something different.
His [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture) — argued in a blog post in April 2018 and in the conference talks that followed, starting with NDC Sydney later that year — started from a different frustration.

Bogard's observation: when you implement a feature, you touch every layer.
Adding a "create order" feature means a new controller action, a new service method, a new repository method, a new database migration.
The code for a single feature is spread vertically across every layer of the application.
To understand the feature, you have to read code in four different places.

His prescription: stop organizing code by technical layer and start organizing it by feature.
A "create order" feature gets its own folder, its own request object, its own handler, its own database interaction.
Everything that belongs to that feature lives together.
When you need to understand or modify the feature, you go to one place.

A vertical slice is a thin cut through the full stack, from HTTP request to database response, organized as a coherent unit rather than distributed across technical layers.

Bogard's insight resonates immediately with working engineers because it maps onto how work actually happens.
You are not handed a "service layer sprint."
You are handed features.
You implement features.
Organizing code by feature rather than by layer means your codebase structure matches your work structure.

Vertical Slice Architecture comes closer to [WYSIWID](/writing/jacksons-synthesis/) than any other mainstream architectural pattern.
The "slice" and the "concept" are cousins — both are feature-oriented, both resist the pull of technical layers, both insist that coherent units of functionality should stay together in the code.

---

## Why Neither Goes Far Enough

What both patterns share is that they are _organizational_.
They tell you where to put code.
They do not tell you what the code should express.

Hexagonal architecture tells you to keep the core clean of framework dependencies.
It does not tell you what concepts belong in the core or how they should relate to each other.
You can have a perfectly hexagonal application with a completely incoherent domain model.

Vertical Slice Architecture tells you to organize code by feature.
It does not tell you what a feature _is_, how to identify feature boundaries, or how features should interact.
You can have a beautifully sliced application where every slice reaches directly into every other slice's data.
The "independence" of your slices is then a fiction maintained only by developer discipline.

Both patterns are silent on a question that turns out to be fundamental: **what are the right units of functionality, and how do they relate to each other?**

A vertical slice could be anything.
"Create order" and "process payment" and "send notification" could each be a slice.
They could also be a single slice, or "process payment" could belong to two of them.
The pattern provides no guidance.
You are on your own.

Bogard and Cockburn were solving real problems and solving them well.
But there is a gap between "organize code by feature" and "design a system as a coherent set of independent, user-meaningful concepts."
The first is an organizational heuristic.
The second is a design theory.

---

## The Semantic Gap

What all of these architectural patterns have in common — layered, hexagonal, vertical slice — is that they operate at the level of code organization.
They answer the question "where should this code live?"
They do not answer the question "what should this code mean?"

The semantic gap — the distance between what users think in terms of and what the code is organized around — persists across all of them.
Users think in terms of concepts: orders, payments, shipments, subscriptions.
The code is organized in terms of layers, adapters, or slices — technical constructs that have no direct correspondence to what the user experiences.

Closing that gap requires something different from an organizational pattern.
It requires a [design theory](/writing/jacksons-synthesis/): a principled account of what the right units of user-facing functionality are, how to find them, how to define their boundaries, and how to let them interact without coupling.

The architecture wars produced better and better ways to organize code.
The question they could not answer was what to organize it _around_.

---

---

_Part of the series: Legible by Design: The Long Search_

## References

- Cockburn, A. (2005, September 4). [_The Hexagonal (Ports & Adapters) Architecture_](https://alistair.cockburn.us/hexagonal-architecture/) (HaT Technical Report 2005.02).
- Bogard, J. (2018, April 19). [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture)
- Jackson, D. [_The Essence of Software_](https://essenceofsoftware.com)
