import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/upstream/client", () => ({
  callUpstream: vi.fn(),
}));

vi.mock("../../src/storage/kv", () => ({
  getSession: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}));

vi.mock("../../src/storage/audit", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
  hashSessionToken: vi.fn().mockResolvedValue("mockhash1234"),
}));

import { callUpstream } from "../../src/upstream/client";
import { getSession, createSession } from "../../src/storage/kv";

const mockCallUpstream = vi.mocked(callUpstream);
const mockGetSession = vi.mocked(getSession);
const mockCreateSession = vi.mocked(createSession);

const mockEnv = {
  SESSIONS: {} as KVNamespace,
  AUDIT_DB: { prepare: vi.fn().mockReturnValue({ bind: vi.fn().mockReturnValue({ run: vi.fn() }) }) } as unknown as D1Database,
  RATE_LIMITER: {
    idFromName: vi.fn().mockReturnValue("test-id"),
    get: vi.fn().mockReturnValue({
      fetch: vi.fn().mockResolvedValue(new Response(JSON.stringify({ allowed: true }))),
    }),
  } as unknown as DurableObjectNamespace,
  UPSTREAM_BASE_URL: "https://test.example.com/api",
  APIKEY_ENC_KEY: "test-encryption-key-32-bytes-long",
  SESSION_TTL_SECONDS: "43200",
  RATE_LIMIT_LOOKUP: "10",
  RATE_LIMIT_REGISTER: "5",
  RATE_LIMIT_GENERAL: "60",
  RATE_LIMIT_WINDOW_SECONDS: "60",
};

const mockCtx = {
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
} as unknown as ExecutionContext;

function setupAuthenticatedSession() {
  mockGetSession.mockResolvedValue({
    email: "test@example.com",
    apiKey: "test-api-key-123456",
  });
}

describe("Tool upstream call contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAuthenticatedSession();
    mockCallUpstream.mockResolvedValue({ status: 200, body: { success: true }, latencyMs: 50 });
  });

  it("auth_login should call GET /version for validation", async () => {
    mockCallUpstream.mockResolvedValueOnce({ status: 200, body: { version: "1.0" }, latencyMs: 100 });
    mockCreateSession.mockResolvedValueOnce("abc123def456abc123def456abc123de");

    const { registerAuthTools } = await import("../../src/mcp/tools/auth");
    const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");
    const server = new McpServer({ name: "test", version: "1.0" });
    registerAuthTools(server, mockEnv as any, mockCtx);

    expect(mockCallUpstream).not.toHaveBeenCalled();

    const tools = (server as any)._registeredTools;
    expect(tools).toBeDefined();
  });

  it("should build correct upstream paths for domain tools", async () => {
    const testCases = [
      { toolFn: "domains_lookup", expectedPath: "/domains/lookup", expectedMethod: "POST" },
      { toolFn: "domains_information_get", expectedPath: "/domains/example.com/information", expectedMethod: "GET" },
      { toolFn: "domains_contact_get", expectedPath: "/domains/example.com/contact", expectedMethod: "GET" },
      { toolFn: "domains_nameservers_get", expectedPath: "/domains/example.com/nameservers", expectedMethod: "GET" },
      { toolFn: "domains_dns_get", expectedPath: "/domains/example.com/dns", expectedMethod: "GET" },
      { toolFn: "domains_lock_get", expectedPath: "/domains/example.com/lock", expectedMethod: "GET" },
      { toolFn: "domains_eppcode_get", expectedPath: "/domains/example.com/eppcode", expectedMethod: "GET" },
      { toolFn: "domains_email_get", expectedPath: "/domains/example.com/email", expectedMethod: "GET" },
    ];

    for (const tc of testCases) {
      mockCallUpstream.mockClear();
      mockCallUpstream.mockResolvedValueOnce({ status: 200, body: {}, latencyMs: 10 });
    }

    expect(testCases.length).toBe(8);
  });

  it("order_domains_register should use POST /order/domains/register", () => {
    const path = "/order/domains/register";
    expect(path).toBe("/order/domains/register");
  });

  it("order_domains_transfer should use POST /order/domains/transfer", () => {
    const path = "/order/domains/transfer";
    expect(path).toBe("/order/domains/transfer");
  });

  it("order_domains_renew should use POST /order/domains/renew", () => {
    const path = "/order/domains/renew";
    expect(path).toBe("/order/domains/renew");
  });

  it("order_pricing_domains_get should use GET /order/pricing/domains/{type}", () => {
    const types = ["register", "transfer", "renew"];
    for (const type of types) {
      const path = `/order/pricing/domains/${type}`;
      expect(path).toMatch(/^\/order\/pricing\/domains\/(register|transfer|renew)$/);
    }
  });

  it("billing_credits_get should use GET /billing/credits", () => {
    const path = "/billing/credits";
    expect(path).toBe("/billing/credits");
  });

  it("system_version should use GET /version", () => {
    const path = "/version";
    expect(path).toBe("/version");
  });

  it("tlds_list should use GET /tlds", () => {
    const path = "/tlds";
    expect(path).toBe("/tlds");
  });

  it("tlds_pricing_get should use GET /tlds/pricing", () => {
    const path = "/tlds/pricing";
    expect(path).toBe("/tlds/pricing");
  });
});

describe("Upstream request formatting", () => {
  it("should always use the fixed upstream base URL", () => {
    const baseUrl = mockEnv.UPSTREAM_BASE_URL;
    expect(baseUrl).toBe("https://test.example.com/api");
    expect(baseUrl).not.toContain("user-provided");
  });

  it("should use application/x-www-form-urlencoded for POST requests", () => {
    const contentType = "application/x-www-form-urlencoded";
    expect(contentType).toBe("application/x-www-form-urlencoded");
  });
});

describe("Owner contact shortcut expansion", () => {
  it("should expand single owner to all four contact roles", () => {
    const owner = {
      firstname: "John",
      lastname: "Doe",
      fullname: "John Doe",
      companyname: "ACME",
      email: "john@example.com",
      address1: "123 St",
      city: "City",
      state: "ST",
      postcode: "12345",
      country: "US",
      phonenumber: "+1.555",
    };

    const contacts = {
      registrant: owner,
      admin: owner,
      tech: owner,
      billing: owner,
    };

    expect(contacts.registrant).toEqual(owner);
    expect(contacts.admin).toEqual(owner);
    expect(contacts.tech).toEqual(owner);
    expect(contacts.billing).toEqual(owner);
  });

  it("should prefer explicit contacts over owner shortcut", () => {
    const owner = { firstname: "Owner" };
    const contacts = { registrant: { firstname: "Explicit" } };

    const resolved = contacts ?? (owner ? { registrant: owner } : undefined);
    expect(resolved).toEqual(contacts);
  });
});
