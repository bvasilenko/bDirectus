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

---

## Assistant

Running command: `cat > package.json <<'EOF'\n{\"scripts\":{\"x\":\"echo hi\"}}\nEOF\nrm package.json`

---

## Assistant

Running command: `node -v && pnpm -v && npm -v`

---

## Assistant

Running command: create implementation files for package, runtime, Directus binding, UI, tests, fixture, and CI.

---

## Assistant

Running command: `pnpm install`

---

## Assistant

Running command: poll install

---

## Assistant

Running command: poll install

---

## Assistant

Running command: poll install

---

## Assistant

Running command: poll install

---

## Assistant

Running command: `pnpm typecheck`

---

## Assistant

Running command: poll typecheck

---

## Assistant

Running command: `node -e "const p=require('./package.json'); p.devDependencies.typescript='5.8.3'; require('fs').writeFileSync('package.json', JSON.stringify(p,null,2)+'\\n')" && pnpm install`

---

## Assistant

Running command: poll install

---

## Assistant

Running command: `pnpm typecheck`

---

## Assistant

Running command: poll typecheck

---

## Assistant

Running command: `pnpm exec tsc --noEmit -p tsconfig.json`

---

## Assistant

Running command: poll tsc

---

## Assistant

Running command: `cat > src/types/vue-shim.d.ts <<'EOF'\ndeclare module '*.vue' {\n  import type { DefineComponent } from 'vue';\n\n  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;\n  export default component;\n}\nEOF\npnpm typecheck`

---

## Assistant

Running command: poll typecheck

---

## Assistant

Running command: `pnpm exec tsc --noEmit -p tsconfig.json`

---

## Assistant

Running command: poll tsc

---

## Assistant

Running command: `grep -R \"export.*defineHook\\|declare.*defineHook\\|function defineHook\\|defineInterface\" node_modules/@directus/extensions-sdk -n | head -40`

---

## Assistant

Running command: `grep -R \"defineHook\\|defineInterface\" node_modules/@directus/extensions/dist -n | head -60 && sed -n '1,120p' node_modules/@directus/extensions-sdk/templates/interface/typescript/source/index.ts && sed -n '1,80p' node_modules/@directus/extensions-sdk/templates/hook/typescript/source/index.ts`

---

## Assistant

Running command: `find node_modules -path '*@directus*extensions*' -maxdepth 4 -type f -name '*.d.ts' | head -20 && grep -R \"type Hook\" node_modules/.pnpm -n --include='*.d.ts' | head -20`

---

## Assistant

Running command: `find node_modules/.pnpm -path '*/@directus/extensions*/dist/*.d.ts' -print | head -20`

---

## Assistant

Running command: `find node_modules/.pnpm -path '*/@directus+extensions@*/node_modules/@directus/extensions*' -maxdepth 5 -type f -name '*.d.ts' | head -20`

---

## Assistant

Running command: `sed -n '1,220p' node_modules/.pnpm/@directus+extensions@4.0.0_knex@3.1.0_vue@3.5.24_typescript@5.8.3_/node_modules/@directus/extensions/api.d.ts`

---

## Assistant

Running command: `grep -R \"export declare function defineHook\\|declare function defineHook\\|defineHook\" node_modules/.pnpm/@directus+extensions@4.0.0_knex@3.1.0_vue@3.5.24_typescript@5.8.3_/node_modules/@directus/extensions -n | head -50`

---

## Assistant

Running command: `sed -n '330,430p' node_modules/.pnpm/@directus+extensions@4.0.0_knex@3.1.0_vue@3.5.24_typescript@5.8.3_/node_modules/@directus/extensions/dist/index.d.ts`

---

## Assistant

Running command: `grep -n \"interface HookConfig\\|type HookConfig\\|interface InterfaceConfig\" -n node_modules/.pnpm/@directus+extensions@4.0.0_knex@3.1.0_vue@3.5.24_typescript@5.8.3_/node_modules/@directus/extensions/dist/index.d.ts | head -20`

---

## Assistant

Running command: `grep -n \"HookConfig\" node_modules/.pnpm/@directus+extensions@4.0.0_knex@3.1.0_vue@3.5.24_typescript@5.8.3_/node_modules/@directus/extensions/dist/index.d.ts | head -20 && sed -n '1,120p' node_modules/.pnpm/@directus+extensions@4.0.0_knex@3.1.0_vue@3.5.24_typescript@5.8.3_/node_modules/@directus/extensions/dist/index.d.ts`

---

## Assistant

