# Použití

Tato stránka popisuje jak používat ClaudeCode MCP nástroje.

## Základní workflow

### 1. Kontrola pending úkolů

Na začátku session (nebo kdykoliv) zavolejte:

```
Použij nástroj get_pending_task k zjištění, jestli mám nějaký přiřazený úkol.
```

Nebo Claude může automaticky:

```
Mám nějaké úkoly ve frontě?
```

### 2. Zpracování úkolu

Pokud existuje pending task, Claude obdrží:

```json
{
  "success": true,
  "task": {
    "id": 42,
    "githubIssueUrl": "https://github.com/Olbrasoft/VirtualAssistant/issues/123",
    "githubIssueNumber": 123,
    "summary": "Implementovat nový endpoint pro statistiky",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

Claude pak:
1. Otevře GitHub issue
2. Přečte požadavky
3. Implementuje řešení
4. Commitne a pushne změny
5. Přidá komentář k issue

### 3. Nahlášení dokončení

Po dokončení práce:

```
Použij complete_task k nahlášení, že úkol #42 je hotový.
Výsledek: Implementován endpoint /api/stats s unit testy.
```

## Příklady použití

### Manuální workflow

```
Uživatel: Zkontroluj jestli nemám nějaké úkoly.

Claude: [volá get_pending_task]
        Máš přiřazený úkol #42: "Implementovat nový endpoint pro statistiky"
        GitHub Issue: https://github.com/Olbrasoft/VirtualAssistant/issues/123
        
        Chceš abych na tom začal pracovat?

Uživatel: Ano, udělej to.

Claude: [pracuje na úkolu...]
        [po dokončení volá complete_task]
        
        Úkol dokončen! Implementoval jsem endpoint /api/stats s následujícími změnami:
        - Vytvořen StatsController
        - Přidány unit testy
        - Aktualizována dokumentace
```

### Automatický workflow (plánováno)

V budoucnu bude možné nakonfigurovat automatické načtení úkolu při startu session:

```
# V CLAUDE.md nebo system prompt:
Na začátku každé session zkontroluj pending úkoly pomocí get_pending_task.
Pokud existuje úkol, začni na něm pracovat.
Po dokončení nahlas výsledek pomocí complete_task.
```

## Best practices

### 1. Vždy dokumentuj práci

Před voláním `complete_task` se ujisti, že:

- [ ] Změny jsou commitnuté a pushnuté
- [ ] Přidán komentář k GitHub issue
- [ ] Výsledek v `complete_task` je konkrétní

### 2. Používej popisné výsledky

**Špatně:**
```
complete_task(42, "Hotovo")
```

**Dobře:**
```
complete_task(42, "Implementován StatsController s endpointy GET /api/stats a GET /api/stats/{id}. Přidáno 15 unit testů. PR #456 připraven k review.")
```

### 3. Kontroluj frontu pravidelně

Pokud pracuješ na dlouhém úkolu, občas zkontroluj jestli nepřibyl urgentní úkol s vyšší prioritou.

### 4. Hlásit i neúspěch

Pokud se úkol nepodaří dokončit:

```
complete_task(42, "FAILED: Nelze implementovat - chybí přístup k external API. Potřeba konzultace s architektem.")
```

## Integrace s jinými nástroji

### GitHub MCP

ClaudeCode se dobře doplňuje s GitHub MCP serverem:

```
1. get_pending_task → získej URL issue
2. mcp__github__get_issue → načti detaily issue
3. [implementuj řešení]
4. mcp__github__add_issue_comment → přidej komentář
5. complete_task → nahlas dokončení
```

### Memory MCP

Pro dlouhodobé úkoly:

```
1. get_pending_task → získej úkol
2. mcp__memory__create_entities → ulož kontext úkolu
3. [pracuj na úkolu přes více sessions]
4. mcp__memory__search_nodes → obnov kontext
5. complete_task → nahlas dokončení
```

## Chybové stavy

### Žádný pending úkol

```json
{
  "success": true,
  "task": null,
  "message": "No pending tasks available"
}
```

→ Fronta je prázdná, můžeš pracovat na jiných věcech.

### API nedostupné

```json
{
  "success": false,
  "error": "Failed to connect to VirtualAssistant API after 3 retries"
}
```

→ Zkontroluj že VirtualAssistant service běží.

### Task not found

```json
{
  "success": false,
  "error": "Task 42 not found"
}
```

→ Task byl možná smazán nebo ID je špatné.

## Další kroky

- [[API-Reference|API Reference]] - Detailní dokumentace tools
- [[Troubleshooting|Řešení problémů]] - Časté problémy
