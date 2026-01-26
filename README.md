# waw-core

`waw-core` is the foundational module of the **waw framework**. It provides core CLI commands (project/module lifecycle + ops) and a small set of runtime utilities attached to the global `waw` object. Core is intentionally minimal: it sets up common helpers and provides the CLI entrypoints that other modules build on.

---

## What Core Provides

### Runtime helpers
Loaded by `server/core/index.js`:

- `waw.wait(ms)` — Promise-based delay helper
- `waw.http(hostname, port)` — minimal HTTP client wrapper (get/post/put/patch/delete)

---

## CLI Commands

Implemented by `server/core/cli.js` and utilities:

### `waw new <name> [repo|number] [branch]`
Create a new project from a template repository.

### `waw add <module>`
Generate/add a new module using the core module generator (`server/core/module/default`).

### `waw css [branch]`
Switch CSS base/framework for supported templates (optionally provide branch, default `master`).

### `waw sync ["commit message"] [branch]`
Synchronize module folders based on their `module.json` repositories:
- `waw sync` → destructive sync (force) from repo
- `waw sync "MESSAGE" [branch]` → publish current folder state to repo (with hygiene enforcement)

### `waw start` / `waw stop` / `waw restart`
Process management via PM2.

### `waw --version` / `waw -v` / `waw version`
Display installed framework version and accessible modules.

---

## Structure

```txt
server/core/
├── cli.js              # CLI commands + aliases
├── index.js            # Loads runtime helpers onto `waw`
├── util.runtime.js     # Runtime helpers (wait/http)
├── util.scaffold.js    # new/add/css
├── util.maintain.js    # sync/version
├── util.git.js         # git workflows + hygiene helper
├── util.pm2.js         # PM2 start/stop/restart
└── module.json         # waw module manifest
````

---

## Development Notes

* Core aims to remain **stable** because many other modules rely on it.
* Keep `cli.js` thin; put logic in `util.*.js`.
* Maintain backward compatibility unless explicitly versioned.

---

## License

MIT © Web Art Work
