---
title: 'Why Your Codebase Is Hard to Change (And What the Field Has Been Getting Wrong for Decades)'
subtitle: 'Legible by Design: The Long Search — Introduction'
description: 'You know the feeling. A new feature request comes in — something that sounds simple, something a user could describe in one sentence. And you open the codebase and start tracing:…'
date: 2026-08-13
series: 'legible-by-design-the-long-search'
order: 1
originalUrl: 'https://medium.com/@daveelkins/why-your-codebase-is-hard-to-change-and-what-the-field-has-been-getting-wrong-for-decades-64e190354198'
source: 'medium'
tags: []
draft: false
---

You know the feeling.
A new feature request comes in — something that sounds simple, something a user could describe in one sentence.
And you open the codebase and start tracing: a controller here, a service there, a model that has grown to six hundred lines, a background job that touches the same table from a different direction.
An hour later you have a rough map of everything the change might affect.
You make the change carefully.
Something breaks somewhere you didn't expect.

The problem is not your skill.
It's not your team's discipline.
It is that the dominant architectural patterns of the last thirty years have a structural flaw — and the field has been slowly, iteratively discovering what that flaw is and how to fix it.

This series is about that discovery.

---

## The Flawed Assumption

The assumption underlying most architectures you have probably worked in is that organizing code well is primarily a question of _where things live_.

Layered architecture says: put presentation here, business logic there, data access down below.
Hexagonal architecture says: put the core here, adapters at the boundary.
Vertical Slice Architecture says: put everything for a feature in one folder.
MVC says: models here, views there, controllers in between.

These are all answers to the question "where should this code live?"
They are useful answers.
They reduce certain kinds of chaos.
But they leave a more fundamental question unanswered: **what should the code be organized _around_?**

Tables?
Layers?
Features?
HTTP endpoints?
The answers you get from different frameworks and architectural patterns are inconsistent, and none of them quite maps onto what users actually care about.

Users don't think in terms of database tables.
They don't think in terms of service layers or adapters or slices.
They think in terms of _concepts_: posts, comments, subscriptions, notifications, labels, drafts.
The things they interact with.
The things they complain about when they break.
The things they ask for in feature requests.

The gap between how users think about a system and how the system's code is organized is the source of most of the friction you experience as an engineer.
When a feature request touches five files in three layers, it is because the feature corresponds to a concept in the user's mind that has no corresponding home in the code.
No home at all.

---

## What This Series Is About

This is a series about Concept Design — a design theory developed by Daniel Jackson at MIT — and its structural implementation pattern, WYSIWID (What You See Is What It Does), introduced in a 2025 paper by Eagon Meng and Daniel Jackson.

Concept Design says: organize your software around the concepts users think in.
Give each concept its own independent module with its own state and its own actions.
Express the relationships between concepts explicitly, in a dedicated sync layer that neither concept owns.
Make the structure of your code a direct reflection of the structure of your users' mental model.

WYSIWID says: here is how to implement that in real code — with explicit module boundaries, a sync engine that coordinates between them, and a structural pattern that makes concept independence possible in practice.

Together, they are the most coherent answer the field has produced to the question of how to build software that is legible — comprehensible to the engineers who maintain it, to the AI tools that increasingly assist with it, and to the users who depend on it.

---

## Why the History Matters

You could skip straight to the implementation.
The pattern is laid out; the code is written; go build something.

But engineers who understand only the _what_ of a design pattern are fragile.
They apply it mechanically in the cases the tutorial covered and get stuck the moment their situation diverges.
Engineers who understand the _why_ — the problem the pattern solves, the alternatives it rejected, the insight it embodies — can adapt it, extend it, and defend it when colleagues push back.

The history also makes the pattern believable.
WYSIWID is not an arbitrary set of conventions.
It is a synthesis of insights that have been independently discovered, in different forms, by different researchers, over decades.
[Reenskaug](/writing/mvc-original-sin/) was pointing at it in 1979.
[Sullivan and Notkin](/writing/patterns-movement/) formalized a piece of it in 1992.
[Harel](/writing/behavioral-programming/) proved a key property of it in 2010.
[Bogard](/writing/hexagonal-slices-architecture-wars/) got within striking distance of it in 2018.
[Jackson](/writing/jacksons-synthesis/) named the whole thing in 2021 and 2025.

When you see that lineage, the pattern stops feeling like one person's opinion and starts feeling like something the field has been converging on.
That matters when you are trying to convince a skeptical colleague, or when you are deciding whether to stake a production system on a relatively new idea.

---

## What You Will Find in This Series

This series traces the intellectual history through these posts:

[**The Machine Doesn't Care**](/writing/machines-dont-care/) — how Turing's model of computation and von Neumann's stored-program machine made correctness a question the machine answers, and why human comprehension was never part of the specification.

[**The First Legibilists**](/writing/the-first-legibilists/) — how Dijkstra, Knuth, Parnas, and Brooks spent two decades arguing that comprehensibility is a first-class requirement, and the question they left the architecture wars to answer.

[**MVC and the Original Sin**](/writing/mvc-original-sin/) — how Reenskaug's original insight about user mental models got distorted into a filing system, and why your fat models are the result.

[**Objects Were Supposed to Fix This**](/writing/objects-supposed-to-fix-this/) — OOP's promise to model the world, the inheritance disaster, and DCI as the partial correction that never quite landed.

[**DCI: The Diagnosis Was Right, the Cure Didn't Take**](/writing/dci/) — how Reenskaug and Coplien correctly identified what MVC and OOP missed, why their fix was genuine but incomplete, and how it points directly at Concept Design's sync layer.

[**The Patterns Movement**](/writing/patterns-movement/) — what the Gang of Four got right and wrong, and why Sullivan and Notkin's 1992 Mediators paper was decades ahead of its time.

[**Hexagonal, Slices, and the Architecture Wars**](/writing/hexagonal-slices-architecture-wars/) — Cockburn and Bogard getting close, and why "organizational" is not the same as "semantic."

[**Behavioral Programming: The Academic Road Not Taken**](/writing/behavioral-programming/) — Harel's b-threads as the most rigorous formal ancestor of WYSIWID, and why it never crossed from the academy to industry.

[**What About Everything Else? DDD, Clean Architecture, CQRS, and the Alternatives**](/writing/what-about-everything-else/) — how DDD, Clean Architecture, CQRS, Event Sourcing, and Functional Programming relate to Concept Design, and what each got right or left unfinished.

[**Jackson's Synthesis**](/writing/jacksons-synthesis/) — what Concept Design actually says, what the WYSIWID paper adds, and what it leaves open for implementors.

Want to see it in practice?
The already-published series [Building Legible Software](/writing/why-features-break/) builds a real Python application using Concept Design and the WYSIWID pattern.

---

## A Note on Who This Is For

This series is written for working software engineers — people who build and maintain real systems, who have felt the friction of codebases that resist change, and who are skeptical of architectural theories that promise everything and deliver another layer of abstraction.

If you have ever wondered why a "simple" change touched seven files, this series is for you.

If you have ever inherited a codebase and spent a week just trying to understand where things live, this series is for you.

If you have ever watched a well-intentioned refactor make things worse because the underlying structure was wrong, this series is for you.

The history is worth your time.
The pattern at the end of it is worth your codebase.

---

---

_Part of the series: Legible by Design: The Long Search_

## References

- Daniel Jackson, [_The Essence of Software_](https://essenceofsoftware.com)
- Meng & Jackson, ["What You See Is What It Does"](https://doi.org/10.1145/3759429.3762628)
