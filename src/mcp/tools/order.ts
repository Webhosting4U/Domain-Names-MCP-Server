import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Env } from "../../types.js";
import {
  domainSchema,
  contactSchema,
  contactsSchema,
  nameserversSchema,
  addonsSchema,
  pricingTypeSchema,
  sessionTokenSchema,
  type Contact,
} from "../../validation/schemas.js";
import { withSession, formatToolError } from "./helpers.js";
import { getSession } from "../../storage/kv.js";
import { callUpstream } from "../../upstream/client.js";

const DEFAULT_ADDONS = { dnsmanagement: 0, emailforwarding: 0, idprotection: 0 };
const EMPTY_DOMAINFIELDS = "YTowOnt9"; // base64_encode(serialize([])) — PHP empty array

function buildRegistrant(c?: Contact): Record<string, string> {
  if (!c) return {};
  return {
    firstname: c.firstname,
    lastname: c.lastname,
    companyname: c.companyname ?? "",
    email: c.email,
    address1: c.address1,
    address2: c.address2 ?? "",
    city: c.city,
    state: c.state,
    postcode: c.postcode,
    country: c.country,
    phonenumber: c.phonenumber,
    tax_id: c.tax_id ?? "",
  };
}

export function registerOrderTools(
  server: McpServer,
  env: Env,
  ctx: ExecutionContext,
): void {
  server.tool(
    "order_domains_register",
    "Register a new domain name. Provide registrant contact details via 'owner' (single contact) or 'contacts' (only the registrant field is sent to the upstream API). The domain must have a paid invoice in the system before registration can proceed.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      regperiod: z.number().int().min(1).max(10).describe("Registration period in years"),
      nameservers: nameserversSchema,
      contacts: contactsSchema.optional().describe("Contact details — only registrant is used by the upstream API"),
      owner: contactSchema.optional().describe("Shortcut: single contact used as registrant"),
      addons: addonsSchema.optional(),
      domainfields: z.string().optional().describe("Base64-encoded serialized additional domain fields. Defaults to empty."),
      idnLanguage: z.string().optional().describe("IDN language tag"),
    },
    async ({ session_token, domain, regperiod, nameservers, contacts, owner, addons, domainfields, idnLanguage }) => {
      try {
        return await withSession(env, ctx, session_token, "register", "order_domains_register", domain, async () => {
          const registrant = contacts?.registrant ?? owner;

          const body: Record<string, unknown> = {
            domain,
            regperiod: String(regperiod),
            idnLanguage: idnLanguage ?? "",
            domainfields: domainfields ?? EMPTY_DOMAINFIELDS,
            addons: addons ?? DEFAULT_ADDONS,
            nameservers: {
              ns1: nameservers.ns1,
              ns2: nameservers.ns2,
              ns3: nameservers.ns3 ?? "",
              ns4: nameservers.ns4 ?? "",
              ns5: nameservers.ns5 ?? "",
            },
            contacts: {
              registrant: buildRegistrant(registrant),
            },
          };

          return { method: "POST", path: "/order/domains/register", bodyParams: body };
        });
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "order_domains_transfer",
    "Transfer a domain to your account. Provide registrant contact via 'owner' or 'contacts'. The domain must have a paid invoice in the system before transfer can proceed. Special rules for .gr domains: (1) transfers are free of charge; (2) transfers are instant and cannot be recalled; (3) the Greek registry does not allow any nameserver or contact changes during transfer — nameservers are not required and are ignored; (4) upon successful transfer the domain is automatically synced and set to Active.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      eppcode: z.string().min(1).max(100).optional().describe("EPP/Auth code for the domain transfer"),
      regperiod: z.number().int().min(1).max(10).describe("Registration period in years"),
      nameservers: nameserversSchema.optional().describe("Nameservers for the domain. Not required for .gr domains (Greek registry ignores changes during transfer)."),
      contacts: contactsSchema.optional().describe("Contact details — only registrant is used by the upstream API"),
      owner: contactSchema.optional().describe("Shortcut: single contact used as registrant"),
      addons: addonsSchema.optional(),
      domainfields: z.string().optional().describe("Base64-encoded serialized additional domain fields. Defaults to empty."),
      idnLanguage: z.string().optional().describe("IDN language tag"),
    },
    async ({ session_token, domain, eppcode, regperiod, nameservers, contacts, owner, addons, domainfields, idnLanguage }) => {
      try {
        const isGr = domain.toLowerCase().endsWith(".gr");

        if (!isGr && !nameservers) {
          return {
            content: [{ type: "text" as const, text: "Nameservers are required for non-.gr domain transfers. Provide ns1 and ns2 at minimum." }],
            isError: true,
          };
        }

        const result = await withSession(env, ctx, session_token, "register", "order_domains_transfer", domain, async () => {
          const registrant = contacts?.registrant ?? owner;

          const body: Record<string, unknown> = {
            domain,
            regperiod: String(regperiod),
            idnLanguage: idnLanguage ?? "",
            domainfields: domainfields ?? EMPTY_DOMAINFIELDS,
            addons: addons ?? DEFAULT_ADDONS,
            contacts: {
              registrant: buildRegistrant(registrant),
            },
          };

          if (!isGr && nameservers) {
            body.nameservers = [
              nameservers.ns1,
              nameservers.ns2,
              nameservers.ns3 ?? "",
              nameservers.ns4 ?? "",
              nameservers.ns5 ?? "",
            ];
          }

          if (eppcode) body.eppcode = eppcode;

          return { method: "POST", path: "/order/domains/transfer", bodyParams: body };
        });

        if (isGr && !result.isError) {
          try {
            const session = await getSession(env, session_token);
            if (session) {
              const syncResponse = await callUpstream(env, {
                method: "POST",
                path: `/domains/${encodeURIComponent(domain)}/transfersync`,
                body: { domain },
                email: session.email,
                apiKey: session.apiKey,
              });
              result.content.push({
                type: "text",
                text: `\n.gr Transfer Sync: ${JSON.stringify(syncResponse.body, null, 2)}\nDomain Status: Active (.gr transfers are instant)`,
              });
            }
          } catch {
            result.content.push({
              type: "text",
              text: "\n.gr transfers are instant — domain is now Active. Automatic sync was attempted but could not be confirmed.",
            });
          }
        }

        return result;
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "order_domains_renew",
    "Renew an existing domain registration. The domain must have a paid invoice in the system before renewal can proceed.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      regperiod: z.number().int().min(1).max(10).describe("Renewal period in years"),
      addons: addonsSchema.optional(),
      idnLanguage: z.string().optional().describe("IDN language tag"),
    },
    async ({ session_token, domain, regperiod, addons, idnLanguage }) => {
      try {
        return await withSession(env, ctx, session_token, "register", "order_domains_renew", domain, async () => {
          const body: Record<string, unknown> = {
            domain,
            regperiod: String(regperiod),
            idnLanguage: idnLanguage ?? "",
            addons: addons ?? DEFAULT_ADDONS,
          };
          return { method: "POST", path: "/order/domains/renew", bodyParams: body };
        });
      } catch (err) {
        return formatToolError(err);
      }
    },
  );

  server.tool(
    "order_pricing_domains_get",
    "Get pricing for a specific domain for registration, transfer, or renewal.",
    {
      session_token: sessionTokenSchema,
      domain: domainSchema,
      type: pricingTypeSchema.describe("Pricing type: register, transfer, or renew"),
    },
    async ({ session_token, domain, type }) => {
      try {
        return await withSession(env, ctx, session_token, "general", "order_pricing_domains_get", domain, async () => ({
          method: "GET",
          path: `/order/pricing/domains/${type}`,
          queryParams: { domain },
        }));
      } catch (err) {
        return formatToolError(err);
      }
    },
  );
}
