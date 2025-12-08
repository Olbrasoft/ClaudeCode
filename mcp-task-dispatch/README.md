# MCP Task Dispatch

TypeScript MCP Server for dispatching tasks from VirtualAssistant to Claude Code.

## Overview

This MCP server provides tools for Claude Code to:
- Fetch pending tasks from VirtualAssistant task queue
- Report task completion back to VirtualAssistant

## Installation

```bash
npm install
npm run build
```

## Configuration

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "task-dispatch": {
      "command": "node",
      "args": ["/path/to/mcp-task-dispatch/dist/index.js"],
      "env": {
        "VIRTUAL_ASSISTANT_API_URL": "http://localhost:5055"
      }
    }
  }
}
```

## MCP Tools

### get_pending_task

Fetches the oldest pending task for Claude agent.

**Parameters:** None

**Returns:**
```json
{
  "success": true,
  "task": {
    "id": 42,
    "githubIssueUrl": "https://github.com/...",
    "githubIssueNumber": 123,
    "summary": "Task description",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### complete_task

Marks a task as completed.

**Parameters:**
- `taskId` (number, required): Task ID from get_pending_task
- `result` (string, required): Summary of completed work
- `sessionId` (string, optional): Claude Code session ID

**Returns:**
```json
{
  "success": true,
  "completedAt": "2024-01-15T14:45:30Z",
  "message": "Task 42 marked as completed"
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Clean build
npm run clean
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| VIRTUAL_ASSISTANT_API_URL | http://localhost:5055 | VirtualAssistant API base URL |

## Related

- [ClaudeCode Wiki](https://github.com/Olbrasoft/ClaudeCode/wiki)
- [VirtualAssistant](https://github.com/Olbrasoft/VirtualAssistant)
- [Issue #7](https://github.com/Olbrasoft/ClaudeCode/issues/7) - Parent issue
