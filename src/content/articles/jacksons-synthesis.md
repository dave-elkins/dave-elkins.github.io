---
title: "Jackson's Synthesis"
description: 'Every idea in this series has been pointing at the same place.'
date: 2026-11-21
series: 'legible-by-design-the-long-search'
order: 11
tags: [concept-design, wysiwid, architecture, software-history]
draft: false
---

Every idea in this series has been pointing at the same place.

[Reenskaug](/writing/mvc-original-sin/) wanted code to reflect the concepts users think in.
[OOP](/writing/objects-supposed-to-fix-this/) promised to model the world but delivered inheritance hierarchies.
[The Gang of Four](/writing/patterns-movement/) gave us structural vocabulary but not semantic meaning.
[Sullivan and Notkin](/writing/patterns-movement/) said coordination logic deserves a first-class home.
[Cockburn](/writing/hexagonal-slices-architecture-wars/) drew a clean boundary at the perimeter and left the interior unresolved.
[Bogard](/writing/hexagonal-slices-architecture-wars/) said organize by feature and left "what is a feature?"
unanswered.
[Harel](/writing/behavioral-programming/) proved that independent behavioral concerns can coexist without coupling, if you give them a mediating runtime.

Each of these was a partial answer.
Daniel Jackson's contribution is the synthesis: a coherent design theory that resolves all of these partial answers into a single, usable framework.

---

## The Essence of Software: What a Concept Is

Jackson's book [_The Essence of Software_](https://essenceofsoftware.com) (2021) opens with a deceptively simple observation: software is hard to use because it does not match the user's mental model of the problem.
The gap between what users expect and what software does is not primarily a UI problem.
It is a design problem — a failure to identify and express the right concepts.

A **concept**, in Jackson's sense, is a unit of user-facing functionality.
Not a class.
Not a table.
Not a layer.
A concept is something users think in terms of: a post, a comment, a subscription, a notification, a label.
It exists because some user need requires it.
It has behavior that users can understand and predict.

This definition does real work.
It excludes things that are implementation details — database tables, service classes, HTTP endpoints.
It excludes things that are technical infrastructure — caches, queues, adapters.
A concept must be legible to a user.
If you cannot explain it to a non-technical stakeholder in a sentence, it is probably not a concept.

Each concept has three components that Jackson defines precisely:

**State**: the data the concept manages, private to that concept.
No other concept reads or writes it directly.

**Actions**: the operations users can perform on the concept.
Each action has a defined effect on state and a defined output — an ActionRecord that other parts of the system can observe.

**Operational principle**: the invariant the concept maintains.
The narrative of how it works: "to post a comment, you create it; to read it, you retrieve it; to remove it, you delete it."
The operational principle is not documentation — it is a design constraint that actions must satisfy.

---

## Concepts Are Independent

The most important architectural property of concepts is that they do not know about each other.

A `Comment` concept does not import a `Post` concept.
It does not call `Post.exists()` before creating a comment.
It holds a reference to a post — an opaque identifier, an uninterpreted atom — but it has no knowledge of what that identifier means.
The `Post` concept's internals are invisible to `Comment`.

This independence is intentional.
It is the central design constraint, and it is what makes concepts composable.

The obvious question: if concepts don't know about each other, how do they coordinate?
When a post is deleted, comments on that post should be deleted too.
If `Comment` can't call `Post`, and `Post` can't call `Comment`, where does that logic live?

The answer is the sync layer.

---

## The Sync Layer: Coordination Made Explicit

Jackson's sync layer — and its structural elaboration in the WYSIWID paper — is where the [Sullivan and Notkin](/writing/patterns-movement/) insight finally finds its application-design home.

The sync layer is a dedicated place in the architecture where the relationships between concepts are expressed explicitly.
Sync rules have a simple shape: _when action A completes in concept X, trigger action B in concept Y_.
When `Post.delete` completes, the sync layer fires `Comment.deleteForPost`.
The `Post` concept does not know this happens.
The `Comment` concept does not know why it is being asked to delete.
The coordination logic lives entirely in the sync layer, owned by neither concept, visible to any engineer who wants to understand how the system behaves.

