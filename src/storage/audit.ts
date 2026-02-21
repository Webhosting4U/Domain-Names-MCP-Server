import type { Env } from "../types.js";

interface AuditEntry {
  toolName: string;
  upstreamEndpoint?: string;
  upstreamMethod?: string;
  upstreamStatus?: number;
  latencyMs?: number;
  sessionHash: string;
  domain?: string;
  errorCode?: string;
}

export async function writeAuditLog(
  env: Env,
  entry: AuditEntry,
): Promise<void> {
  try {
    await env.AUDIT_DB.prepare(
      `INSERT INTO audit_log (tool_name, upstream_endpoint, upstream_method, upstream_status, latency_ms, session_hash, domain, error_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        entry.toolName,
        entry.upstreamEndpoint ?? null,
        entry.upstreamMethod ?? null,
        entry.upstreamStatus ?? null,
        entry.latencyMs ?? null,
        entry.sessionHash,
        entry.domain ?? null,
        entry.errorCode ?? null,
      )
      .run();
  } catch {
    // Audit logging is best-effort; never fail the request
  }
}

export async function hashSessionToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  let hex = "";
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, "0");
  }
  return hex.slice(0, 16);
}
