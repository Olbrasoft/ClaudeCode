# Task Dispatch Plugin

Integrates Claude Code with VirtualAssistant task queue using hooks.

## Architecture

```
~/.claude/plugins/task-dispatch/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── hooks/
│   └── hooks.json           # SessionStart + Stop hooks
├── scripts/
│   ├── load-task.sh         # Query DB → output task context
│   └── save-result.sh       # Update DB with result
└── .env                     # Database connection settings
```

## Flow

1. **Session Start** → `load-task.sh` → loads pending task from DB → injects into Claude's context
2. **Claude works** on the task
3. **Session Stop** → `save-result.sh` → saves result to DB, notifies TTS

## Hooks

| Event | Script | Purpose |
|-------|--------|---------|
| SessionStart | load-task.sh | Load pending task for Claude agent |
| Stop | save-result.sh | Save session result, mark task completed |

## Database Schema

Uses VirtualAssistant's PostgreSQL database:

**Table: `agent_tasks`**
- `id` - Task ID
- `github_issue_url` - Full GitHub issue URL
- `github_issue_number` - Issue number
- `summary` - Task description
- `target_agent_id` - Claude's agent ID
- `status` - pending/approved/notified/sent/completed/cancelled
- `result` - Completion summary
- `claude_session_id` - Session ID for tracking
- `sent_at`, `completed_at` - Timestamps

## Installation

1. Copy plugin to Claude plugins directory:
```bash
cp -r plugins/task-dispatch ~/.claude/plugins/
```

2. Configure database connection in `.env`:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=virtual_assistant
DB_USER=postgres
DB_PASSWORD=postgres
```

3. Ensure `jq` and `psql` are installed:
```bash
sudo apt install jq postgresql-client
```

## Usage

When Claude Code starts with a pending task:
- The task description is automatically injected into context
- Task status changes from "pending/approved" to "sent"
- `claude_session_id` is set for tracking

When Claude Code session ends:
- Result is extracted from transcript
- Task status changes to "completed"
- TTS notification is sent (optional)

## Manual Testing

Test load script:
```bash
echo '{"session_id": "test-123", "cwd": "/home/user"}' | ./scripts/load-task.sh
```

Test save script:
```bash
echo '{"session_id": "test-123", "transcript_path": "/tmp/test.jsonl"}' | ./scripts/save-result.sh
```

## Requirements

- PostgreSQL client (`psql`)
- `jq` for JSON parsing
- VirtualAssistant database running
- Agent "claude" registered in `agents` table

## Related Issues

- [Issue #1](https://github.com/Olbrasoft/ClaudeCode/issues/1) - PoC: Task Dispatch Plugin
- [Issue #2](https://github.com/Olbrasoft/ClaudeCode/issues/2) - Plugin skeleton with hooks.json
- [Issue #3](https://github.com/Olbrasoft/ClaudeCode/issues/3) - SessionStart hook
- [Issue #4](https://github.com/Olbrasoft/ClaudeCode/issues/4) - Stop hook