This is [Sullivan and Notkin's Mediator](/writing/patterns-movement/), built for application design.
This is [Harel's b-program runtime](/writing/behavioral-programming/), at the right level of abstraction for domain modeling.
This is what the [Mediator pattern in GoF](/writing/patterns-movement/) was gesturing at without quite reaching.

The sync layer also handles the harder cases.
Guards prevent actions from executing unless conditions are met — expressed as sync rules, not buried in concept logic.
Compensating actions roll back partial state if a sync chain fails.
The sync layer is not a simple event bus; it is a first-class architectural component with its own design vocabulary.

---

## The WYSIWID Paper: The Pattern Named

Jackson's book established what concepts are and how to design them.
The [WYSIWID paper](https://doi.org/10.1145/3759429.3762628) — "What You See Is What It Does," by Meng and Jackson, published at Onward!
2025 — established how to implement them.

The paper's title captures the central property the pattern aims to achieve: the structure of the code should directly reflect the structure of the user's experience.
When an engineer reads the codebase, they should see the concepts users think in, expressed directly, without indirection or translation.
What you see in the code is what it does in the world.

The paper names and formalizes the structural pattern: independent concept modules, each with their own state and actions, connected by a sync engine that mediates all inter-concept coordination.
It specifies what the sync engine does, how ActionRecords flow through it, how guards and compensating actions are expressed.
It turns Jackson's design theory into an implementable architecture.

Crucially, the paper is explicit about what it leaves open.
It doesn't prescribe a specific language or framework.
It doesn't specify how concept state should be persisted.
It doesn't define the exact API of the sync engine.
These are left to implementors — which means there is real work to be done in building the tooling, the libraries, and the idioms that make WYSIWID practical in specific ecosystems.

That gap — between the pattern as specified and the pattern as usable in a Python application, a TypeScript service, a production system with real operational requirements — is where the work in front of us lives.

---

## What the Paper Leaves Open

Read the [WYSIWID paper](https://doi.org/10.1145/3759429.3762628) carefully and Section 9 is explicit about future directions.

**Distributed systems and scaling**: the paper raises how concept instances can run across separate physical servers, using synchronizations to keep them coordinated.
It notes that traditional synchronization semantics may need weakening to support eventual consistency, and identifies database sharding — running multiple instances of a single concept to partition data — as an open coordination challenge.

**Concept catalogs and verification**: the paper envisions a marketplace of pre-built, domain-specific concept implementations, where application development shifts to writing custom synchronizations on top of verified building blocks.
It leaves open the social and technical challenge of how such concepts get formally verified for correctness.

**Automated debugging tooling**: Section 7.4 demonstrates manual action graph tracing to diagnose a causal bug, then lists capabilities that should ideally be automated but are not yet built — automated flow marking, provenance tracking, semantic analysis and patch generation, and isolated replay sandboxing.

**LLM design biases**: in their case study using AI assistance, the authors note that LLMs are prone to generating overly coupled concept designs because their training data heavily favors object-oriented paradigms.
Better prompt engineering to steer LLMs toward clean concept architecture is identified as unsolved.

**AI legibility**: there is a positive side to the AI story that the paper does not develop.
Explicit concept boundaries, independent state, structured ActionRecords, and a centralized sync layer give LLMs something they rarely have in conventional codebases: a clear, consistent structural description of what the system does and how its parts relate.
An LLM operating on a WYSIWID codebase does not need to trace through entangled class hierarchies to understand a feature — it can read the concept's operational principle, inspect its actions, and examine the sync rules that connect it to other concepts.
This is a structural advantage for AI-assisted development that is worth exploring systematically.

These are not weaknesses of the theory.
They are honest acknowledgments that a paper introducing a pattern cannot also be a complete implementation guide — and invitations for the work that comes next.

---

## Limitations and Open Questions

A fair assessment of Concept Design and WYSIWID requires acknowledging what the pattern does not yet address.

**The sync layer can become a bottleneck.** In systems with many concepts and complex cross-concept relationships, the sync layer risks becoming the kind of tangled god class it was meant to eliminate.
Sync rules are explicit and centralized, which is an improvement over implicit coordination — but explicit does not automatically mean simple.
A disciplined approach to sync design — keeping rules small, naming them clearly, grouping related rules — is essential and not yet codified.

**Performance costs of indirection.** Every inter-concept coordination passes through the sync engine.
For most applications this cost is negligible, but for high-throughput systems the indirection adds measurable latency.
The paper acknowledges distributed and scaling concerns but does not provide performance benchmarks or guidance on when the pattern's costs outweigh its benefits.

**When the pattern adds complexity.** Concept Design shines when the domain has many interacting concepts with clear user-facing boundaries.
For simple CRUD applications, a layered architecture or even a single module may be the simpler, more pragmatic choice.
Concept Design is not a universal answer — it is an answer for systems where the complexity of user-facing interactions has outgrown the ability of layered or class-based organization to contain it.

**Team maturity required.** The pattern demands a willingness to identify concepts, design operational principles, and maintain sync discipline.
Teams that are not bought into the design philosophy can produce a WYSIWID-shaped mess: concepts with fuzzy boundaries, sync rules that reach into concept internals, actions that violate operational principles.
The pattern provides structure, but it does not enforce it in the way a compiler enforces types.

**No production track record.** WYSIWID is a 2025 paper.
There are no large-scale production deployments to study, no postmortems, no battle-tested libraries.
The pattern is credible — its intellectual lineage is strong and its structural arguments are sound — but it has not yet been stress-tested by the industry in the way that MVC, layered architecture, or Clean Architecture have been.
That will change over time, and the lessons from those deployments will shape the pattern's evolution.

None of these limitations are fatal.
They are the normal shape of a young architectural idea that has not yet gone through the full cycle of industrial adoption, critique, and refinement.
Acknowledging them honestly strengthens the case for the pattern, because it means you can evaluate it with clear eyes rather than with the breathless enthusiasm of a new convert.

---

## Thirty Years in the Making

Step back and look at the lineage.

[1979: Reenskaug](/writing/mvc-original-sin/) says code should reflect the concepts users think in.
The insight gets lost in translation.

[1992: Sullivan and Notkin](/writing/patterns-movement/) say coordination logic is a first-class concern.
The paper is appreciated and ignored.

[1994: The Gang of Four](/writing/patterns-movement/) give the field structural vocabulary.
The Mediator pattern quietly encodes the coordination insight without developing it.

[2010: Harel](/writing/behavioral-programming/) proves that independent behavioral concerns can coexist with a mediating runtime.
The idea stays in the academy.

[2010s: Cockburn and Bogard](/writing/hexagonal-slices-architecture-wars/) get the boundary and the feature-orientation right.
The semantic question remains open.

2021: Jackson publishes _The Essence of Software_.
Concepts are named and defined.

2025: Meng and Jackson publish the WYSIWID paper.
The structural pattern is formalized.

This is a story about a field slowly working out an answer to a question it has been asking, in various forms, for decades — not about one person having a brilliant idea — about **how to build software whose structure matches what users need, whose behavior is legible, and whose parts can evolve independently**.

The answer has a name now.
The work of making it practical is what comes next.

---

_This series has traced the intellectual history of Concept Design and the WYSIWID pattern.
The next series begins where the theory ends: building real software with it._

---

---

_Part of the series: Legible by Design: The Long Search_

## References

- Jackson, D. [_The Essence of Software_](https://essenceofsoftware.com)
- Meng & Jackson. ["What You See Is What It Does."](https://doi.org/10.1145/3759429.3762628)
