import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Env } from "../../types.js";
import { createSession, deleteSession } from "../../storage/kv.js";
import { callUpstream } from "../../upstream/client.js";
import { writeAuditLog, hashSessionToken } from "../../storage/audit.js";
import { authInvalid, formatToolError } from "../../errors/index.js";
import { sessionTokenSchema } from "../../validation/schemas.js";

export function registerAuthTools(
  server: McpServer,
  env: Env,
  ctx: ExecutionContext,
): void {
  server.tool(
    "auth_login",
    "Authenticate with the DomainsReseller API. Validates credentials against upstream and returns an opaque session token for all subsequent tool calls. Never share your API key again after login.",
    {
      email: z.string().email().describe("Your reseller account email"),
      api_key: z.string().min(16).describe("Your DomainsReseller API key"),
    },
    async ({ email, api_key }) => {
      try {
        const response = await callUpstream(env, {
          method: "GET",
          path: "/version",
          email,
          apiKey: api_key,
        });

        if (response.status >= 400) {
          let msg = "Invalid email or API key.";
          if (response.body && typeof response.body === "object" && "error" in response.body) {
            const errStr = String((response.body as Record<string, unknown>).error);
            if (/whitelist|Your IP is/i.test(errStr)) {
              const ipMatch = errStr.match(/[\d.:a-f]+:[\d.:a-f]+|(\d{1,3}\.){3}\d{1,3}/i);
              const ip = ipMatch ? ipMatch[0] : "unknown";
              msg = `Upstream IP whitelist rejection (Worker IP: ${ip}). Add this IP to your DomainsReseller API whitelist.`;
            } else {
              msg = "Upstream authentication failed. Check your email and API key.";
            }
          }
          throw authInvalid(msg);
        }

        const token = await createSession(env, email, api_key);

        const sessionHash = await hashSessionToken(token);
        ctx.waitUntil(
          writeAuditLog(env, {
            toolName: "auth_login",
            upstreamEndpoint: "/version",
            upstreamMethod: "GET",
            upstreamStatus: response.status,
            latencyMs: response.latencyMs,
            sessionHash,
          }),
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                session_token: token,
                expires_in_seconds: parseInt(env.SESSION_TTL_SECONDS, 10) || 43200,
                message: "Authentication successful. Use this session_token in all subsequent tool calls.",
              }),
            },
          ],
        };
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "auth_logout",
    "Revoke an active session. Deletes the session from the server, invalidating the session token immediately.",
    {
      session_token: sessionTokenSchema.describe("The session token to revoke"),
    },
    async ({ session_token }) => {
      try {
        await deleteSession(env, session_token);

        const sessionHash = await hashSessionToken(session_token);
        ctx.waitUntil(
          writeAuditLog(env, {
            toolName: "auth_logout",
            sessionHash,
          }),
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ message: "Session revoked successfully." }),
            },
          ],
        };
      } catch (err) {
        return formatToolError(err);
      }
    },
  );
}
