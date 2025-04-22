#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "Google Maps",
  description: "Fetches relevant data using Google Maps services",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "get_nearby_places_by_coordinates",
  "Fetches nearby places by coordinates",
  {
    lat: z.string().describe("Latitude of the location"),
    lng: z.string().describe("Longitude of the location"),
  },
  async ({ lat, lng }) => {
    return {
      content: [
        {
          type: "text",
          text: `TEST: Nearby place coordinates: ${lat}, ${lng}`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Maps MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
