---
title: "DCI: The Diagnosis Was Right, the Cure Didn't Take"
description: 'Post 5 ended with a verdict on object-oriented programming: objects are good at modeling data with associated operations, but interesting behavior happens between objects, in the…'
date: 2026-09-15
series: 'legible-by-design-the-long-search'
order: 6
originalUrl: 'https://medium.com/@daveelkins/dci-the-diagnosis-was-right-the-cure-didnt-take-0d294dfde155'
source: 'medium'
tags: [architecture, software-history]
draft: false
---

Post 5 ended with a verdict on object-oriented programming: objects are good at modeling data with associated operations, but interesting behavior happens _between_ objects, _in the context of_ specific interactions.
OOP had no word for this and no place to put it.

Two people who understood this better than almost anyone were Trygve Reenskaug — the inventor of MVC — and James Coplien, a [software patterns](/writing/patterns-movement/) pioneer who had spent decades studying how expert programmers actually think.
In the late 2000s, they collaborated on a book, _Lean Architecture_, and a design approach called DCI: Data, Context, Interaction.

DCI is the most serious attempt before Concept Design to fix what MVC and OOP got wrong.
Its diagnosis was sharp.
Its prescription was genuine.
And it never went mainstream — for reasons that are themselves instructive.

---

## What MVC Actually Missed

Reenskaug invented MVC in 1979, and he spent the following decades watching it get misunderstood.
By the time Rails and Django had popularized the pattern, what remained bore little resemblance to his original intent.

His original insight was that software should reflect the user's mental model — the concepts users think in, the things they care about, the way they understand the system to work.
The Model was supposed to capture that mental model: not a database row, but a representation of knowledge.

What MVC missed — what Reenskaug himself came to articulate clearly only later — was _behavior in context_.
A user does not just have a mental model of what things _are_.
They have a mental model of what things _do_ in specific situations.
A bank account behaves one way when you are checking a balance and a different way when you are participating in a funds transfer.
The same object plays different roles in different interactions.

MVC modeled the nouns.
It had no answer for the verbs — for behavior that belongs to interactions rather than to objects.
No verbs at all.

DCI was designed to fill that gap.

---

## The DCI Model

DCI separates three concerns that OOP had collapsed together:

**Data** is what objects _are_.
Their identity, their attributes, their persistent state.
A `BankAccount` has a balance and an owner.
That is its data.
Data is stable — it does not change based on what interaction is happening.

**Context** is the scenario being enacted.
A funds transfer is a context.
A balance inquiry is a context.
Contexts correspond to the use cases users actually care about — the things they are trying to accomplish.
Each context has a well-defined beginning, a set of roles to be played, and an end.

**Interaction** is the behavior that objects exhibit when playing roles in a context.
In the funds transfer context, a `BankAccount` plays the role of `SourceAccount` — with behavior specific to that role, like verifying sufficient funds and debiting the balance.
In a different context, the same account plays `DestinationAccount`, with different behavior.
The role is not a permanent property of the object; it is a costume worn for the duration of an interaction.

The key move: behavior is attached to _roles in contexts_, not to _objects_, permanently.
An object is not statically a `SourceAccount`.
It becomes one when the context needs it to.

This is closer to how users think.
Users do not think "the bank account object has a transfer method."
They think "I am transferring money from my savings to my checking."
The context — the transfer — is the primary thing.
The objects are participants.

---

## What DCI Got Right

DCI made three genuine advances over OOP.

**Use cases became first-class entities.** OOP gave us objects.
DCI gave us _use cases as first-class entities_.
The Context is not just a service class or a controller action — it is a named, bounded scenario with defined roles and a defined operational principle.
Naming this level is real progress.

**The accumulation problem had a structural solution.** OOP's objects accumulate methods because every behavior that touches their data gets added to them.
DCI's Data objects are lean — they hold state and nothing else.
Behavior lives in roles, which live in contexts.
The accumulation problem finally had a way out.

**The user's perspective was finally in the design.** Contexts correspond to what users are trying to do.
Roles correspond to how users think about participants in those interactions.
DCI keeps the user's perspective in the design in a way that pure OOP does not.

