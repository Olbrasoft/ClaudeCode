#!/bin/bash
# load-task.sh - Load pending task from VirtualAssistant database
# Called by Claude Code SessionStart hook
# Reads JSON from stdin: {"session_id": "...", "transcript_path": "...", "cwd": "..."}
# Outputs task context to stdout (injected into Claude's context)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"

# Load environment variables
if [ -f "$PLUGIN_DIR/.env" ]; then
    source "$PLUGIN_DIR/.env"
fi

# Read input JSON from stdin
INPUT_JSON=$(cat)
SESSION_ID=$(echo "$INPUT_JSON" | jq -r '.session_id // empty')
CWD=$(echo "$INPUT_JSON" | jq -r '.cwd // empty')

# Database connection (from .env or default)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-virtual_assistant}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

export PGPASSWORD="$DB_PASSWORD"

# Query for pending/approved task for Claude agent
# Join with agents table to find claude's agent_id
TASK_QUERY="
SELECT
    t.id,
    t.github_issue_url,
    t.github_issue_number,
    t.summary,
    t.status,
    t.created_at
FROM agent_tasks t
JOIN agents a ON t.target_agent_id = a.id
WHERE a.name = 'claude'
  AND t.status IN ('pending', 'approved', 'notified')
ORDER BY t.created_at ASC
LIMIT 1;
"

# Execute query
RESULT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -A -F '|' -c "$TASK_QUERY" 2>/dev/null)

if [ -z "$RESULT" ]; then
    # No pending task - exit silently (no output = no context injection)
    exit 0
fi

# Parse result
IFS='|' read -r TASK_ID GITHUB_URL GITHUB_ISSUE SUMMARY STATUS CREATED_AT <<< "$RESULT"

# Update task status to 'sent' and set claude_session_id
UPDATE_QUERY="
UPDATE agent_tasks
SET status = 'sent',
    sent_at = NOW(),
    claude_session_id = '$SESSION_ID'
WHERE id = $TASK_ID;
"

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$UPDATE_QUERY" >/dev/null 2>&1

# Output task context (injected into Claude's context)
cat << EOF

================================================================================
ASSIGNED TASK FROM VIRTUAL ASSISTANT
================================================================================

Task ID: $TASK_ID
GitHub Issue: $GITHUB_URL
Issue Number: #$GITHUB_ISSUE
Created: $CREATED_AT

TASK DESCRIPTION:
$SUMMARY

--------------------------------------------------------------------------------
INSTRUCTIONS:
1. Work on this task as your primary objective
2. When complete, your session result will be automatically saved
3. Include clear summary of what was done in your final response
4. If you create a PR, mention it in your summary
================================================================================

EOF
