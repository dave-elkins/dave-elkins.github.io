# Software methodologies survey — series planning chat

> **Type:** Chat transcript, cleaned for research use
> **Purpose:** Background for the software methodologies series
> **Topics:** Methodology inventory, post-by-post outline, strengths/weaknesses, AI-native revisit

**Harvest:** see [series-harvest.md](series-harvest.md) for the synthesized research notes.

Each numbered turn is self-contained so an individual question and answer can be harvested or cited on its own.

## Turns

1. Which methodologies should the series cover?
2. Post-by-post outline, including an AI-native revisit

## Key ideas for harvesting

- **43-methodology inventory** grouped by era and philosophy: foundations, Agile, scaling, hybrid/flow, engineering practices, development techniques, process improvement, product-oriented, emerging (Turn 1).
- **Editorial choices** — identify the expected "core" posts, distinguish methodology from practice, include a decision guide, and use the "why it failed" angle (Turn 1).
- **Per-post template** — origin/problem, how it works, strengths, weaknesses, why it failed or is misapplied, AI-native revisit (Turn 2).
- **17-post series outline** (posts 0–16), each with a concrete AI-native angle (Turn 2).
- **Recurring AI-native themes** — specs and tests as primary human artifacts, review as the bottleneck, short loops over fixed sprints, risk-first prototyping, humans owning intent/context/accountability (Turn 2, post 15).
- **Choice dimensions** — team size, regulation, uncertainty, delivery cadence (Turn 2, post 16).

## Turn 1 — Which methodologies should the series cover?

**User**

> If I was going to write a blog series about a survey of all the major software methodologies. What is the list of software methodologies should I cover?

**Assistant**

Here's a list organized by era and philosophy, so the series can tell a story rather than just catalog:

### Foundations (pre-Agile)

- **1. Waterfall**
- **2. V-Model**
- **3. Spiral**
- **4. Rapid Application Development (RAD)**
- **5. Rational Unified Process (RUP)**
- **6. Prototyping / Incremental / Iterative (the "in-between" models)**

### Agile family

- **7. Scrum**
- **8. Extreme Programming (XP)**
- **9. Kanban**
- **10. Lean Software Development**
- **11. Crystal**
- **12. Feature-Driven Development (FDD)**
- **13. DSDM (Dynamic Systems Development Method)**
- **14. Adaptive Software Development**

### Scaling frameworks

