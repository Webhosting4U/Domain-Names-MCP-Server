import { createMcpHandler } from "agents/mcp";
import { createServer } from "./mcp/server.js";
import type { Env } from "./types.js";
import { LLMS_TXT_CONTENT } from "./llms-txt.js";

export { RateLimiter } from "./storage/rate-limiter.js";

export default {
  fetch: async (
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> => {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/llms.txt") {
      return new Response(LLMS_TXT_CONTENT, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const server = createServer(env, ctx);
    const handler = createMcpHandler(server, {
      corsOptions: {
        origin: "*",
        methods: "GET, POST, DELETE, OPTIONS",
        headers: "Content-Type, mcp-session-id",
      },
    });
    return handler(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
