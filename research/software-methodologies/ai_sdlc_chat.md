# AI SDLC and agentic engineering — research chat

> **Type:** Chat transcript, cleaned for research use
> **Purpose:** Background for the software methodologies series
> **Topics:** Vibe coding, Agentic Software Engineering, Agent = Model + Harness, Spec-Driven Development, MentorScript, AI-native SDLC, vendor playbooks

**Harvest:** see [series-harvest.md](series-harvest.md) for the synthesized research notes.

Each numbered turn is self-contained so an individual question and answer can be harvested or cited on its own. Inline source-pill artifacts from the chat interface (for example `Medium`, `arXiv`, `Okane Land`, and `+ 1`) were removed; source names remain where they appear in the prose.

## Turns

1. The New SDLC With Vibe Coding (Kaggle whitepaper)
2. Other views on vibe coding
3. Controls, processes, and research for agentic engineering
4. The human 20%
5. What is MentorScript?
6. MentorScript examples
7. Is MentorScript open source or conceptual?
8. Clarification
9. Anthropic's AI-Native SDLC Playbook
10. Other AI coding vendors (OpenAI, Cursor, Cognition)

## Key ideas for harvesting

- **Vibe coding vs. Agentic Engineering** — a spectrum defined by how much verification and harness surround the AI (Turn 1).
- **Agent = Model + Harness** — roughly 10% model, 90% harness; improve the harness, not the base model (Turn 1, Turn 3).
- **Bottleneck shift** — implementation collapses to hours; specification and verification become the new bottlenecks (Turn 1, Turn 9).
- **New developer roles** — Conductor in the IDE, Orchestrator of multi-agent factories (Turn 1).
- **Context engineering** — static rules vs. dynamic, on-demand context via progressive disclosure (Turn 1).
- **Competing critiques** — reproducibility and review burden (Bonn), the 3-month complexity wall (Red Hat), speed-to-market pragmatism (Hacker News), ambiguity of natural language (Thor Projects) (Turn 2).
- **Controls for ASE** — sandboxes, MCP-scoped tools, `AGENTS.md` rulesets, Spec-Driven Development, Merge-Readiness Packs, risk/control/tooling map (Turn 3).
- **Research anchors** — Diaz et al. on SDD, Hassan et al. on SE 3.0 (ACE/AEE), Hoda on socio-technical ASE, SWE-Bench Pro, formalizing the Agent Harness (Turn 3).
- **The human 20%** — problem formulation, edge cases, architecture, security/governance, accountability and on-call ownership (Turn 4).
- **MentorScript** — "mentorship-as-code"; BriefingScript / LoopScript / MentorScript triad; largely absorbed into `AGENTS.md` in practice (Turn 5–7).
- **Anthropic's playbook** — artifact-driven Git loop (`intent.md` → `spec.md` → `plan.md` → diff), non-engineers authoring intent, production-to-intent feedback, markdown-first vs. Jira, layered review (Turn 9).
- **Vendor views** — OpenAI's harness engineering and "Bolts," Cursor's micro-VM sandboxes and parallel subagents, Cognition's Lead/Sidekick and proof packages (Turn 10).

## Turn 1 — The New SDLC With Vibe Coding (Kaggle whitepaper)

**User**

> Tell me about <https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding>

**Assistant**

The New SDLC With Vibe Coding is a 51-page whitepaper published on Kaggle by Google AI engineering leaders Addy Osmani, Shubham Saboo, and Sokratis Kartakis. It serves as a flagship reading resource alongside Google's free Kaggle Learn course, 5-Day AI Agents: Intensive Vibe Coding.

The whitepaper explores how autonomous AI coding agents and natural-language interfaces are fundamentally shifting software engineering — from typing precise syntax to directing AI intent.

### Core concepts and key takeaways

1. **Vibe coding vs. agentic engineering.** The paper presents software development on a spectrum determined by how much verification and harness surround the AI.
   - **Vibe Coding:** Describing what you want in natural language, letting the AI generate code, accepting output iteratively, and pasting errors back in. It is fast and fluid for rapid prototyping or side projects, but high-risk for production software.
   - **Agentic Engineering:** Disciplined software engineering using AI agents governed by deterministic tests, safety guardrails, evaluations, and architecture rules. It raises the ceiling for what production engineering teams can safely ship.

2. **The equation: Agent = Model + Harness.** One of the whitepaper's most prominent frameworks is that an agent consists roughly of 10% LLM model and 90% harness.
   - The harness includes rule files (e.g., `AGENTS.md`), Model Context Protocol (MCP) integrations, sandboxed execution environments, test runners, guardrails, and orchestration logic.
   - The paper demonstrates that improving the harness (prompts, middleware, and tools) can jump an agent into top benchmark performance without changing the underlying base model.

