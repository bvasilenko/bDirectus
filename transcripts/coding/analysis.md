# Session 019ec1c6-f0eb-77f2-92f7-27bf3f86ce5b

---

## Assistant

Running command: `find .. -maxdepth 3 \( -path '*/.github/docs/MISSION_ANCHORS.md' -o -name MISSION.md -o -name AGENTS.md -o -name CLAUDE.md -o -name .cursorrules \) -print && cat .github/docs/TODO.md`

---

## Assistant

Running command: `find . -maxdepth 3 -type f | sort | sed 's#^\./##' && printf '\n--- package ---\n' && [ -f package.json ] && cat package.json || true && printf '\n--- src files ---\n' && find src tests test-fixtures .github/workflows -type f 2>/dev/null -maxdepth 4 -print -exec sh -c 'echo "--- $1"; sed -n "1,220p" "$1"' sh {} \;`

---

## Assistant

Running command: `npm view @directus/extensions-sdk version peerDependencies --json && npm view directus version --json && npm view @booga/bdirectus version --json 2>/dev/null || true`

---

## Assistant

Running command: poll npm results

---

## Assistant

## Scope read

Literal order: analyze `.github/docs/TODO.md`, focus only VM-5 `[contribot-bsuite-bdirectus]`, treat `[~]` as skipped, do not modify workspace or TODO.

Immediate intent: produce an evidence-based implementation proposal for the unchecked bDirectus cycle without editing files.

Inducted goal: prepare the Directus adapter implementation so the next explicit coding request can proceed cleanly.

Mission anchor used: issue text supplied inline: bDirectus must wrap the b-suite binaries inside Directus v10/v11 authoring lifecycle with honest phase, public-safe voice, and no premature publishing.

## Evidence captured

- Workspace is effectively skeleton-only: no `package.json`, no `src/`, no `tests/`, no workflow files.
- `.github/docs/TODO.md` contains only VM-5 actionable unchecked items for this repository.
- `npm view @booga/bdirectus` returns `E404`, so the package is not yet published.
- Current registry facts:
  - `@directus/extensions-sdk` latest is `18.0.0`.
  - `directus` latest is `12.0.2`.
- Official Directus docs confirm:
  - Bundles group multiple extensions in one distributable package. Source: https://directus.com/docs/guides/extensions/bundles
  - Hook extensions use `filter` before an event and `action` after an event. Source: https://directus.com/docs/guides/extensions/api-extensions/hooks
  - Sandbox config belongs in `directus:extension`; disabling sandbox is honest if local process spawn is required. Source: https://directus.com/docs/guides/extensions/api-extensions/sandbox
  - Custom interfaces are item-page UI extensions. Source: https://directus.com/docs/guides/extensions/app-extensions/interfaces

## Proposal

Build bDirectus in this order:

```text
Package shell
  -> Runtime core
  -> Hook binding
  -> Admin interface
  -> Unit tests
  -> Minimal Directus fixture
  -> CI
```

### 1. Package shape first

Purpose: Directus must be able to discover the extension before any runtime behavior matters.

Implement:

- `package.json`
- `tsconfig.json`
- `README.md`
- `LICENSE`

Counter-suggestion: use `peerDependencies: { "@directus/extensions-sdk": ">=11 <19" }` instead of exactly `^11`.

Rationale: TODO says `^11`, but npm evidence shows the SDK is currently `18.0.0`. Exact `^11` risks excluding newer Directus-supported SDK versions while the TODO also claims v10/v11 host support.

### 2. Prefer bundle with hook + interface, no endpoint initially

Purpose: meet the authoring flow without adding unnecessary attack surface.

Implement bundle entries:

```json
[
  { "type": "hook", "name": "bdirectus-hook", "source": "src/hook/index.ts" },
  { "type": "interface", "name": "bsuite-directive", "source": "src/interface/index.ts" }
]
```

Counter-suggestion: do **not** implement `defineEndpoint` in v0.1 unless testing proves the admin UI requires it.

Rationale: TODO item 9.8 says no endpoint unless user-visible workflow requires one. Hook + interface is enough for save-time directive persistence and read-only display.

### 3. Runtime core before hook integration

Purpose: isolate risky child-process behavior from Directus lifecycle code.

Implement:

- `src/runtime/spawn-binary.ts`
- `src/runtime/fanOut.ts`
- `src/runtime/marker.ts`
- `src/errors.ts`

Key contract:

```text
payload with marker
  -> fanOut enabled binaries
  -> collect stdout
  -> store directive bundle
  -> never silently succeed on timeout/spawn/malformed output
```

Counter-suggestion: make every binary result explicit in the bundle, including failures.

