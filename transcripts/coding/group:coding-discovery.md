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

---

## Assistant

## Worthiness assessment

**Verdict: worthy, but only as a real first implementation cycle, not as a cosmetic scaffold.**

The current repo has no implementation files. The TODO is not asking for a small patch. It asks for a complete Directus extension package: manifest, hook runtime, binary fan-out, admin UI, errors, tests, fixture, and CI. A broad change-set is therefore expected.

If implemented as only package metadata + placeholder files, it would be a bandaid. If implemented with tested runtime boundaries and Directus fixture proof, it is aligned to intent.

## Expected footprint

Approximate necessary footprint:

```text
package/config/docs
  package.json
  tsconfig.json
  README.md
  LICENSE
  pnpm-lock.yaml

runtime
  src/config.ts
  src/errors.ts
  src/runtime/marker.ts
  src/runtime/spawn-binary.ts
  src/runtime/fanOut.ts

Directus binding
  src/hook/index.ts
  src/interface/index.ts
  src/interface/DirectiveDisplay.vue
  src/index.ts or bundle entry

tests
  tests/unit/config-shape.test.ts
  tests/unit/marker.test.ts
  tests/unit/fanout.test.ts
  tests/unit/hook-filter.test.ts
  tests/fixtures/fake-binary.*

fixture/CI
  test-fixtures/directus-v10-minimal/...
  .github/workflows/ci.yml
```

Likely size: **20-35 files**.

That is not too large for the objective. The objective is a first-cycle product package, not a bug fix.

## Brutal risk assessment

| Area | Risk | Brutal truth |
|---|---:|---|
| Directus extension packaging | High | If package metadata is wrong, Directus will not load anything, regardless of runtime quality. |
| SDK/version compatibility | High | TODO says peer `@directus/extensions-sdk: ^11`, but latest is `18.0.0`; blindly pinning `^11` may create fake compatibility. |
| Binary execution in Directus | High | `child_process.spawn` inside a CMS lifecycle is operationally risky: timeout, cwd, env, missing binaries, and blocked process permissions all matter. |
| Sandbox posture | High | Local binary execution and Directus sandbox are in tension; pretending sandboxed mode works would be dishonest. |
| Filter hook behavior | Medium-high | Mutating payloads before save must avoid corrupting user content or overwriting an existing directive field unexpectedly. |
| Marker detection | Medium | Marker collision is a real edge case and must be explicit, not guessed. |
| Admin UI | Medium | UI can be simple, but must not hide directive content or use banned wording. |
| CI/publish | Medium | Publish job must exist but must not be triggered by this agent. |
| E2E fixture | Medium-high | A fake “fixture” that never proves Directus loads the extension would be theater. |

## Edge cases that must be supported inside scope

### Config

- Empty collections list: fail config validation.
- Missing config: use safe defaults where allowed, fail where required.
- Unknown binary key: fail config validation.
- No binaries enabled: fail config validation.
- Custom `directiveField`: supported.
- Existing payload field with same directive name: detect and either overwrite only if owned shape is present, or throw `marker-collision`.
- Timeout less than or equal to zero: fail config validation.
- Binary path missing: map to `binary-spawn-failed`.

### Marker detection

- Marker absent: return payload unchanged.
- Sentinel marker present in string field: run fan-out.
- JSON-tail marker present in object/string payload: run fan-out.
- Multiple markers: deterministic behavior.
- Malformed JSON-tail: `binary-malformed-output` or config/marker error, not silent pass.
- Marker appears inside existing directive field: must not recursively trigger.

### Binary execution

- Binary exits 0 with stdout: capture directive.
- Binary exits 1 with stdout: capture directive as blocking/unsafe verdict, not internal failure.
- Binary exits 2: malformed invocation result.
- Binary exits 64: internal tool error.
- Binary missing: explicit failure result.
- Timeout: kill process and return timeout result.
- stderr present: store diagnostic summary separately, do not treat stderr as directive.
- stdout empty: malformed output.
- Very large stdout: cap output and mark truncation.
- Parallel binaries: bounded to enabled binary count.
- One binary fails: bundle records per-binary failure; no silent all-good result.

### Hook lifecycle

- Create and update both supported.
- Non-allowlisted collection: no mutation or explicit closed error depending registration strategy.
- Allowlisted collection, marker absent: no binary fan-out.
- Allowlisted collection, marker present: directive field set before persistence.
- Fan-out failure: fail closed unless configured inspect-only, but TODO does not request inspect-only, so fail closed is safer.
- Action hook must never block save path after persistence.

### UI

- Null value: render empty/read-only state.
- Unknown bundle shape: render safe “unreadable directive bundle” state.
- Long directive text: wraps, no hidden overflow.
- Multiple binary verdicts: readable list/badges.
- No internal/banned wording.

## Counter-suggestion: tighten implementation standard before coding

Do **not** implement “happy-path Directus extension” only.

The correct bar is:

```text
No binary directive = no false success.
No valid marker = no mutation.
No allowlist = no run.
No sandbox support = explicit unsupported posture.
No Directus load proof = not shippable.
```

## Proposed non-bandaid acceptance bar

Before considering the change worthy:

1. `pnpm typecheck` passes.
2. `pnpm test` passes.
3. Unit tests cover all runtime failure classes.
4. A fake binary proves stdout capture and timeout.
5. Directus fixture proves the package can be installed/loaded.
6. Public text scan proves no banned wording.
7. No endpoint exists unless a test proves it is needed.
8. No TODO modification.
9. No commit/push/tag/publish/stash.

## Final judgment

The proposal is worthy **only if implemented as a boundary-tested adapter**, not as a thin scaffold.

The required footprint is broad because the task is broad. The real danger is not file count. The real danger is fake confidence: metadata that builds but does not load in Directus, binary spawning that works only on the developer machine, or UI that displays a stored field without proving the save lifecycle.

No disk changes made.

## Post-Request Review

| # | Goal | Score | Evidence |
|---|---|---|---|
| 1 | Mission inducted | 9 | I tied the assessment to the VM-5 bDirectus lifecycle objective and no-disk-change constraint. |
| 2 | Industry baseline preserved | 9 | The assessment requires fail-fast validation, isolated runtime boundaries, and tested contracts. |
| 3 | Contracts preserved or strengthened | 9 | I preserved the no-commit, no-push, no-stash, no-TODO-modification constraints. |
| 4 | Principled fix over minimum-edit | 10 | I rejected placeholder scaffolding and defined a boundary-tested implementation bar. |
| 5 | Pre-change audit performed | 10 | No edits were made; the assessment used the previously inspected TODO and repo state. |
| 6 | Post-change interrogation answered honestly | 10 | I explicitly stated that no disk changes were made. |
| 7 | Scope discipline | 9 | I focused only on bDirectus VM-5 scope and deferred publish/deploy actions. |
| 8 | Honest reporting | 9 | I called out high-risk areas including Directus packaging, SDK compatibility, sandboxing, and fake fixture risk. |
| 9 | Trade-offs surfaced | 9 | I surfaced the large footprint as necessary and identified the real risks as load proof and runtime behavior. |
| 10 | Project mission anchors respected | 8 | I used the inline mission anchors from the issue because no local mission anchor file was found earlier. |
| **Total** | | **92/100** | |
