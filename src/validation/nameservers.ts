import { z } from "zod";

const nsPattern = z.string().min(1).max(253);

export const nameserversSchema = z.object({
  ns1: nsPattern,
  ns2: nsPattern,
  ns3: nsPattern.optional(),
  ns4: nsPattern.optional(),
  ns5: nsPattern.optional(),
});

export type Nameservers = z.infer<typeof nameserversSchema>;

export const childNameserverSchema = z.object({
  nameserver: z.string().min(1).max(253).describe("Nameserver hostname to register"),
  ipaddress: z.string().min(7).max(45).describe("IP address for the nameserver"),
});

export const childNameserverModifySchema = z.object({
  nameserver: z.string().min(1).max(253).describe("Nameserver hostname to modify"),
  currentipaddress: z.string().min(7).max(45).describe("Current IP address"),
  newipaddress: z.string().min(7).max(45).describe("New IP address"),
});

export const childNameserverDeleteSchema = z.object({
  nameserver: z.string().min(1).max(253).describe("Nameserver hostname to delete"),
});
