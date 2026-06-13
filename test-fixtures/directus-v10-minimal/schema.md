# Minimal fixture schema

Create an `articles` collection with:

| Field | Type |
|---|---|
| `id` | UUID or integer primary key |
| `title` | String |
| `body` | Text |
| `bsuite_directive` | JSON |

The `body` field can contain `[[bsuite]]` to trigger directive generation.
