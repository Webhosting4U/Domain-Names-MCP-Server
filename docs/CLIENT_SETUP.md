# Client Setup Guide

## Prerequisites

To use this MCP server you need a **Domain Reseller account** and an **API key** from [Webhosting4U](https://webhosting4u.gr).

1. **Create an account** -- [Order a Domain Reseller package](https://webhosting4u.gr/customers/index.php?rp=/store/webhosting/domain-reseller). Orders are manually reviewed and activated.
2. **Get your API key** -- Once your account is activated, generate an API key from your reseller control panel.
3. **Add credits** -- Domain registrations, transfers, and renewals require available credits in your account. Top up your balance before placing orders.

## Connecting to the MCP Server

### Server Endpoint

```
https://mcp-domains.webhosting4u.gr/mcp
```

Transport: **Streamable HTTP**

### VS Code (1.99+)

1. Open VS Code Settings and enable `chat.mcp.enabled`
2. Create `.vscode/mcp.json` in your project root:

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

3. Restart VS Code -- the "domains-reseller" server will appear in your MCP servers list

### Other MCP Clients

Any client supporting Streamable HTTP transport can connect. Configure it with:

- **URL:** `https://mcp-domains.webhosting4u.gr/mcp`
- **Transport:** Streamable HTTP
- **Content-Type:** `application/json`
- **Accept:** `application/json, text/event-stream`

## Usage

### Step 1 -- Log in

In your IDE's AI chat, type:

> Log me in to the domains reseller with email `your@email.com` and API key `YOUR_API_KEY`

Or call the tool directly:

```
auth_login(email: "your@email.com", api_key: "your-api-key")
```

This returns a `session_token` valid for 12 hours. Your API key is encrypted on the server and never sent again.

### Step 2 -- Use domain tools

All tool calls require the `session_token`. In natural language mode, the AI handles this automatically. For direct tool calls:

```
domains_lookup(session_token: "...", searchTerm: "example", tldsToInclude: ["com", "net"])
billing_credits_get(session_token: "...")
tlds_list(session_token: "...")
order_domains_register(session_token: "...", domain: "example.com", regperiod: "1", ...)
```

### Step 3 -- Log out when done

```
auth_logout(session_token: "...")
```

Or simply say "Log me out" in the AI chat.

## Available Tools (32 total)

### Authentication
- `auth_login` -- Authenticate with email + API key, receive session token
- `auth_logout` -- Revoke session token

### Domain Availability
- `domains_lookup` -- Check if a domain is available across one or more TLDs
- `domains_lookup_suggestions` -- Get alternative domain name suggestions

### Domain Management
- `domains_information_get` -- Domain details (expiry, status, etc.)
- `domains_contact_get` / `domains_contact_save` -- WHOIS contacts
- `domains_nameservers_get` / `domains_nameservers_save` -- Nameservers
- `domains_nameservers_register` / `domains_nameservers_modify` / `domains_nameservers_delete` -- Child/glue nameservers
- `domains_dns_get` / `domains_dns_save` -- DNS records
- `domains_lock_get` / `domains_lock_save` -- Registrar lock
- `domains_eppcode_get` -- EPP/auth code for transfer
- `domains_email_get` / `domains_email_save` -- Email forwarding
- `domains_protectid_toggle` -- WHOIS ID protection
- `domains_release` -- Release domain to another registrar
- `domains_delete` -- Request domain deletion
- `domains_sync` / `domains_transfersync` -- Sync status with registry

### Orders & Pricing
- `order_domains_register` -- Register a new domain (requires credits)
- `order_domains_transfer` -- Transfer a domain (requires credits)
- `order_domains_renew` -- Renew a domain (requires credits)
- `order_pricing_domains_get` -- Get pricing for registration, transfer, or renewal

### Billing & System
- `billing_credits_get` -- Check account credit balance
- `system_version` -- API version / health check
- `tlds_list` -- List all available TLDs
- `tlds_pricing_get` -- TLD pricing
