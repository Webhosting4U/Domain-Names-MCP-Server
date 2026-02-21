import type { ToolError } from "../types.js";

export class McpToolError extends Error {
  public readonly toolError: ToolError;

  constructor(error: ToolError) {
    super(error.message);
    this.name = "McpToolError";
    this.toolError = error;
  }
}

export function authRequired(message = "Authentication required. Call auth_login first."): McpToolError {
  return new McpToolError({ code: "AUTH_REQUIRED", message });
}

export function authInvalid(message = "Invalid or expired session."): McpToolError {
  return new McpToolError({ code: "AUTH_INVALID", message });
}

export function validationError(message: string): McpToolError {
  return new McpToolError({ code: "VALIDATION_ERROR", message });
}

export function upstreamError(message: string, upstreamStatus?: number): McpToolError {
  return new McpToolError({
    code: "UPSTREAM_ERROR",
    message: sanitizeMessage(message),
    details: upstreamStatus ? { upstreamStatus } : undefined,
  });
}

export function rateLimited(retryAfter: number): McpToolError {
  return new McpToolError({
    code: "RATE_LIMITED",
    message: `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
    details: { retryAfter },
  });
}

export function internalError(message = "An internal error occurred."): McpToolError {
  return new McpToolError({ code: "INTERNAL_ERROR", message: sanitizeMessage(message) });
}

function sanitizeMessage(msg: string): string {
  return msg
    .replace(/api[_-]?key[=:]\s*\S+/gi, "api_key=[REDACTED]")
    .replace(/token[=:]\s*\S+/gi, "token=[REDACTED]")
    .replace(/password[=:]\s*\S+/gi, "password=[REDACTED]")
    .replace(/secret[=:]\s*\S+/gi, "secret=[REDACTED]");
}

export function formatToolError(err: unknown): { content: Array<{ type: "text"; text: string }>; isError: true } {
  if (err instanceof McpToolError) {
    return {
      content: [{ type: "text", text: JSON.stringify(err.toolError) }],
      isError: true,
    };
  }

  const message = err instanceof Error ? sanitizeMessage(err.message) : "An unexpected error occurred.";
  const toolErr: ToolError = { code: "INTERNAL_ERROR", message };

  return {
    content: [{ type: "text", text: JSON.stringify(toolErr) }],
    isError: true,
  };
}
