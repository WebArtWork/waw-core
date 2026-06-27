# waw-core — AI agent guide

**Purpose:** the foundational system module. It provides the default CLI commands for creating/managing/operating waw projects and attaches a few stable runtime helpers to the shared `waw` context. It does **not** implement application frameworks, routing, databases, or business logic — keep those out of core.

## How to work with this module
- CLI commands are registered in `server/core/cli.js`, which stays thin and delegates to focused utilities: `util.scaffold.js` (new project / new module / css), `util.maintain.js` (sync / version), `util.pm2.js` (process control), `util.asset.js` (image optimize), `util.ai.js` (`waw ai`), `util.runtime.js` (runtime helpers).
- Runtime extension is loaded from `index.js` → `util.runtime.js`, which adds `waw.wait(ms)` (Promise delay) and `waw.http(hostname, port=443)` (minimal fetch-based client with `get/post/put/patch/delete` and a mutable `headers` object).
- Core is stable and shared by every project — avoid breaking changes, prefer Node APIs over shell, and keep `cli.js` delegating rather than holding logic.

## Commands an agent can run
- `waw new <name> [repo|number] [branch]` — clone a project template (interactive list includes regional "IT Space" submenus); strips git metadata after.
- `waw add <name>` / `waw a` — scaffold a module into `waw.modulesPath` from `module/default/`.
- `waw css` — replace the stylesheet folder (`src/scss`, or `scss` for wjst) with a chosen framework repo; front-end projects only.
- `waw sync ["msg"] [branch]` — without a message: destructive force-sync of each module from its `module.json` repo; with a message: publish current module state.
- `waw asset <image-url> <output-path>` — download → resize to fit 512×512 → WebP. Requires `sharp` (local or global).
- `waw start` / `stop` / `restart` — PM2 process control; reads `config.pm2` (`exec_mode` default `fork`, `instances` 1, memory `800M`).
- `waw version` (aliases `--version`, `-version`, `--v`, `-v`, `ver`, `v`) — print install path, version, and accessible modules.
- `waw wipe` — remove the `server` folder from the waw install. `waw update` — remove `server` and force-sync waw from its repo.
- `waw ai` — print the concatenated `AI_INSTRUCTIONS.md` of waw + every loaded module (this is how these files reach an agent).

## Gotchas
- `waw wipe` / `waw update` delete the installed `server` folder — destructive; only run when reinstalling/maintaining the waw install itself.
- `waw sync` without a message is a destructive force-sync that overwrites local module changes.
- `waw add` / `waw a` are also defined by the sem and angular modules; the effective handler depends on module load order in the current project.
