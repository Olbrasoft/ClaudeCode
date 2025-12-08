# Řešení problémů

Časté problémy a jejich řešení.

## MCP Server

### Tools nejsou vidět v Claude Code

**Symptom:** Po zadání `/mcp` nevidím `task-dispatch` tools.

**Řešení:**

1. Zkontroluj `~/.claude/settings.json`:
   ```bash
   cat ~/.claude/settings.json | jq '.mcpServers'
   ```

2. Ověř že cesta k `index.js` existuje:
   ```bash
   ls -la /cesta/k/mcp-task-dispatch/dist/index.js
   ```

3. Zkus spustit server manuálně:
   ```bash
   node /cesta/k/mcp-task-dispatch/dist/index.js
   # Měl by čekat na stdin
   ```

4. Restartuj Claude Code session (úplně zavři a znovu otevři)

---

### Server crash při startu

**Symptom:** MCP server se ihned ukončí.

**Řešení:**

1. Zkontroluj Node.js verzi:
   ```bash
   node --version  # Musí být 18+
   ```

2. Přeinstaluj dependencies:
   ```bash
   cd mcp-task-dispatch
   rm -rf node_modules
   npm install
   npm run build
   ```

3. Zkontroluj logy:
   ```bash
   # Spusť s debug logováním
   LOG_LEVEL=debug node dist/index.js
   ```

---

### "Module not found" error

**Symptom:** `Error: Cannot find module '@modelcontextprotocol/sdk'`

**Řešení:**

```bash
cd mcp-task-dispatch
npm install
npm run build
```

Pokud přetrvává:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## API Connectivity

### Connection refused

**Symptom:** `Failed to connect to VirtualAssistant API: Connection refused`

**Řešení:**

1. Zkontroluj že VirtualAssistant běží:
   ```bash
   systemctl --user status virtual-assistant.service
   ```

2. Test API manuálně:
   ```bash
   curl http://localhost:5055/health
   ```

3. Zkontroluj port:
   ```bash
   ss -tlnp | grep 5055
   ```

4. Zkontroluj env variable:
   ```bash
   echo $VIRTUAL_ASSISTANT_API_URL
   # Mělo by být http://localhost:5055
   ```

---

### Timeout errors

**Symptom:** `Request timeout after 10000ms`

**Řešení:**

1. Zkontroluj zátěž serveru:
   ```bash
   top -p $(pgrep -f VirtualAssistant)
   ```

2. Zkontroluj database connection:
   ```bash
   systemctl --user status postgresql
   ```

3. Zkontroluj VirtualAssistant logy:
   ```bash
   journalctl --user -u virtual-assistant.service -f
   ```

---

### 404 Not Found

**Symptom:** `Task 42 not found`

**Příčiny:**
- Task byl smazán
- Špatné task ID
- Task neexistuje v databázi

**Řešení:**

1. Ověř task v databázi:
   ```sql
   SELECT * FROM agent_tasks WHERE id = 42;
   ```

2. Zkontroluj že používáš správné ID z `get_pending_task`

---

## Task Management

### get_pending_task vrací stále stejný task

**Symptom:** Po dokončení úkolu se stále vrací stejný task.

**Příčina:** Task nebyl označen jako completed.

**Řešení:**

1. Zavolej `complete_task` s výsledkem:
   ```
   complete_task(taskId: 42, result: "Completed successfully")
   ```

2. Ověř status v databázi:
   ```sql
   SELECT id, status, completed_at FROM agent_tasks WHERE id = 42;
   ```

---

### Task stuck in 'sent' status

**Symptom:** Task má status 'sent' ale Claude ho už nezpracovává.

**Příčina:** Session byla ukončena před voláním `complete_task`.

**Řešení (manuální):**

```sql
-- Reset na pending
UPDATE agent_tasks 
SET status = 'pending', sent_at = NULL 
WHERE id = 42;
```

**Řešení (budoucí):** Automatický stale task recovery (viz #7).

---

### Žádné pending tasks ale issue existuje

**Symptom:** `get_pending_task` vrací null, ale v GitHub je issue s labelem.

**Příčiny:**
- Webhook nepřišel
- Task má jiný status (completed, failed)
- Task je přiřazen jinému agentovi

**Řešení:**

1. Zkontroluj databázi:
   ```sql
   SELECT * FROM agent_tasks 
   WHERE github_issue_number = 123;
   ```

2. Zkontroluj webhook logy:
   ```bash
   journalctl --user -u virtual-assistant.service | grep webhook
   ```

3. Manuálně vytvoř task (pokud webhook selhal):
   - Použij VirtualAssistant Admin UI
   - Nebo API endpoint

---

## Debugging

### Zapnutí debug logů

```bash
# V MCP server konfiguraci
{
  "mcpServers": {
    "task-dispatch": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "LOG_LEVEL": "debug",
        "VIRTUAL_ASSISTANT_API_URL": "http://localhost:5055"
      }
    }
  }
}
```

### Testování API bez Claude Code

```bash
# Test get pending
curl -s http://localhost:5055/api/claude/tasks/pending | jq

# Test complete (nahraď ID)
curl -X POST http://localhost:5055/api/claude/tasks/42/complete \
  -H "Content-Type: application/json" \
  -d '{"result": "Test completion"}' | jq
```

### Kontrola MCP komunikace

```bash
# Spusť server a sleduj komunikaci
node dist/index.js 2>&1 | tee mcp-debug.log
```

---

## Kontakt a podpora

- **Issues:** [GitHub Issues](https://github.com/Olbrasoft/ClaudeCode/issues)
- **VirtualAssistant Issues:** [VirtualAssistant Repo](https://github.com/Olbrasoft/VirtualAssistant/issues)
