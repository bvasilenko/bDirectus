# bDirectus

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
