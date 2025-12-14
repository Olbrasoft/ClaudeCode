#!/usr/bin/env node

/**
 * MCP Server for Notifications
 *
 * Provides a tool for Claude Code to send notifications to VirtualAssistant.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE_URL = process.env.VIRTUAL_ASSISTANT_URL || "http://localhost:5055";

interface NotifyParams {
  text: string;
}

interface NotificationResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Create MCP server
const server = new Server(
  {
    name: "mcp-notify",
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
        name: "notify",
        description:
          "Send a notification to VirtualAssistant database. " +
          "Use this to inform about your work progress: starting work, progress updates, or completion. " +
          "Write notifications in Czech language, be concise (1-2 sentences). " +
          "Include issue number if working on a specific issue.",
        inputSchema: {
          type: "object" as const,
          properties: {
            text: {
              type: "string",
              description: "Notification text in Czech (e.g., 'Zahajuji praci na issue #255')",
            },
          },
          required: ["text"],
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

  if (name === "notify") {
    const params = args as unknown as NotifyParams;
    const result = await handleNotify(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

/**
 * Send notification to VirtualAssistant API
 */
async function handleNotify(
  params: NotifyParams
): Promise<NotificationResult> {
  if (!params.text || typeof params.text !== "string" || params.text.trim() === "") {
    return {
      success: false,
      error: "text is required and must be a non-empty string",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: params.text.trim(),
        source: "claude-code",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `API error ${response.status}: ${errorText}`,
      };
    }

    return {
      success: true,
      message: "Notification sent successfully",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[notify] Error:", message);
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

  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await server.close();
    process.exit(0);
  });

  console.error("[MCP Server] Starting mcp-notify server...");
  await server.connect(transport);
  console.error("[MCP Server] Server connected and ready");
}

main().catch((error) => {
  console.error("[MCP Server] Fatal error:", error);
  process.exit(1);
});