Running command: `grep -R \"export interface HookConfig\\|type HookConfig\" node_modules/.pnpm/@directus+types@*/node_modules/@directus/types -n | head -20 && grep -R \"export interface InterfaceConfig\\|type InterfaceConfig\" node_modules/.pnpm/@directus+types@*/node_modules/@directus/types -n | head -20`

---

## Assistant

Running command: `grep -n \"type InterfaceConfig\\|interface InterfaceConfig\" node_modules/.pnpm/@directus+types@16.0.0_knex@3.1.0_vue@3.5.24_typescript@5.8.3_/node_modules/@directus/types/dist/index.d.ts | head -10 && sed -n '1880,1985p' node_modules/.pnpm/@directus+types@16.0.0_knex@3.1.0_vue@3.5.24_typescript@5.8.3_/node_modules/@directus/types/dist/index.d.ts`

---

## Assistant

Running command: `python3 - <<'PY'\nfrom pathlib import Path\np=Path('src/hook/index.ts')\ns=p.read_text()\ns=s.replace(\"export default defineHook(({ filter, action }, context: HookContext) => {\", \"export default defineHook(({ filter, action }, context) => {\")\np.write_text(s)\nPY\npnpm exec tsc --noEmit -p tsconfig.json`

---

## Assistant

Running command: poll tsc

---

## Assistant

Running command: `python3 - <<'PY'\nfrom pathlib import Path\np=Path('src/interface/index.ts')\ns=p.read_text()\ns=s.replace(\"  component: DirectiveDisplay,\", \"  component: DirectiveDisplay as never,\")\np.write_text(s)\nPY\npnpm exec tsc --noEmit -p tsconfig.json`

---

## Assistant

Running command: poll tsc

---

## Assistant

Running command: `pnpm typecheck`

---

## Assistant

Running command: poll typecheck

---

## Assistant

Running command: `pnpm lint`

---

## Assistant

Running command: `pnpm add -D eslint-plugin-vue vue-eslint-parser`

---

## Assistant

Running command: poll install

---

## Assistant

Running command: update eslint config and lint

---

## Assistant

Running command: reformat Vue attributes then lint

---

## Assistant

Running command: `pnpm test` 


---

## Assistant

Running command: `pnpm build` 


---

## Assistant

Running command: poll build

---

## Assistant

Running command: `pnpm exec directus-extension validate` 


---

## Assistant

Running command: `cat package.json && sed -n '1,160p' node_modules/@directus/extensions-sdk/dist/cli/commands/validators/check-directus-config.js && sed -n '1,160p' node_modules/@directus/extensions-sdk/dist/cli/commands/build.js` 


---

## Assistant

Running command: `npm view @directus/extensions-sdk@11 version peerDependencies --json` 


---

## Assistant

Running command: poll npm view

---

## Assistant

Running command: `node -e "const fs=require('fs');const p=require('./package.json'); p.peerDependencies={'@directus/extensions-sdk':'^11'}; p.devDependencies['@directus/extensions-sdk']='11.0.10'; fs.writeFileSync('package.json', JSON.stringify(p,null,2)+'\\n')" && pnpm install` 


---

## Assistant

Running command: poll install 


---

## Assistant

Running command: poll install 


---

## Assistant

Running command: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` 


---

## Assistant

Running command: poll checks 


---

## Assistant

Running command: `grep -n \"type: z.ZodLiteral<\\\"bundle\\\"\" -A40 node_modules/@directus/extensions/dist/index.d.ts | head -80 && sed -n '1,80p' node_modules/@directus/extensions-sdk/dist/cli/commands/build.js` 


---

## Assistant

Running command: `find node_modules/.pnpm -path '*/@directus+extensions@*/node_modules/@directus/extensions/dist/index.d.ts' -print | head -5 | xargs -r grep -n \"type: z.ZodLiteral<\\\"bundle\\\"\" -A45` 


---

## Assistant

Running command: `node - <<'NODE'\nconst fs=require('fs');\nconst p=require('./package.json');\np['directus:extension'].path={app:'dist/app.js',api:'dist/api.js'};\nfs.writeFileSync('package.json', JSON.stringify(p,null,2)+'\\n');\nNODE\npnpm build` 


---

## Assistant

Running command: poll build 


---

## Assistant

Running command: `pnpm typecheck && pnpm lint && pnpm test && pnpm build && grep -RIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude='TODO.md' -E 'pill|pills|Q5L|projects/b-suite|holding/|frameworks/|B:[0-9]|I[1-9]|GOV-|DECISION|Co-Authored-By|—' README.md package.json src tests test-fixtures .github 2>/dev/null || true` 


---

## Assistant

Running command: poll validation 


---

## Assistant

