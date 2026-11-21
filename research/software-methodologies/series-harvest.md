# Software methodologies series — research harvest

> **Built from:** `claude_chat.md` (inventory and post outline), `ai_sdlc_chat.md` (vibe coding → Agentic Software Engineering), `yada_chat.md` (methodology + reference-implementation framing)
> **Status:** Working harvest. Ideas are extracted from those three chats; the supporting sources were verified on 2026-11-21 and are linked inline and in [section 5](#5-vetted-sources). Claims that could not be verified are flagged there and must not be cited as fact.
> **Scope note:** The YADA naming and domain discussion was excluded. Only its structural idea — a methodology paired with a named reference implementation, like Agile → Scrum — is retained as a possible series framing.
> **Scope note (2026-11-21):** Research-only constructs (ACE/AEE, SASE, BriefingScript/LoopScript/MentorScript, CRPs/MRPs) are excluded. Only practices with a public implementation, standard, or deployed product are retained.

## Contents

- [1. Candidate methodologies](#1-candidate-methodologies)
- [2. Genealogy: what each wave was reacting against](#2-genealogy-what-each-wave-was-reacting-against)
- [3. Harvest cards: tenets, strengths, weaknesses, AI-native revisit](#3-harvest-cards-tenets-strengths-weaknesses-ai-native-revisit)
- [4. Cross-cutting themes for the AI-native series](#4-cross-cutting-themes-for-the-ai-native-series)
- [5. Vetted sources](#5-vetted-sources)
- [6. Areas needing further research](#6-areas-needing-further-research)

## 1. Candidate methodologies

### 1.1 The 43-item inventory (from `claude_chat.md`, Turn 1)

| # | Methodology | Era / philosophy |
|---:|---|---|
| 1 | Waterfall | Foundations (pre-Agile) |
| 2 | V-Model | Foundations (pre-Agile) |
| 3 | Spiral | Foundations (pre-Agile) |
| 4 | Rapid Application Development (RAD) | Foundations (pre-Agile) |
| 5 | Rational Unified Process (RUP) | Foundations (pre-Agile) |
| 6 | Prototyping / Incremental / Iterative ("in-between" models) | Foundations (pre-Agile) |
| 7 | Scrum | Agile family |
| 8 | Extreme Programming (XP) | Agile family |
| 9 | Kanban | Agile family |
| 10 | Lean Software Development | Agile family |
| 11 | Crystal | Agile family |
| 12 | Feature-Driven Development (FDD) | Agile family |
| 13 | DSDM (Dynamic Systems Development Method) | Agile family |
| 14 | Adaptive Software Development | Agile family |
| 15 | SAFe (Scaled Agile Framework) | Scaling frameworks |
| 16 | LeSS (Large-Scale Scrum) | Scaling frameworks |
| 17 | Disciplined Agile (DA) | Scaling frameworks |
| 18 | Nexus | Scaling frameworks |
| 19 | Spotify Model (case study, not a true framework) | Scaling frameworks |
| 20 | Scrumban | Hybrid and flow-oriented |
| 21 | Shape Up (Basecamp) | Hybrid and flow-oriented |
| 22 | Dual-Track Agile / Continuous Discovery | Hybrid and flow-oriented |
| 23 | DevOps | Engineering-practice-driven |
| 24 | Continuous Delivery / CI/CD | Engineering-practice-driven |
| 25 | Site Reliability Engineering (SRE) | Engineering-practice-driven |
| 26 | GitOps | Engineering-practice-driven |
| 27 | DevSecOps | Engineering-practice-driven |
| 28 | Test-Driven Development (TDD) | Development-technique methodologies |
| 29 | Behavior-Driven Development (BDD) | Development-technique methodologies |
| 30 | Domain-Driven Design (DDD) | Development-technique methodologies |
| 31 | Model-Driven Development / Model-Driven Architecture | Development-technique methodologies |
| 32 | Formal methods (briefly) | Development-technique methodologies |
| 33 | CMMI | Process improvement and maturity models |
| 34 | Six Sigma / Lean Six Sigma | Process improvement and maturity models |
| 35 | ISO/IEC 12207 and related standards | Process improvement and maturity models |
| 36 | Personal/Team Software Process (PSP/TSP) | Process improvement and maturity models |
| 37 | Lean Startup | Product-oriented approaches |
| 38 | Design Thinking | Product-oriented approaches |
| 39 | Jobs-to-be-Done | Product-oriented approaches |
| 40 | Product-led / outcome-driven development (e.g., OKR-driven teams) | Product-oriented approaches |
| 41 | AI-assisted / agentic development workflows | Emerging |
| 42 | Platform engineering | Emerging |
| 43 | Mob / ensemble programming | Emerging |

**Editorial guidance from the chat:** core posts readers expect are Waterfall, Spiral, Scrum, XP, Kanban, Lean, SAFe, DevOps, and Shape Up. Group the rest into roundups. Posts 7, 12, and 14 of the proposed outline are the easiest to fold.

### 1.2 AI-native candidates surfaced in `ai_sdlc_chat.md`

These are not in the 43-item inventory but are proposed as methodologies or practices in their own right:

- **Vibe coding** — natural-language prompting, iterative acceptance, pasting errors back in. Fast for prototypes, high-risk for production.
- **Agentic Engineering / Agentic Software Engineering (ASE)** — disciplined engineering with agents governed by deterministic tests, guardrails, evals, and architecture rules.
- **Spec-Driven Development (SDD)** — machine-readable specs and contracts authored before agents generate code; the agent loops until the test harness passes.
- **Harness Engineering** — treating the harness (rules, tools, MCP, sandboxes, orchestration) as the primary lever rather than the model.
- **Artifact-Driven / Markdown-first SDLC** — Git-committed `intent.md` → `spec.md` → `plan.md` → diff → evals → ops, with repository hooks triggering each phase.
- **Delegated Parallel Sandbox Engineering** — cloud micro-VMs with specialized parallel subagents building a dynamic context map (Cursor's framing).
- **Asynchronous Multi-Agent Execution** — Lead/Sidekick architecture with proof packages for human approval (Cognition's framing).
- **`AGENTS.md` / `CLAUDE.md` rulesets** — version-controlled agent instructions in the repository; a *practice*, not a methodology.

**Taxonomy warning from the chats:** TDD, BDD, DDD, and repository rulesets are techniques or practices that plug into methodologies rather than replace them. Post 0 should settle "what counts as a methodology?" before the survey begins.

### 1.3 Structural framing idea from `yada_chat.md`

A methodology can be published as an abstract philosophy plus a **named reference implementation** that makes it concrete — the Agile → Scrum relationship. Useful as a possible shape for the series' synthesis post: the AI-native methodology as the idea, with a concrete starter workflow as its reference implementation. Naming and domain selection were explicitly out of scope for this harvest.

## 2. Genealogy: what each wave was reacting against

As framed in the chats — a narrative spine for the series.

| Wave | Difficulty it answered | Where it fell short |
|---|---|---|
| Waterfall / V-Model | Wanted structure and predictability for stable, regulated work; Royce's paper was misread. | Late feedback; brittle when requirements shift. |
| Spiral / RUP | Late risk discovery and rigidity of linear models; introduced risk-driven iteration. | RUP collapsed under ceremony. |
| RAD / Prototyping / Iterative | Heavyweight paperwork and slow tooling; ancestors of Agile. | Faded as a *brand*: absorbed into DSDM and Agile; narrow fit and organizational burden mattered more than tooling. |
| Scrum / XP / Kanban / Lean | Heavy process, late feedback, low customer involvement. | Cargo-cult rituals and "Scrum-but"; XP's cultural demands; weak on planning for flow methods. |
| Scaling frameworks | Agile not fitting large enterprises. | Heavyweight-process irony — reintroduced the ceremony Agile rejected. |
| Shape Up / Dual-Track | Scrum rigidity; discovery and delivery competing for the same cycle. | (Not detailed in the chats.) |
| DevOps / CD / SRE / GitOps / DevSecOps | Handoff walls between Dev and Ops; slow, unsafe delivery. | Tool sprawl and the "DevOps team" anti-pattern. |
| Techniques (TDD, BDD, DDD, MDD, formal) | Quality, ambiguity, and traceability from requirements to code. | MDA branding stalled; "brittle generators" was one factor among tool sprawl, skills, round-trip and ROI problems. Ideas survived in niches. |
| Process improvement (CMMI, Six Sigma, PSP/TSP) | Variability and poor quality; measurement culture. | Bureaucracy; metrics that no longer measure the right things. |
| Product-oriented (Lean Startup, Design Thinking, JTBD, outcome-driven) | Building the wrong thing efficiently. | (Not detailed in the chats.) |
| Emerging (platform engineering, mob programming, agentic) | Cognitive load, collaboration, and now cheap code. | "What's real vs. hype." |
| AI-native | Code generation collapses from weeks to hours; the bottleneck moves to intent, specification, verification, and review. | Claims largely from vendor and AI-generated sources — needs verification. |

Each row now has primary or authoritative backing in [section 5](#5-vetted-sources); the caveats in [5.6](#56-corrections-to-claims-in-the-chats) apply to several of the "where it fell short" entries.

## 3. Harvest cards: tenets, strengths, weaknesses, AI-native revisit

Each card gives the source turn in the cleaned transcript plus **vetted source** links to primary or authoritative material. "Gaps" marks something the chats did not establish, not a claim that no source exists.

### 0. What counts as a methodology?

- **Tenets:** Separate methodology, framework, and practice. TDD/BDD/DDD plug into methodologies rather than replace them.
- **Working taxonomy (settled 2026-11-21).** Four levels, widest first:
  - **Family / umbrella:** a set of shared values, e.g. Agile (the Manifesto), or the predictive vs. adaptive split.
  - **Process model / life-cycle model:** an abstract description of the *shape* of a process — Waterfall, Spiral, V-Model, Incremental, Prototyping. IEEE: "A software process model is an abstract description of how development activities are ordered and related." **This is where "waterfall" belongs: a category, not a branded method.**
  - **Framework / named instance:** a bounded, defined approach — Scrum, XP, DSDM, RUP, SAFe. The Scrum Guide calls Scrum "a lightweight framework" and "a container for other techniques, methodologies, and practices"; Scrum.org argues explicitly that it is a framework, not a methodology.
  - **Practice / technique:** TDD, BDD, pair programming, refactoring, WIP limits.
- On the user's "class" analogy: the intuition is right. Use **family** for Agile and **process model** for waterfall. The usual "Waterfall vs. Agile" framing compares a *category* (partly a strawman) with a *set of frameworks*, which is why it stays slippery.
- **AI-native revisit:** Sets up the central question — what changes when code is cheap?
- **Source:** `claude_chat.md` Turn 2, post 0; Turn 1 "Suggested editorial choices."
- **Vetted source:** [Sommerville, *Software process models*, ACM Computing Surveys](https://doi.org/10.1145/234313.234420); [IEEE Technology Navigator, "Software Process"](https://technav.ieee.org/topic/software-process/); [Sommerville, *Software Processes* chapter slides](http://csis.pace.edu/~scharff/cs389/ref/ch3cs389.pdf); [TU Munich on life-cycle models](https://ase.in.tum.de/lehrstuhl_1/component/content/article/43-books/237.html); [2020 Scrum Guide](https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf); [Scrum.org, "Why is Scrum a Framework, not a Methodology?"](https://www.scrum.org/resources/blog/why-scrum-framework-not-methodology); [Agile Manifesto history](https://agilemanifesto.org/history.html); [Fowler on TDD](https://martinfowler.com/bliki/TestDrivenDevelopment.html); [North on BDD](https://dannorth.net/blog/introducing-bdd); [Evans' DDD](https://www.domainlanguage.com/ddd/blue-book/).

### 1. Waterfall and V-Model

- **What Royce actually said (1970, read in full).** He starts with two steps for small internal programs: analysis then coding. For large customer systems, Figure 2 adds two levels of requirements analysis, a program design step, testing, and operations. Figure 3 already shows feedback between *successive* phases ("hopefully, the iterative interaction... is confined to successive steps"). Then the famous warning: "I believe in this concept, but the implementation described above is risky and invites failure" — testing is the first point where timing, storage, and I/O are experienced, so late failures force redesign and up to a 100% overrun (Figure 4: iterations "are never confined to the successive steps"). Crucially, he then says the approach is "fundamentally sound" and spends the rest of the paper adding five risk reducers:
  1. **Program design comes first** — a preliminary design phase before analysis, to settle storage/timing/data-flux constraints early; write an overview document.
  2. **Document the design** — "quite a lot"; "the first rule of managing software development is ruthless enforcement of documentation requirements." Early on, "documentation is the specification and... is the design."
  3. **Do it twice** — for a first-of-a-kind system, deliver a second version for critical areas; build a pilot model, "the entire process done in miniature" (10-month pilot for a 30-month project).
  4. **Plan, control and monitor testing** — independent test specialists; visual scans by a second party; test every logic path; don't use the computer for simple errors.
  5. **Involve the customer** — formal commitment at points before final delivery.
- **Terminology:** Royce never uses the word "waterfall." The label was applied later (Bell & Thayer, 1976). See card 0: waterfall is a *process model / family*, not a named methodology.
- **Genealogy:** The early attempt at predictability and discipline. V-Model pairs each development phase with a verification level.
- **Strengths:** Strong where requirements are stable and regulated.
- **Weaknesses / why faded:** Late feedback; the five risk reducers were dropped in the single-pass "waterfall" that was later standardized and taught.
- **AI-native revisit:** Upfront specs become the prompt, so spec-first is back — now with a fast feedback loop. Royce's "do it twice" reads as an early argument for cheap prototypes.
- **Source:** `claude_chat.md` Turn 2, post 1.
- **Vetted source:** [Royce 1970 paper](https://github.com/tpn/pdfs/raw/master/Managing%20the%20Development%20of%20Large%20Software%20Systems%20-%201970%20(waterfall).pdf); [Larman & Basili on the misreading](https://www.cs.umd.edu/~basili/publications/journals/J90.pdf); [Bell & Thayer 1976](https://mosaicprojects.com.au/PDF-Gen/software_requirements_are_they_really_a_problem.pdf); [SEI on the V-Model](https://www.sei.cmu.edu/blog/using-v-models-for-testing); [A Brief History of the Waterfall Model](https://arxiv.org/abs/2510.03894).
- **Qualification on the "misread" claim:** real but easy to overcorrect. Larman & Basili say Royce's iterative step "has been lost in most descriptions" yet call his approach "clearly not classic IID." Walker Royce said his father "was always a proponent of iterative, incremental, evolutionary development," describing the waterfall as "the simplest description" that "would not work for all but the most straightforward projects." Royce still argued for phases and heavy documentation; what disappeared was the feedback, the pilot, and the warning.

### 2. Spiral and RUP

- **Tenets:** Risk-driven iteration; iterative elaboration and construction (RUP).
- **Genealogy:** A response to late risk discovery and linear rigidity.
- **Strengths:** Risk-first prototyping.
- **Weaknesses / why faded:** RUP collapsed under ceremony.
- **AI-native revisit:** Risk-first prototyping is nearly free now.
- **Source:** `claude_chat.md` Turn 2, post 2.
- **Vetted source:** [Boehm's Spiral paper](https://www.cse.msu.edu/~cse435/Homework/HW3/boehm.pdf); [Jacobson/Booch/Rumbaugh on the Unified Process](https://people.eecs.ku.edu/~hossein/810/Readings/rup-unified-process.pdf); [IBM RUP datasheet](https://public.dhe.ibm.com/software/rational/web/datasheets/version6/rup.pdf).
- **Gaps:** Specific Spiral/RUP practices and their original cost drivers.

### 3. RAD, Prototyping, and Iterative models

- **Tenets:** The canonical bundle is tools, methodology, people, management (Agarwal et al. 2000). In practice: JRP/JAD workshops, timeboxing, incremental prototyping, reusable components, small user-developer teams, and 4GL/CASE/GUI/database tooling (Beynon-Davies et al. 1999). Pressman's textbook version: fully functional systems in "60 to 90 days" when requirements are understood and scope is constrained. Martin's primary text was not accessible, so that number is secondary-sourced.
- **Genealogy:** A reaction to heavyweight paperwork and slow tooling; prototype-driven and timeboxed, feeding directly into DSDM and Agile.
- **Strengths:** Fast feedback, active users, short delivery, working prototypes.
- **Weaknesses / why faded (ranked by evidential support):**
  1. **Absorption and rebranding** — DSDM began in 1994 and became the leading UK RAD framework; VTT's 2002 agile survey treats DSDM as an agile method. The label faded while the practices migrated.
  2. **Narrow fit and scalability** — Pressman, Beynon-Davies et al. and VTT all scope RAD to modularizable, short, well-understood business systems. Beynon's seven cases were all small; VTT says large systems only work when decomposed into small-team components.
  3. **Organizational and cultural burden** — sustained user involvement, rapid decisions, clean rooms, training and management commitment recur as conditions of success.
  4. **Process and maintainability risk** — Agarwal et al. found developers favored fast-development features over modeling features; Beynon found no project with reversible changes and raised cost/justification concerns.
  5. **Tooling limits and CASE hype failure** — tools enabled and *circumscribed* what RAD could do; CASE "failed to emerge as the promised silver bullet." A contributing condition, not a demonstrated single cause. No verified revenue data for a mid-1990s CASE/4GL market collapse was found.
- **What survived:** Timeboxes, short iterations, working prototypes, frequent delivery, close user collaboration, empowered teams, integrated testing. The brand and the CASE/4GL tooling ideology did not.
- **AI-native revisit:** "The tooling is finally here" is too narrow. Faster generation relaxes the tooling constraint but not the fit, scalability, user-involvement or maintainability constraints — the same quick-and-dirty failure modes can recur with generated code.
- **Source:** `claude_chat.md` Turn 2, post 3.
- **Vetted source:** [Martin 1991 bibliographic record](https://archive.org/details/rapidapplication00mart); [Beynon-Davies et al., RAD: an empirical review (1999)](http://damiantgordon.com/Methodologies/Papers/Rapid%20Application%20Development%20RAD%20An%20Empirical%20Review.pdf); [Agarwal et al., Risks of RAD (2000)](https://doi.org/10.1145/352515.352516); [Pressman, Software Engineering 5th ed.](https://repository.unikom.ac.id/45085/1/Software%20Engineering%20-%20Roger%20S%20Pressman%20%5B5th%20edition%5D.pdf); [VTT Publications 478, agile methods review (2002)](https://publications.vtt.fi/pdf/publications/2002/P478.pdf); [Iivari, Why are CASE tools not used? (1996)](https://doi.org/10.1145/236156.236183); [Notkin, CASE: Past, Present, and Future (1997)](https://homes.cs.washington.edu/~notkin/talks/icse97-case.pdf).
- **Gaps:** Martin's primary text was inaccessible (bibliographic verification only); no verified market-collapse data; no direct evidence that generation speed improves RAD's non-tooling failure modes.

### 4. Scrum

- **Tenets:** Fixed cadence, roles, ceremonies, accountability.
- **Strengths:** Cadence and accountability.
- **Weaknesses / why failed:** Cargo-cult rituals; "Scrum-but."
- **AI-native revisit:** Two-week sprints may be too slow when a feature takes hours.
- **Source:** `claude_chat.md` Turn 2, post 4.
- **Vetted source:** [2020 Scrum Guide](https://scrumguides.org/scrum-guide.html); [ScrumBut, Scrum.org](https://www.scrum.org/resources/what-scrumbut).
- **Gaps:** Whether cadence has value independent of feature duration.

### 5. Extreme Programming

- **Tenets:** Pair programming, TDD, refactoring, continuous customer involvement.
- **Weaknesses / why failed:** Cultural demands.
- **AI-native revisit:** The AI is your pair; tests become the contract for generated code.
- **Source:** `claude_chat.md` Turn 2, post 5; reinforced by `ai_sdlc_chat.md` Turn 3 (tests/evals as binding contract).
- **Vetted source:** [XP Explained sample pages, Kent Beck](https://ptgmedia.pearsoncmg.com/images/9780321278654/samplepages/9780321278654.pdf); [Fowler on TDD](https://martinfowler.com/bliki/TestDrivenDevelopment.html); [pair-programming cost/benefit study](https://www.cs.utexas.edu/~ans/classes/cs439/projects/XPSardinia.PDF).
- **Gaps:** Which XP practices survive when the pair is an agent; refactoring ownership.

### 6. Kanban, Lean, and Scrumban

- **Tenets:** Flow, WIP limits, eliminating waste.
- **Strengths:** Flow orientation.
- **Weaknesses:** Weak on planning.
- **AI-native revisit:** The bottleneck moves from writing to review, so WIP limits on review matter.
- **Source:** `claude_chat.md` Turn 2, post 6; reinforced by `ai_sdlc_chat.md` Turn 9 ("review bottleneck").
- **Vetted source:** [Anderson on Kanban principles and WIP limits](https://djaa.com/revisiting-the-principles-and-general-practices-of-the-kanban-method); [Kanban Guide](https://kanban.university/kanban-guide/); [Poppendieck on Lean waste](https://ptgmedia.pearsoncmg.com/images/9780321150783/samplepages/0321150783.pdf).
- **Gaps:** How to measure review WIP when reviewers are human and agents do the writing.

### 7. The rest of Agile (Crystal, FDD, DSDM, ASD)

- **Tenets / strengths / weaknesses:** Not detailed in the chats — planned as a roundup of what each got right and why they lost mindshare.
- **AI-native revisit:** Not stated.
- **Source:** `claude_chat.md` Turn 2, post 7.
- **Vetted source:** [Cockburn on Crystal](https://alistaircockburn.com/Articles/Crystal-the-un-methodology); [FDD overview](https://agilemodeling.com/essays/fdd.htm); [DSDM framework, Agile Business Consortium](https://www.agilebusiness.org/resource/the-dsdm-agile-project-framework); [Adaptive Software Development, Dorset House](https://www.dorsethouse.com/books/asd.html).

### 8. Scaling frameworks (SAFe, LeSS, Nexus, DA)

- **Tenets:** Scale Agile practices to large organizations.
- **Strengths:** Enterprise appeal.
- **Weaknesses:** The heavyweight-process irony.
- **AI-native revisit:** If teams shrink, does scaling shrink with them?
- **Source:** `claude_chat.md` Turn 2, post 8.
- **Vetted source:** [SAFe](https://scaledagileframework.com/); [LeSS](https://less.works/); [Nexus, Scrum.org](https://www.scrum.org/resources/scaling-scrum); [Disciplined Agile, PMI](https://www.pmi.org/disciplined-agile/toolkit).
- **Gaps:** Evidence on team size changes under agentic development.

### 9. Shape Up and Dual-Track Agile

- **Tenets:** Appetite-based betting, six-week cycles, discovery alongside delivery.
- **AI-native revisit:** Appetites and shaping fit well, since shaping becomes the highest-value human work.
- **Source:** `claude_chat.md` Turn 2, post 9.
- **Vetted source:** [Shape Up, Basecamp](https://basecamp.com/shapeup); [Patton on dual-track development](https://jpattonassociates.com/dual-track-development/).
- **Gaps:** Strengths and weaknesses not spelled out in the chats.

### 10. DevOps, CD, SRE, GitOps, DevSecOps

- **Tenets:** Fast, safe delivery; automation across build, deploy, and operations.
- **Strengths:** Fast, safe delivery.
- **Weaknesses:** Tool sprawl; the "DevOps team" anti-pattern.
- **AI-native revisit:** Guardrails and automated verification become the main defense against bad generated code.
- **Source:** `claude_chat.md` Turn 2, post 10; expanded in `ai_sdlc_chat.md` Turn 3 (sandboxes, SAST guardrails, CI/CD gates).
- **Vetted source:** [Continuous Delivery](https://continuousdelivery.com/); [Google SRE books](https://sre.google/books); [OpenGitOps principles](https://opengitops.dev/blog/1.0-announcement); [DevOps topologies and anti-types](https://web.devopstopologies.com/); [OpenAI on Codex sandboxing](https://openai.com/index/inside-the-codex-sandbox/).

### 11. Technique methodologies (TDD, BDD, DDD, MDD, formal methods)

- **Tenets:** Tests, models and precise specs as specifications. TDD/BDD/DDD and formal methods are covered by the sources below; the deep dive here is MDD.
- **Terminology:** MDE is the broad use of precise models in development; MDD is the branch that generates implementations from models; MDA is MDD using OMG standards (Whittle et al. 2014). "Model-driven development" is a family of approaches, not one tool or method.
- **The promise:** OMG adopted UML and MOF in 1997 and made MDA its base architecture in 2001 (the FAQ says February; the Executive Overview says September/late 2001 — don't give an unqualified month). The 2003 MDA Guide promised machine-readable models giving long-term flexibility in implementation, integration, maintenance, testing and simulation; the FAQ says model functionality "once and only once" and claimed tools automated 50–70% of PIM→PSM (OMG self-report). Supporting standards: MOF, XMI, QVT (1.0 in 2008), fUML; Executable UML (Mellor & Balcer, 2002) — the chat's "Executive UML" is a typo.
- **The reality check:** Whittle et al. (2014) surveyed 450 practitioners and interviewed 22 across 17 companies: whole-system generation was rare, success was usually scoped and DSL-based, code generation was "not the key driver," typical gains were 20–30% and were offset by training and organizational change; only two interviewees used MDA. Hutchinson et al. (2014): over 75% valued generation, about 40% reported significant integration problems, about 35% spent significant time synchronizing models and code, 74% needed extra training, 44% found UML too complex, and nearly 100 tools were named. Whittle et al. (2017) add generated-code complexity, permanent generator tuning, vendor lock-in, round-trip, versioning and organizational resistance.
- **Verdict on the chat's claim:** "MDD failed because generators were brittle" is too simple. Generator quality is real but one factor in a socio-technical mismatch of tools, skills, scoping and ROI. The MDA *branding* had little uptake; broader MDE practice persisted.
- **What survived:** Safety-critical embedded code generation ([SCADE](https://ansys.synopsys.com/products/embedded-software/ansys-scade-suite) — vendor claims certification to DO-178B Level A, DO-178C/DO-330 TQL-1, IEC 61508 SIL3, ISO 26262 ASIL D), [AUTOSAR](https://www.autosar.org/about/) in automotive, MBSE via [SysML 2.0](https://www.omg.org/spec/SysML/), DSLs and language workbenches ([Fowler 2010](https://martinfowler.com/articles/languageWorkbench.html)), model-based testing ([Uzun & Tekinerdogan 2018](https://edepot.wur.nl/453261), potential "not fully exploited"), and bounded evidence of maintainability gains ([Martínez et al. 2014](https://link.springer.com/article/10.1007/s10664-013-9269-5)). Low-code adjacency is plausible but direct lineage is not verified.
- **AI-native revisit:** "Models and specs finally have a flexible compiler" remains speculative. [Zhang et al. (2026)](https://link.springer.com/article/10.1007/s10664-026-10921-4) map 86 LLM4MDE studies (2022–early 2026): mostly model generation, only 5 on code generation, mostly black-box GPT-4 prototypes, 42% without baselines. [Cheon (2025)](https://www.scitepress.org/DigitalLibrary/Link.aspx?doi=10.5220/0013580300003964) shows narrow UML/OCL → Dart/Flutter feasibility with unresolved verification and abstraction issues.
- **Source:** `claude_chat.md` Turn 2, post 11; `ai_sdlc_chat.md` Turn 3 (Gherkin, OpenAPI, typed contracts), Turn 9 (artifact chain).
- **Vetted source:** [OMG MDA FAQ](https://www.omg.org/mda/faq_mda.htm); [MDA Guide v1.0.1 (2003)](https://www.omg.org/cgi-bin/doc?omg/03-06-01.pdf); [Whittle et al., State of practice in MDE (2014)](https://doi.org/10.1109/MS.2013.65); [Hutchinson et al., MDE practices in industry (2014)](https://doi.org/10.1016/j.scico.2013.03.017); [Whittle et al., taxonomy of tool-related issues (2017)](https://doi.org/10.1007/s10270-015-0487-8); [Bucchiarone et al., grand challenges in MDE (2020)](https://doi.org/10.1007/s10270-019-00773-6); [Zhang et al., LLM4MDE mapping study (2026)](https://link.springer.com/article/10.1007/s10664-026-10921-4); [Dan North on BDD](https://dannorth.net/blog/introducing-bdd); [Eric Evans' DDD Blue Book](https://www.domainlanguage.com/ddd/blue-book/); [NIST definition of formal methods](https://csrc.nist.gov/glossary/term/formal_method).
- **Gaps:** Whether LLMs lower MDE's adoption barriers in practice; how formal-methods ideas transfer; what "flexible compiler" would require beyond prototype demos.

### 12. Process improvement (CMMI, Six Sigma, PSP/TSP)

- **Tenets:** Measurement and maturity to reduce variability.
- **Strengths:** Measurement culture.
- **Weaknesses:** Bureaucracy.
- **AI-native revisit:** AI makes metrics collection cheap, but do the metrics still measure the right things?
- **Source:** `claude_chat.md` Turn 2, post 12.
- **Vetted source:** [CMMI Institute](https://cmmiinstitute.com/); [ASQ on Six Sigma](https://asq.org/quality-resources/six-sigma); [NIST on Lean, ISO, Six Sigma](https://www.nist.gov/baldrige/lean-iso-and-six-sigma); [SEI on TSP](https://www.sei.cmu.edu/library/the-team-software-process-tsp).
- **Gaps:** Candidate replacement metrics for agentic work (cycle time, evidence quality, rework rate).

### 13. Product-oriented (Lean Startup, Design Thinking, JTBD, outcome-driven)

- **Tenets:** Building the right thing.
- **AI-native revisit:** When building is cheap, deciding what to build is the constraint.
- **Source:** `claude_chat.md` Turn 2, post 13; echoed in `ai_sdlc_chat.md` Turn 4 (problem formulation) and Turn 9 (non-engineers authoring `intent.md`).
- **Gaps:** Strengths/weaknesses not detailed in the chats.

### 14. Emerging (platform engineering, mob programming, agentic workflows)

- **Tenets:** Not detailed; framed as "what's real vs. hype."
- **AI-native revisit:** Platform engineering appears in the AI-native context; mob/ensemble programming is listed as emerging.
- **Source:** `claude_chat.md` Turn 2, post 14.
- **Vetted source:** [CNCF platform engineering glossary](https://tag-app-delivery.cncf.io/wgs/platforms/glossary/); [mob programming overview](https://www.stickyminds.com/article/mob-programming-working-well-together).
- **Gaps:** Needs its own evidence pass.

### 15. AI-native synthesis (candidate methodology)

- **Tenets:** Specs and tests as the primary human artifacts; review designed as the bottleneck; short loops over fixed sprints; risk-first prototyping; humans owning intent, context, and accountability.
- **Strengths:** Compresses implementation; makes intent and verification explicit and auditable.
- **Weaknesses / open risks:** Non-determinism, code review burden, architectural erosion, missing requirements, security/compliance, accountability.
- **Genealogy:** Inherits spec-first from Waterfall, risk-first from Spiral, tests-as-contract from XP, flow/WIP from Kanban, guardrails from DevOps/DevSecOps, shaping from Shape Up, and "build the right thing" from product-oriented approaches.
- **Source:** `claude_chat.md` Turn 2, post 15; `ai_sdlc_chat.md` Turns 1–4 and 9.
- **Vetted source:** [Diaz et al. on SDD](https://arxiv.org/abs/2609.00252); [Hoda on ASE beyond code](https://arxiv.org/abs/2510.19692); [Anthropic's AI-Native SDLC Playbook](https://claude.com/blog/the-ai-native-sdlc-playbook).
- **Gaps:** Needs a name, a reference implementation, and validation beyond vendor claims.

### 16. AI-native candidates detailed in the AI SDLC chat

| Candidate | Tenet | Strength | Weakness / risk | Source |
|---|---|---|---|---|
| Vibe coding | Natural-language intent, iterative acceptance | Fast, fluid prototyping | Non-deterministic, hard to review, no learning loop, 3-month complexity wall | `ai_sdlc_chat.md` Turn 1–2 |
| Agentic Engineering | Disciplined agents bounded by tests, evals, guardrails, architecture rules | Raises the production ceiling | Requires harness investment | Turns 1, 3 |
| SDD | Contract-first: Gherkin/OpenAPI/typed specs before code | Makes "correct" explicit; agent loops to green | Specification effort moves upstream | Turns 3, 9 |
| Harness Engineering | Improve rules, tools, middleware; model is ~10% of the equation | Benchmark gains without model changes | Harness complexity itself | Turns 1, 10 |
| Artifact-driven Markdown SDLC | Git-committed `.md` artifacts trigger phases via hooks | Auditable, automation-friendly | Tickets/Jira displaced; new ceremony risk | Turn 9 |
| Delegated parallel sandbox engineering | Cloud micro-VMs + parallel subagents | Safe isolation, dynamic context map | Infrastructure cost, telemetry dependence | Turn 10 |
| Lead/Sidekick + proof packages | High-reasoning lead delegates code to sidekicks; humans approve evidence | Asynchronous human review | Proof quality, trust calibration | Turn 10 |

**Vetted sources for these candidates:** [Osmani on agent harness engineering](https://addyosmani.com/blog/agent-harness-engineering/); [Osmani on conductors and orchestrators](https://addyosmani.com/blog/future-agentic-coding); [OpenAI harness engineering](https://openai.com/index/harness-engineering/); [Cursor cloud agent architecture](https://cursor.com/blog/cloud-agent-lessons); [Cognition Devin Fusion](https://cognition.com/blog/local-fusion); [AGENTS.md](https://agents.md/). The Lead/Sidekick architecture is documented by Cognition; the specific "proof packages" label is not (see 5.7).

## 4. Cross-cutting themes for the AI-native series

- **Code is cheap; intent and verification are scarce.** Implementation weeks → hours, while specification and verification become the bottlenecks (`ai_sdlc_chat.md` Turn 1; `claude_chat.md` Turn 2, post 13). **Vetted:** [Anthropic playbook](https://claude.com/blog/the-ai-native-sdlc-playbook); [Kaggle whitepaper](https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding).
- **Agent = Model + Harness (~10% / 90%).** The harness — rules, MCP tools, sandboxes, test runners, guardrails, orchestration — is the safety boundary and the main improvement lever (Turns 1, 3, 10). **Vetted:** [Osmani on harness engineering](https://addyosmani.com/blog/agent-harness-engineering/); [OpenAI harness engineering](https://openai.com/index/harness-engineering/); [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28). The exact 10/90 split is a rhetorical framing in the sources, not a measured result.
- **Tests and specs as the binding contract.** Tests-first, contract-first, Gherkin, OpenAPI, typed interfaces, evals (Turn 3; `claude_chat.md` post 5). **Vetted:** [Fowler on TDD](https://martinfowler.com/bliki/TestDrivenDevelopment.html); [Gherkin reference](https://cucumber.io/docs/gherkin/reference/); [OpenAPI Specification](https://spec.openapis.org/oas/); [Anthropic on agent evals](https://www.anthropic.com/research/demystifying-evals-for-ai-agents).
- **Review becomes the bottleneck.** Shift from code review to evidence review — test results, static analysis, lint, rationale — and apply WIP limits to review (`ai_sdlc_chat.md` Turns 3, 9; `claude_chat.md` post 6). **Vetted:** [Anthropic playbook](https://claude.com/blog/the-ai-native-sdlc-playbook) for layered review; [OpenAI on agent reviewers](https://openai.com/index/harness-engineering/); [Google SRE books](https://sre.google/books) for automated verification gates. The chats' "Merge-Readiness Pack" label is not a public standard and is excluded from this harvest.
- **Context engineering.** Static always-loaded rules vs. dynamic, progressive disclosure via skills, RAG, and MCP results (Turn 1). **Vetted:** [Anthropic Agent Skills and progressive disclosure](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview); [CLAUDE.md memory docs](https://code.claude.com/docs/en/memory); [original RAG paper](https://arxiv.org/abs/2005.11401); [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28).
- **Bounded vs. unbounded tasks.** Give agents constrained tasks with prerequisites and explicit boundaries; unbounded goals invite arbitrary choices (Turns 2, 9). **Vetted:** [Anthropic, Building effective agents](https://www.anthropic.com/research/building-effective-agents); [Claude Code best practices](https://code.claude.com/docs/en/best-practices); [Red Hat on specificity](https://developers.redhat.com/articles/2026/02/17/uncomfortable-truth-about-vibe-coding).
- **The human 20%.** Problem formulation, edge cases/resilience, architecture and long-term maintainability, security/compliance/governance, accountability and on-call ownership (Turn 4). **Vetted:** [Hoda on socio-technical ASE](https://arxiv.org/abs/2510.19692); [Google SRE book on on-call and error budgets](https://sre.google/books); [OpenAI on agentic security review](https://openai.com/index/introducing-aardvark/). The 80/20 framing itself is an industry rhetorical device, not a measured finding.
- **Version-controlled agent instructions.** Auditable rulesets committed to the repository (`AGENTS.md` / `CLAUDE.md`); a practical harness artifact, not a methodology (Turns 5–7). **Vetted:** [AGENTS.md](https://agents.md/); [CLAUDE.md memory docs](https://code.claude.com/docs/en/memory); [Anthropic Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview). Automatically synthesizing corrections into rules is not an established practice.
- **Short loops over fixed sprints; risk-first prototyping.** Cadence may need to shrink when features take hours (`claude_chat.md` posts 4, 15; `ai_sdlc_chat.md` Turn 10 "Bolts"). **Vetted:** [Boehm's Spiral paper](https://www.cse.msu.edu/~cse435/Homework/HW3/boehm.pdf) for risk-driven iteration; [AWS AI-DLC on Bolts](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/) — note Bolts is AWS's term, not OpenAI's (see 5.6).
- **Markdown-first vs. ticket-first.** Git-committed artifacts as the audit trail and trigger system, with non-engineers authoring intent (`ai_sdlc_chat.md` Turn 9). **Vetted:** [Anthropic's AI-Native SDLC Playbook](https://claude.com/blog/the-ai-native-sdlc-playbook). The playbook's author is Louis Claxton (Aug 21, 2026).
- **Process compression vs. ceremony.** Enterprise sizing, governance, and measurement must be re-examined if teams shrink and metrics are cheap (`claude_chat.md` posts 8, 12). **Vetted:** [SAFe](https://scaledagileframework.com/), [LeSS](https://less.works/), [CMMI Institute](https://cmmiinstitute.com/), [ISO/IEC/IEEE 12207:2026](https://www.iso.org/standard/90219.html). Claims about shrinking teams under agentic development remain unevidenced.

## 5. Vetted sources

Verification pass completed **2026-11-21**. Status: **P** = primary (original paper, official specification, creator's site); **A** = authoritative secondary (standards body, peer-reviewed, established reference); **C** = real source, but the chat got a detail wrong. All links below were checked to resolve.

### 5.1 Foundations and Agile family

| Topic | Vetted source | Status | Supports |
|---|---|---|---|
| Waterfall — original paper | [Royce, *Managing the Development of Large Software Systems* (1970)](https://github.com/tpn/pdfs/raw/master/Managing%20the%20Development%20of%20Large%20Software%20Systems%20-%201970%20(waterfall).pdf) | P | Full text read 2026-11-21. Phased baseline with intended successive-phase feedback; "risky and invites failure" because testing is late; five remedies: design first, document heavily, do it twice (pilot), plan testing, involve customer. Royce never uses the word "waterfall". |
| Waterfall — "misread" claim | [Larman & Basili, *Iterative and Incremental Development: A Brief History*](https://www.cs.umd.edu/~basili/publications/journals/J90.pdf) | A | Many "incorrectly view Royce's paper as the paragon of single-pass waterfall"; his iterative step "has been lost in most descriptions" but his approach is "clearly not classic IID". Includes Walker Royce on his father's iterative, incremental, evolutionary preference. |
| Waterfall — variants over time | [Saravanos, *A Brief History of the Waterfall Model: Past, Present, and Future*](https://arxiv.org/abs/2510.03894) ([NYU archive PDF](https://archive.nyu.edu/bitstream/2451/75504/2/Brief_History.pdf); ACM DOI 10.1145/3783862.3783879) | A | Academic surveys show three different five-phase depictions vs. Royce's seven; the paper's second and third models (linear, then with feedback) are the versions usually labelled "waterfall." Explicitly: "Royce did not advocate a strictly linear process." Confirms a family of variants, not a single fixed method. |
| Waterfall — origin of the term | [Bell & Thayer, *Software Requirements: Are They Really a Problem?* (1976)](https://mosaicprojects.com.au/PDF-Gen/software_requirements_are_they_really_a_problem.pdf) | A | Earliest documented naming of the "waterfall" — by others, six years after Royce. |
| Taxonomy — process models | [Sommerville, *Software process models*, ACM Computing Surveys](https://doi.org/10.1145/234313.234420); [Sommerville's process-model slides](http://csis.pace.edu/~scharff/cs389/ref/ch3cs389.pdf); [IEEE Technology Navigator, "Software Process"](https://technav.ieee.org/topic/software-process/); [TU Munich on life-cycle models](https://ase.in.tum.de/lehrstuhl_1/component/content/article/43-books/237.html) | A/P | "A software process model is an abstract representation of a process." Waterfall, Spiral, and V-Model are grouped as process/life-cycle models — categories of process shape, not branded methodologies. |
| Taxonomy — framework vs. methodology | [2020 Scrum Guide](https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf); [Scrum.org, "Why is Scrum a Framework, not a Methodology?"](https://www.scrum.org/resources/blog/why-scrum-framework-not-methodology) | P | Scrum is "a lightweight framework," "purposefully incomplete," and "a container for other techniques, methodologies, and practices"; the distinction between framework and methodology is explicit. |
| V-Model | [SEI, *Using V Models for Testing*](https://www.sei.cmu.edu/blog/using-v-models-for-testing) | A | Development phases paired with verification and validation levels. |
| Spiral | [Boehm, *A Spiral Model of Software Development and Enhancement*](https://www.cse.msu.edu/~cse435/Homework/HW3/boehm.pdf) | P | Risk-driven rather than document- or code-driven; prototyping and iteration. |
| RAD — canonical account | [Martin 1991, bibliographic record](https://archive.org/details/rapidapplication00mart); [Pressman, *Software Engineering* 5th ed.](https://repository.unikom.ac.id/45085/1/Software%20Engineering%20-%20Roger%20S%20Pressman%20%5B5th%20edition%5D.pdf); [Beynon-Davies et al. 1999](http://damiantgordon.com/Methodologies/Papers/Rapid%20Application%20Development%20RAD%20An%20Empirical%20Review.pdf); [Agarwal et al. 2000](https://doi.org/10.1145/352515.352516) | P/A | Title, author and 1991 date (primary text locked); four ingredients (tools/methodology/people/management); JAD/JRP, timeboxes, prototypes, 4GL/CASE dependence; 60–90 days is Pressman's secondary wording. |
| RAD — decline, ranked evidence | [Beynon-Davies et al. 1999](http://damiantgordon.com/Methodologies/Papers/Rapid%20Application%20Development%20RAD%20An%20Empirical%20Review.pdf); [Agarwal et al. 2000](https://doi.org/10.1145/352515.352516); [VTT Publications 478 (2002)](https://publications.vtt.fi/pdf/publications/2002/P478.pdf); [Ngram phrase frequency](https://books.google.com/ngrams/graph?content=rapid+application+development&year_start=1980&year_end=2019&corpus=26&smoothing=3) | A | Small-scale, modularizable fit; heavy user involvement; modeling/maintainability risks; absorption into DSDM. Ngram shows the label peaking around 1999 — context only, not causal. |
| RAD — tooling caveat | [Iivari, *Why are CASE tools not used?* (1996)](https://doi.org/10.1145/236156.236183); [Notkin, *CASE: Past, Present, and Future* (1997)](https://homes.cs.washington.edu/~notkin/talks/icse97-case.pdf) | A | CASE failed to deliver the "silver bullet"; tool limitations contributed but are not a demonstrated single cause of RAD's decline. No verified market-revenue collapse source. |
| RAD → DSDM | [VTT Publications 478 (2002)](https://publications.vtt.fi/pdf/publications/2002/P478.pdf) | A | DSDM began in 1994, became the leading UK RAD framework, and is classed as an agile method; timeboxes and user involvement carried forward. |
| RUP | [Jacobson, Booch & Rumbaugh on the Unified Process](https://people.eecs.ku.edu/~hossein/810/Readings/rup-unified-process.pdf); [IBM RUP datasheet](https://public.dhe.ibm.com/software/rational/web/datasheets/version6/rup.pdf) | P | Authorship, UML lineage, roles and artifacts, and RUP's official claim to be tailorable. |
| Agile Manifesto | [agilemanifesto.org](https://agilemanifesto.org); [history of the 2001 meeting](https://agilemanifesto.org/history.html) | P | Four values, 17 original authors, Snowbird 2001, participating methodologies. |
| Scrum | [2020 Scrum Guide](https://scrumguides.org/scrum-guide.html); [ScrumBut, Scrum.org](https://www.scrum.org/resources/what-scrumbut) | P | Creators, empiricism, 1995 OOPSLA origin; "ScrumBut" as a named anti-pattern. |
| XP | [XP Explained sample pages, Kent Beck](https://ptgmedia.pearsoncmg.com/images/9780321278654/samplepages/9780321278654.pdf); [Extreme Programming Alliance](https://extremeprogrammingalliance.com/about-extreme-programming-xp); [pair-programming cost/benefit study](https://www.cs.utexas.edu/~ans/classes/cs439/projects/XPSardinia.PDF) | P/A | C3 origin, practices, and the genuinely mixed evidence on pair programming. |
| Kanban | [Anderson on Kanban principles](https://djaa.com/revisiting-the-principles-and-general-practices-of-the-kanban-method); [Kanban Guide](https://kanban.university/kanban-guide/) | P | WIP limits, flow, visualization, evolutionary change. |
| Lean software development | [Poppendieck, *Lean Software Development* sample pages](https://ptgmedia.pearsoncmg.com/images/9780321150783/samplepages/0321150783.pdf) | P | Seven principles including eliminate waste and decide as late as possible. |
| Crystal | [Cockburn, *Crystal, the Un-Methodology*](https://alistaircockburn.com/Articles/Crystal-the-un-methodology) | P | A family of methods sized by team, property-based rather than ceremony-based. |
| FDD | [FDD and Agile Modeling, Scott Ambler](https://agilemodeling.com/essays/fdd.htm); [interview/account involving De Luca](https://www.methodsandtools.com/archive/archive.php?id=19) | A | Five processes, 1997 Singapore bank origin, Coad's feature concept. |
| DSDM | [Agile Business Consortium, DSDM framework](https://www.agilebusiness.org/resource/the-dsdm-agile-project-framework) | P | Created in 1994 to build quality into RAD; rebranded in 2016. |
| Adaptive Software Development | [Highsmith, Dorset House publisher page](https://www.dorsethouse.com/books/asd.html); [author page](https://jimhighsmith.com/adaptive-software-development-a-collaborative-approach-to-managing-complex-systems) | P | 2000 book, adaptive/collaborative framing, scaling RAD/XP. |

### 5.2 Scaling, hybrid, DevOps, techniques, process, product, emerging

| Topic | Vetted source | Status | Supports |
|---|---|---|---|
| SAFe | [scaledagileframework.com](https://scaledagileframework.com/) | P | Official framework. "Heavyweight ceremony" is criticism, not a neutral description. |
| LeSS | [less.works](https://less.works/) | P | Official large-scale Scrum definition. |
| Nexus | [Scrum.org, Scaling Scrum with Nexus](https://www.scrum.org/resources/scaling-scrum) | P | Official Nexus guidance. |
| Disciplined Agile | [PMI Disciplined Agile Toolkit](https://www.pmi.org/disciplined-agile/toolkit) | P | Official DA guidance. |
| Spotify Model | [Kniberg & Ivarsson, original paper coverage](https://www.infoq.com/news/2013/04/scaling-agile-spotify-kniberg); [Kniberg, "No, you don't have the Spotify Model"](https://www.infoq.com/news/2016/10/no-spotify-model/) | A/P | Origin and the author's own warning against copying it as a framework. |
| Scrumban | [Agile Alliance](https://agilealliance.org/scrumban); [Atlassian overview](https://www.atlassian.com/agile/project-management/scrumban) | A | Definition and practice; no verified single primary origin. |
| Shape Up | [Basecamp, Shape Up](https://basecamp.com/shapeup) | P | Appetites, betting, six-week cycles. |
| Dual-Track / Continuous Discovery | [Patton, "Dual Track Development is not Duel Track"](https://jpattonassociates.com/dual-track-development/); [Product Talk on discovery handoffs](https://www.producttalk.org/discovery-handoffs/) | A | Origin of the term from Desiree Sy's 2007 paper; two kinds of work, not two teams. |
| DevOps and anti-patterns | [DevOps Topologies, Skelton & Pais](https://web.devopstopologies.com/) | A | "DevOps Team Silo" as a named anti-type; no single right topology. |
| Continuous Delivery | [continuousdelivery.com](https://continuousdelivery.com/) | P | Humble & Farley's official site. |
| SRE | [Google SRE books](https://sre.google/books) | P | SRE practices, on-call, error budgets. |
| GitOps | [OpenGitOps 1.0 principles](https://opengitops.dev/blog/1.0-announcement); [CNCF overview](https://www.cncf.io/blog/2021/09/28/gitops-101-whats-it-all-about/) | P/A | Four principles: declarative, versioned/immutable, pulled, continuously reconciled. |
| TDD | [Fowler on Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html) | A | Kent Beck attribution, red–green–refactor. |
| BDD | [Dan North, *Introducing BDD*](https://dannorth.net/blog/introducing-bdd) | P | Origin of BDD, Given/When/Then, executable acceptance criteria. |
| DDD | [domainlanguage.com, DDD Blue Book](https://www.domainlanguage.com/ddd/blue-book/) | P | Eric Evans' original book. |
| MDD / MDA — terms and promise | [OMG MDA FAQ](https://www.omg.org/mda/faq_mda.htm); [MDA Guide v1.0.1 (2003)](https://www.omg.org/cgi-bin/doc?omg/03-06-01.pdf); [OMG MDA home](https://www.omg.org/mda/); [OMG QVT](https://www.omg.org/spec/QVT/) | P | PIM→PSM→code doctrine, "once and only once," OMG's own automation claims; UML/MOF 1997, MDA 2001 (month conflicting in OMG's pages), QVT 1.0 in 2008. Vendor/consortium self-report for the benefit claims. |
| MDD / MDA — reality check | [Whittle et al., *State of Practice in MDE* (2014)](https://doi.org/10.1109/MS.2013.65); [Hutchinson et al., *MDE practices in industry* (2014)](https://doi.org/10.1016/j.scico.2013.03.017); [Whittle et al., tool-issue taxonomy (2017)](https://doi.org/10.1007/s10270-015-0487-8) | A | 450 practitioners, 22 interviews; whole-system generation rare, gains typically 20–30% and offset by training/org change, only two MDA users; ~40% integration problems, ~35% sync effort, 74% need training, 44% find UML too complex; "brittle generators" is one factor among many. |
| MDD — survival and legacy | [Bucchiarone et al., grand challenges (2020)](https://doi.org/10.1007/s10270-019-00773-6); [Ansys SCADE](https://ansys.synopsys.com/products/embedded-software/ansys-scade-suite); [AUTOSAR](https://www.autosar.org/about/); [OMG SysML 2.0](https://www.omg.org/spec/SysML/); [Fowler on language workbenches (2010)](https://martinfowler.com/articles/languageWorkbench.html); [Uzun & Tekinerdogan, MB testing review (2018)](https://edepot.wur.nl/453261); [Martínez et al. (2014)](https://link.springer.com/article/10.1007/s10664-013-9269-5) | P/A | Survival in safety-critical embedded, automotive, MBSE, DSLs and model-based testing; bounded maintainability evidence. SCADE/AUTOSAR claims are self-described by vendors/consortium. |
| MDD + LLMs | [Zhang et al., LLM4MDE mapping study (2026)](https://link.springer.com/article/10.1007/s10664-026-10921-4); [Cheon, LLMs as MDD code generators (2025)](https://www.scitepress.org/DigitalLibrary/Link.aspx?doi=10.5220/0013580300003964) | A | Exploratory field: 86 studies mostly on model generation, few on code generation, weak baselines; narrow UML/OCL feasibility. Does not establish a mature "flexible compiler." |
| Formal methods | [NIST CSRC glossary, "formal method"](https://csrc.nist.gov/glossary/term/formal_method) | P | Rigorous mathematically based notation for specify/develop/verify. |
| CMMI | [CMMI Institute](https://cmmiinstitute.com/) | P | Official maturity model. |
| Six Sigma / Lean Six Sigma | [ASQ Six Sigma resources](https://asq.org/quality-resources/six-sigma); [NIST, Lean, ISO and Six Sigma](https://www.nist.gov/baldrige/lean-iso-and-six-sigma) | A | DMAIC, variation reduction, lean distinction. |
| ISO/IEC/IEEE 12207 | [ISO standard 90219](https://www.iso.org/standard/90219.html) | P | Current edition is **ISO/IEC/IEEE 12207:2026**, not the generic 1995 label. |
| PSP / TSP | [SEI PSP](https://www.sei.cmu.edu/library/the-personal-software-process-psp); [SEI TSP report, Humphrey 2000](https://www.sei.cmu.edu/library/the-team-software-process-tsp) | P | Watts Humphrey's original SEI reports. |
| Lean Startup | [theleanstartup.com](https://theleanstartup.com/) | P | Eric Ries' official site. |
| Design Thinking | [IDEO design thinking introduction](https://designthinking.ideo.com/introduction) | P | IDEO's authoritative description. |
| Jobs-to-be-Done | [Christensen Institute, JTBD Theory](https://www.christenseninstitute.org/theory/jobs-to-be-done) | P | Original theory, "hire a product to do a job," milkshake case. |
| OKRs | [Google re:Work, Set goals with OKRs](https://rework.withgoogle.com/intl/en/subjects/goal-setting) | P | Authoritative practice guide. |
| Platform engineering | [CNCF Platform Engineering glossary](https://tag-app-delivery.cncf.io/wgs/platforms/glossary/) | P | Definitions of platform and platform engineering. |
| Mob / ensemble programming | [StickyMinds overview](https://www.stickyminds.com/article/mob-programming-working-well-together) | A | Practice description; not a primary origin source. |

### 5.3 AI-native research and commentary

| Claimed source | Verified link | Status | Supports / correction |
|---|---|---|---|
| Kaggle whitepaper, *The New SDLC With Vibe Coding* | [whitepaper](https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding); [companion course](https://kaggle.com/learn-guide/5-day-agents-vibecoding) | P/C | Real. Authors Addy Osmani, Shubham Saboo, Sokratis Kartakis correct; ~50–51 pages. Course is "5-Day AI Agents: Intensive Vibe Coding Course With Google," June 15–19 2026. |
| Anthropic, *The AI-Native SDLC Playbook* | [claude.com blog](https://claude.com/blog/the-ai-native-sdlc-playbook) | P/C | Real, Aug 21 2026, author **Louis Claxton** (the chat gave no author). Artifact chain, hooks, skills, evals, layered review. |
| Diaz et al., SDD for ASE | [arXiv:2609.00252](https://arxiv.org/abs/2609.00252) | P/C | Real. Full title: *Spec-Driven Development for Agentic Software Engineering: Harnessing Human-Agent Teamwork.* Submitted Aug 31 2026, so the arXiv ID is 2609.*, not 2608.*. |
| Hoda, *Toward Agentic Software Engineering Beyond Code* | [arXiv:2510.19692](https://arxiv.org/abs/2510.19692) | P/C | Real. Full title adds *Framing Vision, Values, and Vocabulary.* v1 Oct 2025, ICSE-Companion 2026. |
| SWE-Bench Pro | [arXiv:2509.16941](https://arxiv.org/abs/2509.16941); [PMLR v306](https://proceedings.mlr.press/v306/deng26f.html) | P/C | Real, Xiang Deng et al., ICML 2026. The OpenReview record exists but is linked from PMLR. |
| "Defining the Agent Harness," arXiv Jun 2026 | [arXiv:2606.10106](https://arxiv.org/abs/2606.10106); [Machine Brief explainer](https://machinebrief.com/news/defining-the-agent-harness-the-backbone-of-coding-autonomy-9fjg) | C | **No arXiv paper with that title.** Closest real paper: *What makes a harness a harness: necessary and sufficient conditions for an agent harness* (Jun 8 2026). "Defining the Agent Harness" is also a section heading in [arXiv:2604.21003](https://arxiv.org/abs/2604.21003). |
| "Vibe Coding Considered Harmful," David Bonn | [Medium essay](https://medium.com/@david.bonn.2010/vibe-coding-considered-harmful-4327c90f22bb) | P/C | Real, Dec 18 2025, subtitle *The Emperor's New Coding Tools.* No matching Hacker News thread found — drop that attribution. |
| "The Uncomfortable Truth About Vibe Coding," Red Hat | [Red Hat Developer](https://developers.redhat.com/articles/2026/02/17/uncomfortable-truth-about-vibe-coding) | P/C | Real, Todd Wardzinski, Feb 17 2026. Three-month wall, whack-a-mole, functionality flickering all verified. "Spec-driven realism" is a paraphrase, not a literal phrase. |
| Thor Projects, "Vibe Coding & The Imprecision of Language" | [Robert Bogue, "Vibe Coding: The Good, the Bad, and the Ugly"](https://thorprojects.com/2026/02/24/vibe-coding-the-good-the-bad-and-the-ugly) | C | The exact claimed title does not exist. This Feb 24 2026 article contains the "fundamental problem of specificity" argument. |
| Origin of "vibe coding" | [Karpathy's Feb 2 2025 post](https://x.com/karpathy/status/1886192184808149383) | P | Primary source for the term. |
| Addy Osmani on agentic engineering | [Agent Harness Engineering](https://addyosmani.com/blog/agent-harness-engineering/); [Conductors to orchestrators](https://addyosmani.com/blog/future-agentic-coding); [Beyond Vibe Coding](https://beyond.addy.ie/) | P | Harness as first-class artifact; conductor → orchestrator; 70% problem. |

### 5.4 Vendor and platform engineering sources

| Topic | Vetted source | Status | Supports / correction |
|---|---|---|---|
| OpenAI harness engineering | [Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/) | P | ~1M lines, ~1,500 PRs in 5 months, small human team, agent reviewers, AGENTS.md/repository maps, docs as source of truth. Does **not** support "multi-pass red-team subagents" or "Bolts". |
| OpenAI security agents | [Aardvark, agentic security researcher](https://openai.com/index/introducing-aardvark/); [Codex sandbox](https://openai.com/index/inside-the-codex-sandbox/) | P | Multi-stage security pipeline, validation sandbox, generated patches, documented sandbox architecture. |
| "Bolts" replacing sprints | [AWS, AI-driven development life cycle](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/) | P/C | Real concept — but it is **AWS AI-DLC**, not OpenAI. Epics become Units of Work; sprints become Bolts. |
| Cursor cloud agents | [Lessons from building Cursor's cloud agent](https://cursor.com/blog/cloud-agent-lessons); [cloud development environments](https://cursor.com/blog/cloud-agent-development-environments) | P | Dedicated VMs, parallel and durable execution (Temporal), async subagents, screen recording. Official wording is VMs/sandboxes, not "microVMs". |
| Cursor RL loop | [Tab RL](https://cursor.com/blog/tab-rl); [Composer](https://cursor.com/blog/composer) | P/C | Online RL; **1.5–2 hours to roll out a checkpoint and collect next-step data**, not "retrain the harness every 1.5–2 hours". |
| Cognition Lead/Sidekick | [Devin Fusion](https://cognition.com/blog/local-fusion); [Devin Fusion original](https://cognition.com/blog/devin-fusion) | P | Lead agent delegates to sidekicks with briefs/results/feedback and persistent context. No official source for "proof packages". |
| Anthropic agentic coding guidance | [Claude Code best practices](https://code.claude.com/docs/en/best-practices); [memory/CLAUDE.md](https://code.claude.com/docs/en/memory); [subagents](https://code.claude.com/docs/en/sub-agents); [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview); [Building effective agents](https://www.anthropic.com/research/building-effective-agents); [Demystifying evals](https://www.anthropic.com/research/demystifying-evals-for-ai-agents) | P | Subagents, CLAUDE.md, skills, hooks, MCP, progressive disclosure, deterministic validation, graders and task suites. |
| AGENTS.md | [agents.md](https://agents.md/); [repository](https://github.com/agentsmd/agents.md) | P | Open "README for agents" convention, widely adopted, Linux Foundation / Agentic AI Foundation stewardship. |
| MCP | [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28); [Anthropic announcement](https://www.anthropic.com/news/model-context-protocol) | P | Official current spec and origin. |
| SWE-bench | [swebench.com](https://www.swebench.com/); [Verified](https://www.swebench.com/verified.html); [arXiv:2310.06770](https://arxiv.org/abs/2310.06770) | P | Benchmark, leaderboard, Verified variant, original paper. |

### 5.5 Tooling and concepts named in the chats

| Concept | Vetted source | Status |
|---|---|---|
| Property-based testing | [Hypothesis docs](https://hypothesis.readthedocs.io/); [AutoTest, ETH Zurich](https://se.inf.ethz.ch/research/autotest/) | P |
| SAST guardrails | [Semgrep](https://semgrep.dev/docs/); [Snyk](https://docs.snyk.io/); [SonarQube](https://docs.sonarsource.com/sonarqube/) | P |
| Gherkin / OpenAPI | [Cucumber Gherkin reference](https://cucumber.io/docs/gherkin/reference/); [OpenAPI Specification](https://spec.openapis.org/oas/) | P |
| RAG | [Lewis et al., NeurIPS 2020](https://arxiv.org/abs/2005.11401) | P |
| Sandboxing | [Docker docs](https://docs.docker.com/); [WebAssembly](https://webassembly.org/); [Firecracker microVMs](https://firecracker-microvm.github.io/) | P |
| BigNumber, Redux, Zustand | [bignumber.js](https://github.com/MikeMcl/bignumber.js); [Redux](https://redux.js.org/); [Zustand](https://zustand.docs.pmnd.rs/) | P |
| Claude Cowork | [product page](https://claude.com/product/cowork); [How we contain Claude](https://www.anthropic.com/research/how-we-contain-claude) | P |
| Agent evals | [OpenAI evals guide](https://developers.openai.com/api/docs/guides/evals); [openai/evals repo](https://github.com/openai/evals) | P |
| SDLC Enterprise Framework | [GitHub repo](https://github.com/Minh-Tam-Solution/SDLC-Enterprise-Framework) | C — a public community repository, not an official vendor or standards-body framework. |

### 5.6 Corrections to claims in the chats

- **Royce did not coin "waterfall"** and did not advocate a strictly linear process; the label came later (Bell & Thayer, 1976). Read the full primary text before repeating the "misread" claim: Royce kept the phased baseline, called it "fundamentally sound," and prescribed heavy documentation and early design. What later disappeared was his successive-phase feedback, the "do it twice" pilot, and his warning that a single pass "is risky and invites failure." Don't recast him as an Agile pioneer — Larman & Basili say his approach is "clearly not classic IID."
- **"Defining the Agent Harness" is not an arXiv title** — cite arXiv:2606.10106 instead (see 5.3).
- **Thor Projects article title was wrong** — cite Robert Bogue's "Vibe Coding: The Good, the Bad, and the Ugly" (see 5.3).
- **No Hacker News thread was found** for David Bonn's essay; drop that attribution.
- **"Bolts" is AWS AI-DLC, not OpenAI** (see 5.4).
- **OpenAI's "multi-pass reasoning / red-team subagents" is unverified** as a named practice. The harness post supports agent reviewers, not that specific scheme.
- **Cursor does not officially say "microVMs"** (VMs/isolated sandboxes) or "retraining every 1.5–2 hours" (checkpoint rollout and data collection).
- **"Proof packages" with video/logs is not a Cognition term** found in official sources; Cursor and OpenAI separately document screen/video capture.
- **V-Model origins are contested** (Boehm vs. Hughes Aircraft/FAA). Tenets are solid; origin is not.
- **"RAD faded because tooling limits"** is not a single cause. Better supported: absorption into DSDM/Agile, narrow fit and scalability, user-involvement burden, modeling/maintainability risk, and CASE/4GL hype failure. Classic RAD did depend on 4GL/CASE tooling, but no verified market-collapse data exists.
- **"MDD failed because generators were brittle"** is too simple. Empirical studies (Whittle 2014; Hutchinson 2014; Whittle 2017) confirm generated-code and generator-maintenance problems but place them among tool sprawl, skills shortages, round-trip/versioning, scoping and ROI issues. MDA branding had little uptake; MDE ideas survived in niches.
- **SAFe as "heavyweight ceremony"** is a critique, not a neutral description.
- **ISO/IEC 12207** should be cited by its current edition: ISO/IEC/IEEE 12207:2026.

### 5.7 Do not cite without further proof

- "Defining the Agent Harness" as an arXiv paper (use the corrected citation in 5.3).
- Thor Projects "Vibe Coding & The Imprecision of Language" (use the corrected title).
- A Hacker News source for David Bonn's essay.
- OpenAI as the originator of "Bolts"; OpenAI "multi-pass red-team subagents".
- Cursor "microVMs" and "retraining every 1.5–2 hours" as literal quotes.
- Cognition "proof packages".
- The 10% / 90% model-to-harness split as a measured result — it is a rhetorical framing.
- "Proof" that agentic development shrinks teams or that metrics collection being cheap changes what should be measured — both remain hypotheses in the chats.
- Research-only constructs from Hassan et al. (ACE/AEE, SASE, BriefingScript/LoopScript/MentorScript, CRPs/MRPs) — excluded from this harvest; do not reintroduce them as methodologies or practices.

## 6. Areas needing further research

**Priority 1 — verify the source base (largely complete, 2026-11-21)**

- ~~Confirm every paper, whitepaper, and blog post in section 5 exists; capture real titles, authors, dates, and URLs.~~ Done; see section 5 for corrected citations and section 5.7 for items to drop.
- ~~Check the two supplied URLs resolve and match the described content.~~ Both verified.
- ~~Resolve the named research papers to canonical records.~~ Four of five resolved; the "Defining the Agent Harness" title was wrong and has been corrected.
- ~~Trace vendor claims to primary sources.~~ Mostly done; the "Bolts," "multi-pass red-team," microVM, retraining-cadence, and proof-package claims needed correction or are unverified.
- Remaining: find an authoritative primary source for the DevOps Handbook and DoD DevSecOps Fundamentals (both blocked during verification), and confirm the Spotify original PDF directly rather than via InfoQ.

**Priority 2 — fill the content gaps**

- ~~Write tenets, strengths, weaknesses, and genealogy for the methodologies that only got a one-liner or a roundup mention: V-Model, Crystal, FDD, DSDM, ASD, SAFe/LeSS/Nexus/DA specifics, DevOps-family distinctions, CMMI/Six Sigma/PSP/TSP, Lean Startup/Design Thinking/JTBD, platform engineering, mob programming.~~ Partly done: RAD and MDD/MDA now have deep dives in cards 3 and 11; the rest still needs work. Section 5 gives primary sources to start from.
- RAD follow-up: Martin's primary text is still inaccessible; no verified CASE/4GL market-collapse data; no direct evidence that generation speed fixes RAD's non-tooling failure modes.
- MDD follow-up: no evidence yet that LLMs lower MDE's adoption barriers in practice; the LLM4MDE field is mostly prototypes without baselines.
- ~~Establish a rigorous genealogy from primary histories rather than the chat's summary — especially the Royce "misread" claim~~ (Royce's paper read in full 2026-11-21; see cards 0 and 1 and section 5.1). The Spiral/RUP lineage still needs a primary-source pass.
- ~~Settle the methodology / framework / practice taxonomy in post 0~~ — four-level working taxonomy in card 0 (family → process model → framework → practice). `AGENTS.md` / `CLAUDE.md` are practices/artifacts inside a harness, not methodologies.

**Priority 3 — test the AI-native claims**

- Find benchmark or controlled evidence for SDD, harness improvements, and evidence-based review — not only vendor blogs. Start with [SWE-Bench Pro](https://arxiv.org/abs/2509.16941), [SWE-bench Verified](https://www.swebench.com/verified.html), and [Anthropic's evals guidance](https://www.anthropic.com/research/demystifying-evals-for-ai-agents).
- Validate the "human 20%" framing and the "3-month wall" claim against real projects. The Red Hat article is a practitioner argument, not a study.
- Investigate what metrics should replace velocity/coverage when generation is cheap (post 12 revisit).
- Explore how far models and specs really are from a "flexible compiler" for the model-driven revival — start from the LLM4MDE evidence in card 11, not from the vendor framing (post 11 revisit).
- Work out whether corrections can safely be synthesized into durable `AGENTS.md` / `CLAUDE.md` rules automatically.

**Priority 4 — series design**

- Decide between the 17-post outline and a trimmed version (posts 7, 12, 14 are the easiest to fold into roundups).
- Draft the decision guide (post 16): team size, regulation, uncertainty, delivery cadence.
- Consider publishing the AI-native synthesis as a methodology plus a concrete reference implementation — the Agile → Scrum pattern from the YADA chat, without the naming work.
