---
name: vue-optimize
description: Analyze Vue component structure across client/src for performance (reactivity, re-renders) and code-reuse (duplication, extractable composables/components) issues, and report prioritized findings. Use when asked to analyze, audit, or find optimization opportunities in Vue components — not for applying fixes.
---

# Vue Component Structure Analysis

Produce a prioritized, evidence-based report of performance and code-reuse issues across the Vue codebase. This skill is **read-only** — it reports findings, it does not edit files. If the user wants fixes applied after reviewing the report, hand specific findings to the `vue-expert` agent in a follow-up step (per this repo's `CLAUDE.md`, all `.vue` edits must go through `vue-expert`).

## Scope

Default target: `client/src/views/*.vue`, `client/src/components/*.vue`, `client/src/composables/*.js`.

If the user names specific files/views, scope to those instead — but still cross-reference against the rest of `client/src` for duplication checks, since reuse issues are inherently cross-file.

## What to look for

### 1. Reactivity & re-renders
- `reactive()` used where a plain `ref()` or `computed()` would do (unnecessary deep reactivity on data that's replaced wholesale, e.g. API responses)
- `watch`/`watchEffect` that only recompute a derived value — should be a `computed` instead
- Deep watchers (`{ deep: true }`) on large objects/arrays where a narrower watch source or a computed would avoid the full-tree diff
- Large monolithic components mixing unrelated concerns (data fetching + filtering + charting + modals) in one file, causing broad re-renders when any one concern changes — flag as a split candidate
- Static markup/content that never changes wrapped in reactive templates without `v-once` or `v-memo` where it would meaningfully help
- Expensive work (sorting, filtering, formatting) done inline in the `<template>` or recomputed on every render instead of memoized in a `computed`

### 2. Code duplication / reuse
- Repeated data-fetching lifecycle pattern (loading/error/data refs + `onMounted` load function, as templated in `.claude/agents/vue-expert.md`) copy-pasted across multiple views instead of extracted into a composable in `client/src/composables/`
- Duplicated template markup (e.g. the same filter bar, empty-state, or detail-modal shell rebuilt per view instead of reusing an existing component like `FilterBar.vue` or a shared modal shell)
- Near-identical logic (e.g. currency/date formatting, status-color mapping) redefined per-file instead of a shared util/composable
- Multiple modals (`*DetailModal.vue`, `*Modal.vue`) with overlapping structure (header/close button/backdrop) that could share a base component

Use `Grep` across `client/src` to confirm a pattern is actually repeated (cite at least 2 occurrences) before flagging it as duplication — don't flag single-instance code as "duplicated."

## Process

1. **Enumerate scope** — Glob the target files.
2. **Fan out analysis** — for larger scope (whole `client/src`), spawn a few parallel `Explore` or `general-purpose` agents (read-only), each owning a subset of files (e.g. split by views vs. components vs. composables), instructed to return concrete findings with file:line evidence. For a small, user-named scope, just read the files directly instead of spawning agents.
3. **Cross-reference for duplication** — grep for shared patterns (fetch/loading boilerplate, repeated class names, repeated inline logic) across the full `client/src`, not just the scoped files, since a duplicate's twin may live outside the requested scope.
4. **Synthesize and rank** by impact (perf: how much re-render/compute cost; reuse: how many duplicate sites) × confidence.
5. **Report** in this format, most-severe first:

```
## <short title>
**File(s):** path:line[, path:line...]
**Category:** reactivity | duplication
**Issue:** one sentence, concrete
**Why it matters:** perf cost or maintenance cost, specific not generic
**Suggested fix:** short code sketch or named target (e.g. "extract to composables/useAsyncResource.js")
```

Do not silently skip files due to size — if scope was truncated, say so and name what wasn't covered.

## Guardrails

- No edits. If asked to also fix, stop and confirm scope, then delegate `.vue` edits to `vue-expert` (one finding or a batch at a time) and re-verify by re-reading the changed files.
- Don't flag idiomatic Vue 3 patterns already used consistently across the codebase as "issues" just because a stricter alternative exists — only flag where there's a real, demonstrable cost (measurable re-render scope, actual duplicate maintenance burden).
- Keep findings concrete and file-anchored; no generic "consider using computed properties more" advice without pointing at a specific spot.
