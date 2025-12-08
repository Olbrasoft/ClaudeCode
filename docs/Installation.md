# Instalace

Tato stránka popisuje jak nainstalovat a nakonfigurovat ClaudeCode MCP server.

## Požadavky

- **Node.js** 18+ (doporučeno 20 LTS)
- **npm** 9+
- **Claude Code** CLI nainstalovaný
- **VirtualAssistant** běžící na `localhost:5055`

## Instalace MCP serveru

### 1. Klonování repozitáře

```bash
git clone https://github.com/Olbrasoft/ClaudeCode.git
cd ClaudeCode/mcp-task-dispatch
```

### 2. Instalace závislostí

```bash
npm install
```

### 3. Build

```bash
npm run build
```

Výstup bude v `dist/` složce.

### 4. Ověření

```bash
# Test že se server spustí
node dist/index.js
# Měl by čekat na stdin (MCP protocol)
# Ctrl+C pro ukončení
```

## Konfigurace Claude Code

### Přidání MCP serveru

Upravte `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "task-dispatch": {
      "command": "node",
      "args": ["/home/USER/ClaudeCode/mcp-task-dispatch/dist/index.js"],
      "env": {
        "VIRTUAL_ASSISTANT_API_URL": "http://localhost:5055"
      }
    }
  }
}
```

> ⚠️ **Důležité:** Nahraďte `/home/USER/` skutečnou cestou k repozitáři!

### Ověření konfigurace

1. Restartujte Claude Code
2. Spusťte novou session
3. Ověřte že tools jsou dostupné:

```
/mcp
```

Měli byste vidět:
- `task-dispatch:get_pending_task`
- `task-dispatch:complete_task`

## Konfigurace VirtualAssistant

Ujistěte se, že VirtualAssistant API běží:

```bash
systemctl --user status virtual-assistant.service
```

Nebo manuálně:

```bash
cd ~/Olbrasoft/VirtualAssistant
dotnet run --project src/VirtualAssistant.Service
```

API by mělo být dostupné na `http://localhost:5055`.

### Test API

```bash
# Test health endpoint
curl http://localhost:5055/health

# Test pending tasks endpoint
curl http://localhost:5055/api/claude/tasks/pending
```

## Proměnné prostředí

| Proměnná | Výchozí | Popis |
|----------|---------|-------|
| `VIRTUAL_ASSISTANT_API_URL` | `http://localhost:5055` | URL VirtualAssistant API |
| `LOG_LEVEL` | `info` | Úroveň logování (debug, info, warn, error) |

## Troubleshooting instalace

### MCP server se nespustí

```bash
# Ověřte Node.js verzi
node --version  # Mělo by být 18+

# Ověřte že dist/ existuje
ls -la dist/

# Zkuste znovu build
npm run build
```

### Tools nejsou vidět v Claude Code

1. Zkontrolujte `~/.claude/settings.json` - validní JSON?
2. Zkontrolujte cestu k `index.js` - existuje?
3. Restartujte Claude Code session

### API connection refused

```bash
# Je VirtualAssistant spuštěný?
systemctl --user status virtual-assistant.service

# Test portu
curl http://localhost:5055/health
```

## Další kroky

Po úspěšné instalaci pokračujte na [[Usage|Použití]] pro návod jak nástroje používat.