3. **Shift in the SDLC bottleneck.** The Software Development Life Cycle retains its core phases, but their proportions change.
   - Implementation compresses from weeks to hours. Code generation becomes fast and cheap.
   - Specification and verification become the new bottlenecks. Writing clear specs (like behavior-driven Gherkin tests or `AGENTS.md` context files) and building evals become the primary mechanisms to define what "correct" means.

4. **The developer as an "Orchestrator" or "Conductor."** Instead of writing syntax line-by-line, developers transition into higher-level roles.
   - **The Conductor:** Interacting with AI in real-time inside the IDE to guide decisions, make trade-offs, and conduct code reviews.
   - **The Orchestrator:** Designing multi-agent factory systems, configuring automated pipelines, setting constraints, and letting specialized sub-agents handle multi-file tasks asynchronously.

5. **Context engineering and architecture.** The paper breaks down agent context management into static context (always-loaded system rules, high token cost) and dynamic context (on-demand skills, RAG, and MCP tool results loaded via progressive disclosure to optimize costs and performance).

### Actionable advice from the paper

- **Maintain an `AGENTS.md` file:** Keep a living rules document in repository roots outlining tech stacks, coding standards, and past AI mistakes.
- **Write tests first:** Establish tests and evals before letting the AI write code — they act as the binding contract for intent.
- **Debug the harness first:** When an AI agent fails, the issue is usually missing context, vague constraints, or improper guardrails rather than a flaw in the AI model itself.

## Turn 2 — Other views on vibe coding

**User**

> Anyone else also written about the topic with different or similar views? If yes, please provide links and summaries

**Assistant**

Yes, "vibe coding" (a term originally popularized by Andrej Karpathy) has sparked significant debate across the software engineering industry.

While the Google AI whitepaper treats vibe coding as the initial, casual stage of a broader transition toward "Agentic Engineering," other technologists, platform architects, and industry veterans hold varied views — ranging from enthusiastic endorsement of non-developer building, to warnings about long-term technical debt and architectural collapse.

Below are key perspectives from around the industry, along with summaries of their arguments.

### 1. The skeptic's view: "Vibe Coding Considered Harmful"

**Author / Source:** David Bonn (Medium / Hacker News)

**Core argument:** Pure vibe coding violates core software engineering principles regarding human factors, reproducibility, and long-term maintenance.

**Key takeaways:**

- **Lack of reproducibility:** Unlike compilers, executing the same prompt multiple times yields non-deterministic, varying code output.
- **Code review burden:** Inspecting and reviewing AI-generated code often takes more cognitive effort than writing it from scratch. Expecting non-technical users to catch subtle bugs or security flaws in code they didn't write is unrealistic.
- **No learning loop:** AI agents don't inherently store or remember abstract architectural lessons learned from past mistakes across different projects unless forced to through external tooling.

### 2. The architectural view: "The Uncomfortable Truth About Vibe Coding"

**Author / Source:** Red Hat Developer (Red Hat Developer Blog)

**Core argument:** Vibe coding is great for zero-to-one prototyping, but hits a hard wall around the 3-month mark when software becomes complex.

**Key takeaways:**

- **"Whack-a-Mole" development:** Without explicit specifications, instructing the AI to fix one feature often breaks four other interconnected systems.
- **Functionality flickering:** Unstated details result in AI making random arbitrary choices each time code is re-generated (e.g., UI components changing behavior or style unexpectedly).
- **Spec-driven realism:** Generating code and building sustainable software are fundamentally different tasks. To prevent code bases from collapsing under their own weight, developers must move from prompt-based "vibing" to precise, version-controlled architecture specifications.

### 3. The product realist view: "Maintainability Doesn't Matter Until You Win"

**Author / Source:** Community debates on Hacker News (Hacker News Discussion)

**Core argument:** Engineers vastly overestimate the importance of clean, maintainable architecture in early-stage products compared to speed-to-market.

**Key takeaways:**

- **Speed over polish:** Customers do not see underlying code quality; they only care if the product solves their immediate problem.
- **The "throwaway" prototype:** Vibe coding allows non-technical founders or generalists to validate product-market fit and reach revenue. Once the business makes money, it can afford to hire software engineers to refactor or rewrite the codebase properly.
- **Bounded vs. unbounded tasks:** A software engineer knows how to give the AI a bounded task ("use this layer, don't touch this interface"), whereas a pure vibe coder gives an unbounded goal ("make a chat app") and lets the AI make all choices.

### 4. The requirements problem: "Vibe Coding & The Imprecision of Language"

**Author / Source:** Thor Projects (Thor Projects Analysis)

**Core argument:** The bottleneck in software was never typing code; it was overcoming the inherent ambiguity of human language.

**Key takeaways:**

