import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Env } from "../../types.js";
import { sessionTokenSchema } from "../../validation/schemas.js";
import { withSession, formatToolError } from "./helpers.js";

export function registerTldsTools(
  server: McpServer,
  env: Env,
  ctx: ExecutionContext,
): void {
  server.tool(
    "tlds_list",
    "List all available TLDs (top-level domains) supported by the reseller.",
    {
      session_token: sessionTokenSchema,
    },
    async ({ session_token }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "tlds_list", undefined, async () => ({
          method: "GET",
          path: "/tlds",
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "tlds_pricing_get",
    "Get pricing for all available TLDs.",
    {
      session_token: sessionTokenSchema,
    },
    async ({ session_token }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "tlds_pricing_get", undefined, async () => ({
          method: "GET",
          path: "/tlds/pricing",
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );
}
