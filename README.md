# ClaudeCode

TypeScript MCP server pro integraci Claude Code s VirtualAssistant systémem.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Dokumentace

Kompletní dokumentace je k dispozici v [docs/](./docs/) složce:

- **[Home](./docs/Home.md)** - Úvod a přehled projektu
- **[Architektura](./docs/Architecture.md)** - Jak systém funguje, diagramy
- **[Instalace](./docs/Installation.md)** - Návod na instalaci a konfiguraci
- **[Použití](./docs/Usage.md)** - Jak používat MCP nástroje
- **[API Reference](./docs/API-Reference.md)** - Dokumentace MCP tools
- **[Troubleshooting](./docs/Troubleshooting.md)** - Řešení problémů

## 🎯 Co to dělá?

ClaudeCode poskytuje MCP (Model Context Protocol) server, který umožňuje Claude Code:

- 📥 **Přijímat úkoly** z fronty VirtualAssistant
- ✅ **Reportovat dokončení** úkolů zpět do systému  
- 🔗 **Propojit** GitHub issues s Claude Code session

## 🏗️ Architektura

```
┌─────────────────────────────────────────────────────────┐
│                   ARCHITEKT (člověk)                    │
│  Vytvoří GitHub Issue → label "agent:claude"            │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              VIRTUALASSISTANT (C# .NET)                 │
│  PostgreSQL ◄── REST API ◄── Webhook Handler            │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    CLAUDE CODE                          │
│  ┌────────────────────────────────────────────┐        │
│  │     MCP Server (TypeScript)                │        │
│  │  • get_pending_task                        │        │
│  │  • complete_task                           │        │
│  └────────────────────────────────────────────┘        │
│                       │                                 │
│                       ▼                                 │
│              Claude AI Agent                            │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Rychlý start

```bash
# Klonování
git clone https://github.com/Olbrasoft/ClaudeCode.git
cd ClaudeCode/mcp-task-dispatch

# Instalace a build
npm install
npm run build

# Konfigurace Claude Code (~/.claude/settings.json)
# Viz docs/Installation.md
```

## 📋 MCP Tools

| Tool | Popis |
|------|-------|
| `get_pending_task` | Načte nejstarší pending úkol z fronty |
| `complete_task` | Označí úkol jako dokončený s výsledkem |

## 📦 Struktura projektu

```
ClaudeCode/
├── docs/                    # 📖 Dokumentace (wiki)
│   ├── Home.md
│   ├── Architecture.md
│   ├── Installation.md
│   ├── Usage.md
│   ├── API-Reference.md
│   └── Troubleshooting.md
├── mcp-task-dispatch/       # 🔧 MCP Server (TypeScript)
│   ├── src/
│   │   ├── index.ts         # Entry point
│   │   ├── api-client.ts    # VirtualAssistant API client
│   │   └── types.ts         # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🔗 Související projekty

- [VirtualAssistant](https://github.com/Olbrasoft/VirtualAssistant) - Backend systém pro správu AI agentů
- [Claude Code](https://claude.ai/code) - Anthropic CLI pro Claude

## 📊 Status

🚧 **Ve vývoji** - Viz [Issue #7](https://github.com/Olbrasoft/ClaudeCode/issues/7) pro aktuální stav.

### Sub-tasks

- [ ] #8 Project Setup
- [ ] #9 API Client
- [ ] #10 get_pending_task tool
- [ ] #11 complete_task tool
- [ ] #12 MCP Server integration
- [ ] #13 Configuration & Testing

## 📄 License

MIT