- **The specificity problem:** Human natural language lacks the precision required to explicitly define system logic.
- **Filling in gaps:** When a user prompt leaves edge cases or constraints unstated, the LLM must invent answers. An experienced engineer's real value lies in identifying those missing requirements before writing code, a step natural language prompting often bypasses.

### Summary comparison

| Perspective | View on Vibe Coding | What They Propose Instead |
|---|---|---|
| Google Whitepaper | Good for fast demos; must evolve into Agentic Engineering. | Harnesses, test-driven evals, AGENTS.md files, and sub-agents. |
| David Bonn / Skeptics | Harmful if relied on for production; hard to review. | Rigorous code reviews, strict developer oversight, deterministic tools. |
| Red Hat Developer | Great for 0-to-1, but breaks down in complex codebases. | Spec-driven development with clear architectural boundaries. |
| Product Pragmatists | Highly effective for shipping fast and validating market value. | Vibe code to get revenue first, then hire engineers to rewrite it. |

## Turn 3 — Controls, processes, and research for agentic engineering

**User**

> What are solutions, processes, etc to the risks, controls, etc to move towards AI agentic engineering? Links, summaries, research papers, etc please

**Assistant**

To safely transition from informal, high-risk "vibe coding" (ad-hoc AI prompting) to Agentic Software Engineering (ASE), organizations must systematically mitigate risks like non-deterministic code, subtle logical bugs, architectural drift, security vulnerabilities, and team review bottlenecks.

The industry has converged around five core pillars of controls, processes, solutions, and research frameworks.

### 1. Architectural controls: the harness paradigm

The consensus across literature is that **Agent = Model + Harness**. You cannot make AI autonomous by relying on the LLM alone; the surrounding execution environment provides the safety boundaries.

- **`AGENTS.md` / MentorScript rulesets:** Repositories use version-controlled instruction files in the root folder. These codify team rules, coding standards, dependency restrictions, and architectural guidelines that agents parse before writing code.
- **Progressive tool exposure via MCP:** Instead of giving an agent full system access, organizations use the Model Context Protocol (MCP) to dynamically grant scoped tools (e.g., read-only DB access, sandboxed linter) only when needed, minimizing prompt injection and accidental destructive actions.
- **Deterministic sandboxing:** Agents execute code strictly inside isolated environments (Docker, WebAssembly, micro-VMs) that automatically block unauthorized network access or system file modifications.

### 2. Process transformation: Spec-Driven Development (SDD)

In an agentic workflow, writing code is delegated, while writing specifications and verification mechanisms becomes the primary engineering task.

```text
[ Human Specs Intent ] ──> [ Agent Generates Code ] ──> [ Automated Test Harness ] ──> [ Merge-Readiness Pack ]
```

- **Contract-first engineering:** Developers author machine-readable specs (Behavior-Driven Gherkin tests, OpenAPI specs, typed interface contracts) before triggering agents. The agent loops iteratively until it passes the test harness.
- **Shift from code review to evidence review:** Reviewing thousands of lines of raw AI code is exhausting. In ASE, human engineers review Merge-Readiness Packs (MRPs) — standardized reports compiled by the agent containing end-to-end test results, static analysis summaries, lint pass rates, and an explicit design rationale.

### 3. Risk mitigation and safety frameworks

| Risk category | Mitigation control / process | Tooling / implementation |
|---|---|---|
| Silent hallucinations & regression | Property-Based Testing & Evals: Generate automatic unit/integration tests to constrain the AI's search space. | Hypothesis, AutoTest, SWE-bench Evals |
| Security & vulnerability injection | Automated SAST Guardrails: Block pull requests automatically if agent code introduces CVEs or insecure patterns. | Semgrep, Snyk, SonarQube in CI/CD |
| Context drift / token bloat | Hierarchical Dynamic Context (RAG): Load only relevant files into context via semantic code search instead of dumping whole codebases. | FastContext, Sourcegraph Cody, CodeArts |
| Unbounded agent loops | Budgeting & Kill Switches: Enforce strict token, cost, and iteration limits per execution trajectory. | Agent Harness middleware |

### 4. Foundational papers and research

- **Spec-Driven Development for Agentic Software Engineering** (Diaz et al., Aug 2026). Summary: Analyzes the "productivity paradox" where individual AI speed degrades overall team stability. It details Spec-Driven Development (SDD) as the formal discipline required to bring accountability and verifiability back to AI-driven teams.
- **Agentic Software Engineering: Foundational Pillars and a Research Roadmap** (Hassan et al., arXiv). Summary: Outlines the shift to SE 3.0. Introduces two core workbenches: the Agent Command Environment (ACE) for human orchestration and the Agent Execution Environment (AEE) where agents perform tasks and call back humans for ambiguous trade-offs.
- **Toward Agentic Software Engineering Beyond Code** (Rashina Hoda, arXiv). Summary: Argues that focusing purely on code generation is a trap. Proposes expanding ASE to socio-technical processes across the entire software lifecycle, including requirements engineering, sprint planning, and system architecture.
- **SWE-Bench Pro: Can AI Agents Solve Long-Horizon Software Engineering Tasks?** (OpenReview). Summary: Benchmark evaluation showing that current models struggle severely when human requirements are ambiguous or missing, demonstrating why structured context and human-written interface specifications are necessary.
- **Defining the Agent Harness** (arXiv, Jun 2026). Summary: Establishes formal criteria for what constitutes an "Agent Harness" — the architectural boundary layer connecting LLMs to runtime environments, test runners, and developer IDEs.

