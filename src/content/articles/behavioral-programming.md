---
title: 'Behavioral Programming: The Academic Road Not Taken'
description: 'What if you could add a new feature to your codebase without touching any existing code? Not by abstraction. Not by over-engineering. By structural design.'
date: 2026-11-03
series: 'legible-by-design-the-long-search'
order: 9
tags: [architecture, software-history]
draft: false
---

What if you could add a new feature to your codebase without touching any existing code?
Not by abstraction.
Not by over-engineering.
By structural design.

A particular kind of idea surfaces in academic computer science, gets appreciated by the people who read the right journals, and then disappears from mainstream discourse for fifteen years — not because it was wrong, but because it was right in a way the industry was not yet ready to use.

David Harel's Behavioral Programming is one of those ideas.

---

## Harel's Starting Point

David Harel is an Israeli computer scientist best known for two things.
The first is Statecharts — a formalism for describing complex state machines that influenced UML and is still used in safety-critical systems today.
The second is Live Sequence Charts — scenario-based specifications he co-invented with Willem Damm in the late 1990s, and the direct ancestor of everything he did afterward.

In 2010, Harel turned his attention to a problem that will sound familiar by now: how do you build software systems where independent behavioral concerns can coexist without tangling?

His motivating observation was this: real-world behavior is not naturally sequential.
A system does not do one thing at a time.
It juggles independent concerns at once — security, logging, business rules, user interaction, background processing.
In conventional programming, you weave these concerns into a single thread of execution.
The result is code where separating "what the system does" from "how all these concerns happen to be interleaved" is difficult.

Aspect-Oriented Programming (AOP) had tried to address this with "aspects" — cross-cutting concerns that could be defined separately and woven into the main program.
But AOP was surgical: you defined advice that ran before or after specific join points, and you composed it with a weaver.
AOP is modular in the source code and still entangled in execution.

Harel wanted something more radical: behavioral threads that were truly independent, each expressing a complete behavioral concern, coordinated by a runtime that mediated between them.

---

## B-Threads: The Core Idea

The central construct in Behavioral Programming is the **b-thread** — a behavioral thread.

Each b-thread expresses a single behavioral scenario, written as if it were the only thing happening in the system.
A b-thread does not call other b-threads.
It does not hold references to other components.
It simply declares, at each step, what it wants to _request_ (events it wants to trigger), what it is _waiting for_ (events it wants to react to), and what it wants to _block_ (events it wants to prevent).

The runtime — called the b-program — collects these declarations from all active b-threads at each step and finds an event that satisfies them: an event that some thread has requested, that no thread has blocked.
It fires that event.
Threads waiting for it wake up.
The cycle repeats.

The result is a system where behavioral concerns are independent in the source code.
A security b-thread that blocks certain operations under certain conditions does not need to know about the business logic b-threads it is constraining.
A logging b-thread that records every significant event does not need to be called by the threads it observes.
Each thread expresses its own concern in its own terms; the runtime mediates the interactions.

This is elegant.
Once you see it, you can see what it points at.

---

## The Parallel to WYSIWID

If you have been following this series, the structure should look familiar.

In [WYSIWID](/writing/jacksons-synthesis/), concepts are independent modules that never call each other directly.
They communicate through a sync engine — a runtime that observes completed actions and triggers appropriate responses in other concepts.
The sync rules, like b-thread declarations, live outside the concepts themselves.
Coordination is explicit, centralized, and separate from the concepts it coordinates.

B-threads and WYSIWID concepts are not the same thing — the level of abstraction is different, and b-threads are finer-grained than concepts.
But the architectural intuition is identical: **independent behavioral units, mediated by an explicit runtime, with coordination logic that lives outside the units themselves.**

Harel arrived at this intuition from the direction of formal specification and state machines.
Jackson arrived at it from the direction of software design theory and usability.
They were, without knowing it, triangulating on the same structure.

[Sullivan and Notkin](/writing/patterns-movement/) pointed at it in 1992.
Harel formalized it in 2010.
[Jackson](/writing/jacksons-synthesis/) named it for software design in the 2020s.
The same insight, rediscovered three times.

---

## BPpy: Proof of Concept in Python

