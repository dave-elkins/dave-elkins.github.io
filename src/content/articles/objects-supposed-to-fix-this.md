---
title: 'Objects Were Supposed to Fix This'
description: 'In the late 1980s, object-oriented programming arrived in the mainstream with a promise so compelling it reshaped the entire industry. The promise was this: your code can model…'
date: 2026-09-10
series: 'legible-by-design-the-long-search'
order: 5
originalUrl: 'https://medium.com/@daveelkins/objects-were-supposed-to-fix-this-e3a96cde2f31'
source: 'medium'
tags: [architecture, software-history]
draft: false
---

In the late 1980s, object-oriented programming arrived in the mainstream with a promise so compelling it reshaped the entire industry.
The promise was this: your code can model the world.
You have a `Dog`, a `Kennel`, a `Veterinarian`.
They have attributes.
They have behavior.
They talk to each other.
The structure of your program mirrors the structure of reality, and that makes it comprehensible.

It was a beautiful idea.
It was also, in a specific and important way, wrong.

---

## The Promise

To understand what went wrong, you have to take the promise seriously first.

Before OOP, the dominant paradigm was procedural code: data structures and functions that operated on them, largely separate.
Programs were organized around _what the computer did_, not around _what the problem was about_.
For large systems, this made comprehension hard.
You had to hold the entire execution flow in your head to understand what the code meant.

Object-oriented programming proposed to organize code around _things in the domain_ instead.
A `BankAccount` object would know its own balance and enforce its own rules about withdrawals.
A `ShoppingCart` would manage its own items.
Code would read like a description of the problem domain, not a description of machine operations.

Alan Kay, who coined the term "object-oriented," was thinking about something even more radical — objects as autonomous agents, communicating by passing messages, each responsible for their own behavior.
The idea was biological: cells, not gears.

This vision was powerful.
For a certain class of problem, it worked beautifully.

---

## What Actually Happened

The industry took OOP and built something subtly different from what the pioneers had in mind.

The problem was inheritance.
Inheritance was marketed as OOP's killer feature: define a base class, extend it, reuse code, model taxonomies.
`Animal` → `Dog` → `GoldenRetriever`.
Clean, hierarchical, reusable.

In practice, deep inheritance hierarchies became the primary source of complexity in large OOP codebases.
The reason is fundamental: inheritance couples a class to its entire ancestry.
Change `Animal` and you may break `GoldenRetriever` in ways that are invisible until runtime.
Add a new level to the hierarchy and you discover that the taxonomy was wrong to begin with — `Platypus` refuses to fit anywhere sensible.

[The Gang of Four's _Design Patterns_](/writing/patterns-movement/) (1994) was, in large part, a catalog of workarounds for inheritance's failures.
"Favor composition over inheritance" is GoF's most quoted advice — which is to say, the book that canonized OOP patterns also contained the seeds of OOP's self-critique.

But the deeper problem was not inheritance specifically.
It was that objects turned out to be good at modeling _data with associated operations_.
Which is not the same thing as modeling _behavior in context_.

---

## The Data/Behavior Split

A `BankAccount` object can tell you its balance and enforce withdrawal limits.
That is data with associated operations.

But what about the behavior of _transferring money between accounts_?
That behavior involves two accounts, a transaction record, possibly a notification, possibly a fraud check.
Where does it live?

In a naive OOP design, you put it on `BankAccount`.
Soon `BankAccount` knows about notifications, fraud detection, and transaction logging — none of which is intrinsic to what a bank account _is_.
The object has become a dumping ground for every behavior that touches its data.

The alternative — a `TransferService` or `TransactionProcessor` — is procedural code wearing an object's clothes.
You have not modeled the domain; you have built a function with a class wrapper.

OOP set a trap for itself.
Objects model things.
But interesting behavior happens _between_ things, _in the context of_ specific interactions.
That behavior has no natural home in a class hierarchy.
No `extends`.
No `implements`.
No place at all.

---

## DCI: The Partial Correction

In the late 2000s, Trygve Reenskaug — the same person who invented MVC — came back to the problem with a collaborator, James Coplien.
Their answer was [DCI](/writing/dci/): Data, Context, Interaction.

The insight was clean, and it separated three concerns that OOP had collapsed together:

- **Data**: what objects _are_ (their identity and attributes)
- **Context**: the scenario or use case being executed
- **Interaction**: the roles objects _play_ in that context

In DCI, a `BankAccount` object is just data — a balance and an ID.
But in the context of a funds transfer, it plays the role of `SourceAccount` or `DestinationAccount`, with behavior specific to that role, for the duration of the interaction.
Objects are not statically typed by their behavior; they are dynamically cast into roles as situations demand.

This is much closer to how humans actually think about behavior.
A person is not statically a `CustomerRole` or an `EmployeeRole`.
In the context of buying something, they are a customer.
In the context of their job, they are an employee.
The same entity plays different roles in different situations.

DCI's diagnosis was right: behavior belongs to _interactions_, not to _objects_.

---

## Why You Have Probably Never Used DCI

DCI never went mainstream, and the reasons are instructive — [post 6](/writing/dci/) covers them in depth.
The short version is that the implementation was awkward — role injection requires dynamic object extension, natural in Smalltalk and Ruby, a gymnastics act in statically-typed languages.
The vocabulary was unfamiliar to anyone trained on OOP.
And most importantly, DCI addressed the right problem at the wrong level: it gave you a way to think about behavior in context but no way to design the _system_ as a whole.

The field learned something real from DCI and then mostly moved on, carrying the lesson incompletely.

---

## The Lesson OOP Left Behind

OOP didn't fail.
It succeeded at what it was actually good at: managing complexity in systems where the domain maps cleanly onto a class hierarchy, where objects have clear identity and well-bounded behavior.

What OOP could not do — and what its mainstream adoption obscured — was provide a way to think about _features_ as first-class entities.
A feature is not a class or a layer.
It is a unit of user-facing behavior that spans data, logic, and interaction.
OOP gave us no word for this and no place to put it.

DCI got close.
It understood that behavior belongs to interactions, not to data.
But it left the harder question unanswered: how do you design a system as a collection of coherent, independent, user-meaningful units of functionality?

That question would take another twenty years, [a patterns movement](/writing/patterns-movement/), [several architectural revolutions](/writing/hexagonal-slices-architecture-wars/), and [one MIT professor](/writing/jacksons-synthesis/) to answer properly.

---

---

_Part of the series: Legible by Design: The Long Search_

## References

- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). [_Design Patterns: Elements of Reusable Object-Oriented Software_](https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610). Addison-Wesley.
- Reenskaug, T. & Coplien, J. (2009). ["The DCI Architecture: A New Vision of Object-Oriented Programming."](https://www.artima.com/articles/the-dci-architecture-a-new-vision-of-object-oriented-programming)
- Jackson, D. [_The Essence of Software_](https://essenceofsoftware.com)