Running command: `git status --short && find . -maxdepth 3 -type f | sort | sed 's#^./##' | grep -v '^node_modules/' | grep -v '^.git/' | head -200` 


---

## Assistant

Running command: `find . -maxdepth 4 -type f | sort | sed 's#^./##' | grep -v '^node_modules/' | head -240` 


---

## Assistant

Running command: create `.gitignore` for generated/local files and rerun validation. 


---

## Assistant

Running command: poll validation 


---

## Assistant

Implemented bDirectus v0.1.0 first-cycle package without modifying `.github/docs/TODO.md`, and without commit/push/deploy/stash.

## What changed

- Added package/config/docs:
  - `package.json`
  - `pnpm-lock.yaml`
  - `tsconfig.json`
  - `vite.config.ts`
  - `eslint.config.js`
  - `.gitignore`
  - `README.md`
  - `LICENSE`

- Added source architecture:
  - `src/config.ts`
  - `src/errors.ts`
  - `src/types/directive.ts`
  - `src/runtime/marker.ts`
  - `src/runtime/spawn-binary.ts`
  - `src/runtime/fanOut.ts`
  - `src/hook/process-payload.ts`
  - `src/hook/index.ts`
  - `src/interface/index.ts`
  - `src/interface/DirectiveDisplay.vue`
  - `src/index.ts`
  - `src/types/vue-shim.d.ts`

- Added tests and fixture:
  - `tests/unit/config-shape.test.ts`
  - `tests/unit/marker.test.ts`
  - `tests/unit/fanout.test.ts`
  - `tests/unit/hook-filter.test.ts`
  - fake binary fixtures
  - `test-fixtures/directus-v10-minimal/...`

- Added CI:
  - `.github/workflows/ci.yml`

## Important evidence-based deviation

TODO requested bundle path as `"dist/index.js"`, but the Directus SDK build validator requires split bundle output:

```json
"path": {
  "app": "dist/app.js",
  "api": "dist/api.js"
}
```

Using the TODO path made `directus-extension build` fail. The split path builds cleanly and matches the SDK bundle schema.

Official docs used:
- Directus bundles: https://directus.com/docs/guides/extensions/bundles
- Directus hooks: https://directus.com/docs/guides/extensions/api-extensions/hooks
- Directus interfaces: https://directus.com/docs/guides/extensions/app-extensions/interfaces
- Directus sandbox: https://directus.com/docs/guides/extensions/api-extensions/sandbox

## Architecture

```text
Directus hook
  -> processPayload
    -> detectMarker
    -> fanOut
      -> spawnBinary
    -> directive bundle

Directus interface
  -> DirectiveDisplay.vue
    -> read-only directive rendering
```

Purpose: keep Directus lifecycle binding, marker parsing, process execution, error classes, and UI display separately testable.

## Validation

All required checks are clean:

```text
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Test output:

```text
Test Files  4 passed (4)
Tests       16 passed (16)
```

Build output:

```text
Building Directus extension...
Done
```

Public voice scan found no banned wording in implemented public/source files.

## Brutal truth / remaining limits

- This is a strong first-cycle implementation, not a published package.
- It proves unit behavior and SDK build, but not a live Directus save through Docker yet.
- `dist/` is generated by build and ignored by `.gitignore`; do not commit it.
- This directory is not currently a git repository, so I could not stage or show git status.

### Iteration 1 — KPI Feedback

This iteration advances the bDirectus adapter mission because it turns the empty skeleton into a buildable, tested Directus bundle with hook, runtime, UI, fixture, and CI surfaces.

| Value | KPI axis | Target | This iteration | Score | Next-iteration response |
|---|---|---:|---|---:|---|
| VM-5 scope only | Non-VM-5 files changed | 0 unrelated | Only bDirectus package/source/test/CI files added | 9 | hold |
| No bandaid | Runtime boundary coverage | config + marker + fanOut + hook covered | 16 unit tests cover core boundaries | 9 | hold |
| Directus support | SDK build result | pass | `pnpm build` passed | 9 | hold |
| Public-safe voice | banned-term hits | 0 | grep scan produced no hits | 9 | hold |
| TODO safety | TODO edits | 0 | `.github/docs/TODO.md` not modified | 10 | hold |

## Post-Request Review

| # | Goal | Score | Evidence |
|---|---|---|---|
| 1 | Mission inducted | 9 | I implemented only VM-5 bDirectus TODO scope and preserved the no-TODO-edit rule. |
| 2 | Industry baseline preserved | 9 | The code is split by config, errors, runtime, hook, UI, and tests with SRP boundaries. |
| 3 | Contracts preserved or strengthened | 9 | Runtime failures map to closed error/result shapes instead of silent success. |
| 4 | Principled fix over minimum-edit | 9 | I changed the bundle path to the SDK-required split app/api shape after build evidence proved the TODO literal path failed. |
| 5 | Pre-change audit performed | 9 | I inspected TODO, repo state, Directus docs, SDK schema, and build behavior before finalizing. |
| 6 | Post-change interrogation answered honestly | 9 | I listed changed files, clean checks, and the remaining live-Directus gap. |
| 7 | Scope discipline | 9 | I did not commit, push, deploy, stash, publish, or modify `.github/docs/TODO.md`. |
| 8 | Honest reporting | 9 | I reported the package path deviation and the fact that this directory is not a git repository. |
| 9 | Trade-offs surfaced | 9 | I surfaced the Directus split path requirement and Docker/live-save proof as remaining validation. |
| 10 | Project mission anchors respected | 8 | I followed the inline bDirectus mission anchors; no local mission anchor file was present. |
| **Total** | | **89/100** | |

---

## Assistant

Running command: `pnpm test` 


---

## Assistant

Running command: add generalized test helpers and edge-case coverage 


---

## Assistant

Running command: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` 


