import { describe, it, expect } from "vitest";
import { generateUpstreamToken, formatGmdate, isNearHourBoundary } from "../../src/upstream/token";

describe("formatGmdate", () => {
  it("should format date as yy-mm-dd HH in UTC", () => {
    const date = new Date("2026-02-21T14:30:00Z");
    expect(formatGmdate(date)).toBe("26-02-21 14");
  });

  it("should zero-pad single-digit months, days, and hours", () => {
    const date = new Date("2025-01-05T03:00:00Z");
    expect(formatGmdate(date)).toBe("25-01-05 03");
  });

  it("should handle midnight", () => {
    const date = new Date("2026-12-31T00:00:00Z");
    expect(formatGmdate(date)).toBe("26-12-31 00");
  });

  it("should handle hour 23", () => {
    const date = new Date("2026-06-15T23:59:59Z");
    expect(formatGmdate(date)).toBe("26-06-15 23");
  });
});

describe("generateUpstreamToken", () => {
  it("should produce a base64 string", async () => {
    const token = await generateUpstreamToken(
      "test-api-key",
      "test@example.com",
      new Date("2026-02-21T14:30:00Z"),
    );

    expect(token).toBeTruthy();
    expect(() => atob(token)).not.toThrow();
  });

  it("should produce consistent output for the same inputs", async () => {
    const date = new Date("2026-02-21T14:00:00Z");
    const t1 = await generateUpstreamToken("key123", "user@test.com", date);
    const t2 = await generateUpstreamToken("key123", "user@test.com", date);
    expect(t1).toBe(t2);
  });

  it("should produce different output for different hours", async () => {
    const d1 = new Date("2026-02-21T14:00:00Z");
    const d2 = new Date("2026-02-21T15:00:00Z");
    const t1 = await generateUpstreamToken("key123", "user@test.com", d1);
    const t2 = await generateUpstreamToken("key123", "user@test.com", d2);
    expect(t1).not.toBe(t2);
  });

  it("should produce different output for different API keys", async () => {
    const date = new Date("2026-02-21T14:00:00Z");
    const t1 = await generateUpstreamToken("key-a", "user@test.com", date);
    const t2 = await generateUpstreamToken("key-b", "user@test.com", date);
    expect(t1).not.toBe(t2);
  });

  it("should produce different output for different emails", async () => {
    const date = new Date("2026-02-21T14:00:00Z");
    const t1 = await generateUpstreamToken("key123", "alice@test.com", date);
    const t2 = await generateUpstreamToken("key123", "bob@test.com", date);
    expect(t1).not.toBe(t2);
  });

  it("decoded base64 should be a 64-char hex string (SHA-256 output)", async () => {
    const token = await generateUpstreamToken(
      "test-key",
      "test@example.com",
      new Date("2026-01-01T00:00:00Z"),
    );
    const decoded = atob(token);
    expect(decoded).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("isNearHourBoundary", () => {
  it("should return true at minute 0", () => {
    expect(isNearHourBoundary(new Date("2026-01-01T14:00:00Z"))).toBe(true);
  });

  it("should return true at minute 1", () => {
    expect(isNearHourBoundary(new Date("2026-01-01T14:01:30Z"))).toBe(true);
  });

  it("should return true at minute 59", () => {
    expect(isNearHourBoundary(new Date("2026-01-01T14:59:00Z"))).toBe(true);
  });

  it("should return false at minute 30", () => {
    expect(isNearHourBoundary(new Date("2026-01-01T14:30:00Z"))).toBe(false);
  });

  it("should return false at minute 10", () => {
    expect(isNearHourBoundary(new Date("2026-01-01T14:10:00Z"))).toBe(false);
  });
});