Rationale: this directly closes 9.3 and avoids silent success.

### 4. Hook behavior

Purpose: mutate item payload before save, then log after save.

Implement:

- Filter on allowlisted `items.<collection>.create`
- Filter on allowlisted `items.<collection>.update`
- If marker absent: return payload unchanged
- If marker present: attach configured directive field
- Action hook: non-blocking telemetry only

Counter-suggestion: avoid querying Directus services inside the filter in v0.1 unless needed.

Rationale: filter hooks run before persistence and should stay small. The TODO only requires payload mutation, not database reads.

### 5. Admin interface

Purpose: make saved directive readable to the content author.

Implement:

- `defineInterface({ id: "bsuite-directive", ... })`
- Vue 3 read-only display component
- Render:
  - primary directive text
  - per-binary verdict/status
  - provenance pointer if present

Counter-suggestion: avoid the banned public word `"pill"` in UI labels. TODO 4.1 says “verdict pills”, but repo voice rules ban that word. Use “verdict badges”.

### 6. Tests

Purpose: prove the adapter works before any Directus fixture complexity.

Priority order:

1. `marker.test.ts`
2. `fanout.test.ts`
3. `config-shape.test.ts`
4. `hook-filter.test.ts`
5. Directus fixture

Counter-suggestion: unit-test with fake binaries first, then use fixture for load/save smoke.

Rationale: fake binaries prove stdout capture, timeout, and error mapping without depending on unpublished b-* binaries.

### 7. CI

Purpose: enforce public repo quality before publish.

Implement:

- self-hosted Linux runner
- Node 22
- pnpm 10
- install/typecheck/lint/test/build
- tag-gated npm publish

Counter-suggestion: do not add publish until the package can build and tests pass locally.

Rationale: TODO forbids push/tag/publish by contribot; publish job can exist but only supervisor triggers via tag.

## Evidence gap closure map

| Gap | Current evidence | Proposed closure |
|---|---|---|
| 9.1 Directus packaging | No package files exist | Bundle metadata + build + fixture load |
| 9.2 Save flow | No hook exists | Unit hook test + fixture create/update |
| 9.3 Binary execution | No runtime exists | Fake binary tests for stdout, timeout, spawn error |
| 9.4 Sandbox posture | Directus docs support sandbox config | Set sandbox disabled and document why |
| 9.5 Version support | npm latest SDK is 18.0.0, Directus latest 12.0.2 | Use broader peer range or verify exact SDK API before pinning |
| 9.6 Public voice | TODO contains banned UI wording in one item | Use “command-line tools” and “badges”, never banned terms |
| 9.7 Admin display | No UI exists | Read-only Vue component with responsive wrapping |
| 9.8 Endpoint exposure | No endpoint needed by workflow | Omit endpoint for v0.1 |

## Proof that this serves the purpose

The required user-facing flow is:

```text
Author saves Directus item
        |
filter hook detects marker
        |
local b-* binaries run
        |
stdout directives collected
        |
payload.bsuite_directive is set before save
        |
admin interface renders saved directive
```

The proposal implements exactly that flow, with tests at each boundary and no extra endpoint surface.

No workspace files were modified.

## Post-Request Review

| # | Goal | Score | Evidence |
|---|---|---|---|
| 1 | Mission inducted | 9 | I mapped the request to the supplied bDirectus mission and VM-5 TODO scope before proposing work. |
| 2 | Industry baseline preserved | 9 | The proposal separates package, runtime, hooks, UI, tests, and CI with fail-fast runtime errors. |
| 3 | Contracts preserved or strengthened | 9 | I preserved TODO constraints including no TODO edits, no workspace changes, no endpoint unless required, and public-safe voice. |
| 4 | Principled fix over minimum-edit | 9 | I recommended isolated runtime tests and fixture proof instead of a thin package-only scaffold. |
| 5 | Pre-change audit performed | 10 | No edits were made; I inspected TODO and repository file state first. |
| 6 | Post-change interrogation answered honestly | 10 | I reported that no files were changed and identified the repository as skeleton-only. |
| 7 | Scope discipline | 9 | I limited analysis to VM-5 items and deferred publish/tag/commit actions. |
| 8 | Honest reporting | 9 | I stated npm E404 for `@booga/bdirectus` and identified SDK/version uncertainty. |
| 9 | Trade-offs surfaced | 9 | I surfaced endpoint omission, SDK peer range, and UI wording as explicit counter-suggestions. |
| 10 | Project mission anchors respected | 8 | No local mission anchor file was found by the initial search, so I used the inline issue anchors supplied by the boss. |
| **Total** | | **91/100** | |