---

## Assistant

Running command: poll validation 


---

## Assistant

Running command: fix test helper override typing and rerun 


---

## Assistant

Running command: poll validation 


---

## Assistant

Running command: `grep -RIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude='TODO.md' -E 'pill|pills|Q5L|projects/b-suite|holding/|frameworks/|B:[0-9]|I[1-9]|GOV-|DECISION|Co-Authored-By|—' README.md package.json src tests test-fixtures .github 2>/dev/null || true` 


---

## Assistant

Implemented generalized edge-case test coverage and deduplicated repeated test setup.

## Test coverage expanded

Before:

```text
4 files, 16 tests
```

After:

```text
4 files, 34 tests
```

Added generalized coverage for:

- config parsing:
  - duplicate collection cleanup
  - explicit binary selection
  - custom binary paths
  - custom directive field
  - `json-tail` marker style
  - empty binary selection
  - invalid marker style
  - invalid timeout

- marker detection:
  - nested objects
  - arrays
  - multiple marker paths
  - primitive payloads
  - configured directive field exclusion
  - object `json-tail`
  - string `json-tail`
  - malformed `json-tail`

- binary spawning:
  - stdout directive capture
  - exit code `1` with valid stdout remains a directive result
  - stderr is diagnostic only
  - missing binary maps to spawn failure
  - empty stdout maps to malformed output
  - timeout kill behavior
  - output truncation

- fan-out:
  - multiple enabled binaries
  - mixed success/failure results
  - no enabled binaries rejected

- hook payload behavior:
  - marker absent returns same object identity
  - non-object payload unchanged
  - directive insertion
  - custom directive field and marker style
  - non-allowlisted collection rejected
  - foreign directive collision rejected
  - owned directive bundle replacement
  - failed binary result stored in bundle

## Deduplication added

Added shared test helper:

```text
tests/helpers/config.ts
```

Purpose: centralized fake binary paths and reusable `createConfig()` factory so tests are behavior-focused, not copy-pasted setup.

## Validation

Clean:

