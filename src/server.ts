import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import tool handlers
import { checkServiceAreaTool } from "./tools/check-service-area.js";
import { diagnoseIssueTool } from "./tools/diagnose-issue.js";
import { getPromotionsTool } from "./tools/get-promotions.js";
import { createServiceRequestTool } from "./tools/create-service-request.js";
import { getAvailabilityTool } from "./tools/get-availability.js";
import { getDoorStylesTool } from "./tools/get-door-styles.js";

dotenv.config();

// Create MCP server
const server = new Server(
  {
    name: "aplus-garage-door",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// All available tools
const tools = [
  checkServiceAreaTool,
  diagnoseIssueTool,
  getPromotionsTool,
  createServiceRequestTool,
  getAvailabilityTool,
  getDoorStylesTool,
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.metadata.description,
      inputSchema: tool.metadata.inputSchema,
    })),
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = tools.find((t) => t.name === request.params.name);

  if (!tool) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  try {
    const result = await tool.handler(request.params.arguments as any);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.structuredContent),
        },
      ],
      _meta: tool.metadata._meta,
    };
  } catch (error) {
    throw new Error(
      `Tool execution failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});

// Start MCP server (for stdio transport when used as CLI tool)
async function startMCPServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("A Plus Garage Door MCP Server running on stdio");
}

// HTTP server for hosting widgets and providing HTTP endpoint
function startHTTPServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // Serve static widget files
  app.use("/widgets", express.static("dist/widgets"));

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      version: "1.0.0",
      tools: tools.map((t) => t.name),
    });
  });

  // Test endpoint for tool execution (development only)
  app.post("/test-tool", async (req, res) => {
    try {
      const { tool: toolName, params } = req.body;
      const tool = tools.find((t) => t.name === toolName);

      if (!tool) {
        return res.status(404).json({ error: `Tool '${toolName}' not found` });
      }

      const result = await tool.handler(params);
      res.json(result.structuredContent);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // MCP endpoint for HTTP-based connections
  app.post("/mcp", async (req, res) => {
    try {
      // This would handle MCP protocol over HTTP
      // For now, return basic info
      res.json({
        message: "MCP server - use stdio transport for tool execution",
        tools: tools.map((t) => t.name),
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.listen(PORT, () => {
    console.log(`HTTP server running on http://localhost:${PORT}`);
    console.log(`Widgets available at http://localhost:${PORT}/widgets/`);
  });
}

// Start both servers
if (process.env.NODE_ENV === "development") {
  startHTTPServer();
} else {
  startMCPServer();
}
