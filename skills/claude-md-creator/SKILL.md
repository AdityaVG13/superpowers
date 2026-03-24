---
name: claude-md-creator
description: "Creates or updates minimal, high-signal CLAUDE.md files by analyzing the codebase. Discovers build commands, structure, conventions, and CI config. Use when setting up a new project, onboarding a codebase, or when an existing CLAUDE.md is outdated or bloated."
tools: Read, Glob, Grep, Bash, Edit
---

# CLAUDE.md Creator

Generate or update minimal, accurate CLAUDE.md files by inspecting the actual codebase.
No aspirational rules -- only empirically verifiable facts.

## When to Use

- **Create**: Project has no CLAUDE.md, or existing one is severely outdated
- **Update**: After major refactoring, dependency changes, or CI pipeline changes
- **Trim**: Existing CLAUDE.md exceeds 200 lines or contains bloat

Do NOT use when the project already has a well-maintained CLAUDE.md under 100 lines.

## Phase 1: Codebase Analysis

Scan these sources in order. **Extract actual commands -- do not guess.**

| Source | What to Extract |
|---|---|
| `package.json` / `pnpm-workspace.yaml` | scripts, package manager, monorepo structure |
| `Makefile` / `Justfile` | build/test/lint targets |
| `pyproject.toml` / `setup.py` | Python build, test, lint config |
| `Cargo.toml` / `go.mod` / `go.work` | Rust/Go build config |
| `.github/workflows/*.yml` / `.gitlab-ci.yml` | CI checks, required status checks |
| Lint/format (`.eslintrc*`, `ruff.toml`, `.prettierrc*`, `biome.json`) | Enforced style rules |
| Type configs (`tsconfig.json`, `mypy.ini`, `pyrightconfig.json`) | Type-check strictness |
| `Dockerfile` / `docker-compose.yml` | Container setup, required services |

Also check:
- Top-level directory layout (source root, test root, output dirs)
- Monorepo structure (`packages/`, `apps/`, workspace config)
- `.claude/rules/` directory (avoid duplicating existing rules)
- Existing `CLAUDE.md` in parent directories (avoid contradictions)

## Phase 2: Generate CLAUDE.md

Target: **under 100 lines.** Every line must earn its place. Use only sections that apply.

```markdown
# Project Name

One-line description.

## Commands
- `<build>` -- production build
- `<dev>` -- start dev server
- `<test>` -- run full test suite; `<test:single>` for single file
- `<lint>` -- lint and format check
- `<typecheck>` -- type checking

## Architecture
- `src/` -- application source
- `tests/` -- test files, mirrors src/ structure
- `dist/` -- build output (gitignored)

## Code Style
- [Only rules enforced by tooling, e.g. "ESLint enforces camelCase (see .eslintrc)"]
- [Preferences Claude cannot infer: "Use ES modules, not CommonJS"]

## Gotchas
- [Non-obvious behaviors, ordering dependencies, env quirks]
- [Common mistakes specific to this project]
```

### Example

```markdown
# my-api

Express + TypeScript REST API with PostgreSQL.

## Commands
- `pnpm build` -- TypeScript compilation
- `pnpm dev` -- dev server with hot reload (port 3000)
- `pnpm test` -- Vitest suite; `pnpm test -- path/to/file` for single file
- `pnpm lint` -- ESLint + Prettier check
- `pnpm typecheck` -- tsc --noEmit

## Architecture
- `src/routes/` -- API route handlers
- `src/services/` -- business logic
- `src/db/` -- Drizzle ORM schema and migrations
- `tests/` -- mirrors src/, factories in `tests/factories/`

## Code Style
- ESLint enforces camelCase variables, PascalCase types (see .eslintrc.cjs)
- Strict TypeScript: noImplicitAny, strictNullChecks

## Gotchas
- Tests need `--runInBand` (shared DB state, no parallel)
- `NEXT_PUBLIC_*` env vars must be set at build time, not runtime
- Run `pnpm db:migrate` after pulling if migrations changed
```

## Phase 3: Update Workflow (Existing CLAUDE.md)

When updating rather than creating from scratch:
1. Read the existing CLAUDE.md fully
2. Cross-reference each section against the current codebase
3. **Remove** stale commands, dead file paths, outdated conventions
4. **Add** newly discovered commands, gotchas, or architectural changes
5. **Do not append blindly** -- rewrite sections that have drifted
6. Show a diff of proposed changes before applying

For large projects, use `@path/to/file` imports instead of inlining:
```markdown
See @docs/api-conventions.md for API design rules.
```

## Anti-Bloat Rules

| DO Include | DO NOT Include |
|---|---|
| Commands Claude cannot guess | Anything Claude discovers by reading code |
| Style rules differing from defaults | Standard conventions Claude already knows |
| Non-obvious gotchas and env quirks | Generic advice ("write clean code") |
| Architecture only if non-obvious | File-by-file codebase descriptions |
| Repo workflow (branch naming, PR) | Long tutorials or explanations |
| Required env vars or setup steps | Info that changes frequently (link instead) |

**If there is no linter rule enforcing it, it is aspirational -- leave it out.**

## Verification

After generating or updating:
1. **Run** every command listed -- confirm each succeeds
2. **Check** all file paths mentioned actually exist
3. **Verify** CI requirements match actual workflow files
4. **Count** lines -- over 100? Ask "would removing this cause Claude to make mistakes?"
5. **Diff** against parent-directory CLAUDE.md to avoid contradictions

## Principles

- **Empirical over aspirational.** Only document what the codebase enforces.
- **Commands over descriptions.** `pnpm test` beats "run the test suite."
- **100-line budget forces prioritization.** Cut what Claude does not need.
- **Update, do not accumulate.** Rewrite stale sections rather than appending.
- **Concise is kind.** Bloated CLAUDE.md causes Claude to ignore your instructions.