Harel and his collaborators eventually produced [BPpy](https://github.com/bThink-BGU/BPpy) — a Python library implementing Behavioral Programming.

BPpy is small and unpretentious.
You define b-threads as Python generators.
Each yield point is a synchronization point where the thread declares its request, wait, and block sets.
The runtime collects these declarations, selects an event, and resumes the appropriate threads.

A simple example is a system that adds hot and cold water to a bath.
One b-thread adds hot water three times.
Another adds cold water three times.
A third keeps the temperature stable: it blocks whichever event just fired, so the runtime never selects the same event twice in a row.
Each thread stands alone; the constraint thread never touches the others.
The runtime mediates.

This is the canonical [Hot Cold example](https://bppy.readthedocs.io/en/latest/Examples/hot_cold.html) from the library's documentation.

```python
import bppy as bp

@bp.thread
def add_hot():
    for _ in range(3):
        yield bp.sync(request=bp.BEvent("HOT"))

@bp.thread
def add_cold():
    for _ in range(3):
        yield bp.sync(request=bp.BEvent("COLD"))

@bp.thread
def control_temp():
    e = bp.BEvent("Dummy")
    while True:
        e = yield bp.sync(waitFor=bp.All(), block=e)

b_program = bp.BProgram(
    bthreads=[add_hot(), add_cold(), control_temp()],
    event_selection_strategy=bp.SimpleEventSelectionStrategy(),
    listener=bp.PrintBProgramRunnerListener()
)
b_program.run()
```

The output never repeats an event in a row, enforced by `control_temp` — without that thread knowing anything about the other two.
The constraint appears once, in one place, in its own terms.

Build something non-trivial with BPpy and you feel both the power and the friction.
The power: independent behavioral concerns, composable without coupling.
The friction: the request/wait/block vocabulary is unfamiliar, the generator-based syntax is unusual, and debugging requires understanding what the runtime is doing at each synchronization point.

---

## Why It Never Went Mainstream

BPpy exists.
The papers are clear.
The ideas are sound.
Why have most working engineers never heard of Behavioral Programming?

The vocabulary is the first barrier.
Requests, waits, blocks, synchronization points — this is not how most engineers think about programming.
The mental model requires a genuine shift, and the industry has limited patience for paradigm shifts that do not come with a clear migration path from existing code.

The implementation story is the second.
BPpy is a research library, not a production framework.
It does not come with guidance on how to structure a real application — how to manage state across b-threads, how to integrate with a database, how to handle errors and retries, how to test at scale.
The theory is complete; the practice is not.

The third problem is abstraction level.
B-threads are fine-grained behavioral scenarios.
A non-trivial application might have dozens or hundreds of them.
The pattern works beautifully for specifying and verifying behavioral properties — which is Harel's domain.
As the primary organizational unit of an application a team has to understand and maintain, it is less self-evidently right.

And then there is the academic framing.
Papers published in formal methods venues, written in the vocabulary of computer science theory, do not reach the engineers who build Rails applications or Django services.
The ideas circulate in one world and not the other.

The tragedy is not that Behavioral Programming failed.
The insight it embodies — that coordination between independent behavioral concerns needs a first-class, explicit runtime home — is correct, and it has sat in the literature, unused by industry, for fifteen years.

---

## What the Academic Road Teaches Us

Behavioral Programming represents the most formally rigorous ancestor of the architectural pattern this series is building toward.
It proved, in working code and mathematical notation, that independent behavioral modules can coexist in a single system without coupling — as long as you make the coordination between them explicit and hand it to a mediating runtime.

That is the proof of concept.
The remaining question was how to state the same insight at the right level of abstraction for application design — in terms that domain modelers and working engineers could use, without requiring a background in formal methods.

That is the question [Daniel Jackson](/writing/jacksons-synthesis/) set out to answer.

---

---

_Part of the series: Legible by Design: The Long Search_

## References

- Harel, D., Marron, A., & Weiss, G. (2010). [Programming Coordinated Behavior in Java](https://doi.org/10.1007/978-3-642-14107-2_12). _ECOOP 2010_ (LNCS 6183, pp. 250–274).
- Harel, D., Marron, A., & Weiss, G. (2012). [Behavioral Programming](https://doi.org/10.1145/2209249.2209270). _Communications of the ACM_, 55(7), 90–100. ([Free author version](https://www.wisdom.weizmann.ac.il/~amarron/BP%20-%20CACM%20-%20Author%20version.pdf))
- Yaacov, T., Weiss, G., Ashrov, A., Katz, G., & Zisser, J. (2025). [Exploring and Evaluating Interplays of BPpy with Deep Reinforcement Learning and Formal Methods](https://doi.org/10.5220/0013215200003928). _ENCASE 2025_.
- [BPpy](https://github.com/bThink-BGU/BPpy). Python implementation of Behavioral Programming, maintained at Ben-Gurion University.
- Jackson, D. [_The Essence of Software_](https://essenceofsoftware.com)
- Meng & Jackson. ["What You See Is What It Does."](https://doi.org/10.1145/3759429.3762628)
