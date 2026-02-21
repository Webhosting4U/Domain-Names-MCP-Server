import { z } from "zod";

export const dnsRecordSchema = z.object({
  hostname: z.string().min(1).max(253),
  type: z.string().min(1).max(10),
  address: z.string().min(1).max(500),
  priority: z.number().int().min(0),
  recid: z.string().min(1),
});

export type DnsRecord = z.infer<typeof dnsRecordSchema>;

export const dnsRecordsArraySchema = z.array(dnsRecordSchema).min(1);
