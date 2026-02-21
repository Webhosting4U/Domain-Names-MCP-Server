import { z } from "zod";

const DOMAIN_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export const domainSchema = z
  .string()
  .min(3)
  .max(253)
  .regex(DOMAIN_REGEX, "Invalid domain name format")
  .transform((d) => d.toLowerCase());

export const sldSchema = z
  .string()
  .min(1)
  .max(63)
  .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/, "Invalid SLD format");
