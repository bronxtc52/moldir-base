#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMoldirMcpServer } from "./mcp.js";

const server = createMoldirMcpServer();
const transport = new StdioServerTransport();

await server.connect(transport);

process.stderr.write("Moldir Base MCP server started over stdio.\n");
