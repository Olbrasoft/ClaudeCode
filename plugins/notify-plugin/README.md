# Notify Plugin for Claude Code

Send notifications from Claude Code to VirtualAssistant database.

## Installation

From Claude Code terminal:

```bash
/plugin marketplace add /home/jirka/GitHub/Olbrasoft/ClaudeCode/plugins
/plugin install notify@olbrasoft-plugins
```

Restart Claude Code to activate the plugin.

## Usage

Use the `/notify` command to send notifications:

```
/notify Started working on issue #255
```

This will:
1. Store notification in VirtualAssistant database
2. Set `agent_id` to "Claude Code"
3. Allow VirtualAssistant to track your activity

## How It Works

The plugin adds a `/notify` command that:
- Sends HTTP POST to `http://localhost:5055/api/notifications`
- Includes `agentId: "Claude Code"` in JSON body
- Stores your notification text in the database

## Requirements

- VirtualAssistant service running on `localhost:5055`
- Database with `notifications` table created (Issue #255)

## See Also

- Issue #270: Modify Claude Code notification endpoint
- Issue #271: Remove Claude Code hooks (completed)
