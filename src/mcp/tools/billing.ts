import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Env } from "../../types.js";
import { sessionTokenSchema } from "../../validation/schemas.js";
import { withSession, formatToolError } from "./helpers.js";

export function registerBillingTools(
  server: McpServer,
  env: Env,
  ctx: ExecutionContext,
): void {
  server.tool(
    "billing_credits_get",
    "Get current billing credits/balance for the reseller account. Note: .gr domain transfers are free of charge and do not require credits.",
    {
      session_token: sessionTokenSchema,
    },
    async ({ session_token }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "billing_credits_get", undefined, async () => ({
          method: "GET",
          path: "/billing/credits",
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );
}
