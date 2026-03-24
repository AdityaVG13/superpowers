---
name: deliberation
description: "Activates BEFORE brainstorming when the user faces complex decisions, architectural trade-offs, technology selection, or design dilemmas where options are not well-defined. Assembles multiple stakeholder perspectives to surface tensions and trade-offs without forcing premature choices."
---

# Multi-Perspective Deliberation

A structured decision framework for complex choices where the right path is not obvious.
Invoke this BEFORE brainstorming when the problem space itself is unclear.

---

## When to Use

- Architectural decisions with competing constraints (monolith vs microservices, SQL vs NoSQL)
- Technology selection where team skills, timeline, and requirements pull in different directions
- Design dilemmas where "best" depends entirely on whose priorities you weight
- Cross-cutting concerns that affect multiple system boundaries (auth strategy, data model, API design)
- Any decision where jumping straight to brainstorming would silently encode unexamined assumptions

**Concrete examples:**
- "Should we build a custom auth system or use a third-party provider?" -- YES, use deliberation
- "Should we use PostgreSQL or MongoDB for the activity log?" -- YES, genuine trade-offs exist
- "Which CSS framework should we use?" -- MAYBE, only if constraints are genuinely competing
- "Should we fix this null pointer bug?" -- NO, use systematic-debugging
- "How should we implement the search feature?" -- NO, go straight to brainstorming (the "what" is clear)

## When NOT to Use

- Clear requirements with an obvious implementation path -- go straight to brainstorming
- Pure implementation questions -- use systematic-debugging or writing-plans
- Decisions already made by the user -- do not re-litigate
- Low-stakes, easily reversible choices -- just pick one and move on
- When the user says "just do it" -- respect that

---

## Process

### Step 1: Frame the Decision (Not the Solution)

State the decision in one sentence. Separate what is fixed from what is open.

| Element | Question |
|---|---|
| **Decision** | What are we deciding? (not how) |
| **Stakes** | What breaks or degrades if we choose wrong? |
| **Hard constraints** | What is non-negotiable? (budget, timeline, compliance) |
| **Soft constraints** | What is preferred but flexible? |

**Example:**
> **Decision:** Whether to use a relational DB or document store for the user activity log.
> **Stakes:** Wrong choice means either slow queries or a painful migration in 6 months.
> **Hard constraints:** Must handle 10K writes/sec, must support complex analytics queries.
> **Soft constraints:** Team prefers PostgreSQL, would like to avoid a new ops dependency.

**Guardrail:** If you cannot articulate the stakes, the decision may not need deliberation. Consider skipping to brainstorming.

### Step 2: Identify Objectives Before Alternatives

Before considering options, list what a good outcome looks like. This prevents anchoring on a premature favorite.

Ask: "What would the ideal solution achieve?" List 3-7 objectives ranked by importance.

**Example objectives:**
1. Sustain 10K writes/sec under peak load (must-have)
2. Support ad-hoc analytical queries without a separate system (must-have)
3. Minimize new operational dependencies (strong want)
4. Allow schema evolution without downtime (nice-to-have)

### Step 3: Assemble Perspectives (3-5)

Select stakeholder lenses that create genuine tension for THIS decision. Do not use generic perspectives -- pick ones that will disagree.

**Common lenses (choose the relevant ones):**

| Perspective | Speaks For |
|---|---|
| **The User** | End-user experience, latency, reliability |
| **The Maintainer** | Future developers, readability, debuggability |
| **The Operator** | Deployment, monitoring, failure modes, on-call burden |
| **The Architect** | System boundaries, coupling, extensibility, consistency |
| **The Pragmatist** | Shipping timeline, team skills, existing code, migration cost |
| **The Security Engineer** | Attack surface, data protection, compliance |
| **The Data Steward** | Data integrity, auditability, retention, privacy |

**Selection test:** If all chosen perspectives would agree, either (a) the decision is not actually hard -- skip deliberation, or (b) you picked the wrong perspectives. Swap until you have real tension.

### Step 4: Each Perspective Speaks Once

Each perspective states three things:
1. **What they value most** in this decision (tied to Step 2 objectives)
2. **What risks they see** that others might underweight
3. **What they would lean toward** and why

