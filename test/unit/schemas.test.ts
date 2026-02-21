import { describe, it, expect } from "vitest";
import { domainSchema, sldSchema } from "../../src/validation/domain";
import { contactSchema, contactsSchema } from "../../src/validation/contact";
import { dnsRecordSchema } from "../../src/validation/dns";
import { nameserversSchema } from "../../src/validation/nameservers";
import { addonsSchema } from "../../src/validation/addons";
import { sessionTokenSchema, pricingTypeSchema } from "../../src/validation/schemas";

describe("domainSchema", () => {
  it("should accept valid domains", () => {
    expect(domainSchema.parse("example.com")).toBe("example.com");
    expect(domainSchema.parse("sub.example.co.uk")).toBe("sub.example.co.uk");
    expect(domainSchema.parse("TEST.COM")).toBe("test.com");
    expect(domainSchema.parse("my-domain.org")).toBe("my-domain.org");
  });

  it("should reject invalid domains", () => {
    expect(() => domainSchema.parse("")).toThrow();
    expect(() => domainSchema.parse("no-tld")).toThrow();
    expect(() => domainSchema.parse("-starts-with-dash.com")).toThrow();
    expect(() => domainSchema.parse("ends-with-dash-.com")).toThrow();
    expect(() => domainSchema.parse("has spaces.com")).toThrow();
    expect(() => domainSchema.parse("a")).toThrow();
  });
});

describe("sldSchema", () => {
  it("should accept valid SLDs", () => {
    expect(sldSchema.parse("example")).toBe("example");
    expect(sldSchema.parse("my-domain")).toBe("my-domain");
    expect(sldSchema.parse("a1")).toBe("a1");
  });

  it("should reject invalid SLDs", () => {
    expect(() => sldSchema.parse("")).toThrow();
    expect(() => sldSchema.parse("-start")).toThrow();
    expect(() => sldSchema.parse("end-")).toThrow();
  });
});

describe("contactSchema", () => {
  const validContact = {
    firstname: "John",
    lastname: "Doe",
    fullname: "John Doe",
    companyname: "ACME Inc",
    email: "john@example.com",
    address1: "123 Main St",
    city: "New York",
    state: "NY",
    postcode: "10001",
    country: "US",
    phonenumber: "+1.2125551234",
  };

  it("should accept valid contact", () => {
    expect(() => contactSchema.parse(validContact)).not.toThrow();
  });

  it("should accept contact with optional address2", () => {
    expect(() => contactSchema.parse({ ...validContact, address2: "Suite 100" })).not.toThrow();
  });

  it("should reject contact missing required fields", () => {
    const { email, ...incomplete } = validContact;
    expect(() => contactSchema.parse(incomplete)).toThrow();
  });

  it("should reject invalid email", () => {
    expect(() => contactSchema.parse({ ...validContact, email: "not-an-email" })).toThrow();
  });

  it("should reject invalid country code", () => {
    expect(() => contactSchema.parse({ ...validContact, country: "USA" })).toThrow();
    expect(() => contactSchema.parse({ ...validContact, country: "us" })).toThrow();
  });
});

describe("contactsSchema", () => {
  const validContact = {
    firstname: "John",
    lastname: "Doe",
    fullname: "John Doe",
    companyname: "ACME",
    email: "john@example.com",
    address1: "123 St",
    city: "City",
    state: "ST",
    postcode: "12345",
    country: "US",
    phonenumber: "+1.555",
  };

  it("should accept valid contacts with all roles", () => {
    expect(() =>
      contactsSchema.parse({
        registrant: validContact,
        admin: validContact,
        tech: validContact,
        billing: validContact,
      }),
    ).not.toThrow();
  });

  it("should reject missing role", () => {
    expect(() =>
      contactsSchema.parse({
        registrant: validContact,
        admin: validContact,
        tech: validContact,
      }),
    ).toThrow();
  });
});

describe("dnsRecordSchema", () => {
  it("should accept valid DNS record", () => {
    expect(() =>
      dnsRecordSchema.parse({
        hostname: "www",
        type: "A",
        address: "1.2.3.4",
        priority: 0,
        recid: "123",
      }),
    ).not.toThrow();
  });

  it("should reject missing fields", () => {
    expect(() => dnsRecordSchema.parse({ hostname: "www" })).toThrow();
  });

  it("should reject negative priority", () => {
    expect(() =>
      dnsRecordSchema.parse({
        hostname: "www",
        type: "A",
        address: "1.2.3.4",
        priority: -1,
        recid: "1",
      }),
    ).toThrow();
  });
});

describe("nameserversSchema", () => {
  it("should accept ns1 and ns2", () => {
    expect(() => nameserversSchema.parse({ ns1: "ns1.example.com", ns2: "ns2.example.com" })).not.toThrow();
  });

  it("should accept optional ns3-ns5", () => {
    expect(() =>
      nameserversSchema.parse({
        ns1: "ns1.example.com",
        ns2: "ns2.example.com",
        ns3: "ns3.example.com",
      }),
    ).not.toThrow();
  });

  it("should reject missing ns1", () => {
    expect(() => nameserversSchema.parse({ ns2: "ns2.example.com" })).toThrow();
  });

  it("should reject missing ns2", () => {
    expect(() => nameserversSchema.parse({ ns1: "ns1.example.com" })).toThrow();
  });
});

describe("addonsSchema", () => {
  it("should accept valid addons", () => {
    expect(() =>
      addonsSchema.parse({ dnsmanagement: 1, emailforwarding: 0, idprotection: 1 }),
    ).not.toThrow();
  });

  it("should reject values outside 0-1", () => {
    expect(() =>
      addonsSchema.parse({ dnsmanagement: 2, emailforwarding: 0, idprotection: 0 }),
    ).toThrow();
  });
});

describe("sessionTokenSchema", () => {
  it("should accept 64-char hex token", () => {
    const token = "a".repeat(64);
    expect(() => sessionTokenSchema.parse(token)).not.toThrow();
  });

  it("should reject too short token", () => {
    expect(() => sessionTokenSchema.parse("short")).toThrow();
  });
});

describe("pricingTypeSchema", () => {
  it("should accept valid types", () => {
    expect(pricingTypeSchema.parse("register")).toBe("register");
    expect(pricingTypeSchema.parse("transfer")).toBe("transfer");
    expect(pricingTypeSchema.parse("renew")).toBe("renew");
  });

  it("should reject invalid types", () => {
    expect(() => pricingTypeSchema.parse("delete")).toThrow();
    expect(() => pricingTypeSchema.parse("")).toThrow();
  });
});
