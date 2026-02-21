<div align="center">

<a href="https://webhosting4u.gr">
  <img src="https://webhosting4u.gr/assets/img/wh4u-LogoDark.webp" alt="Webhosting4U" width="280">
</a>

<br><br>

# DomainsReseller MCP Server

**Register, transfer, and manage domain names from your IDE using natural language**

**Designed for the [Webhosting4U](https://webhosting4u.gr) domain registrar**

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![MCP Protocol](https://img.shields.io/badge/MCP-Streamable_HTTP-5A67D8)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-22C55E)](LICENSE)

A production-ready [Model Context Protocol](https://modelcontextprotocol.io/) server for managing domain names -- registrations, transfers, renewals, DNS, nameservers, contacts, and more -- through **32 MCP tools** accessible via natural language from any MCP-compatible IDE.

Provided by [Webhosting4U](https://webhosting4u.gr)

**[English](#what-is-this)** | **[Ελληνικα](README.gr.md)**

---

</div>

## What Is This?

This is an **MCP server** built for the **[Webhosting4U](https://webhosting4u.gr) domain registrar**. It gives your AI coding assistant (in VS Code, or any other MCP-compatible IDE) the ability to manage domain names on your behalf through the Webhosting4U DomainsReseller API. Instead of logging into a web panel, you just type what you want in natural language:

> "Is example.com available?"

> "Register mydomain.io for 2 years"

> "Show me the DNS records for mysite.gr"

The AI calls the right tool automatically. No manual API calls, no web forms -- just conversation.

### What Is MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is an open standard that lets AI assistants in IDEs connect to external tools and services. This server implements MCP so your IDE can talk to the domain registration API directly.

---

## Highlights

- **32 domain management tools** -- register, transfer, renew, DNS, nameservers, contacts, WHOIS, and more
- **Natural language interface** -- ask "Is example.com available?" and get an answer
- **Works with any MCP-compatible IDE** -- VS Code, and any editor that supports Streamable HTTP MCP
- **Secure by design** -- API keys encrypted at rest, session-based auth, rate limiting, zero data leakage
- **Globally distributed** -- runs on Cloudflare's edge network for low latency worldwide

---

## Prerequisites

To use this MCP server you need a **Domain Reseller account** and an **API key** from [Webhosting4U](https://webhosting4u.gr).

1. **Create an account** -- [Order a Domain Reseller package](https://webhosting4u.gr/customers/index.php?rp=/store/webhosting/domain-reseller). Orders are manually reviewed and activated.
2. **Get your API key** -- Once your account is activated, generate an API key from your reseller control panel.
3. **Add credits** -- Domain registrations, transfers, and renewals require available credits in your account. Top up your balance before placing orders.

---

## Quick Start

### Step 1 -- Connect Your IDE

Point your MCP client at the server endpoint:

```
https://mcp-domains.webhosting4u.gr/mcp
```

**Transport:** Streamable HTTP

<details>
<summary><strong>VS Code</strong> (1.99+)</summary>

1. Open VS Code Settings and enable `chat.mcp.enabled`
2. Create a file called `.vscode/mcp.json` in your project root
3. Paste the following configuration:

```json
{
  "servers": {
    "domains-reseller": {
      "type": "http",
      "url": "https://mcp-domains.webhosting4u.gr/mcp"
    }
  }
}
```

4. Restart VS Code

The "domains-reseller" server will now appear in your MCP servers list.

</details>

<details>
<summary><strong>Other MCP Clients</strong></summary>

Any client supporting Streamable HTTP transport can connect. Configure it with:

- **URL:** `https://mcp-domains.webhosting4u.gr/mcp`
- **Transport:** Streamable HTTP
- **Content-Type:** `application/json`
- **Accept:** `application/json, text/event-stream`

</details>

### Step 2 -- Log In

Once your IDE is connected, open the AI chat and type:

> Log me in to the domains reseller with email `your@email.com` and API key `YOUR_API_KEY`

Replace `your@email.com` with the email associated with your Webhosting4U reseller account, and `YOUR_API_KEY` with the API key from your control panel.

The server will:
1. Validate your credentials against the upstream API
2. Encrypt your API key and store it securely on the server
3. Return a **session token** valid for 12 hours

After login, your API key is never sent again. All tool calls use the session token.

### Step 3 -- Manage Domains

Just ask in plain language. The AI will pick the right tool automatically:

| What you say | What happens |
|---|---|
| *"Is example.com available?"* | Checks domain availability |
| *"Check DNS records for mydomain.gr"* | Gets DNS records |
| *"What TLDs do you support?"* | Lists available TLDs |
| *"How much does a .io domain cost?"* | Gets TLD pricing |
| *"Register coolstartup.io for 2 years"* | Registers the domain (requires credits) |
| *"Transfer mydomain.com with EPP code ABC123"* | Initiates domain transfer |
| *"What's my account balance?"* | Shows available credits |
| *"Log me out"* | Ends the session |

### Step 4 -- Log Out

When you're done, say:

> Log me out

This revokes your session immediately.

---

## Available Tools (32)

### Authentication

| Tool | Description |
|------|-------------|
| `auth_login` | Authenticate with email + API key, receive session token |
| `auth_logout` | Revoke session token |

### Domain Availability

| Tool | Description |
|------|-------------|
| `domains_lookup` | Check if a domain is available across one or more TLDs |
| `domains_lookup_suggestions` | Get alternative domain name suggestions |

### Domain Management

| Tool | Description |
|------|-------------|
| `domains_information_get` | Get detailed domain information (expiry, status, etc.) |
| `domains_contact_get` | Get WHOIS contact details |
| `domains_contact_save` | Update WHOIS contact details |
| `domains_nameservers_get` | Get nameservers for a domain |
| `domains_nameservers_save` | Update nameservers |
| `domains_nameservers_register` | Register a child/glue nameserver |
| `domains_nameservers_modify` | Change a child nameserver's IP |
| `domains_nameservers_delete` | Delete a child nameserver |
| `domains_dns_get` | Get DNS records |
| `domains_dns_save` | Update DNS records |
| `domains_lock_get` | Check registrar lock status |
| `domains_lock_save` | Lock or unlock a domain |
| `domains_eppcode_get` | Get EPP/auth code for domain transfer |
| `domains_email_get` | Get email forwarding settings |
| `domains_email_save` | Update email forwarding |
| `domains_protectid_toggle` | Enable or disable WHOIS ID protection |
| `domains_release` | Release domain to another registrar |
| `domains_delete` | Request domain deletion |
| `domains_sync` | Sync domain status with registry |
| `domains_transfersync` | Sync transfer status |

### Orders & Pricing

| Tool | Description |
|------|-------------|
| `order_domains_register` | Register a new domain (requires credits) |
| `order_domains_transfer` | Transfer a domain to your account (requires credits) |
| `order_domains_renew` | Renew an existing domain (requires credits) |
| `order_pricing_domains_get` | Get pricing for registration, transfer, or renewal |

### Billing & System

| Tool | Description |
|------|-------------|
| `billing_credits_get` | Check your account credit balance |
| `system_version` | Get API version (useful as a health check) |
| `tlds_list` | List all available TLDs |
| `tlds_pricing_get` | Get pricing for all available TLDs |

---

## Architecture

```
+-------------------------+
|   IDE (MCP Client)      |
+------------+------------+
             |
             |  Streamable HTTP (MCP)
             v
+------------+------------+     +----------------------------+
|   Cloudflare Worker     +---->|  Workers KV                |
|                         |     |  (encrypted sessions)      |
|   - Auth + validation   |     +----------------------------+
|   - Tool routing        |
|   - Error handling      +---->+----------------------------+
|                         |     |  Durable Objects           |
+------------+------------+     |  (per-session rate limits) |
             |                  +----------------------------+
             |
             |  HTTPS + HMAC-SHA256    +----------------------------+
             +------------------------>|  D1 Database               |
             |                         |  (audit logs, no PII)      |
             v                         +----------------------------+
+------------+------------+
|  WHMCS DomainsReseller  |
|  API (upstream)         |
+-------------------------+
```

- API keys encrypted at rest with AES-256-GCM
- Per-session rate limiting via Durable Objects
- PII-minimized audit logging
- Fixed upstream URL (no SSRF possible)
- Zod schema validation on every input

---

<div align="center">

<a href="https://webhosting4u.gr">webhosting4u.gr</a>

Built with [Cloudflare Workers](https://workers.cloudflare.com/) and [MCP](https://modelcontextprotocol.io/)

AGPL-3.0 License

</div>