Read Coplien and Reenskaug's account of DCI and you feel the rightness of the diagnosis.
They understood what was wrong.
The question is why the cure did not spread.

---

## Why DCI Didn't Catch On

The reasons are layered, and each one teaches something.

**The implementation was language-dependent.** DCI's roles require injecting behavior into objects at runtime — making an existing object suddenly respond to new methods for the duration of an interaction.
Reenskaug's original prototyping was in Squeak Smalltalk; when he and Coplien formally introduced DCI in their 2009 paper [_The DCI Architecture: A New Vision of Object-Oriented Programming_](https://www.artima.com/articles/the-dci-architecture-a-new-vision-of-object-oriented-programming), the Ruby community became its most enthusiastic adopter.
Ruby's open classes and `Object#extend` made role injection almost natural.
But in Java, C#, or statically-typed languages generally, it requires awkward casting, wrapper objects, or runtime reflection.
Coplien's own implementations worked through C++ templates — functional, but not something most teams would willingly adopt.
The gap between "this works cleanly in Ruby" and "this works everywhere" was never bridged.
Eventually James Coplien created an entirely new language — called `trygve`, after Reenskaug — with DCI support built in natively.
That a new language was required is itself a signal of how far the mainstream was from being ready.

**The Context was underspecified.** DCI told you that contexts exist and that they should correspond to use cases.
It didn't give you a rigorous method for identifying the right contexts, defining their boundaries, or deciding what counts as one context versus two.
This left too much to judgment, and judgment is hard to teach and hard to apply consistently across a team.

**It was taught through OOP vocabulary.** DCI was presented as an evolution of object-oriented programming — a correction to OOP's excesses.
That framing made it feel like an advanced OOP technique, something for seasoned practitioners willing to adopt new idioms.
It never established itself as a standalone design theory approachable on its own terms.

**It had no sync story.** DCI got the _intra-context_ structure right: data, roles, context, interaction.
But it had little to say about how contexts relate to each other.
When a funds transfer context completes, what happens to the notification context?
The audit log context?
DCI's answer was: that is your problem.
The relationships between contexts — the coordination layer — were left unaddressed.
Unaddressed, and unresolved.

This last gap is exactly what [Concept Design's sync layer](/writing/jacksons-synthesis/) fills.

---

## The Line from DCI to Concepts and Syncs

If you squint at DCI and Concept Design side by side, the family resemblance is clear.

DCI's **Data** → Concept Design's concept **state**: stable, owned by one entity, not shared across boundaries.

DCI's **Context** → Concept Design's **concept**: a named, bounded unit of user-facing functionality with a defined operational principle.

DCI's **roles in contexts** → Concept Design's **actions**: behavior defined in terms of what the concept does, not what data it holds.

But Concept Design adds what DCI left out: the **sync layer**.
When one concept completes an action, the sync layer observes it and coordinates responses in other concepts.
The relationships between concepts are explicit, centralized, and owned by neither concept.
The inter-context coordination problem that DCI left as an exercise for the reader gets a first-class architectural home.

In this sense, Concept Design is DCI with the missing piece supplied.
Reenskaug and Coplien got the intra-concept structure right.
Jackson got the inter-concept coordination right.
Together they cover the full picture.

---

## The Lesson

DCI matters for this history not because it succeeded but because it failed in an instructive way.
It proved that the field understood, at least partially, what was wrong with OOP.
It proved that naming use cases and roles as first-class entities was the right direction.
And it identified, by omission, the piece that was still missing: an explicit, principled account of how independent behavioral units coordinate without coupling.

That account is what the rest of this series builds toward.

---

---

_Part of the series: Legible by Design: The Long Search_

## References

- Reenskaug, T. & Coplien, J. (2009). ["The DCI Architecture: A New Vision of Object-Oriented Programming."](https://www.artima.com/articles/the-dci-architecture-a-new-vision-of-object-oriented-programming)
- Reenskaug, T. & Coplien, J. [_Lean Architecture_](https://www.wiley.com/en-us/Lean+Architecture%3A+for+Agile+Software+Development-p-9780470684207). Wiley.
- Jackson, D. [_The Essence of Software_](https://essenceofsoftware.com)
