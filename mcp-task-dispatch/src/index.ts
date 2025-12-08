#!/usr/bin/env node

/**
 * MCP Server for Task Dispatch
 *
 * Provides tools for Claude Code to:
 * - Fetch pending tasks from VirtualAssistant
 * - Report task completion back to VirtualAssistant
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { VirtualAssistantApiClient } from "./api-client.js";
import type {
  GetPendingTaskResult,
  CompleteTaskResult,
  CompleteTaskParams,
} from "./types.js";

// Initialize API client
const apiClient = new VirtualAssistantApiClient();

// Create MCP server
const server = new Server(
  {
    name: "task-dispatch",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_pending_task",
        description:
          "Fetches the oldest pending task assigned to Claude from VirtualAssistant. " +
          "Returns task details including GitHub issue URL and summary. " +
          "Call this at session start or when ready for new work.",
        inputSchema: {
          type: "object" as const,
          properties: {},
          required: [],
        },
      },
      {
        name: "complete_task",
        description:
          "Marks a task as completed with a result summary. " +
          "Call this when you have finished working on a task fetched via get_pending_task.",
        inputSchema: {
          type: "object" as const,
          properties: {
            taskId: {
              type: "number",
              description: "The task ID returned from get_pending_task",
            },
            result: {
              type: "string",
              description: "Summary of what was accomplished",
            },
            sessionId: {
              type: "string",
              description: "Optional: Claude Code session ID for tracking",
            },
          },
          required: ["taskId", "result"],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get_pending_task": {
      const result = await handleGetPendingTask();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "complete_task": {
      const params = args as unknown as CompleteTaskParams;
      const result = await handleCompleteTask(params);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

/**
 * Handle get_pending_task tool
 */
async function handleGetPendingTask(): Promise<GetPendingTaskResult> {
  try {
    const task = await apiClient.getPendingTask();

    if (task === null) {
      return {
        success: true,
        task: null,
        message: "No pending tasks available",
      };
    }

    return {
      success: true,
      task,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[get_pending_task] Error:", message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Handle complete_task tool
 */
async function handleCompleteTask(
  params: CompleteTaskParams
): Promise<CompleteTaskResult> {
  // Validate input
  if (typeof params.taskId !== "number") {
    return {
      success: false,
      error: "taskId is required and must be a number",
    };
  }

  if (!params.result || typeof params.result !== "string") {
    return {
      success: false,
      error: "result is required and must be a non-empty string",
    };
  }

  try {
    const response = await apiClient.completeTask(
      params.taskId,
      params.result,
      params.sessionId
    );

    return {
      success: true,
      completedAt: response.completedAt,
      message: `Task ${params.taskId} marked as completed`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[complete_task] Error:", message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.error("[MCP Server] Shutting down...");
    await server.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.error("[MCP Server] Shutting down...");
    await server.close();
    process.exit(0);
  });

  console.error("[MCP Server] Starting task-dispatch server...");
  await server.connect(transport);
  console.error("[MCP Server] Server connected and ready");
}

main().catch((error) => {
  console.error("[MCP Server] Fatal error:", error);
  process.exit(1);
});
