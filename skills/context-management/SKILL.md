---
name: context-management
description: "Persists session state across compactions and long sessions via state.md. Activates when context is running low, after compaction, when switching tasks, or when user requests a state save."
---

# Context Management

Maintains persistent session state using `~/.claude/state.md`.
Prevents information loss during compaction and enables seamless session continuity.

**state.md is ground truth.** If memory, CLAUDE.md, or conversation history conflicts with state.md, trust state.md.

---

## Triggers

Activate this skill when:
- Context usage exceeds ~80% (proactive save before auto-compaction)
- The user runs `/compact` or auto-compaction fires
- Switching between projects or major tasks mid-session
- The user asks to save progress, hand off, or end a session
- Session start — always read state.md first

Do NOT activate when:
- Session is short and self-contained
- The specific state to persist is already captured in CLAUDE.md or MEMORY.md (no unique context to save)
- No meaningful state exists to persist

---

## State File

**Location:** `~/.claude/state.md`

**Format:**

```markdown
# Session State

## Last Updated
YYYY-MM-DD HH:MM

## Active Task
[One sentence: what you are doing right now]
[Project path: /absolute/path/to/project]

## Completed This Session
- [task]: [file paths changed] — [decision rationale if non-obvious]

## In Progress
- [task]: [current status, next immediate step]
- [key file paths being edited]

## Pending
- [ordered by priority]

## Key Decisions
- [decision]: [rationale] — [date]

## Blockers
- [anything preventing progress]

## Environment
- [ports, configs, branch names, tool versions]
```

---

## Operations

### Save State

1. Read current `state.md` if it exists
2. **Merge incrementally** — update sections, do not rewrite from scratch
3. Move completed items from "In Progress" to "Completed This Session"
4. Remove stale completed items (older than 2 sessions) unless they contain key decisions
5. Update the timestamp
6. Write the file

**Rules:**
- File paths over descriptions. `/src/auth/login.ts:42` beats "the login component"
- Decisions need rationale. "Chose SQLite — embedded, no server needed" is useful
- Do not store code snippets — store file paths and line numbers
- Do not duplicate what is already in CLAUDE.md or MEMORY.md

### Restore State (Session Start)

1. Read `~/.claude/state.md`
2. Summarize current status to the user in 3-5 lines
3. Confirm "In Progress" and "Pending" items are still accurate
4. Ask what to work on next

**This is the single most important habit for continuity.** Do it every session.

### Pre-Compaction Save

When context is running low or before `/compact`:

1. Save state immediately — do not wait
2. Include anything that would be lost: error messages, file paths, line numbers, debugging hypotheses
3. Write the "Active Task" section with enough detail that a fresh agent could resume
4. After writing, confirm to the user that state is saved

### Post-Compaction Recovery

After compaction fires (auto or manual), the conversation summary loses file paths, error messages, and precise context. Recovery procedure:

1. **Read `~/.claude/state.md` immediately** — this is your ground truth, not the compaction summary
2. Read `~/.claude/CLAUDE.md` for project rules (already auto-injected, but verify)
3. Re-read the specific files listed in "In Progress" to rebuild working context
4. Resume the "Active Task" without asking the user to re-explain
5. If state.md is missing or stale, tell the user and ask for direction

**Do NOT rely on the compaction summary alone.** A 100K+ conversation compressed to 5-10K tokens cannot preserve every file path and decision. state.md fills that gap.

---

## Do NOT

- **Do NOT auto-save without a trigger.** Save on the triggers listed above, not randomly.
- **Do NOT overwrite state.md entirely.** Always merge with existing content.
- **Do NOT store code in state.md.** File paths and line numbers only.
- **Do NOT keep stale items.** Prune completed items older than 2 sessions.
- **Do NOT skip state.md at session start.** This causes incorrect status reporting and wasted work.
- **Do NOT trust compaction summaries over state.md.** Summaries are lossy. state.md is authoritative.

---

## Key Principles

- **Proactive over reactive.** Save before compaction hits, not after context is lost.
- **Incremental updates, not full rewrites.** Update the relevant section, leave the rest intact.
- **File paths are search keys.** Absolute paths with line numbers enable instant re-orientation.
- **Decisions need rationale.** "What" without "why" is useless in future sessions.
- **state.md is ground truth.** Everything else is supplementary.
