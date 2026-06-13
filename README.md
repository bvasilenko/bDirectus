# bDirectus

Your content team writes in Directus: editorial items, product descriptions, regulated copy. They use AI assistants in the admin app to draft. With bDirectus installed, the same discipline checks that protect your engineers run on those drafts. A Directus filter hook fires on item create/update: bground verifies factual claims against cited evidence, bsmell flags hedged or unsupported language, banchor checks alignment to the brief. Verdicts render in a custom Directus interface alongside the item field: no leaving the admin app, no fact-check ping-pong, no after-the-fact retraction.


Directus extension embedding the b-suite discipline runtime into the admin authoring UI.

## Install

```bash
npm install -D @booga/bdirectus
```

Or install through the Directus extension installer when available:

```bash
npx directus-extension install bdirectus
```

## Usage

Add a JSON field named `bsuite_directive` to each collection that should display directives. Configure allowlisted collections through environment variables:

```bash
BDIRECTUS_COLLECTIONS=articles,pages
BDIRECTUS_BINARIES=bground,banchor,bsmell,bratch,bwatch,bspector
```

The hook checks allowlisted create and update payloads for b-suite markers, runs the enabled b-* binaries, and stores the directive bundle on the configured JSON field before Directus saves the item.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `BDIRECTUS_COLLECTIONS` | none | Comma-separated Directus collections allowed to run the extension. |
| `BDIRECTUS_BINARIES` | all six binaries | Comma-separated enabled binary names. |
| `BDIRECTUS_DIRECTIVE_FIELD` | `bsuite_directive` | JSON field used to store directive output. |
| `BDIRECTUS_MARKER_STYLE` | `sentinel` | Marker parser: `sentinel` or `json-tail`. |
| `BDIRECTUS_BINARY_TIMEOUT_MS` | `5000` | Per-binary timeout in milliseconds. |
| `BDIRECTUS_BINARY_PATH_<NAME>` | binary name | Optional executable path per binary, for example `BDIRECTUS_BINARY_PATH_BGROUND`. |

## License

MIT
