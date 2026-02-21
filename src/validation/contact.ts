import { z } from "zod";

export const contactSchema = z.object({
  firstname: z.string().min(1).max(100),
  lastname: z.string().min(1).max(100),
  fullname: z.string().max(200).optional(),
  companyname: z.string().max(200).optional(),
  email: z.string().email().max(254),
  address1: z.string().min(1).max(255),
  address2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postcode: z.string().min(1).max(20),
  country: z.string().min(2).max(2).regex(/^[A-Z]{2}$/, "Country must be a 2-letter ISO code"),
  phonenumber: z.string().min(1).max(30),
  tax_id: z.string().max(50).optional().describe("Tax/VAT identification number"),
});

export type Contact = z.infer<typeof contactSchema>;

export const contactsSchema = z.object({
  registrant: contactSchema,
  admin: contactSchema,
  tech: contactSchema,
  billing: contactSchema,
});

export type Contacts = z.infer<typeof contactsSchema>;

export const contactDetailsSchema = z.object({
  Registrant: contactSchema,
  Admin: contactSchema,
  Technical: contactSchema,
  Billing: contactSchema,
});

export type ContactDetails = z.infer<typeof contactDetailsSchema>;
