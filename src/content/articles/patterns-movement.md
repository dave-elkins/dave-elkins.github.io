---
title: 'The Patterns Movement'
description: 'You have used the word "Factory" in a pull request description. You have heard someone say "that''s a Strategy pattern" in a design meeting. The vocabulary is useful. But it is…'
date: 2026-09-23
series: 'legible-by-design-the-long-search'
order: 7
originalUrl: 'https://medium.com/@daveelkins/the-patterns-movement-36ad5aa9272c'
source: 'medium'
tags: [architecture, software-history]
draft: false
---

You have used the word "Factory" in a pull request description.
You have heard someone say "that's a Strategy pattern" in a design meeting.
The vocabulary is useful.
But it is also incomplete.

In 1994, four authors published a book that every serious software engineer was supposed to have read and that most software engineers have actually read about forty pages of.
_Design Patterns: Elements of Reusable Object-Oriented Software_ — the Gang of Four book — cataloged 23 recurring solutions to common design problems.
It gave the field a shared vocabulary.
It made structural thinking respectable.

It also, quietly, contained a pattern that pointed far beyond what the authors intended.

---

## What the Patterns Movement Got Right

The premise of the patterns movement was simple and correct: experienced engineers repeatedly solve the same structural problems, and those solutions can be named, documented, and taught.

Before GoF, design knowledge lived in the heads of senior engineers and leaked out slowly through code review and mentorship.
After GoF, you could say "use a Factory here" or "this is a Strategy pattern" and be understood immediately.
The vocabulary was useful — not because it gave you new ideas, but because it let you communicate existing ideas precisely.

The patterns movement also made an important philosophical point: good design is not arbitrary.
There are better and worse ways to structure code, and the better ways recur.
You can study them.
You can reason about them.
Software design is a discipline, not an art.

This wasn't obvious in 1994.
The Gang of Four book arrived during a period when "software engineering" was still fighting for legitimacy as a field.
The patterns movement helped advance that fight.

---

## What the Patterns Movement Got Wrong

The 23 patterns in GoF are almost entirely _structural_.
They describe how to arrange objects and classes to achieve certain properties: flexibility, extensibility, decoupling.
They say little about _semantics_ — about what your code should mean, what concepts it should express, what the user cares about.

That was by design.
GoF was written in the OOP paradigm, and OOP's unit of organization is the class.
The patterns are about how to arrange classes.
Factory, Singleton, Observer, Decorator — these are all answers to questions about class relationships and object creation.
They are useful.
They are also entirely silent on the question of what your system is _for_.

The result was that a generation of engineers learned to think about design in terms of structure — layers, interfaces, abstractions, hierarchies — while the question of domain semantics got less and less attention.
You could have beautifully patterned code that was completely incomprehensible as a description of the problem it solved.

The patterns vocabulary also had an unintended side effect: it made over-engineering respectable.
If you knew the patterns, you could introduce AbstractFactoryBuilderStrategyObserver and defend each choice with a GoF citation.
The patterns became a way to demonstrate sophistication rather than a tool for managing genuine complexity.
A badge, not a tool.

---

## The Mediator Pattern: A Clue Hiding in Plain Sight

One pattern that stands out in GoF's catalog is the Mediator.

The problem it solves: you have a set of objects that need to communicate with each other, but direct connections between them create a tangled web of dependencies.
Every object knows about every other object.
Change one and you may need to change them all.

The Mediator's solution: introduce a central object that all the other objects communicate through.
Instead of objects talking to each other directly, they talk to the mediator, which coordinates the interaction.
The objects remain independent; the mediator manages their relationships.

GoF's canonical example is a dialog box with multiple UI widgets.
Changing one widget — checking a checkbox, selecting from a dropdown — should affect others.
Without a mediator, every widget holds a reference to every other widget it might need to update.
With a mediator, the dialog box itself coordinates: "when this checkbox changes, update that text field."

This is a useful structural pattern.
But read it slowly and you notice something: the Mediator is doing something semantically interesting.
It is externalizing _coordination logic_ — the logic about how independent components interact — into a dedicated object.
The components stay focused on their own behavior.
The relationships between components live somewhere explicit.

This is, in embryonic form, the idea that will eventually become [WYSIWID's sync engine](/writing/jacksons-synthesis/).

---

## Sullivan and Notkin: Thirty Years Early

In 1992 — two years before GoF — Kevin Sullivan and David Notkin published a paper in _ACM Transactions on Software Engineering and Methodology_ (TOSEM, Volume 1, Issue 3) titled ["Reconciling Environment Integration and Software Evolution"](https://doi.org/10.1145/131736.131744).

It does not have the cultural footprint of GoF.
If you work in industry, you have almost certainly never heard of it.
But it contains an idea that was thirty years ahead of its time.

Sullivan and Notkin were working on a problem in software development environments: how do you integrate independent tools — an editor, a compiler, a debugger, a version control system — without coupling them to each other?
Each tool needs to react to changes in the others.
The compiler needs to know when the editor saves a file.
The debugger needs to know when the compiler produces new symbols.
But if every tool directly depends on every other tool, you cannot evolve any of them independently.

Their solution was **Mediators** (note the capital M — distinct from GoF's mediator pattern, though related in spirit).
A Mediator was a first-class software entity that maintained a relationship between tools.
It was not part of any tool.
It lived outside them, observing their events and triggering appropriate reactions.
It owned the coordination logic explicitly.

The key insight: **integration logic is a first-class concern, not an afterthought**.
The relationships between independent components are as important as the components themselves, and they deserve their own place in the architecture.

Sullivan and Notkin were writing about development tools, not about application architecture.
But the structural insight generalizes completely.
If you replace "tools" with "concepts" and "development environment" with "application," you get something close to [WYSIWID's sync layer](/writing/jacksons-synthesis/): a dedicated place where the coordination logic between independent domain concepts lives explicitly, owned by no concept, serving the system as a whole.

The paper was cited, appreciated in academic circles, and then largely ignored by industry for three decades.

---

## Why the Patterns Movement Wasn't Enough

The patterns movement gave the field structure and vocabulary.
It established that design could be reasoned about.
These were real contributions.

But patterns are local.
Each pattern solves a problem in a bounded context — how to create objects, how to decouple interfaces, how to manage state.
They do not compose into a theory of how to design a system.
You can apply all 23 GoF patterns correctly and still end up with a codebase that nobody understands, because the patterns say nothing about what your system should express.

The Mediator pattern was the closest thing in GoF to a systemic insight.
But GoF presented it as one structural option among many — use it when you have too many direct object connections.
Sullivan and Notkin understood it as something deeper: coordination between independent components is a fundamental architectural concern that needs a permanent, first-class home.

That insight would not find its way into mainstream architectural thinking for another decade, and even then only partially.

---

---

_Part of the series: Legible by Design: The Long Search_

## References

- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). [_Design Patterns: Elements of Reusable Object-Oriented Software_](https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610). Addison-Wesley.
- Sullivan, K. & Notkin, D. (1992). ["Reconciling Environment Integration and Software Evolution."](https://doi.org/10.1145/131736.131744) _ACM Transactions on Software Engineering and Methodology_.
- Jackson, D. [_The Essence of Software_](https://essenceofsoftware.com)