**Rules:**
- **No debate.** Each perspective speaks independently -- no rebuttals.
- **No strawmen.** Each perspective makes its strongest honest case.
- **Stay concrete.** Reference the actual system, actual team, actual timeline. No abstract principles.
- **Steel-man the minority.** If one perspective is outnumbered, make its case even stronger. This is the primary guard against premature convergence.

### Step 5: Surface Convergence, Tensions, and Blind Spots

After all perspectives have spoken, synthesize:

- **Convergence:** Where do 3+ perspectives agree? These are likely safe choices.
- **Tensions:** Where do perspectives genuinely conflict? Name the exact trade-off, not a vague "it depends."
  - Bad: "Performance vs maintainability"
  - Good: "Document store gives 3x write throughput but requires denormalized data that makes analytics queries 5x harder to write and maintain"
- **Hidden assumptions:** What did multiple perspectives take for granted? Challenge at least one shared assumption explicitly.
- **Missing voices:** Is there a perspective we did not include that would change the analysis? (e.g., "We did not consider the compliance team -- GDPR retention rules might eliminate one option entirely.")

### Step 6: Rank Tensions by Reversibility

Not all tensions are equal. Classify each:

| Tension | Reversibility | Implication |
|---|---|---|
| Hard to reverse (data model, API contract) | Low | Resolve before proceeding |
| Moderate (framework choice, service boundary) | Medium | Resolve or accept risk explicitly |
| Easy to reverse (config, feature flag) | High | Defer -- decide later with more info |

This prevents the team from spending deliberation energy on decisions that can be cheaply changed later.

### Step 7: Present to User

Deliver the analysis **without a recommendation.** The goal is clarity about trade-offs, not consensus.

> **Decision:** [one sentence]
>
> **Objectives (ranked):** [numbered list]
>
> **Perspectives heard:** [names]
>
> **They agree on:** [bullet points]
>
> **They disagree on:** [bullet points -- name the specific trade-off]
>
> **Assumptions worth questioning:** [bullet points]
>
> **Irreversible tensions (resolve now):** [list]
>
> **Reversible tensions (can defer):** [list]

Then ask the user: "Which tensions do you want to resolve, and which priorities should win?" Their answers become hard constraints for the brainstorming phase.

---

## Anti-Convergence Guardrails

Premature convergence is the primary failure mode of deliberation. These guardrails prevent it:

1. **No recommendation.** Present trade-offs, not answers. The user decides.
2. **Steel-man the minority.** If 4 perspectives agree and 1 dissents, strengthen the dissent. The lone voice often carries the most important risk.
3. **Challenge shared assumptions.** If all perspectives assume "we need real-time," ask: "Do we? What if 5-second staleness is acceptable?"
4. **Separate reversible from irreversible.** Only force resolution on decisions that are hard to undo.
5. **Name what you are NOT considering.** Explicitly state which perspectives were excluded and why.

---

## Integration with Other Skills

- **premise-check** runs BEFORE deliberation -- validates the work is worth doing
- **deliberation** (this skill) runs BEFORE brainstorming -- surfaces trade-offs
- **brainstorming** runs AFTER deliberation -- generates solutions within the resolved constraints

The resolved tensions from deliberation become the design constraints that brainstorming operates within.

---

## Do NOT

- **Do NOT recommend a solution.** The goal is clarity about trade-offs, not consensus.
- **Do NOT roleplay as stakeholders.** Perspectives are analytical lenses, not characters with dialogue.
- **Do NOT include perspectives that all agree.** Unanimous perspectives add no signal.
- **Do NOT use this for simple decisions.** If the answer is obvious, skip deliberation.
- **Do NOT run this after brainstorming has started.** It feeds INTO brainstorming, not the reverse.
- **Do NOT deliberate for more than one response.** If it takes longer, you are overcomplicating it.

---

## Key Principles

- **Objectives before alternatives.** Know what "good" looks like before evaluating options.
- **Tensions are features, not bugs.** The goal is to surface them, not eliminate them.
- **Reversibility determines urgency.** Spend deliberation time on decisions that are hard to undo.
- **3-5 perspectives maximum.** More than 5 creates noise without additional signal.
- **Steel-man, do not straw-man.** Every perspective deserves its strongest case.
