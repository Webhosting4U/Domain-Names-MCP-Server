import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Env } from "../../types.js";
import {
  domainSchema,
  sessionTokenSchema,
  contactDetailsSchema,
  dnsRecordsArraySchema,
  nameserversSchema,
  childNameserverSchema,
  childNameserverModifySchema,
  childNameserverDeleteSchema,
  domainLookupSchema,
  domainLookupSuggestionsSchema,
  emailForwardingSchema,
  domainLockSchema,
  domainReleaseSchema,
} from "../../validation/schemas.js";
import { withSession, formatToolError } from "./helpers.js";

export function registerDomainsTools(
  server: McpServer,
  env: Env,
  ctx: ExecutionContext,
): void {
  server.tool(
    "domains_lookup",
    "Check domain availability. Provide a search term and array of TLDs to check.",
    {
      session_token: sessionTokenSchema,
      searchTerm: domainLookupSchema.shape.searchTerm,
      tldsToInclude: domainLookupSchema.shape.tldsToInclude,
      punyCodeSearchTerm: domainLookupSchema.shape.punyCodeSearchTerm,
      isIdnDomain: domainLookupSchema.shape.isIdnDomain,
      premiumEnabled: domainLookupSchema.shape.premiumEnabled,
    },
    async ({ session_token, searchTerm, tldsToInclude, punyCodeSearchTerm, isIdnDomain, premiumEnabled }) => {
      try {
        const domain = `${searchTerm}.${tldsToInclude[0]}`;
        return await withSession(env, ctx, session_token, "lookup", "domains_lookup", domain, async () => {
          const bodyParams: Record<string, unknown> = { searchTerm, tldsToInclude };
          if (punyCodeSearchTerm) bodyParams.punyCodeSearchTerm = punyCodeSearchTerm;
          if (isIdnDomain !== undefined) bodyParams.isIdnDomain = isIdnDomain;
          if (premiumEnabled !== undefined) bodyParams.premiumEnabled = premiumEnabled;
          return { method: "POST", path: "/domains/lookup", bodyParams };
        });
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_lookup_suggestions",
    "Get domain name suggestions based on a search term.",
    {
      session_token: sessionTokenSchema,
      searchTerm: domainLookupSuggestionsSchema.shape.searchTerm,
      tldsToInclude: domainLookupSuggestionsSchema.shape.tldsToInclude,
      punyCodeSearchTerm: domainLookupSuggestionsSchema.shape.punyCodeSearchTerm,
      isIdnDomain: domainLookupSuggestionsSchema.shape.isIdnDomain,
      premiumEnabled: domainLookupSuggestionsSchema.shape.premiumEnabled,
      suggestionSettings: domainLookupSuggestionsSchema.shape.suggestionSettings,
    },
    async ({ session_token, searchTerm, tldsToInclude, punyCodeSearchTerm, isIdnDomain, premiumEnabled, suggestionSettings }) => {
      try {
        return await withSession(env, ctx, session_token, "lookup", "domains_lookup_suggestions", undefined, async () => {
          const bodyParams: Record<string, unknown> = { searchTerm };
          if (tldsToInclude) bodyParams.tldsToInclude = tldsToInclude;
          if (punyCodeSearchTerm) bodyParams.punyCodeSearchTerm = punyCodeSearchTerm;
          if (isIdnDomain !== undefined) bodyParams.isIdnDomain = isIdnDomain;
          if (premiumEnabled !== undefined) bodyParams.premiumEnabled = premiumEnabled;
          if (suggestionSettings) bodyParams.suggestionSettings = suggestionSettings;
          return { method: "POST", path: "/domains/lookup/suggestions", bodyParams };
        });
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_information_get",
    "Get detailed information about a domain.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
    },
    async ({ session_token, domain }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_information_get", domain, async () => ({
          method: "GET",
          path: `/domains/${encodeURIComponent(domain)}/information`,
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_contact_get",
    "Get contact details (WHOIS) for a domain.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
    },
    async ({ session_token, domain }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_contact_get", domain, async () => ({
          method: "GET",
          path: `/domains/${encodeURIComponent(domain)}/contact`,
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_contact_save",
    "Update contact details for a domain. Requires Registrant, Admin, Technical, and Billing contacts.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      contactdetails: contactDetailsSchema,
    },
    async ({ session_token, domain, contactdetails }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_contact_save", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/contact`,
          bodyParams: { domain, contactdetails: contactdetails as unknown as Record<string, unknown> },
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_nameservers_get",
    "Get the nameservers configured for a domain.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
    },
    async ({ session_token, domain }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_nameservers_get", domain, async () => ({
          method: "GET",
          path: `/domains/${encodeURIComponent(domain)}/nameservers`,
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_nameservers_save",
    "Update nameservers for a domain. ns1 and ns2 are required; ns3-ns5 are optional.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      nameservers: nameserversSchema,
    },
    async ({ session_token, domain, nameservers }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_nameservers_save", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/nameservers`,
          bodyParams: {
            domain,
            ns1: nameservers.ns1,
            ns2: nameservers.ns2,
            ns3: nameservers.ns3 ?? "",
            ns4: nameservers.ns4 ?? "",
            ns5: nameservers.ns5 ?? "",
          } as Record<string, unknown>,
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_nameservers_register",
    "Register a child/glue nameserver for a domain.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      ...childNameserverSchema.shape,
    },
    async ({ session_token, domain, nameserver, ipaddress }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_nameservers_register", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/nameservers/register`,
          bodyParams: { domain, nameserver, ipaddress },
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_nameservers_modify",
    "Modify a child/glue nameserver IP address for a domain.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      ...childNameserverModifySchema.shape,
    },
    async ({ session_token, domain, nameserver, currentipaddress, newipaddress }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_nameservers_modify", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/nameservers/modify`,
          bodyParams: { domain, nameserver, currentipaddress, newipaddress },
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_nameservers_delete",
    "Delete a child/glue nameserver from a domain.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      ...childNameserverDeleteSchema.shape,
    },
    async ({ session_token, domain, nameserver }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_nameservers_delete", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/nameservers/delete`,
          bodyParams: { domain, nameserver },
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_dns_get",
    "Get DNS records for a domain.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
    },
    async ({ session_token, domain }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_dns_get", domain, async () => ({
          method: "GET",
          path: `/domains/${encodeURIComponent(domain)}/dns`,
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_dns_save",
    "Save/update DNS records for a domain. Provide an array of DNS records.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      records: dnsRecordsArraySchema,
    },
    async ({ session_token, domain, records }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_dns_save", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/dns`,
          bodyParams: { domain, dnsrecords: records as unknown as Record<string, unknown> },
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_lock_get",
    "Get the registrar lock status for a domain.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
    },
    async ({ session_token, domain }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_lock_get", domain, async () => ({
          method: "GET",
          path: `/domains/${encodeURIComponent(domain)}/lock`,
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_lock_save",
    "Set the registrar lock for a domain. Use 'locked' or 'unlocked'.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      lockstatus: domainLockSchema.shape.lockstatus,
    },
    async ({ session_token, domain, lockstatus }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_lock_save", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/lock`,
          bodyParams: { domain, lockstatus },
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_eppcode_get",
    "Get the EPP/authorization code for a domain (used for transfers).",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
    },
    async ({ session_token, domain }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_eppcode_get", domain, async () => ({
          method: "GET",
          path: `/domains/${encodeURIComponent(domain)}/eppcode`,
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_email_get",
    "Get email forwarding settings for a domain.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
    },
    async ({ session_token, domain }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_email_get", domain, async () => ({
          method: "GET",
          path: `/domains/${encodeURIComponent(domain)}/email`,
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_email_save",
    "Save email forwarding settings for a domain. Each prefix maps to its corresponding forwardto entry by index.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      prefix: emailForwardingSchema.shape.prefix,
      forwardto: emailForwardingSchema.shape.forwardto,
    },
    async ({ session_token, domain, prefix, forwardto }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_email_save", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/email`,
          bodyParams: { domain, prefix, forwardto } as unknown as Record<string, unknown>,
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_release",
    "Release a domain to a new registrar tag.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      transfertag: domainReleaseSchema.shape.transfertag,
    },
    async ({ session_token, domain, transfertag }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_release", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/release`,
          bodyParams: { domain, transfertag },
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_delete",
    "Delete/cancel a domain registration.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
    },
    async ({ session_token, domain }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_delete", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/delete`,
          bodyParams: { domain },
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_sync",
    "Sync domain status and expiry with the upstream registry.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
    },
    async ({ session_token, domain }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_sync", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/sync`,
          bodyParams: { domain },
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_transfersync",
    "Sync the transfer status of a domain.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
    },
    async ({ session_token, domain }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_transfersync", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/transfersync`,
          bodyParams: { domain },
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "domains_protectid_toggle",
    "Toggle WHOIS ID protection for a domain. 1 = enable, 0 = disable.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      status: z.number().int().min(0).max(1).describe("1 to enable ID protection, 0 to disable"),
    },
    async ({ session_token, domain, status }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "domains_protectid_toggle", domain, async () => ({
          method: "POST",
          path: `/domains/${encodeURIComponent(domain)}/protectid`,
          bodyParams: { domain, status: String(status) },
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );
}
