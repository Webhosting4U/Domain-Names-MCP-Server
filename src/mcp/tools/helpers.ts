import type { Env, RateLimitCategory, UpstreamResponse } from "../../types.js";
import { getSession } from "../../storage/kv.js";
import { callUpstream } from "../../upstream/client.js";
import { writeAuditLog, hashSessionToken } from "../../storage/audit.js";
import {
  authRequired,
  authInvalid,
  rateLimited,
  upstreamError,
  formatToolError,
} from "../../errors/index.js";

interface AuthenticatedContext {
  email: string;
  apiKey: string;
  sessionToken: string;
}

export async function withSession(
  env: Env,
  ctx: ExecutionContext,
  sessionToken: string | undefined,
  category: RateLimitCategory,
  toolName: string,
  domain: string | undefined,
  fn: (authCtx: AuthenticatedContext) => Promise<UpstreamCallParams>,
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: true }> {
  if (!sessionToken) {
    throw authRequired();
  }

  const session = await getSession(env, sessionToken);
  if (!session) {
    throw authInvalid();
  }

  await checkRateLimit(env, sessionToken, category);

  const authCtx: AuthenticatedContext = {
    email: session.email,
    apiKey: session.apiKey,
    sessionToken,
  };

  const params = await fn(authCtx);
  const response = await callUpstream(env, {
    method: params.method,
    path: params.path,
    params: params.queryParams,
    body: params.bodyParams,
    email: session.email,
    apiKey: session.apiKey,
  });

  const sessionHash = await hashSessionToken(sessionToken);
  ctx.waitUntil(
    writeAuditLog(env, {
      toolName,
      upstreamEndpoint: params.path,
      upstreamMethod: params.method,
      upstreamStatus: response.status,
      latencyMs: response.latencyMs,
      sessionHash,
      domain,
      errorCode: response.status >= 400 ? `HTTP_${response.status}` : undefined,
    }),
  );

  if (response.status >= 400) {
    let msg: string;
    if (typeof response.body === "object" && response.body !== null && "message" in response.body) {
      msg = String((response.body as Record<string, unknown>).message);
    } else if (response.body !== null && response.body !== undefined) {
      const bodyStr = typeof response.body === "string" ? response.body : JSON.stringify(response.body);
      msg = bodyStr && bodyStr !== "[]" && bodyStr !== "{}"
        ? `Upstream returned status ${response.status}: ${bodyStr}`
        : `Upstream returned status ${response.status}`;
    } else {
      msg = `Upstream returned status ${response.status}`;
    }
    throw upstreamError(msg, response.status);
  }

  return {
    content: [{ type: "text", text: JSON.stringify(response.body, null, 2) }],
  };
}

export interface UpstreamCallParams {
  method: "GET" | "POST";
  path: string;
  queryParams?: Record<string, string>;
  bodyParams?: Record<string, unknown>;
}

async function checkRateLimit(
  env: Env,
  sessionToken: string,
  category: RateLimitCategory,
): Promise<void> {
  const windowMs = (parseInt(env.RATE_LIMIT_WINDOW_SECONDS, 10) || 60) * 1000;

  let limit: number;
  switch (category) {
    case "lookup":
      limit = parseInt(env.RATE_LIMIT_LOOKUP, 10) || 10;
      break;
    case "register":
      limit = parseInt(env.RATE_LIMIT_REGISTER, 10) || 5;
      break;
    case "general":
      limit = parseInt(env.RATE_LIMIT_GENERAL, 10) || 60;
      break;
  }

  const sessionHash = await hashSessionToken(sessionToken);
  const id = env.RATE_LIMITER.idFromName(sessionHash);
  const stub = env.RATE_LIMITER.get(id);

  const response = await stub.fetch("https://rate-limiter/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, limit, windowMs }),
  });

  const result = (await response.json()) as { allowed: boolean; retryAfter?: number };
  if (!result.allowed) {
    throw rateLimited(result.retryAfter ?? 60);
  }
}

export { formatToolError };
