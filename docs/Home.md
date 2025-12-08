# ClaudeCode Wiki

Vítejte v dokumentaci projektu **ClaudeCode** - TypeScript MCP server pro integraci Claude Code s VirtualAssistant systémem.

## Co je ClaudeCode?

ClaudeCode je sada nástrojů (MCP server), která umožňuje Claude Code autonomně:

- 📥 **Přijímat úkoly** z fronty VirtualAssistant
- ✅ **Reportovat dokončení** úkolů zpět do systému
- 🔗 **Propojit** GitHub issues s Claude Code session

## Proč to existuje?

VirtualAssistant je centrální systém pro správu AI agentů. Když architekt (člověk) vytvoří úkol v GitHub issue a přiřadí ho Claude agentovi, tento úkol se uloží do databáze VirtualAssistant. 

ClaudeCode MCP server pak umožňuje Claude Code:
1. Zjistit, že má přiřazený úkol
2. Načíst detaily úkolu (GitHub issue URL, popis)
3. Po dokončení nahlásit výsledek

## Rychlý přehled

| Komponenta | Technologie | Účel |
|------------|-------------|------|
| MCP Server | TypeScript | Komunikace s Claude Code |
| API Client | TypeScript | Volání VirtualAssistant API |
| VirtualAssistant API | C# .NET | Backend pro správu úkolů |
| Database | PostgreSQL | Perzistence úkolů |

## Obsah dokumentace

- [[Architecture|Architektura]] - Jak systém funguje
- [[Installation|Instalace]] - Jak nastavit MCP server
- [[Usage|Použití]] - Jak používat nástroje
- [[API-Reference|API Reference]] - Dokumentace MCP tools
- [[Troubleshooting|Řešení problémů]] - Časté problémy a řešení

## Související projekty

- [VirtualAssistant](https://github.com/Olbrasoft/VirtualAssistant) - Backend systém pro správu AI agentů
- [Claude Code](https://claude.ai/code) - Anthropic CLI pro Claude

## Status projektu

🚧 **Ve vývoji** - Viz [Issue #7](https://github.com/Olbrasoft/ClaudeCode/issues/7) pro aktuální stav implementace.
