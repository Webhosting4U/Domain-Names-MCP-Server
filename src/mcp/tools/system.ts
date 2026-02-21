import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Env } from "../../types.js";
import { sessionTokenSchema } from "../../validation/schemas.js";
import { withSession, formatToolError } from "./helpers.js";

export function registerSystemTools(
  server: McpServer,
  env: Env,
  ctx: ExecutionContext,
): void {
  server.tool(
    "system_version",
    "Get the upstream DomainsReseller API version. Useful for health checks.",
    {
      session_token: sessionTokenSchema,
    },
    async ({ session_token }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "system_version", undefined, async () => ({
          method: "GET",
          path: "/version",
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );
}
