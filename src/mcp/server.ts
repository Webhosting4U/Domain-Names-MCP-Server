import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Env } from "../types.js";
import { registerAuthTools } from "./tools/auth.js";
import { registerOrderTools } from "./tools/order.js";
import { registerDomainsTools } from "./tools/domains.js";
import { registerBillingTools } from "./tools/billing.js";
import { registerSystemTools } from "./tools/system.js";
import { registerTldsTools } from "./tools/tlds.js";

export function createServer(env: Env, ctx: ExecutionContext): McpServer {
  const server = new McpServer({
    name: "DomainsReseller MCP Server",
    version: "1.0.0",
  });

  registerAuthTools(server, env, ctx);
  registerOrderTools(server, env, ctx);
  registerDomainsTools(server, env, ctx);
  registerBillingTools(server, env, ctx);
  registerSystemTools(server, env, ctx);
  registerTldsTools(server, env, ctx);

  return server;
}