### 5. Practical implementation checklist

- **Repository setup:** Add an `AGENTS.md` file specifying build commands, code style rules, and anti-patterns.
- **CI/CD integration:** Set up pre-merge pipelines that reject PRs lacking unit test coverage or passing lint checks.
- **Sandbox enforcement:** Ensure local/remote AI coding CLI agents run in restricted environments without elevated system privileges.
- **Shift roles:** Train engineers to write detailed specifications, evaluate edge cases, and review test coverage rather than inspecting syntax line-by-line.

## Turn 4 — The human 20%

**User**

> What is the 20% that people claim only a human can do?

**Assistant**

In discussions surrounding AI-driven engineering and "vibe coding," the "20%" refers to the Pareto Principle (the 80/20 rule) applied to software development.

While AI agents can easily generate the initial 80% of an application (the happy-path user interface, boilerplate, CRUD endpoints, and working prototypes) in a matter of minutes, the remaining 20% is where software engineering gets difficult — and where industry experts argue only humans can provide necessary oversight and judgment.

```text
  [ AI AGENT CAPABILITY ]         [ HUMAN ENGINEERING BOUNDARY ]
┌─────────────────────────────┐  ┌─────────────────────────────────┐
│     The Initial 80%         │  │         The Final 20%           │
│                             │  │                                 │
│  • Syntax & Boilerplate     │  │  • Problem Definition           │
│  • UI Scaffolding           │  │  • Edge-Case & Error Handling   │
│  • Working Demos & Spikes   │ ──>  • Security & Governance       │
│  • Standard Integrations    │  │  • System Architecture          │
│  • First-Draft Code         │  │  • Legal & Ethic Responsibility │
└─────────────────────────────┘  └─────────────────────────────────┘
```

The key pillars defining that uniquely human 20% include:

### 1. Problem formulation and "translating intent"

AI generates code based on what you ask it to do, but humans must figure out what should be built.

- **Defining the "Why":** Understanding customer needs, trade-offs, and business strategy.
- **Translating ambiguity:** AI requires explicit instructions to avoid making arbitrary assumptions. Humans possess domain knowledge to resolve conflicting business requirements before a single prompt is written.

### 2. Edge cases, failures, and resilience

AI models naturally default to the "happy path" — building systems where everything works under ideal conditions. Humans are required to design for when things fail.

- **Graceful degradation:** What happens when a database times out, a third-party API changes its schema, or network latency spikes?
- **Concurrency and race conditions:** AI routinely struggles to reason about asynchronous state conflicts, thread safety, or memory leaks occurring under heavy load.

### 3. System architecture and long-term maintainability

AI agents write code locally without natively understanding the global, long-term state of a multi-year repository.

- **Preventing "architectural erosion":** Ensuring new code adheres to company patterns instead of introducing duplicate functions, mismatched abstractions, or unwanted dependencies.
- **Refactoring strategy:** Deciding when code has accumulated too much technical debt and restructuring the core foundation — a task AI agents cannot evaluate holistically.

### 4. Security, compliance, and governance

AI models generate code based on statistical patterns from training data, which frequently includes insecure patterns, hardcoded secrets, or subtle vulnerabilities.

- **Threat modeling:** Identifying zero-day attack vectors, logic flaws, and privilege escalation vulnerabilities that automated scanners miss.
- **Regulatory compliance:** Ensuring compliance with data privacy regulations (GDPR, HIPAA, SOC 2), data sovereignty, and industry safety standards.

### 5. Accountability and verification

A foundational rule of agentic engineering is that an AI agent cannot be held legally or operationally accountable for system failure.

- **Review and verification:** Inspecting agent output, evaluating test harnesses, and running verification suites.
- **On-call and incident ownership:** When production crashes at 2 AM, a human engineer must diagnose the root cause, issue a hotfix, and take ultimate responsibility.

**The industry consensus:** AI compresses the time spent on syntax and execution (doing the work), shifting the human engineer's role upward into an Architect, Conductor, and Evaluator who owns the design, governance, and final quality of the product.

## Turn 5 — What is MentorScript?

**User**

> What is MentorScript?

