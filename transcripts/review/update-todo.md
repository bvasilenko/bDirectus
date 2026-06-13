# Session 019ec1c4-a4b5-7e41-9f17-8e49fdbdcfbb

---

## Assistant

Evidence captured:
- Workspace has only `.github/docs/TODO.md` and `contribot.state.review.json`.
- No source code exists yet.
- No local mission-anchor files found; I used the inline Issue #26 anchors.
- No files changed.

Sources checked:
- Directus hook docs: filter hooks mutate payload before event; action hooks run after event. https://directus.com/docs/guides/extensions/api-extensions/hooks
- Directus bundle docs: bundle `entries` live under `src` and are declared in `directus:extension.entries`. https://directus.com/docs/guides/extensions/bundles
- Directus sandbox docs: sandboxed extensions have restricted runtime and must request scopes; they do not have normal Node capability. https://directus.com/docs/guides/extensions/api-extensions/sandbox
- Directus extension install docs: npm extension install usually implies custom Directus image for self-hosted projects. https://directus.com/docs/self-hosting/including-extensions
- Node child process docs: `child_process.spawn()` is the correct async subprocess primitive. https://nodejs.org/api/child_process.html
- Runtime registry check: `@directus/extensions-sdk` latest is `18.0.0`; `directus` latest is `12.0.2`, Node engine `>=22`.

## Assessment

The TODO is directionally right, but it has 4 material spec gaps before implementation.

```
Directus item save
      |
      v
filter hook: items.<collection>.create/update
      |
      v
detect marker -> spawn enabled b-* binaries -> capture stdout
      |
      v
payload.bsuite_directive = directive bundle
      |
      v
Directus persists item
      |
      v
admin interface renders read-only directive field
```

## Worthiness

Worthy, but not small.

Expected footprint if done properly:
- ~18-25 files.
- Package, TypeScript config, build config, hook, runtime, errors, admin interface, tests, fixture, CI, README, license.
- This breadth is justified because the objective is a real Directus bundle, not a single hook snippet.

Brutal truth:
- A minimal hook-only implementation would be a bandaid.
- The TODO’s current shape mixes product contract, Directus packaging, runtime spawning, UI rendering, and release tasks. That is broad, but scope-accurate.
- The highest risk is not code size. The highest risk is wrong Directus extension metadata or sandbox assumptions.

## Evidence gaps closed

### 1. Hook phase is correct

TODO says directive execution belongs in filter phase.

Evidence: Directus filter hooks run before the event and can modify payload; action hooks run after and are for follow-up work.

Judgement: keep this. It serves the purpose because the directive must be persisted into the item before save.

### 2. Bundle shape needs correction

TODO says bundle with `path: "dist/index.js"` plus nested entries.

Evidence: Directus bundle docs describe `directus:extension.entries`, each with `type`, `name`, and `source` under `src`.

Counter-suggestion:
- Use bundle entries as the source of truth.
- Do not depend on a single top-level `dist/index.js` assumption unless confirmed by generated Directus extension output.

### 3. Sandbox is a hard product decision

TODO says sandbox disabled false: `"sandbox": { "enabled": false }`.

Issue body also says manifest declares `process.spawn` + filesystem requested scopes.

Evidence: Directus sandbox is restricted; Node subprocess spawning is normal Node API, not a sandbox-safe operation.

Counter-suggestion:
- For v0.1.0, keep sandbox disabled and document why: binary execution requires Node process access.
- Do not pretend scope declarations make spawn safe inside sandbox unless a Directus runtime probe proves it.

### 4. Dependency version is stale-risk

TODO requires `@directus/extensions-sdk: "^11"`.

Evidence: npm registry shows latest SDK is `18.0.0`; Directus latest is `12.0.2`.

Counter-suggestion:
- If target is only Directus v10/v11, keep host as `^10 || ^11`, but validate SDK version against generated extension output.
- If target includes current Directus, update host support decision before coding. Current public Directus is v12, so v10/v11-only support is already behind latest.

## My proposal

Implement only after tightening TODO into these build contracts:

1. Scaffold a Directus bundle with:
   - hook entry
   - interface entry
   - optional endpoint only if needed later

2. Use filter hook as the blocking/mutating path:
   - allowlisted collections only
   - marker present only
   - spawn enabled binaries
   - timeout per binary
   - stdout captured as primary directive
   - inject `bsuite_directive`

3. Use action hook only for telemetry:
   - no mutation
   - no blocking business logic

4. Keep sandbox disabled for v0.1.0:
   - because spawning local binaries is the core requirement
   - no false sandbox-safety claim

