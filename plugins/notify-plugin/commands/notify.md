---
description: Send a notification to VirtualAssistant database
args:
  text:
    type: string
    description: The notification message text
    required: true
---

# Notify Command

**Purpose**: Store notification in VirtualAssistant database with Claude Code as agent_id.

**How to use this command:**

1. Execute HTTP POST to `http://localhost:5055/api/notifications`
2. Send JSON body: `{"agentId": "Claude Code", "text": "<text>"}`
3. Replace `<text>` with the actual notification text from args
4. Use curl or equivalent HTTP client
5. Example: `curl -X POST http://localhost:5055/api/notifications -H "Content-Type: application/json" -d '{"agentId":"Claude Code","text":"Started working on issue #123"}'`

**Important**: Always set `agentId` to exactly "Claude Code" (not "Unknown").

**When to use**: Whenever you want to notify the user about significant progress, completion, or need for attention.