**Assistant**

In Agentic Software Engineering (SE 3.0), MentorScript is a version-controlled, durable rulebook used by human engineering coaches to codify best practices, architectural norms, and team standards for AI agents.

Rather than relying on informal or ephemeral AI instructions (like typing "don't do X" in a one-off prompt), MentorScript represents the concept of "mentorship-as-code".

### Key features and how it works

#### 1. Version-controlled rulebook

MentorScript lives alongside your project codebase (similar to `AGENTS.md` or `.cursorrules`). It captures team-specific guidelines such as:

- **Code quality rules:** "Do not write obvious comments; document design rationale and trade-offs instead."
- **Architecture patterns:** "Always use dependency injection for backend services in this repo."
- **Anti-patterns:** Rules learned from past failures or bad pull requests generated by AI agents.

#### 2. Durability and learning

When a human developer refactors or corrects an agent's work, the developer (or the agent itself) synthesizes that correction into a broader principle. Once approved, that principle is added to MentorScript so that all agents across the entire organization instantly benefit and avoid repeating the same mistake.

#### 3. Part of the script triad

In agentic frameworks (such as those outlined in the research paper *Agentic Software Engineering: Foundational Pillars and a Research Roadmap*), system execution is guided by three core scripts:

```text
┌─────────────────────────────────────────────────────────┐
│                    AGENTIC SCRIPTS                      │
├─────────────────┬───────────────────┬───────────────────┤
│  BriefingScript │    LoopScript     │   MentorScript    │
│  (Mission Plan) │(Workflow Playbook)│ (Best Practices)  │
└─────────────────┴───────────────────┴───────────────────┘
```

- **BriefingScript:** Defines what the task/mission is.
- **LoopScript:** Defines how the agent executes steps in its workflow.
- **MentorScript:** Defines the standards and rules the agent must uphold while executing the task.

#### 4. Auditability

When agents complete a task and compile a Merge-Readiness Pack (MRP) for human review, the pack links directly to the specific version of MentorScript used during execution. This provides a frozen audit trail showing exactly which guidelines the agent was following.

## Turn 6 — MentorScript examples

**User**

> Can you show me examples of MentorScript?

**Assistant**

In Agentic Software Engineering (SE 3.0), a MentorScript acts as a version-controlled, machine-readable rulebook that codifies institutional knowledge, architectural constraints, and quality standards for AI agents.

While simple instruction files (like `.cursorrules` or `CLAUDE.md`) offer basic hints, a formal MentorScript uses structured schema, failure history, explicit triggers, and severity levels so autonomous agents can programmatically parse and validate their work against it.

Below are two concrete examples showing how MentorScript is structured in practice.

### Example 1: Full YAML schema (`.mentor/backend-rules.yaml`)

This example demonstrates a production-grade MentorScript governing a backend service. It sets actionable constraints, enforces architectural patterns, and records "learned anti-patterns" derived from real code review failures.

```yaml
version: "1.2.0"
target_scope: "services/billing/**"
last_updated_by: "human-coach-dev"
last_updated_at: "2026-08-15"

meta:
  description: "Mentorship rules for Billing & Subscription services."
  policy_enforcement: "STRICT" # Rejects PR/MRP generation if high-severity rules are breached

# 1. ARCHITECTURAL PATTERNS & DIRECTIVES
patterns:
  - id: "MTR-PAT-001"
    name: "Dependency Injection"
    severity: "CRITICAL"
    rule: "All third-party clients (Stripe, Redis, Sendgrid) MUST be injected via constructor interfaces."
    anti_pattern: "Do NOT instantiate raw HTTP or API clients inline inside controller functions."
    rationale: "Inline instantiation prevents isolation testing in the Agent Execution Environment (AEE)."

  - id: "MTR-PAT-002"
    name: "Database Transaction Boundaries"
    severity: "HIGH"
    rule: "Multi-table mutation queries MUST be wrapped in an explicit SQL transaction block with explicit rollback logic."
    remediation_example: |
      // CORRECT:
      await db.transaction(async (tx) => {
        await tx.insert(orders).values(...);
        await tx.update(inventory).set(...);
      });

# 2. INFERRED MENTORSHIP & ANTI-PATTERNS (Lessons from past mistakes)
# Added after human developers refactored or corrected previous AI pull requests
learned_lessons:
  - id: "MTR-LESSON-089"
    origin_pr: "PR-4021"
    trigger: "Modifying user payment methods"
    rule: "Never log raw payload metadata during billing failures."
    correction_history: "Agent previously printed `err.payload` to stdout, which briefly exposed unmasked PII token strings in CloudWatch."
    enforcement_action: "Ensure log messages use `sanitizeLog(payload)`."

# 3. CODE HYGIENE & QUALITY GATES
hygiene:
  comments:
    rule: "Avoid redundant code summaries (e.g., '// increments counter by 1'). Only include comments explaining complex design trade-offs, security context, or business logic edge cases."
  error_handling:
    rule: "Do NOT catch generic `Exception` or `Error` globally without rethrowing or wrapping in a DomainError class."

# 4. REQUIRED EVIDENCE FOR MERGE-READINESS PACK (MRP)
verification_requirements:
  unit_test_coverage_min: 85
  required_checkers:
    - "semgrep --config=p/security-audit"
    - "npm run lint"
```

