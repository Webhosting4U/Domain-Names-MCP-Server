export { domainSchema, sldSchema } from "./domain.js";
export {
  contactSchema,
  contactsSchema,
  contactDetailsSchema,
  type Contact,
  type Contacts,
  type ContactDetails,
} from "./contact.js";
export { dnsRecordSchema, dnsRecordsArraySchema, type DnsRecord } from "./dns.js";
export {
  nameserversSchema,
  childNameserverSchema,
  childNameserverModifySchema,
  childNameserverDeleteSchema,
  type Nameservers,
} from "./nameservers.js";
export { addonsSchema, type Addons } from "./addons.js";

import { z } from "zod";

export const sessionTokenSchema = z.string().min(32).max(128);

export const pricingTypeSchema = z.enum([
  "register",
  "transfer",
  "renew",
]);

export const domainLookupSchema = z.object({
  searchTerm: z.string().min(1).max(63).describe("Domain name to check (e.g. 'example')"),
  tldsToInclude: z.array(z.string().min(1).max(63)).min(1).describe("TLDs to check (e.g. ['com','net','gr'])"),
  punyCodeSearchTerm: z.string().max(253).optional().describe("Punycode version for IDN domains"),
  isIdnDomain: z.boolean().optional().describe("Whether this is an internationalized domain name"),
  premiumEnabled: z.boolean().optional().describe("Include premium domain results"),
});

export const domainLookupSuggestionsSchema = z.object({
  searchTerm: z.string().min(1).max(100).describe("Keyword to get domain suggestions for"),
  tldsToInclude: z.array(z.string().min(1).max(63)).optional().describe("TLDs to include in suggestions"),
  punyCodeSearchTerm: z.string().max(253).optional(),
  isIdnDomain: z.boolean().optional(),
  premiumEnabled: z.boolean().optional(),
  suggestionSettings: z.record(z.unknown()).optional().describe("Additional suggestion settings"),
});

export const emailForwardingSchema = z.object({
  prefix: z.array(z.string().min(1).max(64)).min(1).describe("Email prefix(es) to forward"),
  forwardto: z.array(z.string().email().max(254)).min(1).describe("Destination email address(es)"),
});

export const domainLockSchema = z.object({
  lockstatus: z.string().describe("Lock status: 'locked' or 'unlocked'"),
});

export const domainReleaseSchema = z.object({
  transfertag: z.string().min(1).max(50).describe("New registrar tag to release domain to"),
});
