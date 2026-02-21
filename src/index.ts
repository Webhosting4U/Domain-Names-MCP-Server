import { createMcpHandler } from "agents/mcp";
import { createServer } from "./mcp/server.js";
import type { Env } from "./types.js";

export { RateLimiter } from "./storage/rate-limiter.js";

export default {
  fetch: async (
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> => {
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
