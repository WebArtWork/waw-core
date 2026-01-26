# Contributing to waw-core

Thanks for contributing to **waw-core**.

Core is a foundational module: changes here affect many projects.
Please prioritize **stability**, **backward compatibility**, and **clear behavior**.

---

## Guiding Principles

- **Runner stays thin**
  - `server/core/cli.js` should mostly export and dispatch.
  - Put implementation into `util.*.js`.

- **Avoid breaking changes**
  - If you must change behavior, document it clearly and keep migration easy.

- **Keep runtime utilities attached to `waw`**
  - Core exposes small helpers through the global `waw` object (see `util.runtime.js`).

- **Cross-platform friendly**
  - Prefer Node APIs (`fs.rmSync`, `fs.cpSync`) over shell-only commands.
  - If shell is required, quote paths and provide fallbacks.

---

## What You Can Contribute

### Bug fixes
- CLI flows (`new`, `add`, `sync`, `css`)
- Git/PM2 helpers
- Safety and error handling

### Improvements
- Better defaults, clearer messages
- Refactors that keep behavior identical
- Documentation improvements

### Documentation
- Usage examples
- Module lifecycle explanation
- CLI reference

---

## Development Workflow

1. Fork the repository
2. Create a branch for your change
3. Follow existing style:
   - Tabs
   - 4-space tab width
4. Test changes in a real waw project
5. Submit a pull request with:
   - Description of the change
   - Reason for the change
   - Notes on backward compatibility

---

## Testing Checklist

- `waw new` creates projects correctly (repo selection + branch)
- `waw add` creates modules using the generator
- `waw css` switches frameworks correctly for each project type
- `waw sync` works both in fetch mode and commit mode
- `waw --version` prints version and modules
- PM2 commands operate correctly (`start/stop/restart`)

---

## Communication

- Be respectful and constructive
- Explain *why* a change is needed
- Assume others depend on core in production

Thanks for helping keep waw stable and scalable.
