# bDirectus 0.1.0-first-cycle TODO

Per the canonical spec at the brand-repo (`projects/b-suite/specs/bDirectus.md`) — platform-grade, axes A1-A8.

**Shape**: Directus v10/v11 extension (TypeScript). Wraps the 6 b-suite binaries (bground / banchor / bsmell / bratch / bwatch / bspector) inside the Directus admin UI. Directus extensions use `defineHook` (event-driven) + `defineEndpoint` (custom routes) + `defineModule` (admin UI). Sibling pattern: M7a bPayload + M7b bStrapi + M7c bSanity already shipped to npm.

## CRITICAL VOICE CONSTRAINT (read first; apply throughout)

This repository is PUBLIC at `https://github.com/bvasilenko/bDirectus`. Every committed byte (README + package.json description + src/ comments + tests/ comments + commit messages) MUST follow public-safe voice rules:

- Do NOT use the word "pill" or "pills" anywhere. Use neutral terms: "command-line tool", "binary", "package", "the b-* binaries", or specific binary name.
- Do NOT cite internal-only terms: `Q5L R-NN`, `projects/b-suite/`, `holding/`, `frameworks/`, doctrine identifiers (`B:NN`, `I1-I9`, `GOV-...`, `DECISION N`), internal milestone vocabulary, or internal decision codes.
- Do NOT include `Co-Authored-By:` attribution in commit messages.
- Do NOT include em-dashes (U+2014). ASCII only.
- Do NOT commit `transcripts/`, `.github/docs/TODO.md`, `contribot.config.*.json`, `contribot.state.*.json`, `node_modules/`, `dist/`, `.env*`.

Public voice sample: "Directus extension embedding the b-suite discipline runtime into the admin authoring UI."

## Cycle scope

Author the v0.1.0 Directus extension per the platform-grade spec. The extension:
1. Declares `directus:extension` manifest in `package.json` with type="bundle" + nested hook + endpoint + module entries OR three separate extensions.
2. Defines hooks via `defineHook(({ filter, action, init, schedule }) => ...)` that bind `items.<collection>.create` / `items.<collection>.update` filter events (filter hooks intercept + mutate; action hooks run after; the b-suite directive runs in the FILTER phase).
3. Spawns the 6 binary tools as child processes from the hook handler; captures stdout per stdout-primacy.
4. Renders directives inline in the Directus admin UI via a custom interface OR a panel + dashboard extension.
5. Persists the directive in a `bsuite_directive` JSON column on consented collections.

Land as `v0.1.0` tag + `@booga/bdirectus@0.1.0` published to npm. CI on self-hosted runner.

## 1. Package shape

- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 1.1 `package.json` declares `name = "@booga/bdirectus"`, `version = "0.1.0"`, `description = "Directus extension embedding the b-suite discipline runtime into the admin authoring UI."`, `license = "MIT"`, `repository = "github:bvasilenko/bDirectus"`.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 1.2 `package.json` declares `"directus:extension": { "type": "bundle", "path": "dist/index.js", "entries": [...], "host": "^10.0.0 || ^11.0.0", "sandbox": { "enabled": false } }` per Directus v10/v11 extension format.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 1.3 `package.json` declares `peerDependencies: { "@directus/extensions-sdk": "^11" }` for build-time SDK access.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 1.4 `tsconfig.json` extends a sensible TypeScript 5.x baseline; `strict: true`; `target: ES2022`; `moduleResolution: bundler`.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 1.5 `README.md` per the public-safe template: one-line description + install (`npx directus-extension install bdirectus` or `npm install -D @booga/bdirectus`) + usage + license.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 1.6 `LICENSE` file carries MIT text.

## 2. Hook entry (filter + action)

- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 2.1 `src/hook/index.ts` exports `defineHook(({ filter, action }, context) => ...)` registering filter hooks `items.<collection>.create` + `items.<collection>.update` for each collection in the allowlist.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 2.2 `BDirectusConfig` TypeScript interface: `collections: string[]`, `binaries: { bground?: boolean, banchor?: boolean, bsmell?: boolean, bratch?: boolean, bwatch?: boolean, bspector?: boolean }`, `directiveField?: string` (default `bsuite_directive`), `markerStyle?: 'sentinel' | 'json-tail'`, `binaryPaths?: Record<string, string>`, `binaryTimeoutMs?: number` (default 5000).
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 2.3 Filter hook signature: `(payload, meta, context) => payload` where the filter checks marker presence on payload + fan-out + sets `payload.bsuite_directive` with the directive bundle.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 2.4 Action hook signature: `(meta, context) => void` runs after the item is persisted; emits a non-blocking telemetry log line.

