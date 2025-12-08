/**
 * VirtualAssistant API client with retry logic.
 * Communicates with the C# backend for task management.
 */

import type {
  PendingTask,
  CompleteTaskRequest,
  CompleteTaskResponse,
  ApiErrorResponse,
} from "./types.js";

/**
 * Configuration for the API client
 */
interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: process.env.VIRTUAL_ASSISTANT_API_URL || "http://localhost:5055",
  timeout: 10000,
  maxRetries: 3,
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * VirtualAssistant API client
 */
export class VirtualAssistantApiClient {
  private config: ApiClientConfig;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Make HTTP request with retry logic
   */
  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.config.timeout
        );

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 204 No Content
        if (response.status === 204) {
          return null;
        }

        // Handle errors
        if (!response.ok) {
          const errorBody = (await response.json()) as ApiErrorResponse;
          throw new Error(
            errorBody.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on client errors (4xx)
        if (lastError.message.includes("HTTP 4")) {
          throw lastError;
        }

        // Log retry attempt
        if (attempt < this.config.maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.error(
            `[API Client] Attempt ${attempt} failed, retrying in ${delay}ms...`,
            lastError.message
          );
          await sleep(delay);
        }
      }
    }

    throw new Error(
      `Failed after ${this.config.maxRetries} retries: ${lastError?.message}`
    );
  }

  /**
   * Get the oldest pending task for Claude agent.
   * Returns null if no tasks are available.
   */
  async getPendingTask(): Promise<PendingTask | null> {
    const url = `${this.config.baseUrl}/api/claude/tasks/pending`;
    return this.fetchWithRetry<PendingTask>(url);
  }

  /**
   * Mark a task as completed with the result summary.
   */
  async completeTask(
    taskId: number,
    result: string,
    sessionId?: string
  ): Promise<CompleteTaskResponse> {
    const url = `${this.config.baseUrl}/api/claude/tasks/${taskId}/complete`;

    const body: CompleteTaskRequest = {
      result,
      ...(sessionId && { sessionId }),
    };

    const response = await this.fetchWithRetry<CompleteTaskResponse>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response) {
      throw new Error("Unexpected empty response from complete task endpoint");
    }

    return response;
  }
}
