import type { RateLimitCategory } from "../types.js";

interface RateLimitEntry {
  timestamps: number[];
}

interface CheckLimitRequest {
  category: RateLimitCategory;
  limit: number;
  windowMs: number;
}

interface CheckLimitResponse {
  allowed: boolean;
  retryAfter?: number;
}

export class RateLimiter implements DurableObject {
  private state: DurableObjectState;
  private buckets: Map<string, RateLimitEntry> = new Map();

  constructor(state: DurableObjectState) {
    this.state = state;

    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<Record<string, RateLimitEntry>>("buckets");
      if (stored) {
        this.buckets = new Map(Object.entries(stored));
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);

    if (url.pathname === "/check") {
      const body = (await request.json()) as CheckLimitRequest;
      const result = this.checkLimit(body);
      await this.persist();
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/reset") {
      this.buckets.clear();
      await this.persist();
      return new Response("OK");
    }

    return new Response("Not found", { status: 404 });
  }

  private checkLimit(req: CheckLimitRequest): CheckLimitResponse {
    const now = Date.now();
    const cutoff = now - req.windowMs;

    let entry = this.buckets.get(req.category);
    if (!entry) {
      entry = { timestamps: [] };
      this.buckets.set(req.category, entry);
    }

    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

    if (entry.timestamps.length >= req.limit) {
      const oldest = entry.timestamps[0];
      const retryAfter = Math.ceil((oldest + req.windowMs - now) / 1000);
      return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
    }

    entry.timestamps.push(now);
    return { allowed: true };
  }

  private async persist(): Promise<void> {
    const obj: Record<string, RateLimitEntry> = {};
    for (const [key, val] of this.buckets) {
      obj[key] = val;
    }
    await this.state.storage.put("buckets", obj);
  }
}
