/**
 * TypeScript interfaces for MCP Task Dispatch server.
 * Matches VirtualAssistant API contracts.
 */

/**
 * Pending task returned from GET /api/claude/tasks/pending
 */
export interface PendingTask {
  id: number;
  githubIssueUrl: string;
  githubIssueNumber: number;
  summary: string;
  createdAt: string;
}

/**
 * Result of get_pending_task tool
 */
export type GetPendingTaskResult =
  | {
      success: true;
      task: PendingTask;
    }
  | {
      success: true;
      task: null;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Parameters for complete_task tool
 */
export interface CompleteTaskParams {
  taskId: number;
  result: string;
  sessionId?: string;
}

/**
 * Request body for POST /api/claude/tasks/{id}/complete
 */
export interface CompleteTaskRequest {
  sessionId?: string;
  result: string;
}

/**
 * Response from POST /api/claude/tasks/{id}/complete
 */
export interface CompleteTaskResponse {
  id: number;
  status: string;
  completedAt: string;
}

/**
 * Result of complete_task tool
 */
export type CompleteTaskResult =
  | {
      success: true;
      completedAt: string;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * API error response
 */
export interface ApiErrorResponse {
  error: string;
}
