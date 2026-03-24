---
name: token-efficiency
description: "Always-on background rules for minimizing token waste: parallel tool calls, no redundant reads, targeted access, rtk wrappers, compressed context."
user-invocable: false
type: background
---

# Token Efficiency

Background operational standard applied to every session.
Reduces token waste without sacrificing quality. If a task-specific skill conflicts, it takes precedence.

---

## Core Rules

### 1. Parallel Tool Calls
When tool calls have no data dependency, batch them in one turn.
```
DO:    [Read A] [Read B] [Grep C]   <- single turn
DON'T: [Read A] -> wait -> [Read B] -> wait -> [Grep C]
```

### 2. No Redundant Reads
Before issuing Read, ask: "Do I already have this content?"
Re-read only if: the file was edited, you need a different section, or context was compacted.

### 3. Targeted File Access
- Grep to locate, then Read with `offset`/`limit` for the relevant section
- Never read a 2000-line file for a 5-line function
- Read signatures before bodies; scan structure before details

### 4. Use `rtk` Wrappers
`rtk` compresses shell output by 60-90%, saving thousands of tokens per command.
```bash
rtk git status    # not git status
rtk ls            # not ls
rtk grep pattern  # not grep pattern
rtk pytest        # not pytest
rtk git diff      # not git diff
```
Track savings: `rtk gain` or `rtk gain --graph`

### 5. Compress at Boundaries
At logical boundaries (subtask done, focus shift):
- Summarize findings internally; release raw details
- Keep only: conclusions, file paths, next steps
- Before `/compact`, ensure state.md is updated

### 6. Direct Answers
- No preamble ("Great question!" / "Let me help you with that")
- No restating the question or narrating tool calls
- Conclusions first, supporting details second

### 7. Efficient Search Strategy
1. Glob for file discovery (fast, no content scan)
2. Grep with targeted patterns (function names, error strings)
3. Read only after you know which files matter
4. Search broadly only when you genuinely don't know where to look

### 8. Batch Edits
Multiple edits to one file: plan all, execute sequentially, don't re-read between edits unless an edit changes context you need.

### 9. Context-Aware Compaction
- Auto-compaction triggers at ~83.5% of context window
- PreCompact hooks preserve critical instructions; use them
- Structured prompts consume ~30% fewer tokens than narrative ones
- After compaction, re-read state.md immediately (ground truth)

---

## Anti-Patterns

| Anti-Pattern | Waste | Fix |
|---|---|---|
| Reading a file you just wrote | ~1000 tok | Trust your writes |
| Re-searching something already found | ~500 tok | Track results mentally |
| Full file read for one function | ~2000 tok | Grep then targeted read |
| Narrating each step before doing it | ~200 tok/step | Just execute |
| Using raw shell instead of `rtk` | ~500-2000 tok | Always prefix with `rtk` |
| Sequential calls that could be parallel | ~latency + overhead | Batch independent calls |
| Re-reading state.md mid-session | ~500 tok | Read once at start |
| Verbose tool descriptions in output | ~300 tok | Let results speak |

---

## Do NOT

- Read files speculatively. Know why before opening.
- Repeat information the user already stated.
- Generate verbose explanations when a short answer suffices.
- Re-read files you wrote in the same session (unless user edited them).
- Issue sequential tool calls when they could run in parallel.
- Use raw `git status`, `ls`, `grep` when `rtk` equivalents exist.

---

## Measurement

Track with `rtk gain` after each session. Targets:
- **50%+ reduction** vs. naive approach (no rtk, sequential calls)
- **Zero redundant reads** per session
- **All independent tool calls parallelized**
- Review `rtk gain --graph` weekly for trends