### Example 2: Markdown `AGENTS.md` hybrid format

Because many teams prefer standard Markdown, `AGENTS.md` is widely used as an accessible alternative or wrapper for MentorScript. This version shows how teams organize mentorship rules right at the root of a project.

````markdown
# AGENTS.md (MentorScript Overlay)

> **Role:** Institutional Rulebook & Quality Standards
> **Enforcement Level:** Mandatory for all autonomous Agent runs.

---

## Critical Anti-Patterns (DO NOT DO)

### 1. No Silent Error Suppression
- **Rule:** Never write empty `catch (e) {}` blocks or suppress promises with `.catch(() => {})`.
- **Why:** Silent failures create ghost bugs that waste hours during human on-call triage.
- **Correct Action:** Log the failure with trace IDs and rethrow a structured `ServiceException`.

### 2. Avoid Floating Point Math for Financial Values
- **Rule:** Do NOT use standard JavaScript/TypeScript numbers (`0.1 + 0.2`) for currency operations.
- **Correct Action:** Always use the `BigNumber` library or store integer micro-cents (`1000` = $10.00).

---

## Architecture & Style Standards

### State Management Guidelines
- All application state updates must go through designated Redux/Zustand slices.
- **Do not** bypass global state by creating ad-hoc local state bindings across sibling components.

### Testing Contracts
When generating new unit tests for an endpoint:
1. **Happy Path:** At least 1 test for standard response (200 OK).
2. **Boundary/Edge Case:** At least 1 test for invalid input payloads (400 Bad Request).
3. **Failure Path:** At least 1 test simulating network/database timeout (503 Service Unavailable).

---

## Feedback Log (Mentorship History)

| ID | Issue Caught in Review | Required Agent Behavior | Added By |
|---|---|---|---|
| `MTR-101` | Agent imported `axios` when the team uses native `fetch`. | Use standard `fetch` wrappers defined in `@/lib/api`. | @senior_dev |
| `MTR-102` | Agent generated hardcoded delay timeouts `setTimeout(5000)`. | Use exponential backoff middleware with retry limits. | @lead_arch |
````

### Key structural sections in a MentorScript

- **`target_scope` / Context:** Defines which services, folders, or repositories the rules apply to.
- **`patterns` (Directives):** Strict structural requirements (e.g., architectural patterns, testing minimums).
- **`learned_lessons` / Feedback Log:** A historical ledger of past AI mistakes. When an engineer rejects an agent PR, the reason is codified here so the agent fleet never repeats that mistake.
- **`verification_requirements`:** Explicit criteria the agent must pass before compiling its Merge-Readiness Pack (MRP) for human approval.

## Turn 7 — Is MentorScript open source or conceptual?

**User**

> Is this an open source project or spec? Or is MentorScript more of a conceptual?

**Assistant**

MentorScript originated as an academic conceptual term, but it is rapidly evolving into a practical, open-source specification standard.

The exact state of the term sits on a spectrum between research theory and production software.

### 1. The conceptual origin (academic research)

MentorScript was introduced in research papers — most notably in *Agentic Software Engineering: Foundational Pillars and a Research Roadmap* (Hassan et al.).

The paper proposed a framework for Structured Agentic Software Engineering (SASE) and introduced three theoretical artifact scripts:

- **BriefingScript:** Formal task requirements (the What).
- **LoopScript:** Workflow automation rules (the How).
- **MentorScript:** Codified architectural rules and team norms (the Standards).

In this context, MentorScript was defined as a conceptual scaffold — a theoretical pattern for "Mentorship-as-Code".

### 2. Practical reality: absorbed by `AGENTS.md`

As open-source tooling catches up with research, the industry consolidated around `AGENTS.md` as the open-source format for what research called MentorScript.

Instead of creating a standalone `.mentorscript` language:

- The broader open-source community adopted `AGENTS.md` (which has thousands of open-source implementations on GitHub).
- Open-source frameworks (such as the SDLC Enterprise Framework) treat MentorScript concepts as specific sections inside `AGENTS.md` (e.g., `## Conventions` and `## DO NOT` sections).

### Summary

