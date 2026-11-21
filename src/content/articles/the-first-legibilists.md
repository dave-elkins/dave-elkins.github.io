---
title: 'The First Legibilists'
description: 'You are maintaining a codebase that was written before you joined. Nobody on the team wrote most of it. Nobody fully understands all of it.'
date: 2026-08-26
series: 'legible-by-design-the-long-search'
order: 3
originalUrl: 'https://medium.com/@daveelkins/the-first-legibilists-24213c2d3119'
source: 'medium'
tags: [legibility, software-history]
draft: false
---

You are maintaining a codebase that was written before you joined.
Nobody on the team wrote most of it.
Nobody fully understands all of it.

This is not a new problem.
By the early 1960s, software had a problem it had not anticipated.
Programs were getting large.
Teams were getting bigger.
And code written by one person was increasingly being read, maintained, and modified by others — often much later, often without the original author available to explain what they had been thinking.

The foundational model of computation, inherited from Turing and Von Neumann, had nothing to say about this.
Code was instructions for machines.
Whether humans could understand it was not part of the specification.

A handful of thinkers decided this wasn't acceptable.
They would spend the next two decades arguing, in different ways and from different angles, for the same proposition: that comprehensibility is not a luxury feature of software.
It is a fundamental requirement.

They were the first legibilists.
They didn't use that word.
But that is what they were.

---

## Dijkstra: Structure as the Prerequisite for Reasoning

