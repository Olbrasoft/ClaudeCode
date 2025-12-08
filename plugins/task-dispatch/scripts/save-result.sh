#!/bin/bash
# save-result.sh - Save session result to VirtualAssistant database
# Called by Claude Code Stop hook
# Reads JSON from stdin: {"session_id": "...", "transcript_path": "...", "cwd": "..."}

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
TRANSCRIPT_PATH=$(echo "$INPUT_JSON" | jq -r '.transcript_path // empty')

# Database connection (from .env or default)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-virtual_assistant}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

export PGPASSWORD="$DB_PASSWORD"

# Check if we have a session_id to match
if [ -z "$SESSION_ID" ]; then
    exit 0
fi

# Find task by claude_session_id
TASK_QUERY="
SELECT id, status
FROM agent_tasks
WHERE claude_session_id = '$SESSION_ID'
LIMIT 1;
"

RESULT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -A -F '|' -c "$TASK_QUERY" 2>/dev/null)

if [ -z "$RESULT" ]; then
    # No task found for this session - exit silently
    exit 0
fi

IFS='|' read -r TASK_ID CURRENT_STATUS <<< "$RESULT"

# Only update if task is in 'sent' status (not already completed)
if [ "$CURRENT_STATUS" != "sent" ]; then
    exit 0
fi

# Extract result from transcript (if available)
RESULT_TEXT="Session completed"
if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
    # Try to extract last assistant message from JSONL transcript
    # Transcript is JSONL with {"role": "assistant", "content": "..."} entries
    LAST_ASSISTANT=$(tail -100 "$TRANSCRIPT_PATH" 2>/dev/null | grep '"role":"assistant"' | tail -1 | jq -r '.content // empty' 2>/dev/null || true)

    if [ -n "$LAST_ASSISTANT" ]; then
        # Truncate to reasonable length for DB storage
        RESULT_TEXT=$(echo "$LAST_ASSISTANT" | head -c 4000)
    fi
fi

# Escape single quotes for PostgreSQL
RESULT_TEXT_ESCAPED=$(echo "$RESULT_TEXT" | sed "s/'/''/g")

# Update task as completed
UPDATE_QUERY="
UPDATE agent_tasks
SET status = 'completed',
    completed_at = NOW(),
    result = '$RESULT_TEXT_ESCAPED'
WHERE id = $TASK_ID;
"

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$UPDATE_QUERY" >/dev/null 2>&1

# Notify VirtualAssistant TTS (optional)
TTS_URL="${TTS_NOTIFY_URL:-http://localhost:5055/api/tts/notify}"
curl -s -X POST "$TTS_URL" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Task ${TASK_ID} dokončen\", \"source\": \"claudecode\"}" \
    >/dev/null 2>&1 || true

exit 0
