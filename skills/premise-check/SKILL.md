---
name: premise-check
description: "Validates whether proposed work should exist before building it. Catches flawed premises, unnecessary complexity, and wrong-problem solutions early."
---

# Premise Check

A pre-flight validation that the work you are about to do is worth doing.
Run this BEFORE brainstorming, designing, or building anything non-trivial.

---

## Scope

Use when:
- Starting any new feature, tool, or system
- A request feels like solving the wrong problem
- Building something complex to solve something simple
- Requirements come from assumptions rather than evidence

Skip when: user says "just do it", task is a clear bug fix, or change is under 20 lines.

---

## Step 1: The 5 Whys -- Find the Real Problem

Drill into the problem before evaluating the solution. Ask "why" until you hit a root cause.

1. "Why do we need [proposed work]?" -- surfaces the stated problem
2. "Why does [stated problem] exist?" -- reveals the mechanism
3. "Why hasn't [mechanism] been addressed?" -- uncovers constraints
4. "Why is [constraint] present?" -- exposes systemic causes
5. "Why is [systemic cause] tolerated?" -- reaches the root

Stop early if you hit root cause before question 5.

**Example:**
> "We need a caching layer." Why? "API is slow." Why? "Re-queries DB every request." Why? "No deduplication." Why? "Nobody profiled it."
> Root cause: missing profiling, not missing cache.

---

## Step 2: Four Validation Questions

### Q1. Is this a real problem?
- Can you name a specific user or scenario experiencing this today?
- How frequent? (Daily? Weekly? Once ever?)
- Is the pain measured or assumed?

**Red flags:** "We might need this someday." "Other projects do this." "It would be nice."

### Q2. Is there a simpler alternative?
- Could configuration, a flag, or an env var solve this?
- Does an existing tool or built-in handle it?
- Could a manual process work until the problem is better understood?
- What is the minimum change that addresses the root cause?

**Red flags:** Framework when a function would do. Infrastructure when a script suffices.

### Q3. What are we assuming?

List every assumption, then rate confidence:

| Assumption | Confidence |
|---|---|
| Users actually want X | Known / Believed / Assumed |
| This needs to handle Y scale | Known / Believed / Assumed |
| Requirements won't change soon | Known / Believed / Assumed |

- **Known** = have evidence (data, feedback, measurements)
- **Believed** = reasonable but unverified
- **Assumed** = no evidence, just convention or gut feel

Any "Assumed" item with high impact is a reason to pause.

### Q4. What would change our mind?
Name specific findings that would kill or reshape this approach:
- "If the existing system already handles this edge case"
- "If users do X instead of Y when observed"
- "If the performance requirement is 10x lower than assumed"

If you cannot name anything, you are not thinking critically.

---

## Step 3: Decision Tree

```
               Root cause clear?
              /                 \
            YES                  NO --> STOP: Investigate first
             |
        Real problem?
       /            \
     YES             NO --> STOP: Don't build
      |
  Simpler path?
  /          \
YES           NO
 |             |
PIVOT      High-impact "Assumed" items?
            /              \
          YES               NO
           |                 |
     PROCEED WITH        PROCEED
       CAUTION
```

- **Proceed** -- root cause clear, problem real, no simpler path, assumptions verified
- **Proceed with caution** -- move forward but validate unverified assumptions early
- **Pivot** -- real problem, but a simpler solution exists; redirect effort
- **Stop** -- flawed premise or insufficient understanding; investigate first

---

## Output Format

> **Root cause (5 Whys):** [one sentence]
>
> **Verdict:** Proceed / Proceed with caution / Pivot / Stop
>
> **The real problem:** [may differ from stated request]
>
> **Simpler alternatives considered:** [list, or "none viable"]
>
> **Key assumptions:** [assumption] -- [Known/Believed/Assumed]
>
> **Would reconsider if:** [list]
>
> **Next step:** [one concrete action]

---

## Do NOT

- **Skip this for "obvious" features.** They often hide flawed premises.
- **Let the check take longer than the work.** Five minutes max.
- **Present the check as a blocker.** It is a conversation, not a gate.
- **Conclude "Stop" without a path forward.** Always suggest what to investigate instead.
- **Re-run after user has approved.** One check per decision.

---

## Key Principles

- Five minutes of premise-checking saves five hours of wrong-direction work.
- "We should build X" is not a premise. "Users need X because Y" is a premise.
- The root cause is almost never what it appears on first description.
- Simpler is not lazier. The best solution is often the least impressive one.
- Assumptions are not bad. Unexamined assumptions are.
