# waw-core

**waw-core** is the foundational system module of the waw platform. It provides the default CLI command set used to create, manage, and operate waw projects, and it extends the shared `waw` execution context with a small, stable set of runtime utilities. Core is intentionally minimal and opinionated only about developer workflows; it does not implement application logic, frameworks, routing, or data layers.

---

## Responsibilities

waw-core is responsible for:

- Project scaffolding and initialization
- Module scaffolding
- CSS framework switching for supported front-end project types
- Synchronization and publishing of module repositories
- Version reporting
- PM2-based process management
- Providing small runtime helpers attached to the `waw` object

All functionality is exposed either through CLI commands (`cli.js`) or through runtime extensions loaded from `index.js`.

---

## Runtime Extensions

When loaded during runtime, core executes `server/core/index.js`, which attaches the following helpers to the global `waw` context:

- `waw.wait(ms)` — returns a Promise that resolves after the specified number of milliseconds
- `waw.http(hostname, port = 443)` — a minimal HTTP client helper supporting `get`, `post`, `put`, `patch`, and `delete`, with mutable request headers and JSON handling

These helpers are intentionally small and synchronous-friendly, and they are meant to be used by other modules rather than replaced.

---

## CLI Commands

CLI commands are implemented in `server/core/cli.js` and delegated to utility files.

### `waw new <name> [repo|number] [branch]`

Creates a new project directory by cloning a template repository. The project name may be provided as an argument or entered interactively. The template repository can be selected interactively, passed as a numeric option, or provided directly as a URL. If no branch is specified, `master` is used by default. After cloning, git metadata and GitHub workflow files are removed to keep the generated project clean.

---

### `waw add <module>` / `waw a <module>`

Creates a new module inside the project’s modules directory using the default module template. If the module name is not provided, it is requested interactively. Module scaffolding is performed by executing a `scaffold.js` file from the selected template.

---

### `waw css`

Switches the CSS base for supported front-end project types (`angular`, `react`, `vue`, `wjst`). The command interactively prompts for a CSS framework and replaces the project’s CSS folder with the selected template. This command is not available for non–front-end projects.

---

### `waw sync [commit message] [branch]`

Synchronizes module directories based on their `module.json` repository configuration.

- Without a commit message, `waw sync` performs a destructive force-sync from each module’s repository.
- With a commit message, it publishes the current module state to the repository, enforcing repository hygiene before committing.

If no branch is provided, `master` is used.

---

### `waw start`, `waw stop`, `waw restart`

Manages the running project using PM2. The process name is derived from project configuration or the current working directory. PM2 settings such as execution mode, instance count, and memory limits are read from `config.pm2` if present.

---

### `waw --version`, `waw -v`, `waw version`, `waw ver`

Prints the installed waw version and a list of accessible modules.

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
