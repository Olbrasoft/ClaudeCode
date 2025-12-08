# API Reference

Dokumentace MCP tools poskytovaných ClaudeCode serverem.

## Tools

### get_pending_task

Načte nejstarší pending úkol přiřazený Claude agentovi.

#### Specifikace

```typescript
{
  name: "get_pending_task",
  description: "Fetches the oldest pending task assigned to Claude from VirtualAssistant. Returns task details including GitHub issue URL and summary. Call this at session start or when ready for new work.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
}
```

#### Parametry

Žádné.

#### Návratová hodnota

**Když existuje úkol:**

```typescript
{
  success: true,
  task: {
    id: number,           // ID úkolu v databázi
    githubIssueUrl: string,   // URL GitHub issue
    githubIssueNumber: number, // Číslo issue
    summary: string,       // Shrnutí úkolu
    createdAt: string      // ISO 8601 timestamp
  }
}
```

**Příklad:**

```json
{
  "success": true,
  "task": {
    "id": 42,
    "githubIssueUrl": "https://github.com/Olbrasoft/VirtualAssistant/issues/123",
    "githubIssueNumber": 123,
    "summary": "Implementovat endpoint pro statistiky uživatelů",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Když není žádný úkol:**

```json
{
  "success": true,
  "task": null,
  "message": "No pending tasks available"
}
```

**Při chybě:**

```json
{
  "success": false,
  "error": "Failed to connect to VirtualAssistant API: Connection refused"
}
```

#### Side effects

- Task status se změní z `pending`/`approved`/`notified` na `sent`
- Nastaví se `SentAt` timestamp

---

### complete_task

Označí úkol jako dokončený s výsledkem.

#### Specifikace

```typescript
{
  name: "complete_task",
  description: "Marks a task as completed with a result summary. Call this when you have finished working on a task fetched via get_pending_task.",
  inputSchema: {
    type: "object",
    properties: {
      taskId: {
        type: "number",
        description: "The task ID returned from get_pending_task"
      },
      result: {
        type: "string",
        description: "Summary of what was accomplished"
      },
      sessionId: {
        type: "string",
        description: "Optional: Claude Code session ID for tracking"
      }
    },
    required: ["taskId", "result"]
  }
}
```

#### Parametry

| Parametr | Typ | Povinný | Popis |
|----------|-----|---------|-------|
| `taskId` | number | ✅ | ID úkolu z `get_pending_task` |
| `result` | string | ✅ | Shrnutí výsledku práce |
| `sessionId` | string | ❌ | Claude Code session ID |

#### Návratová hodnota

**Při úspěchu:**

```typescript
{
  success: true,
  completedAt: string,  // ISO 8601 timestamp
  message: string       // Potvrzení
}
```

**Příklad:**

```json
{
  "success": true,
  "completedAt": "2024-01-15T14:45:30Z",
  "message": "Task 42 marked as completed"
}
```

**Při chybě - task nenalezen:**

```json
{
  "success": false,
  "error": "Task 42 not found"
}
```

**Při chybě - validace:**

```json
{
  "success": false,
  "error": "Result is required and cannot be empty"
}
```

#### Side effects

- Task status se změní na `completed`
- Nastaví se `CompletedAt` timestamp
- Uloží se `Result` text
- Pokud je poskytnut, uloží se `ClaudeSessionId`

---

## REST API (VirtualAssistant)

MCP server komunikuje s těmito VirtualAssistant API endpointy:

### GET /api/claude/tasks/pending

Vrátí nejstarší pending task pro Claude agenta.

**Response 200:**

```json
{
  "id": 42,
  "githubIssueUrl": "https://github.com/Olbrasoft/VirtualAssistant/issues/123",
  "githubIssueNumber": 123,
  "summary": "Task summary",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Response 204:** No Content (žádný pending task)

### POST /api/claude/tasks/{id}/complete

Označí task jako dokončený.

**Request body:**

```json
{
  "sessionId": "optional-session-id",
  "result": "Summary of completed work"
}
```

**Response 200:**

```json
{
  "id": 42,
  "status": "completed",
  "completedAt": "2024-01-15T14:45:30Z"
}
```

**Response 400:** Invalid request (missing result)

**Response 404:** Task not found

---

## TypeScript Types

```typescript
// types.ts

export interface PendingTask {
  id: number;
  githubIssueUrl: string;
  githubIssueNumber: number;
  summary: string;
  createdAt: string;
}

export interface GetPendingTaskResult {
  success: true;
  task: PendingTask | null;
  message?: string;
} | {
  success: false;
  error: string;
}

export interface CompleteTaskParams {
  taskId: number;
  result: string;
  sessionId?: string;
}

export interface CompleteTaskResult {
  success: true;
  completedAt: string;
  message: string;
} | {
  success: false;
  error: string;
}
```

---

## Error Codes

| Kód | Popis | Řešení |
|-----|-------|--------|
| `CONNECTION_REFUSED` | API není dostupné | Zkontroluj VirtualAssistant service |
| `TIMEOUT` | Request timeout | Zkus znovu, možná vysoká zátěž |
| `NOT_FOUND` | Task nenalezen | Ověř task ID |
| `VALIDATION_ERROR` | Neplatný input | Zkontroluj parametry |
| `INTERNAL_ERROR` | Interní chyba API | Zkontroluj VirtualAssistant logy |
