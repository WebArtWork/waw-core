# waw-core

`waw-core` is the foundational module of the **waw framework**.
It provides core CLI commands (project/module lifecycle + ops) and a small set of runtime utilities attached to the global `waw` object.

Core is intentionally minimal: it sets up common helpers and provides the CLI entrypoints that other modules build on.

---

## What Core Provides

### Runtime helpers (router-side)
Loaded by `server/core/index.js`:

- `waw.exe(command, cb)` — async shell execution wrapper
- `waw.wait(ms)` — Promise-based delay helper
- `waw.http(hostname, port)` — minimal HTTP client wrapper (get/post/put/patch/delete)
- `waw.clearCache(query)` / `waw.clearBag(bag)` — small cache invalidation helpers

> These helpers are kept for backwards compatibility and convenience across modules.

---

## CLI Commands

Implemented by `server/core/runner.js` and utilities:

### `waw new <name> [repo|number] [branch]`
Create a new project from a template repository.

### `waw add <module>`
Generate/add a new module using the core module generator (`server/core/module/default`).

### `waw css`
Switch CSS base/framework for supported templates.

### `waw sync ["commit message"] [branch]`
Synchronize module folders based on their `module.json` repositories.

### `waw git store <key>` / `waw git restore <key>`
Store/restore `.git` folders into a global `.repos` storage inside the framework root.

### `waw start` / `waw stop` / `waw restart`
Process management via PM2.

### `waw --version` / `waw -v` / `waw version`
Display installed framework version and accessible modules.

---

## Structure

```

server/core/
├── index.js            # Loads runtime helpers onto `waw`
├── runner.js           # CLI router (thin dispatcher)
├── util.*.js           # CLI and runtime utilities
├── module/
│   └── default/        # Default module generator template
└── module.json         # waw module manifest

```

---

## Development Notes

- Core aims to remain **stable** because many other modules rely on it.
- Keep `runner.js` thin; put logic in `util.*.js`.
- Maintain backward compatibility unless explicitly versioned.

---

## License

MIT © Web Art Work