- **15. SAFe (Scaled Agile Framework)**
- **16. LeSS (Large-Scale Scrum)**
- **17. Disciplined Agile (DA)**
- **18. Nexus**
- **19. Spotify Model (popular, though it's more a case study than a true framework)**

### Hybrid and flow-oriented

- **20. Scrumban**
- **21. Shape Up (Basecamp)**
- **22. Dual-Track Agile / Continuous Discovery**

### Engineering-practice-driven

- **23. DevOps**
- **24. Continuous Delivery / CI/CD**
- **25. Site Reliability Engineering (SRE)**
- **26. GitOps**
- **27. DevSecOps**

### Development-technique methodologies

- **28. Test-Driven Development (TDD)**
- **29. Behavior-Driven Development (BDD)**
- **30. Domain-Driven Design (DDD)**
- **31. Model-Driven Development / Model-Driven Architecture**
- **32. Formal methods (briefly)**

### Process improvement and maturity models

- **33. CMMI**
- **34. Six Sigma / Lean Six Sigma**
- **35. ISO/IEC 12207 and related standards**
- **36. Personal/Team Software Process (PSP/TSP)**

### Product-oriented approaches

- **37. Lean Startup**
- **38. Design Thinking**
- **39. Jobs-to-be-Done**
- **40. Product-led / outcome-driven development (e.g., OKR-driven teams)**

### Emerging

- **41. AI-assisted / agentic development workflows**
- **42. Platform engineering**
- **43. Mob / ensemble programming**

### Suggested editorial choices

- **Core vs. optional:** Waterfall, Spiral, Scrum, XP, Kanban, Lean, SAFe, DevOps, and Shape Up are the ones readers will expect. The rest can be grouped into roundup posts.
- **Distinguish methodology from practice:** TDD, BDD, and DDD are techniques that plug into methodologies rather than replace them. A short "what counts as a methodology?" intro post would head off reader pushback.
- **Include a decision post:** A closing piece on how to choose (team size, regulatory environment, uncertainty level, delivery cadence) gives the series practical value.
- **Add the "why it failed" angle:** RUP, RAD, and the heavy-process era make good cautionary stories about what each method was reacting against.

I can suggest a post-by-post outline or a suggested series order if that's useful.

## Turn 2 — Post-by-post outline, including an AI-native revisit

**User**

> Post by post outline. Definitely strengths, weaknesses, why failed, what might be worth revisiting in an AI native software methodology

**Assistant**

### Standard template for every methodology post

- Origin and the problem it reacted to
- How it works (short)
- Strengths
- Weaknesses
- Why it failed or faded (or where it gets misapplied)
- AI-native revisit: what's worth stealing

### The series

0. **What counts as a methodology?** Methodology vs. framework vs. practice. Sets up the AI-native thread: what changes when code is cheap?

1. **Waterfall and V-Model.** Royce's paper was misread. Strong where requirements are stable and regulated. Failed on late feedback. AI revisit: upfront specs become the prompt, so spec-first is back, with a fast feedback loop.

2. **Spiral and RUP.** Risk-driven iteration. RUP collapsed under ceremony. AI revisit: risk-first prototyping is nearly free now.

3. **RAD, Prototyping, and Iterative models.** The ancestors of Agile. RAD faded with tooling limits. AI revisit: the tooling is finally here.

4. **Scrum.** Strengths: cadence and accountability. Failures: cargo-cult rituals, "Scrum-but." AI revisit: two-week sprints may be too slow when a feature takes hours.

5. **Extreme Programming.** Pair programming, TDD, and refactoring. Failed on cultural demands. AI revisit: the AI is your pair, and tests become the contract for generated code.

6. **Kanban, Lean, and Scrumban.** Flow, WIP limits, and waste. Weak on planning. AI revisit: the bottleneck moves from writing to review, so WIP limits on review matter.

7. **The rest of Agile** (Crystal, FDD, DSDM, ASD). A roundup of what each got right and why they lost mindshare.

8. **Scaling frameworks** (SAFe, LeSS, Nexus, DA). Enterprise appeal vs. the heavyweight-process irony. AI revisit: if teams shrink, does scaling shrink with them?

9. **Shape Up and Dual-Track Agile.** Appetite-based betting, six-week cycles, and discovery alongside delivery. AI revisit: appetites and shaping fit well, since shaping becomes the highest-value human work.

10. **DevOps, CD, SRE, GitOps, DevSecOps.** Strengths: fast, safe delivery. Weaknesses: tool sprawl and "DevOps team" anti-patterns. AI revisit: guardrails and automated verification become the main defense against bad generated code.

11. **Technique methodologies** (TDD, BDD, DDD, MDD, formal methods). Why model-driven failed in the 2000s (brittle generators). AI revisit: this is the big one. Models and specs finally have a flexible compiler.

12. **Process improvement** (CMMI, Six Sigma, PSP/TSP). Measurement culture vs. bureaucracy. AI revisit: AI makes metrics collection cheap, but do the metrics still measure the right things?

13. **Product-oriented** (Lean Startup, Design Thinking, JTBD, outcome-driven). Building the right thing. AI revisit: when building is cheap, deciding what to build is the constraint.

14. **Emerging** (platform engineering, mob programming, agentic workflows). What's real vs. hype.

15. **Synthesis: what an AI-native methodology might look like.** Pull the threads together:
    - Specs and tests as the primary human artifacts
    - Review as the bottleneck, so design for it
    - Short loops over fixed sprints
    - Risk-first prototyping
    - Humans owning intent, context, and accountability

16. **How to choose.** Decision guide by team size, regulation, uncertainty, and cadence.

If you want to trim, posts 7, 12, and 14 are the easiest to fold into roundups. Want me to draft the intro post or a fuller outline for the AI-native synthesis?
