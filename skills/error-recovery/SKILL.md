---
name: error-recovery
description: "Maintains a project-specific known-issues.md mapping recurring errors to root causes and fixes. Consulted BEFORE debugging to avoid rediscovering known problems. Invoke when you hit any error or after fixing a non-trivial bug."
---

# Error Recovery

A persistent knowledge base of project-specific errors and their solutions.
Every recorded fix saves future debugging time. The value compounds across sessions.

---

## Scope

Use this skill when:
- You encounter ANY error, build failure, or unexpected behavior (lookup first)
- You fix a non-trivial bug that cost real debugging time (record it)
- The known-issues file has grown past 30 entries (prune it)

Do NOT use when:
- The error is a simple typo or syntax mistake that will not recur
- The error is already documented in the project's official docs
- The user says "skip known-issues" or equivalent

---

## File Location

- **Per-project:** `docs/known-issues.md` in the project root
- **Cross-project fallback:** `~/.claude/known-issues.md`

If neither file exists and you need to record an entry, create the per-project file.

---

## Entry Format

Each entry in known-issues.md MUST follow this exact structure.
The `Signature` field is the primary search key -- use exact text from the error.

```markdown
### [Short human-readable title]

| Field | Value |
|-------|-------|
| **Signature** | `exact error message or pattern` |
| **Category** | build / runtime / test / env / dependency / config |
| **First seen** | YYYY-MM-DD |
| **Last seen** | YYYY-MM-DD |
| **Frequency** | once / occasional / frequent |
| **Status** | workaround / permanent-fix |

**Root cause:** Why it happens -- one or two sentences.

**Fix:**
[Exact steps, commands, file paths, or code changes. Must be copy-pasteable.]

**Prevention:** How to avoid recurrence, if applicable.

---
```

**Rules for entries:**
- `Signature` must be the **exact error text** or a representative regex -- never a paraphrase
- `Fix` must be **directly actionable** -- "check your config" is not a fix; "set `NODE_ENV=production` in `.env`" is
- `Root cause` explains **why**, not **what** -- symptoms go in Signature
- `Status` distinguishes temporary workarounds from permanent fixes

---

## Workflow

### Step 1: LOOKUP (before ANY debugging)

This is **mandatory**. Do not form hypotheses until you have checked known-issues.

1. Read the project's `docs/known-issues.md` (and `~/.claude/known-issues.md` if it exists)
2. Search for the error signature -- match on substrings, error codes, or stack trace patterns
3. **If found with permanent-fix status:** apply the fix directly, update `Last seen` date
4. **If found with workaround status:** apply the workaround, then decide whether to pursue a permanent fix
5. **If found but fix fails:** update the entry with what you learned, then proceed to normal debugging
6. **If not found:** proceed with normal debugging

### Step 2: RECORD (after fixing any non-trivial bug)

After resolving an error through debugging, decide whether to record it:

**Record if ANY of these are true:**
- The fix took more than 2 minutes to find
- The error is environment-specific (OS, version, config)
- The error involves a dependency or external service
- The error has a non-obvious root cause
- You had to search the web or read source code to find the fix

**Do NOT record if ALL of these are true:**
- The fix was a simple typo or missing import
- The error message directly told you what to do
- The error will never recur (one-time data issue)

When recording: append the entry to known-issues.md using the exact format above.

### Step 3: PRUNE (periodic maintenance)

Run when: the file exceeds 30 entries, or every ~10 sessions, or on user request.

**Remove entries where:**
- The root cause has been structurally eliminated (code refactored, dependency removed)
- Status is `permanent-fix` AND last seen is older than 90 days
- The project no longer uses the relevant technology

**Keep entries where:**
- Status is `workaround` (no permanent fix exists yet)
- The error is environment-specific (these recur unpredictably)
- Frequency is `frequent` regardless of age

**Promote entries where:**
- A workaround now has a permanent fix -- update Status and Fix fields

---

## Do NOT

- **Do NOT skip the lookup step.** Always check known-issues.md before forming hypotheses.
- **Do NOT paraphrase error messages.** The signature must match future searches.
- **Do NOT write vague fixes.** Every fix must be copy-pasteable or directly actionable.
- **Do NOT record trivial errors.** Only errors that cost real debugging time.
- **Do NOT let the file grow unbounded.** Prune when it exceeds 30 entries.
- **Do NOT duplicate entries.** If the error already exists, update it instead.

---

## Integration

- **systematic-debugging / any debugging workflow:** Check known-issues as the FIRST step, before forming hypotheses. If the error matches, apply the fix. If the fix fails, update the entry and debug normally.
- **claude-mem:** For cross-project patterns, also search memory. Known-issues.md is for project-specific errors; memory handles cross-project knowledge.

---

## Key Principles

- **Error messages are search keys.** Include the exact text, not a summary.
- **Fixes must be actionable.** Commands, file paths, code changes -- not descriptions.
- **Record root causes, not symptoms.** The fix should prevent the error, not hide it.
- **Workarounds are temporary.** Mark them clearly and revisit when capacity allows.
- **Cross-session value compounds.** A 2-minute recording saves 30 minutes next time.