In 1968, a short letter appeared in _Communications of the ACM_ titled ["Go To Statement Considered Harmful"](https://doi.org/10.1145/362929.362947).
Its author was Edsger Dijkstra, a Dutch computer scientist with a gift for the precise, uncomfortable statement.
It became one of the most influential pieces of writing in the history of software.

His argument was not primarily about `goto` — it was about what makes code possible to reason about.
A program with unrestricted `goto` statements can jump to any point in the code from any other point.
The result is that the program's execution path cannot be understood by reading the code sequentially.
You cannot reason about what the program does by reading what it says.
The gap between text and execution is unbridgeable.

Structured programming — using loops, conditionals, and subroutines instead of arbitrary jumps — was Dijkstra's prescription.
Its virtue was not elegance but _reasonability_: structured code could be read, understood, and verified by a human mind working through it systematically.

Dijkstra's [EWD notes](https://www.cs.utexas.edu/~EWD/) — a series of handwritten and typed memos he distributed informally over decades — extended this argument in every direction.
Complexity is the fundamental enemy of software.
The programmer's primary obligation is to manage complexity so that human minds can keep up with what the code does.
"The art of programming," he wrote, "is the art of organizing complexity."

This is a legibility argument.
Not aesthetics.
Not elegance for its own sake.
The structure of code must be such that a human can reason about it.

---

## Knuth: Programs Are for Humans

"Programs are meant to be read by humans and only incidentally for computers to execute."

That is Donald Knuth's most quoted sentence.
It is almost paradoxical coming from the author of _The Art of Computer Programming_ — the first volume published in 1968, the same year as Dijkstra's goto letter — a book famous for its mathematical rigor and its depth of algorithmic detail.
Not, at first glance, a book about human comprehension.

This is a radical claim.
It inverts the foundational assumption that code is instructions for machines.
Knuth is saying that the primary audience for code is human.
The machine is secondary.
The criterion for good code is not just that it runs correctly but that a human can understand it.

Knuth put this belief into practice with literate programming — a system he developed in the 1980s in which a program is written as a document for human readers, with code woven into the prose rather than the reverse.
The idea was that the natural order of explanation for humans is not the same as the natural order of execution for machines, and that code should be organized around the former.

Literate programming never went mainstream — its tooling was awkward and its demands on the programmer were high.
But the underlying claim has never been refuted: the primary reader of code is a human being, and that should shape how code is written.

---

## Parnas: Modules Should Encapsulate Decisions

What makes a good module?
The question sounds obvious, but nobody had answered it clearly until David Parnas tackled it in his 1972 paper ["On the Criteria to Be Used in Decomposing Systems into Modules"](https://doi.org/10.1145/361598.361623).
He approached the legibility problem from a different angle than Dijkstra or Knuth.

The conventional answer was functional decomposition — break the program into steps, make each step a module.
Parnas argued this was wrong.
A module decomposed by steps exposes the program's algorithm, which means any change to the algorithm requires changes across many modules.

His answer: a module should encapsulate a _design decision_ — a piece of knowledge about the system that might change.
The module's interface should hide that knowledge from everything outside it.
Change the decision, change only the module.
The rest of the system is unaffected.

This is information hiding, and it is the first rigorous account of what a module should _mean_ — not just what it should do.
A module is not an arbitrary boundary.
Not a convenience.
A semantic commitment: "this piece of knowledge lives here, and nowhere else."

Parnas's criterion is still the right one.
[Jackson's concepts](/writing/jacksons-synthesis/), forty years later, are Parnas modules applied to user-facing functionality: each concept encapsulates the design decisions associated with one coherent unit of user experience, and hides those decisions from every other concept.

---

## Brooks: Conceptual Integrity

The most important property of a software system is _conceptual integrity_ — the quality of appearing to have been designed by a single coherent mind, even when built by a large team.
Fred Brooks arrived at this argument through experience: he managed the development of IBM's OS/360 — one of the largest software projects ever attempted at the time — and documented the lesson in _The Mythical Man Month_ (1975), one of the most cited books in software engineering.
Its central concept is one that Jackson will later reclaim and make precise.
A system with conceptual integrity has a consistent set of ideas running through it.
Its parts fit together.
Its behavior is predictable.
A user who learns one part of the system has a head start on understanding the rest.

"Conceptual integrity," Brooks wrote, "is the most important consideration in system design."

The word "concept" is doing real work here, even if Brooks did not develop it formally.
He understood that software has to make sense — not just to the machine, not just to the programmer who wrote it, but to the human mind encountering it.
A system whose parts have been built without a shared conceptual model is harder to use, harder to understand, and harder to change.

Brooks could not yet say what concepts were or how to design them.
That would take another forty-five years.
But he named the thing that was missing.

---

## What the Legibilists Left Open

Dijkstra, Knuth, Parnas, and Brooks were right about the most important thing: human comprehension is a first-class requirement of software, not an afterthought.
Their arguments were clear, their evidence was compelling, and they were largely ignored by the mainstream for decades.

But they also left a gap.
They argued for comprehensibility at the level of code structure — modules, subroutines, information hiding.
They said relatively little about what code should be organized _around_.
What are the right units of decomposition?
How do you decide where one module ends and another begins?
How do you ensure that the structure of your code corresponds to the structure of the problem you are solving — not just to the convenience of the programmer or the framework?

These questions were left for subsequent generations.
The next thirty years of software architecture — [MVC](/writing/mvc-original-sin/), [OOP](/writing/objects-supposed-to-fix-this/), [design patterns](/writing/patterns-movement/), [hexagonal architecture](/writing/hexagonal-slices-architecture-wars/), [vertical slices](/writing/hexagonal-slices-architecture-wars/) — can be read as a series of attempts to answer them.
Each attempt got something right and left something unfinished.

The search was underway.

---

---

_Part of the series: Legible by Design: The Long Search_

## References

- Dijkstra, E. [EWD notes](https://www.cs.utexas.edu/~EWD/)
- Knuth, D. [_The Art of Computer Programming_](https://www-cs-faculty.stanford.edu/~knuth/taocp.html). Addison-Wesley.
- Parnas, D. (1972). ["On the Criteria to Be Used in Decomposing Systems into Modules."](https://doi.org/10.1145/361598.361623) _Communications of the ACM_.
- Brooks, F. (1975). [_The Mythical Man-Month_](https://www.informit.com/store/mythical-man-month-the-essays-on-software-engineering-9780201835953). Addison-Wesley.
- Jackson, D. [_The Essence of Software_](https://essenceofsoftware.com)
