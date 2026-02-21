import { z } from "zod";

export const addonsSchema = z.object({
  dnsmanagement: z.number().int().min(0).max(1),
  emailforwarding: z.number().int().min(0).max(1),
  idprotection: z.number().int().min(0).max(1),
});

export type Addons = z.infer<typeof addonsSchema>;
