import { generateUpstreamToken, isNearHourBoundary } from "./token.js";
import { upstreamError } from "../errors/index.js";
import type { Env, UpstreamResponse } from "../types.js";

const REQUEST_TIMEOUT_MS = 15_000;

interface UpstreamRequestOptions {
  method: "GET" | "POST";
  path: string;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
  email: string;
  apiKey: string;
}

export async function callUpstream(
  env: Env,
  opts: UpstreamRequestOptions,
): Promise<UpstreamResponse> {
  const baseUrl = env.UPSTREAM_BASE_URL;
  if (!baseUrl) {
    throw upstreamError("Upstream base URL not configured.");
  }

  const result = await attemptUpstreamCall(baseUrl, opts);

  if (
    (result.status === 401 || result.status === 403) &&
    isNearHourBoundary()
  ) {
    const retryDate = new Date();
    if (retryDate.getUTCMinutes() >= 58) {
      retryDate.setUTCHours(retryDate.getUTCHours() + 1, 0, 0, 0);
    } else {
      retryDate.setUTCMinutes(0, 0, 0);
    }
    return attemptUpstreamCall(baseUrl, opts, retryDate);
  }

  return result;
}

async function attemptUpstreamCall(
  baseUrl: string,
  opts: UpstreamRequestOptions,
  tokenDate?: Date,
): Promise<UpstreamResponse> {
  const token = await generateUpstreamToken(opts.apiKey, opts.email, tokenDate);

  const headers: Record<string, string> = {
    username: opts.email,
    token,
  };

  let url = `${baseUrl}${opts.path}`;
  const init: RequestInit = { method: opts.method, headers };

  if (opts.method === "GET" && opts.params) {
    const qs = new URLSearchParams(opts.params).toString();
    if (qs) url += `?${qs}`;
  }

  if (opts.method === "POST" && opts.body) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    init.body = buildFormBody(opts.body);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  init.signal = controller.signal;

  const start = Date.now();
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw upstreamError("Upstream request timed out.");
    }
    throw upstreamError("Failed to connect to upstream API.");
  } finally {
    clearTimeout(timeout);
  }

  const latencyMs = Date.now() - start;
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    body = await response.text().catch(() => null);
  }

  return { status: response.status, body, latencyMs };
}

/**
 * Builds a URL-encoded form body, supporting nested objects with bracket notation.
 * Handles contacts[registrant][firstname] style nesting required by the upstream API.
 */
function buildFormBody(data: Record<string, unknown>, prefix = ""): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;

    if (value === null || value === undefined) continue;

    if (typeof value === "object" && !Array.isArray(value)) {
      parts.push(buildFormBody(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === "object") {
          parts.push(buildFormBody(value[i] as Record<string, unknown>, `${fullKey}[${i}]`));
        } else {
          parts.push(`${encodeURIComponent(`${fullKey}[${i}]`)}=${encodeURIComponent(String(value[i]))}`);
        }
      }
    } else {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
    }
  }

  return parts.filter(Boolean).join("&");
}
