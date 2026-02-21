import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../../src/crypto/encryption";

const TEST_SECRET = "a-test-secret-key-for-encryption-tests-minimum-32-chars";

describe("AES-256-GCM encryption", () => {
  it("should encrypt and decrypt a string round-trip", async () => {
    const plaintext = "my-secret-api-key-12345";
    const encrypted = await encrypt(plaintext, TEST_SECRET);
    const decrypted = await decrypt(encrypted, TEST_SECRET);
    expect(decrypted).toBe(plaintext);
  });

  it("should produce different ciphertext for same plaintext (random IV)", async () => {
    const plaintext = "same-input-different-output";
    const e1 = await encrypt(plaintext, TEST_SECRET);
    const e2 = await encrypt(plaintext, TEST_SECRET);
    expect(e1).not.toBe(e2);
  });

  it("should fail to decrypt with wrong secret", async () => {
    const plaintext = "secret-data";
    const encrypted = await encrypt(plaintext, TEST_SECRET);
    await expect(decrypt(encrypted, "wrong-secret-key-that-is-different")).rejects.toThrow();
  });

  it("should fail to decrypt tampered ciphertext", async () => {
    const plaintext = "tamper-test";
    const encrypted = await encrypt(plaintext, TEST_SECRET);
    const tampered = encrypted.slice(0, -2) + "XX";
    await expect(decrypt(tampered, TEST_SECRET)).rejects.toThrow();
  });

  it("should handle empty string", async () => {
    const plaintext = "";
    const encrypted = await encrypt(plaintext, TEST_SECRET);
    const decrypted = await decrypt(encrypted, TEST_SECRET);
    expect(decrypted).toBe(plaintext);
  });

  it("should handle unicode content", async () => {
    const plaintext = "key-with-unicode-\u00e9\u00e8\u00ea-\u4f60\u597d";
    const encrypted = await encrypt(plaintext, TEST_SECRET);
    const decrypted = await decrypt(encrypted, TEST_SECRET);
    expect(decrypted).toBe(plaintext);
  });

  it("should reject invalid base64 input", async () => {
    await expect(decrypt("not-valid-base64!!!", TEST_SECRET)).rejects.toThrow();
  });

  it("should reject too-short input", async () => {
    const shortData = btoa("short");
    await expect(decrypt(shortData, TEST_SECRET)).rejects.toThrow();
  });
});
