---
name: notify
description: Send notification to VirtualAssistant about your work progress
---

Send a notification to VirtualAssistant database about your current work.

The notification should:
- Describe what you're doing (starting work, progress update, completion)
- Be written in Czech language
- Be concise (1-2 sentences)
- Include issue number if working on a specific issue

Examples:
- "Zahajuji praci na issue #255"
- "Vytvoril jsem Notification entitu"
- "Dokoncil jsem issue #255"

After writing the notification text, call the VirtualAssistant API:
- Endpoint: `http://localhost:5055/api/notifications`
- Method: POST
- Headers: `Content-Type: application/json`
- Body: `{"agentId": "Claude Code", "text": "<your notification text>"}`

Use curl to make the HTTP request:
```bash
curl -X POST http://localhost:5055/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"agentId": "Claude Code", "text": "<your notification text>"}'
```
