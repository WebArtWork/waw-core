# waw-core

**waw-core** is the foundational system module of the waw platform. It provides the default CLI command set used to create, manage, and operate waw projects, and it extends the shared `waw` execution context with a small, stable set of runtime utilities. Core is intentionally minimal and opinionated only about developer workflows; it does not implement application logic, frameworks, routing, or data layers.

> 🤖 **AI agents:** read [`AI_INSTRUCTIONS.md`](AI_INSTRUCTIONS.md) first — it is the agent-oriented working guide for this module (conventions to follow, how to extend it, and gotchas to avoid). This README is the human reference.

---

## Responsibilities

waw-core is responsible for:

- Project scaffolding and initialization (`waw new`)
- Module scaffolding (`waw add` / `waw a`)
- CSS framework switching for supported front-end project types (`waw css`)
- Synchronization and publishing of module repositories (`waw sync`)
- Image asset download / optimization (`waw asset`)
- Version reporting (`waw version` and aliases)
- PM2-based process management (`waw start` / `stop` / `restart`)
- Self-maintenance of the waw install (`waw wipe`, `waw update`)
- Providing small runtime helpers attached to the `waw` object

All functionality is exposed either through CLI commands ([`cli.js`](cli.js)) or through runtime extensions loaded from [`index.js`](index.js). `cli.js` stays thin and delegates to focused utility files (`util.scaffold.js`, `util.maintain.js`, `util.pm2.js`, `util.asset.js`, `util.ai.js`, `util.runtime.js`).

---

## Runtime Extensions

When loaded during runtime, core executes [`index.js`](index.js), which requires [`util.runtime.js`](util.runtime.js) and attaches the following helpers to the global `waw` context:

- `waw.wait(ms)` — returns a Promise that resolves after the specified number of milliseconds
- `waw.http(hostname, port = 443)` — a minimal HTTP client helper supporting `get`, `post`, `put`, `patch`, and `delete`, with mutable request headers and JSON handling

These helpers are intentionally small and synchronous-friendly, and they are meant to be used by other modules rather than replaced.

---

## CLI Commands

CLI commands are implemented in `server/core/cli.js` and delegated to utility files.

### `waw new <name> [repo|number] [branch]`

Creates a new project directory by cloning a template repository. The project name may be provided as an argument or entered interactively. The template repository can be selected interactively, passed as a numeric option, or provided directly as a URL.

The interactive list offers the built-in starters (waw Server, Angular, React, Vue, Unity) and a set of regional "IT Space" entries. Selecting a space (e.g. *IT Kamianets*) opens a second menu of that space's project/theme repositories.

If no branch is specified, `master` is used by default. After cloning, git metadata is removed (`waw.git.remove`) to keep the generated project clean.

---

### `waw add <module>` / `waw a <module>`

Creates a new module inside the project’s modules directory (`waw.modulesPath`) using the default module template at [`module/default/`](module/default/). If the module name is not provided, it is requested interactively. The module name is lowercased; if the target folder already exists the command aborts. Scaffolding runs the template’s `scaffold.js`, which is invoked with a context spread from `waw` plus `name`, `Name`, `base` (target folder), and `template` (template root).

---

### `waw css`

Switches the CSS base for supported front-end project types (`angular`, `react`, `vue`, `wjst`). The command interactively prompts for a CSS framework, deletes the project’s stylesheet folder, and force-syncs the selected framework repo into it. The folder is `src/scss` for most project types and `scss` for `wjst`. This command exits early for non–front-end projects (when `projectType` is missing or `waw`).

Available frameworks per project type include **Basic**, **Bootstrap**, **Tailwind**, **Foundation**, and **Bulma**; Angular additionally offers **Material**. Each maps to a `WebArtWork/*-css*` repository.

---

### `waw sync [commit message] [branch]`

Synchronizes module directories based on their `module.json` repository configuration.

- Without a commit message, `waw sync` performs a destructive force-sync from each module’s repository.
- With a commit message, it publishes the current module state to the repository, enforcing repository hygiene before committing.

If no branch is provided, `master` is used.

---

### `waw asset <image-url> <output-path>`

Downloads an image from a URL, resizes it to fit within **512×512** (preserving aspect ratio, never enlarging), converts it to **WebP**, and writes it relative to the project path. A `.webp` extension is appended if missing, and parent directories are created as needed. Requires the [`sharp`](https://sharp.pixelplumbing.com/) package, resolved either locally or from the global npm root; if `sharp` cannot be loaded the command errors out.

---

### `waw start`, `waw stop`, `waw restart`

Manages the running project using PM2. The process name is derived from `config.name` / `config.title` or the current working directory. The started script is `<wawPath>/util.runtime.js`. PM2 settings — `exec_mode` (default `fork`), `instances` (default `1`), and `max_memory_restart` (`config.pm2.memory`, default `800M`) — are read from `config.pm2` if present.

---

### `waw --version`, `waw version`, `waw ver`, `waw v`

Prints the waw install location, the installed waw version (from `package.json`), and a list of accessible modules. Aliases: `--version`, `-version`, `--v`, `-v`, `version`, `ver`, `v`.

---

### `waw wipe`

Removes the `server` folder from the waw install directory (`waw.wawPath`). Used to clear out installed server modules.

---

### `waw update`

Removes the `server` folder from the waw install and force-syncs the latest waw from `https://github.com/WebArtWork/waw.git`.

---

### `waw love`

Prints a friendly message and exits.

---

### `waw ai`

Prints aggregated AI instructions by concatenating the global `AI_INSTRUCTIONS.md`, each loaded module’s `AI_INSTRUCTIONS.md`, and a final description of the Web Art Work ecosystem.

---

## Module Manifest

The core module is defined by `server/core/module.json`. It declares a repository URL, installs `pm2` as a dependency, and is ordered before all other modules using `"before": "*"` to ensure its CLI commands and runtime helpers are available first.

---

## Development Notes

- Core must remain stable; changes here affect all waw projects.
- Keep `cli.js` thin and delegate logic to `util.*.js` files.
- Prefer Node.js APIs over shell commands for portability.
- Avoid breaking changes unless explicitly versioned and documented.

---

## License

MIT © Web Art Work
