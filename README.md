# ClaudeCode

TypeScript plugins for Claude Code integration - task dispatch, notifications, and automation.

## Plugins

| Plugin | Description | Status |
|--------|-------------|--------|
| [task-dispatch](./plugins/task-dispatch/) | Send tasks from VirtualAssistant to Claude Code | Planned |

## Purpose

This repository contains plugins that extend Claude Code functionality, primarily for integration with [VirtualAssistant](https://github.com/Olbrasoft/VirtualAssistant).

### Architecture

```
VirtualAssistant (C#)
    │
    ├── Database (tasks, notifications)
    │
    └── Claude Code (worker)
            │
            └── task-dispatch plugin
                    ├── Reads tasks from DB
                    ├── Sends to Claude Agent SDK
                    └── Reports completion back
```

## Development

Each plugin is a standalone npm package in the `plugins/` directory.

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
cd plugins/task-dispatch
npm install
npm run build
```

## License

MIT