5. Add tests around contracts, not internals:
   - marker absent means no spawn
   - marker present means directive injected
   - timeout maps to closed error
   - malformed output maps to closed error
   - non-allowlisted collection is refused

6. Add one Directus fixture:
   - proves package shape loads
   - proves create/update filter can mutate payload
   - proves admin field can display stored JSON

## Counter-suggestions

- Rename visible UI label from `b-suite directive` to `b-suite Directive` or `Directive` for public polish.
- Avoid “verdict pills” in code/comments because TODO bans “pill/pills”; use “verdict badges”.
- Do not include an endpoint in v0.1.0 unless the admin interface needs it. Hook + interface is enough for the stated purpose.
- Treat `@directus/extensions-sdk` as a dev/build dependency unless runtime evidence proves a peer dependency is required.
- Add a compatibility probe before implementation: scaffold with `create-directus-extension`, inspect generated `package.json`, then mirror that shape.

## Proof this serves the purpose

The purpose is to embed b-suite directives into Directus authoring.

This proposal serves it because:
- filter hook runs before persistence, so directives can be stored on the item;
- spawned binaries preserve stdout-primacy;
- admin interface displays the stored directive to authors;
- closed errors prevent silent failure;
- tests cover every behavior edge inside v0.1.0 scope.

## No-change confirmation

No workspace files were modified. `.github/docs/TODO.md` was read only.

## Post-Request Review

| # | Goal | Score | Evidence |
|---|---|---:|---|
| 1 | Mission inducted | 8 | Used Issue #26 inline mission because no local mission-anchor files exist. |
| 2 | Industry baseline preserved | 8 | Recommendation favors contract tests, fail-fast errors, and no false sandbox claim. |
| 3 | Contracts preserved or strengthened | 8 | No files changed; proposal preserves stdout-primacy and Directus filter mutation contract. |
| 4 | Principled fix over minimum-edit | 9 | Rejected hook-only bandaid and identified needed package/UI/runtime/test footprint. |
| 5 | Pre-change audit performed | 10 | No edits were made; TODO and workspace tree were read first. |
| 6 | Post-change interrogation answered honestly | 9 | Report states no source exists and no workspace changes occurred. |
| 7 | Scope discipline | 9 | Stayed on TODO assessment and did not implement. |
| 8 | Honest reporting | 9 | Surfaced stale SDK/version and sandbox risks directly. |
| 9 | Trade-offs surfaced | 8 | Named sandbox-disabled and v10/v11-vs-current-Directus decisions. |
| 10 | Project mission anchors respected | 7 | Local mission anchors were absent; inline issue anchors were used instead. |
| **Total** | | **85/100** | |

### Remediation
- Project mission anchors respected: SURFACED TO BOSS: repo lacks `.github/docs/MISSION_ANCHORS.md` / `MISSION.md`; add one before implementation if this repo needs standalone mission context.

---

## Assistant

Updated `.github/docs/TODO.md`.

- Replaced all remaining unchecked item prefixes with `!ONLY FOR VM-5 [contribot-bsuite-bdirectus]: FOCUS ON THIS!`.
- Preserved all existing checkbox text, numbering, nesting, and code snippets.
- Added preserved assessment-gap TODOs under section 9.
- Did not mark any item `- [~]`.
- Did not commit, push, deploy, or stash.

## Post-Request Review

| # | Goal | Score | Evidence |
|---|---|---:|---|
| 1 | Mission inducted | 8 | Used the inline Issue #26 bDirectus scope and current TODO as the mission anchor. |
| 2 | Industry baseline preserved | 8 | Update was surgical and did not alter implementation contracts. |
| 3 | Contracts preserved or strengthened | 8 | Existing checkbox items remained unchecked and intact; prior assessment gaps were preserved as TODOs. |
| 4 | Principled fix over minimum-edit | 8 | Added missing preserved gap items instead of only doing prefix replacement. |
| 5 | Pre-change audit performed | 9 | Read current TODO and workspace state before editing. |
| 6 | Post-change interrogation answered honestly | 9 | Report states exactly what changed and that no git operation occurred. |
| 7 | Scope discipline | 8 | Only `.github/docs/TODO.md` was changed as requested. |
| 8 | Honest reporting | 9 | Counted resulting unchecked items directly from the file. |
| 9 | Trade-offs surfaced | 8 | Preserved conflict-prone gaps as TODOs rather than stripping them. |
| 10 | Project mission anchors respected | 7 | No local mission-anchor file exists, so issue text was used. |
| **Total** | | **82/100** | |

### Remediation
- Project mission anchors respected: SURFACED TO BOSS: this repo still lacks a standalone mission-anchor file.

REMAINING: 34
