# Notify Plugin for Claude Code

Plugin that provides a `/notify` command to send notifications to VirtualAssistant database.

## Installation

### 1. Add marketplace (if not already added)
```bash
/plugin marketplace add /home/jirka/GitHub/Olbrasoft/ClaudeCode
```

### 2. Install the plugin
```bash
/plugin install notify@ClaudeCode
```

### 3. Restart Claude Code
Restart to apply changes.

## Usage

```
/notify <message>
```

### Examples
```
/notify Zahajuji praci na issue #255
/notify Vytvoril jsem Notification entitu
/notify Dokoncil jsem issue #255
```

## API Endpoint

The plugin sends notifications to:
- **URL**: `http://localhost:5055/api/notifications`
- **Method**: POST
- **Headers**: `Content-Type: application/json`
- **Body**: `{"agentId": "Claude Code", "text": "<message>"}`

## Requirements

- VirtualAssistant service running on localhost:5055
- `/api/notifications` endpoint available