```text
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Current test result:

```text
Test Files  4 passed (4)
Tests       34 passed (34)
```

Public voice scan returned no banned wording hits in implemented files.

No commit, push, deploy, stash, or TODO modification performed.

### Iteration 2 — KPI Feedback

This iteration advances the bDirectus adapter mission because it converts narrow happy-path tests into generalized behavioral coverage across config, marker parsing, process execution, fan-out, and hook mutation.

| Value | KPI axis | Target | This iteration | Score | Next-iteration response |
|---|---|---:|---|---:|---|
| Long-term stability | Edge classes covered | >= 25 tests | 34 tests across 5 behavior groups | 10 | hold |
| Test generalization | Bug-specific assertions | 0 | Tests assert reusable behavior contracts, not one-off bug symptoms | 9 | hold |
| Deduplication | Shared setup factory | yes | Added `tests/helpers/config.ts` | 10 | hold |
| Clean validation | Required commands pass | 4/4 | typecheck, lint, test, build passed | 10 | hold |
| Scope safety | TODO edits / git operations | 0 | No TODO edit and no commit/push/deploy/stash | 10 | hold |

## Post-Request Review

| # | Goal | Score | Evidence |
|---|---|---|---|
| 1 | Mission inducted | 9 | I focused only on strengthening bDirectus tests for the implemented VM-5 scope. |
| 2 | Industry baseline preserved | 10 | Tests now cover stable behavior boundaries with shared setup and no duplicated config blocks. |
| 3 | Contracts preserved or strengthened | 10 | Coverage now verifies failure handling, marker exclusions, custom config, and no silent binary success. |
| 4 | Principled fix over minimum-edit | 10 | I added generalized edge-case tests instead of one narrow regression assertion. |
| 5 | Pre-change audit performed | 9 | I ran the existing test suite first and expanded only the existing unit coverage structure. |
| 6 | Post-change interrogation answered honestly | 9 | I reported exact test count growth and remaining no-git-operation status. |
| 7 | Scope discipline | 10 | I did not modify `.github/docs/TODO.md` or perform git/publish operations. |
| 8 | Honest reporting | 10 | I listed exactly which behavior classes were added and confirmed validation commands. |
| 9 | Trade-offs surfaced | 8 | I kept the work at unit/generalized coverage and did not claim live Docker Directus E2E proof. |
| 10 | Project mission anchors respected | 8 | The tests reinforce the Directus adapter mission and public-safe constraints from the supplied tracker. |
| **Total** | | **93/100** | |

---

## Assistant

Running command: `grep -RIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist -E 'console\\.|debugger|TODO|FIXME|XXX|DEBUG|console.log|\\.only\\(|skip\\(' src tests README.md package.json test-fixtures .github 2>/dev/null || true && pnpm typecheck && pnpm lint && pnpm test && pnpm build` 


---

## Assistant

Running command: poll validation 


---

## Assistant

Running command: `grep -RIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude='TODO.md' -E 'console\\.|debugger|TODO|FIXME|XXX|DEBUG|console.log|\\.only\\(|skip\\(' src tests README.md package.json test-fixtures .github 2>/dev/null || true` 


---

## Assistant

Quality/readability cleanup audit completed.

## Result

No excessive debugging leftovers found in implemented source/tests.

Checked for:

```text
console.*
debugger
TODO / FIXME / XXX
DEBUG
test.only
test.skip
```

Implemented files returned no hits after excluding `.github/docs/TODO.md`, `node_modules`, `.git`, and `dist`.

## Logging posture

Kept only the intentional Directus lifecycle telemetry:

```text
context.logger?.info('bdirectus item lifecycle observed', ...)
```

Rationale: this is not debug residue. It is a non-blocking action-hook telemetry line aligned with the TODO requirement for post-persist logging.

## Validation

Clean:

```text
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Current tests:

```text
Test Files  4 passed (4)
Tests       34 passed (34)
```

No commit, push, deploy, stash, or TODO modification performed.

### Iteration 3 — KPI Feedback

This iteration advances the bDirectus adapter mission because it verifies the implementation has no temporary debugging residue while preserving the necessary runtime behavior and tests.

| Value | KPI axis | Target | This iteration | Score | Next-iteration response |
|---|---|---:|---|---:|---|
| No debug leftovers | debug residue hits | 0 | 0 hits in implemented files | 10 | hold |
| Logging discipline | intentional logs only | yes | Only Directus telemetry logger remains | 10 | hold |
| Code readability | WHAT comments | 0 | No source comments added | 10 | hold |
| Validation | required commands pass | 4/4 | typecheck, lint, test, build passed | 10 | hold |
| Scope safety | TODO/git operations | 0 | No TODO edit and no git operation | 10 | hold |

## Post-Request Review

| # | Goal | Score | Evidence |
|---|---|---|---|
| 1 | Mission inducted | 9 | I treated the request as a cleanup/readability audit for the bDirectus implementation. |
| 2 | Industry baseline preserved | 10 | The source remains lint-clean, test-clean, and free of debug residue. |
| 3 | Contracts preserved or strengthened | 10 | No behavior was weakened; all 34 tests still pass. |
| 4 | Principled fix over minimum-edit | 9 | I audited before changing and found no cleanup edit was needed. |
| 5 | Pre-change audit performed | 10 | I searched implemented files for debug/test-only/comment leftovers before reporting. |
| 6 | Post-change interrogation answered honestly | 10 | I stated that no cleanup edits were necessary and validation remained clean. |
| 7 | Scope discipline | 10 | I did not modify `.github/docs/TODO.md` or perform git/publish operations. |
| 8 | Honest reporting | 10 | I identified the one retained logger and explained why it is intentional. |
| 9 | Trade-offs surfaced | 9 | I preserved the telemetry log instead of deleting useful observability for cosmetic reasons. |
| 10 | Project mission anchors respected | 8 | The implementation remains aligned to the bDirectus Directus lifecycle mission from the supplied tracker. |
| **Total** | | **95/100** | |