| Perspective | Status | What it means |
|---|---|---|
| Academic Definition | Conceptual Pattern | Represents the theoretical paradigm of "Mentorship-as-Code". |
| Open Source Implementation | YAML / AGENTS.md Specs | Real-world frameworks implement MentorScript logic using structured YAML schemas or standard AGENTS.md markdown files in Git repositories. |

If you are implementing this concept in a project today, you don't need a proprietary compiler — you write an `AGENTS.md` file or a structured `.github/agent-rules.yaml` schema in your repository root.

## Turn 8 — Clarification

**User**

> That clears up my confusion

**Assistant**

Glad that helped clear things up!

It's a really interesting shift — academic papers love coining new names like MentorScript or BriefingScript, but open-source developers almost always default to pragmatic solutions like `AGENTS.md` or simple `.yaml` rulesets in the repository root.

If you're looking to try out these agentic patterns or set up a harness for your own projects, let me know!

## Turn 9 — Anthropic's AI-Native SDLC Playbook

**User**

> <https://claude.com/blog/the-ai-native-sdlc-playbook> — summarize, points that reinforce what has been said in this chat, new thoughts/ideas, any contradictions with other sources

**Assistant**

Anthropic's article, The AI-Native SDLC Playbook (published August 2026), builds directly on the shift from "vibe coding" to structured Agentic Software Engineering (ASE).

### 1. Core summary of the playbook

Anthropic argues that writing code is no longer the bottleneck in software development. The "Build" phase has collapsed from weeks to hours, shifting the primary constraints to the human-speed steps to the left and right: Plan, Review/Test, Deploy, and Maintain.

Instead of treating development as a linear, handoff-heavy process (Product Manager → Architect → Dev → QA → Ops), the AI-Native SDLC operates as a continuous, event-driven loop:

```text
[ intent.md ] ──> [ spec.md ] ──> [ plan.md ] ──> [ Code / Diff ] ──> [ Evals ] ──> [ Continuous Ops ]
      ▲                                                                                 │
      └────────────────── (Breached metrics trigger new intent.md) ─────────────────────┘
```

Every stage produces a machine-readable, human-auditable artifact committed to Git (e.g., `intent.md`, `spec.md`, `plan.md`, test diffs). Passing one artifact automatically triggers the next agentic phase via repository hooks.

### 2. Points that reinforce our conversation

- **Agent = Model + Harness (`CLAUDE.md` / `AGENTS.md`):** Anthropic stresses that team standards and institutional knowledge shouldn't be repeatedly typed in prompts. Instead, they must be committed directly to version control as machine-readable rulesets (`CLAUDE.md` / `AGENTS.md` / skills), matching the exact concept of MentorScript / Mentorship-as-Code we discussed earlier.
- **The shift to Spec-Driven Development (SDD):** Just as research papers (Diaz et al.) argued, Anthropic confirms that intent formulation and specification writing are the new core tasks of engineering. Code implementation is delegated to the AI, while humans set boundaries and evaluate output.
- **The "review bottleneck" and evidence-based reviews:** Human engineers cannot review every line of AI-generated code by hand without creating massive queues. Anthropic recommends shifting human focus to reviewing high-level intent, security gates, and automated evaluation summaries — mirroring the Merge-Readiness Pack (MRP) framework.
- **Bounded vs. unbounded execution:** The playbook warns against giving agents vague instructions. It requires explicit prerequisites, constraint bounds, and isolated step executions to keep agents from refactoring unrelated modules.

### 3. New ideas and unique contributions

- **Artifact-driven loop triggers:** Rather than human developers manually invoking AI at each step, Anthropic introduces a model where committing an accepted markdown artifact fires the next phase automatically via CI/CD hooks.
  - Merging `intent.md` → Triggers Design Agent to write `spec.md`.
  - Merging `spec.md` → Triggers Planning Agent to write `plan.md`.
  - Merging `plan.md` → Triggers Coding Agent to write implementation diffs.
- **Non-engineers directly authoring `intent.md`:** Product managers, customer support reps, or operations leads use non-technical AI interfaces (like Claude Cowork) to brainstorm and generate structured `intent.md` files. This allows non-developers to kick off the SDLC without waiting for an analyst to translate business needs into tickets.
- **Feedback loop from production back to intent:** When monitoring agents detect a bug or breached control metric in production, they automatically write a new `intent.md` detailing the anomaly and trigger a fix loop — closing the loop between operations and planning.

### 4. Subtle contradictions and differing views