## 3. Runtime (fanOut + marker)

- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 3.1 `src/runtime/fanOut.ts` spawns enabled b-* binaries via `child_process.spawn`; passes payload body via stdin; collects stdout per stdout-primacy; respects per-binary timeout; concurrency cap = number of enabled binaries.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 3.2 `src/runtime/marker.ts` exports marker detection (sentinel + json-tail variants).
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 3.3 `src/runtime/spawn-binary.ts` wraps `child_process.spawn` with stdout capture + timeout + error mapping.

## 4. Admin extension (interface or panel)

- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 4.1 `src/interface/index.ts` exports `defineInterface({ id: 'bsuite-directive', name: 'b-suite directive', component: DirectiveDisplay })` Vue component (Directus admin is Vue 3) that reads the `bsuite_directive` JSON field and renders directive markdown + per-binary verdict pills + corpus-provenance pointer.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 4.2 `src/interface/DirectiveDisplay.vue` is the Vue 3 SFC component; reads props.value (the JSON directive bundle); renders read-only.

## 5. Closed exception classes

- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 5.1 `src/errors.ts` declares closed union `type BDirectusErrorCode = 'binary-spawn-failed' | 'binary-timeout' | 'binary-malformed-output' | 'marker-collision' | 'directus-version-mismatch' | 'directive-injection-failed' | 'config-malformed' | 'collection-not-allowlisted' | 'interface-mount-failed' | 'fanout-budget-exceeded' | 'sandbox-bypass-required'`.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 5.2 Each error thrown wraps a `BDirectusError extends Error` with `code: BDirectusErrorCode` + `cause?: unknown`.

## 6. E2E fixture + tests

- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 6.1 `test-fixtures/directus-v10-minimal/` contains: minimal Directus configuration; a sample collection schema with the `bsuite_directive` JSON field; docker-compose for local Directus + sqlite database.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 6.2 `tests/unit/config-shape.test.ts` covers `BDirectusConfig` parsing.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 6.3 `tests/unit/hook-filter.test.ts` covers the filter hook with mocked Directus context: marker-present + marker-absent + fanOut-error.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 6.4 `tests/unit/fanout.test.ts` covers spawn + stdout + timeout + concurrency cap.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 6.5 `tests/unit/marker.test.ts` covers marker detection on payload bodies.

## 7. CI

- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 7.1 `.github/workflows/ci.yml` on push (main + tags `v[0-9]+.[0-9]+.[0-9]+`): node 22 + pnpm 10; `pnpm install --frozen-lockfile`; `pnpm typecheck`; `pnpm lint`; `pnpm test`; `pnpm build`. Use `runs-on: [self-hosted, Linux, X64]` (a self-hosted runner is already registered).
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 7.2 Tag-gated publish job: on push tag matching `v*`, run CI then `npm publish --access=public` using `NPM_TOKEN` secret.

## 8. Ship

- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 8.1 Commit changes in tight modular slices: 1 commit per top-level item above. No `Co-Authored-By` in any commit.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 8.2 No git push or tag operation by contribot; supervisor performs push + tag + npm publish per AFTER-scope.

## Out of scope

- bsuite-core v0.2.x runtime fetching of corpus.
- OpenEvolve corpus production.
- Obfuscation.
- bPayload / bStrapi / bSanity cycles.
- Hub repo.

## 9. Preserved assessment gaps

- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 9.1 Directus extension packaging works for an installed Directus project: the published package is installable and Directus loads the hook and admin display without manual source edits.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 9.2 Directus save flow works from the author's perspective: creating or updating an allowlisted item with discipline markers stores a readable directive bundle on the configured directive field before the item is saved.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 9.3 Local binary execution works reliably from Directus: enabled b-suite binaries can run, return stdout directives, time out safely, and surface failures without silent success.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P0] 9.4 Sandbox posture is honest and functional: the extension either runs with the permissions needed for local binaries or clearly refuses unsupported sandboxed operation.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P1] 9.5 Directus version compatibility is proven for the declared host range, including the SDK/package metadata needed by supported Directus versions.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P1] 9.6 Public authoring UI wording is compliant: labels, README text, package metadata, comments, and test names avoid internal-only vocabulary and banned wording.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P1] 9.7 The admin display works from the user's perspective on common desktop and laptop viewport widths without hiding the directive content.
- [ ] !ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS! [P2] 9.8 The extension does not expose an endpoint unless a user-visible Directus workflow requires one.
