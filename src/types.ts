export interface Env {
  SESSIONS: KVNamespace;
  AUDIT_DB: D1Database;
  RATE_LIMITER: DurableObjectNamespace;

  UPSTREAM_BASE_URL: string;
  APIKEY_ENC_KEY: string;
  SESSION_TTL_SECONDS: string;

  RATE_LIMIT_LOOKUP: string;
  RATE_LIMIT_REGISTER: string;
  RATE_LIMIT_GENERAL: string;
  RATE_LIMIT_WINDOW_SECONDS: string;
}

export interface SessionData {
  email: string;
  encryptedApiKey: string;
  createdAt: number;
  expiresAt: number;
}

export interface ToolError {
  code:
    | "AUTH_REQUIRED"
    | "AUTH_INVALID"
    | "VALIDATION_ERROR"
    | "UPSTREAM_ERROR"
    | "RATE_LIMITED"
    | "INTERNAL_ERROR";
  message: string;
  details?: {
    upstreamStatus?: number;
    retryAfter?: number;
  };
}

export interface UpstreamResponse {
  status: number;
  body: unknown;
  latencyMs: number;
}

export type RateLimitCategory = "lookup" | "register" | "general";
