---
title: 'What About Everything Else? DDD, Clean Architecture, CQRS, and the Alternatives'
description: 'You have read about MVC, OOP, DCI, patterns, hexagons, slices, and behavioral threads. Each got something right. Each left something unfinished.'
date: 2026-11-11
series: 'legible-by-design-the-long-search'
order: 10
tags: [architecture]
draft: false
---

You have read about [MVC](/writing/mvc-original-sin/), [OOP](/writing/objects-supposed-to-fix-this/), [DCI](/writing/dci/), [patterns](/writing/patterns-movement/), [hexagons](/writing/hexagonal-slices-architecture-wars/), [slices](/writing/hexagonal-slices-architecture-wars/), and [behavioral threads](/writing/behavioral-programming/).
Each got something right.
Each left something unfinished.

But if you are a practicing engineer, there are probably other names running through your head as you read this history.
Domain-Driven Design.
Clean Architecture.
CQRS.
Event Sourcing.
Functional Programming.

These are not part of the main lineage this series has traced — they do not lead directly to [Jackson's synthesis](/writing/jacksons-synthesis/).
But they are the approaches you have actually encountered, and they deserve an honest answer to the question: _how does Concept Design relate to what I already know?_

---

## Domain-Driven Design: The Closest Relative

If any existing approach overlaps with Concept Design, it is Domain-Driven Design.

Eric Evans's [_Domain-Driven Design_](https://www.domainlanguage.com/ddd/) (2003) argued, like this series, that software should be organized around the domain model — the concepts and rules that experts in the field actually think in.
Its core tools — bounded contexts, aggregates, entities, value objects, ubiquitous language — exist to make the code reflect the domain.

The overlap is real.
A Concept Design concept is not far from a DDD aggregate: both encapsulate state, both have well-defined boundaries, and both correspond to something meaningful in the domain.

But there are three differences that matter.

**Bounded contexts are organizational; concepts are semantic.** A bounded context in DDD is primarily a boundary around a subdomain or a team's responsibility.
It is about _who owns what_.
A concept in Concept Design is a unit of user-facing functionality — something that exists because a user needs it.
The boundary is semantic, not organizational.
Two teams can own the same concept; one team can own multiple concepts.
The user's mental model defines the unit of decomposition, not the org chart.

**Aggregates mix state and behavior; concepts separate them.** A DDD aggregate contains both its state and the operations that modify it.
A Concept Design concept has state and actions, but actions are not methods on the state — they are operations defined at the concept level, and the coordination between concepts lives in a separate sync layer.
DDD gives you no principled place to put cross-aggregate coordination.
You put it in a domain service, or an application service, or a saga, or wherever fits — and there is no consistent answer.

**Ubiquitous language is a goal; the operational principle is a constraint.** DDD's ubiquitous language is something you work toward through conversation with domain experts.
It is a practice, not a specification.
Concept Design's operational principle is a formal constraint: every action on a concept must be consistent with the concept's narrative.
You write it down.
You check against it.
It is not a conversation guide — it is a design rule.

Domain-Driven Design was the first mainstream approach to say "organize around the domain."
Concept Design goes further — here is exactly how to do that, including the parts DDD left implicit.

---

## Clean Architecture: The Dependency Rule Isn't Enough

Robert C. Martin's [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) (2012) is one of the most widely cited architectural frameworks in industry.
Its central rule — dependencies point inward, toward the domain entities — is good advice.
It ensures that business logic does not depend on frameworks, databases, or UI.

But Clean Architecture is still organized by _technical layer_, not by _concept_.
Its canonical structure — entities, use cases, interface adapters, frameworks — is a stack.
It tells you which direction dependencies should flow.
It does not tell you what the right units of functionality are or how they should relate to each other.

A Clean Architecture application can have a perfect dependency graph and still be incomprehensible, because the entities layer is a dumping ground for everything that is "core" and the use case layer contains coordination logic that has no explicit architectural home.

Concept Design solves a problem Clean Architecture does not address: _what belongs inside the dependency boundary?_ The answer is not "entities" — it is _concepts_, each with its own independent state and actions, coordinated by a sync layer that lives outside all of them.

Clean Architecture gives you direction.
Concept Design gives you destination.

---

## CQRS and Event Sourcing: Events, Commands, and the Sync Layer

Command Query Responsibility Segregation ([CQRS](https://martinfowler.com/bliki/CQRS.html)) — a pattern Greg Young introduced — separates the code that reads data from the code that writes it.
[Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) stores the history of changes rather than the current state.

Both share a family resemblance with Concept Design.

CQRS's separation of commands and queries resembles Concept Design's separation of an action from the ActionRecord other components observe — but CQRS operates at the level of read vs. write, not at the level of _independent semantic units_.
A CQRS application can still have a God class on the command side; the pattern does not constrain how you decompose the system.

Event Sourcing's event log is structurally similar to Concept Design's ActionRecords: both record what happened so that other parts of the system can react.
But Event Sourcing stores everything forever, and its events are typically global.
Concept Design scopes ActionRecords to concepts — each concept has its own action log — and the sync layer coordinates across them.

The sync layer is, in a sense, CQRS's event bus made architectural.
This is not an infrastructure choice; it is a structural component with its own design vocabulary.
CQRS gives you a mechanism.
Concept Design gives you a structure to build within.

---

## Functional Programming: Algebraic Effects and the Mediating Runtime

Functional programmers have been solving similar problems for years — Plotkin and Pretnar's formalization of [algebraic effect handlers](<https://doi.org/10.2168/lmcs-9(4:23)2013>) is the standard reference.

Algebraic effects separate _what_ a computation does from the _context_ in which it runs.
A function that performs IO declares an effect; the runtime decides how to handle it.
The effect is not coupled to the implementation.

This is structurally similar to Concept Design's separation of concepts from the sync layer: a concept declares what actions it performs; the sync layer determines how those actions relate to actions in other concepts.

But there is a difference in audience and abstraction level.
Algebraic effects need language support for effect handlers — OCaml 5, Eff, and Koka provide it, and Haskell and Scala reach it through libraries.
Concept Design achieves the same separation through an architectural pattern — explicit module boundaries, a sync engine, ActionRecords — that works in any language.
The constraint is structural, not type-level.

Functional programming achieves independence through types; Concept Design achieves it through architecture.
Both are valid.
Concept Design is accessible to teams that are not ready to adopt a functional language.

---

## Why These Comparisons Matter

The point of this post is not to argue that every other approach is wrong.
The point is that each of them — DDD, Clean Architecture, CQRS, Event Sourcing, Functional Programming — identified a piece of the answer.

- DDD identified that code should be organized around the domain.
- Clean Architecture identified that dependencies should point inward.
- CQRS and Event Sourcing identified that commands and events are first-class concerns.
- Functional Programming identified that you can separate what a computation does from where it runs.

Concept Design does not compete with these ideas.
It integrates them into a single coherent framework that answers a question none of them fully addressed: _what are the right units of user-facing functionality, and how do they relate to each other without coupling?_

The integration is credible but unproven — the pattern has not been stress-tested at industrial scale the way these approaches have been.

The next post — [Jackson's Synthesis](/writing/jacksons-synthesis/) — shows exactly how that framework works.

---

---

_Part of the series: Legible by Design: The Long Search_

## References

- Evans, E. (2003). [_Domain-Driven Design: Tackling Complexity in the Heart of Software_](https://www.domainlanguage.com/ddd/) (companion site for the book). Addison-Wesley.
- Fowler, M. (2005). [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) (part of the _Further Enterprise Application Architecture_ project).
- Fowler, M. (2011). [CQRS](https://martinfowler.com/bliki/CQRS.html).
- Martin, R. C. (2012). [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).
- Plotkin, G. D., & Pretnar, M. (2013). [Handling algebraic effects](<https://doi.org/10.2168/lmcs-9(4:23)2013>). _Logical Methods in Computer Science_, 9(4). (Open access.)