| Area | Other Industry Views (Google Whitepaper, Skeptics) | Anthropic's Playbook |
|---|---|---|
| Role of Jira / Ticketing Systems | Traditional SDLC relies on Jira/Linear tickets as the source of truth for requirements. | Markdown-First (.md in Git): Tickets are secondary. Version-controlled Markdown files (`intent.md`, `spec.md`) living directly in the code repository act as the true audit trail and trigger system. |
| Vibe Coding's Place in Enterprise | Google whitepaper treats Vibe Coding as step 1 (prototyping) before graduating to Agentic Engineering. Skeptics call Vibe Coding harmful. | Bypasses Vibe Coding entirely: Focuses strictly on structured, multi-stage pipelines from day one. Unstructured "prompting and vibing" is treated as an anti-pattern for production software. |
| Scope of Human Oversight | Pragmatists argue humans must carefully inspect code diffs line-by-line for security and style. | Layered / Selective Code Review: Humans inspect intent, architecture, and safety gates. Detailed line-by-line review of routine diffs is delegated to automated AI reviewer layers, reserving human eyes primarily for high-risk or regulated code. |

## Turn 10 — Other AI coding vendors (OpenAI, Cursor, Cognition)

**User**

> Does OpenAI or any of the other ai coding companies we haven't discussed put out papers / thoughts?

**Assistant**

Yes, nearly every major AI coding platform and frontier lab has published technical whitepapers or engineering blogs defining their vision of the AI-Native SDLC.

While Google focused on Vibe Coding vs. Agentic Engineering and Anthropic framed it around Artifact-Driven Markdown Loops, other major players offer distinct, complementary perspectives.

### 1. OpenAI: Harness engineering and the agentic software factory

OpenAI shifted the conversation from Prompt Engineering to Harness Engineering. In technical writeups detailing how Codex/GPT models operate internally, OpenAI shares key insights:

- **The "3 Engineers, 1 Million Lines" benchmark:** OpenAI demonstrated building an enterprise-grade product consisting of over a million lines of code using just 3 human engineers acting purely as intent orchestrators — with zero manually written lines of code.
- **Harness over model:** OpenAI publicly emphasized that model intelligence hits diminishing returns without proper harnesses. Their engineering papers advocate for Multi-Pass Reasoning: having one subagent draft code, a second subagent attack/red-team it for edge cases, and a third subagent verify runtime type-checking before the human sees a diff.
- **The "Bolt" replacement for sprints:** OpenAI advocates replacing 2-week Agile sprints with "Bolts" — compressed, high-velocity delivery cycles (hours or days) where humans set intent, agents construct, and automated gates continuously deploy.

### 2. Cursor: The cloud VM sandbox and codebase recall architecture

Cursor (the AI-native IDE built by Anysphere) publishes detailed architectural teardowns explaining how agentic engineering functions under the hood. Their core framework revolves around "Delegated Engineering":

- **Virtual machine isolation:** Cursor argues local IDE prompting fails at scale because agents consume laptop memory and run unsafely. Their model provisions cloud-based Linux micro-VM sandboxes where autonomous agents execute terminal commands, run browser tests, and record video proofs of working features.
- **Parallel subagent exploration:** Instead of dumping an entire repository into an LLM context window (which causes performance degradation), Cursor uses specialized subagents in parallel: one maps frontend trees, another indexes API routes, and a third parses database schemas to build a dynamic context map.
- **Real-time RL loops:** Cursor's team disclosed that they retrain their harness and subagents on continuous telemetry every 1.5 to 2 hours, using active developer feedback to refine tool routing in real time.

### 3. Cognition (Devin): Asynchronous delegation and the Lead/Sidekick architecture

Cognition (creators of the Devin agent) publishes research focused on long-horizon task execution and how humans should interact with fully autonomous agents:

- **The Lead/Sidekick model:** Cognition's orchestration papers show that high-performing AI teams use a high-reasoning "Lead Agent" (e.g., Claude Opus/GPT-5 class models) that never touches code directly. The Lead Agent plans tasks, reviews architectural boundaries, and delegates actual code writing to lower-cost "Sidekick" subagents.
- **Demonstrated proofs of work:** Cognition argues that human review shouldn't consist of reading code. Instead, Devin agents run headless browsers inside their sandboxes, record video clips of UI interactions, attach terminal test logs, and present this "proof package" to human managers for asynchronous approval.

### Comparative map of key players

| Company / Tool | Core Philosophy | Primary Artifact / Mechanism | Human Role |
|---|---|---|---|
| Google AI | Vibe coding to Agentic Engineering | AGENTS.md, Test Harnesses, Evals | Conductor / Orchestrator |
| Anthropic | Artifact-Driven Loop SDLC | Git-committed .md files (`intent.md`, `spec.md`) | Gatekeeper & Intent Author |
| OpenAI | Agentic Software Factory | Harness Engineering, Red-Teaming Subagents | System Architect |
| Cursor | Delegated Parallel Sandbox Engineering | Micro-VM Cloud Sandboxes, Custom Context Maps | Parallel Task Dispatcher |
| Cognition (Devin) | Asynchronous Multi-Agent Execution | Proof Packages (Video/Logs), Lead/Sidekick Models | Asynchronous Product Manager |
