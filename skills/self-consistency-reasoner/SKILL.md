---
name: self-consistency-reasoner
description: "Background reasoning technique for high-stakes inference. Generates 3-5 independent reasoning paths, takes majority vote, flags disagreements. Activates automatically during debugging, verification, and architectural decisions — never invoked directly."
user-invocable: false
---

# Self-Consistency Reasoner

A background reasoning technique — NOT a user-facing skill.
Based on Wang et al. 2022 ("Self-Consistency Improves Chain of Thought Reasoning in Language Models").
Core insight: complex problems admit multiple valid reasoning paths; the correct answer emerges from their convergence.

## When to Activate

**ACTIVATE** for:
- Root cause analysis with multiple plausible hypotheses
- Verification where a wrong conclusion has high cost (claiming "fixed" when it is not)
- Complex code reasoning: concurrency, state machines, recursive logic, security
- Architectural decisions with long-term consequences
- Any inference chain longer than 3 dependent steps

**SKIP** for:
- Simple lookups, straightforward questions, single plausible answer
- Routine code changes with obvious correctness
- Low-stakes, easily reversible decisions

## Algorithm

```
1. FRAME    → State the specific question as a concrete, answerable claim
2. SAMPLE   → Generate N independent reasoning paths (min 3, max 5)
3. COMPARE  → Extract each path's conclusion and tally votes
4. DECIDE   → Apply confidence threshold (see table below)
5. SURFACE  → If confidence < High, flag disagreement to user
```

### Step 1: Frame the Question

Must be concrete and falsifiable:
- "What is causing the null pointer on line 47?"
- "Will this refactoring break existing callers?"
- "Is this race condition reachable in production?"

### Step 2: Generate Independent Paths

Each path MUST reason from evidence independently. Do NOT let earlier paths bias later ones.

| Path | Angle |
|------|-------|
| A | Trace data flow forward from inputs |
| B | Trace backward from the symptom/error |
| C | Reason about what must be true for correct behavior |
| D | Search for similar patterns elsewhere in codebase |
| E | Consider environmental/config/timing factors |

Use 3 paths for moderate-stakes questions. Use 5 for high-stakes (security, data loss, architectural).

### Step 3: Compare and Vote

Extract each path's final answer. Tally.

### Step 4: Apply Confidence Threshold

| Agreement | Confidence | Action |
|-----------|------------|--------|
| Unanimous (N/N) | **High (>90%)** | Proceed. No need to surface reasoning. |
| Strong majority (N-1/N) | **Moderate (70-90%)** | Proceed but note the dissenting path — it may reveal an edge case. |
| Bare majority (3/5, 2/3) | **Low (50-70%)** | Pause. Investigate the split before concluding. Surface to user. |
| No majority | **Insufficient (<50%)** | Do NOT conclude. Gather more evidence. Tell the user. |

### Step 5: Surface Disagreements

When confidence is Moderate or lower, surface explicitly:

> **Reasoning paths disagree (confidence: [X]%):**
> - Paths A, B, C conclude: [answer 1]
> - Paths D, E conclude: [answer 2]
> - Disagreement stems from: [differing assumption or evidence]
> - To resolve: [what additional information would settle it]

## Example

**Question:** "Is the retry loop in `api_client.py:L120` causing the timeout cascade?"

| Path | Reasoning | Conclusion |
|------|-----------|------------|
| A (forward trace) | Request enters, retry loop fires 3x with 30s timeout, 90s total blocks event loop | **Yes** |
| B (backward trace) | Timeout logs show 90s gaps matching 3x retry interval | **Yes** |
| C (correct behavior) | Retry should use exponential backoff with jitter; current code uses fixed delay | **Yes** |
| D (pattern search) | Similar retry in `webhook_client.py` uses backoff and has no timeout issues | **Yes** |

**Result:** 4/4 unanimous. High confidence. Proceed with fix — no need to surface reasoning.

If Path D had instead found that `webhook_client.py` also times out, confidence drops to Moderate and the disagreement gets flagged: the problem may be systemic, not local.

## Integration Points

- **systematic-debugging**: 3+ paths before committing to a root cause hypothesis
- **verification-before-completion**: Validate that a fix actually resolves the issue, not just "looks right"
- **code review**: Each path considers a different failure mode of the proposed change
- **architectural decisions**: Each path evaluates from a different quality attribute (performance, maintainability, security)

## Rules

1. **Independence is non-negotiable.** If later paths rubber-stamp the first, the technique adds zero value.
2. **Disagreement is signal.** Split results mean the problem is harder than it looks — surface this.
3. **Silent by default.** Do NOT produce visible output for each path unless confidence is below High or the user asks.
4. **Cost-aware.** Use 3 paths when 3 suffice. Only scale to 5 for high-stakes questions.
5. **Consistency ~ confidence.** Lower agreement = lower confidence = more caution. This lets the model "know when it doesn't know."
