/**
 * Smoke test script for the DomainsReseller MCP Server.
 *
 * Usage:
 *   npx tsx test/smoke/smoke.ts <base_url> <email> <api_key>
 *
 * Example:
 *   npx tsx test/smoke/smoke.ts https://mcp-domains.webhosting4u.gr/mcp your@email.com YOUR_API_KEY
 */

const [, , baseUrl, email, apiKey] = process.argv;

if (!baseUrl || !email || !apiKey) {
  console.error("Usage: npx tsx test/smoke/smoke.ts <base_url> <email> <api_key>");
  process.exit(1);
}

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

let sessionId: string | undefined;
let requestId = 0;

async function initializeSession(): Promise<string> {
  const initReq: JsonRpcRequest = {
    jsonrpc: "2.0",
    id: ++requestId,
    method: "initialize",
    params: {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "smoke-test", version: "1.0.0" },
    },
  };

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(initReq),
  });

  sessionId = res.headers.get("mcp-session-id") || undefined;
  const body = await parseResponse(res);
  console.log("[INIT]", JSON.stringify(body, null, 2));

  if (body.error) throw new Error(`Initialize failed: ${body.error.message}`);
  return sessionId || "";
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const req: JsonRpcRequest = {
    jsonrpc: "2.0",
    id: ++requestId,
    method: "tools/call",
    params: { name, arguments: args },
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (sessionId) headers["mcp-session-id"] = sessionId;

  const res = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(req),
  });

  return parseResponse(res);
}

async function parseResponse(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/event-stream")) {
    const text = await res.text();
    const lines = text.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of lines) {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.result !== undefined || data.error !== undefined) {
          return data.result ?? data.error ?? data;
        }
      } catch {
        // skip non-JSON lines
      }
    }
    return { raw: text.slice(0, 500) };
  }

  return res.json();
}

async function run() {
  console.log("=== DomainsReseller MCP Server Smoke Test ===\n");
  console.log(`Target: ${baseUrl}\n`);

  console.log("1. Initializing MCP session...");
  await initializeSession();
  console.log(`   Session ID: ${sessionId}\n`);

  console.log("2. auth_login...");
  const loginResult = await callTool("auth_login", { email, api_key: apiKey });
  console.log("   Result:", JSON.stringify(loginResult, null, 2));

  let sessionToken: string | undefined;
  if (loginResult && typeof loginResult === "object" && "content" in loginResult) {
    const content = (loginResult as any).content;
    if (Array.isArray(content) && content.length > 0) {
      try {
        const parsed = JSON.parse(content[0].text);
        sessionToken = parsed.session_token;
      } catch {
        console.error("   Failed to parse login response");
      }
    }
  }

  if (!sessionToken) {
    console.error("   FAILED: No session token received");
    process.exit(1);
  }
  console.log(`   Session token: ${sessionToken.slice(0, 8)}...`);
  console.log();

  console.log("3. system_version...");
  const versionResult = await callTool("system_version", { session_token: sessionToken });
  console.log("   Result:", JSON.stringify(versionResult, null, 2));
  console.log();

  console.log("4. tlds_list...");
  const tldsResult = await callTool("tlds_list", { session_token: sessionToken });
  console.log("   Result (truncated):", JSON.stringify(tldsResult, null, 2).slice(0, 500));
  console.log();

  console.log("5. domains_lookup (example.com)...");
  const lookupResult = await callTool("domains_lookup", {
    session_token: sessionToken,
    sld: "example",
    tld: "com",
  });
  console.log("   Result:", JSON.stringify(lookupResult, null, 2));
  console.log();

  console.log("6. billing_credits_get...");
  const creditsResult = await callTool("billing_credits_get", { session_token: sessionToken });
  console.log("   Result:", JSON.stringify(creditsResult, null, 2));
  console.log();

  console.log("7. auth_logout...");
  const logoutResult = await callTool("auth_logout", { session_token: sessionToken });
  console.log("   Result:", JSON.stringify(logoutResult, null, 2));
  console.log();

  console.log("=== Smoke Test Complete ===");
}

run().catch((err) => {
  console.error("SMOKE TEST FAILED:", err);
  process.exit(1);
});
