# waw-core

waw-core is a foundational module for the waw framework, providing essential commands and functionalities to streamline project management across various applications.

## Key Features

- **Project Initialization** – Quickly set up new projects with predefined templates using the `waw new` command.
- **Module Management** – Easily add new modules to your project with the `waw add` command.
- **Version Control** – Check the current version of the waw framework and its modules using `waw version`.
- **Process Management** – Manage your application's processes using PM2 with the following commands:
  - `waw start` – Starts the application using PM2.
  - `waw stop` – Stops the running application.
  - `waw restart` – Restarts the application.
- **CSS Management** – Use `waw css` to list and switch between different CSS bases or reset to the default style.
- **Module Synchronization** – The `waw sync` command fetches and updates modules from their repositories based on `module.json`.
- **PM2 Integration** – Ensures process scaling, monitoring, and uptime management when running waw-based applications.
- **wjst Front-End Templates** – A collection of server-side templates available under `/wjst/name`, providing reusable components such as:
  - `alert`
  - `controls`
  - `core`
  - `dom`
  - `event`
  - `spinner`

## Getting Started

### 1. Install waw-core

waw-core is not installed via npm. Instead, use the waw command:

```sh
waw add waw-core
```

### 2. Initialize a New Project

```sh
waw new my-project
cd my-project
```

### 3. Add Modules as Needed

```sh
waw add module-name
```

### 4. Synchronize Modules

To fetch and update modules from their repositories, use:

```sh
waw sync
```

### 5. Manage CSS

To list available CSS frameworks or reset to default, run:

```sh
waw css
```

### Contributing

We welcome contributions to enhance the functionality of `waw-core`. Please refer to the [CONTRIBUTING.md](https://github.com/WebArtWork/waw-core/blob/master/CONTRIBUTING.md) file for guidelines on how to contribute.

For more details, visit the [waw-core GitHub repository](https://github.com/WebArtWork/waw-core).

