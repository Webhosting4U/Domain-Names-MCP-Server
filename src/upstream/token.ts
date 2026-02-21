/**
 * Generates the upstream DomainsReseller API auth token.
 *
 * PHP equivalent:
 *   base64_encode(hash_hmac("sha256", $api_key, $email . ":" . gmdate("y-m-d H")))
 *
 * hash_hmac("sha256", data, key) — key is the HMAC key, data is the message.
 * gmdate("y-m-d H") produces 2-digit year, e.g. "26-02-21 14" for 2026-02-21 14:xx UTC.
 * hash_hmac returns lowercase hex by default.
 * base64_encode wraps the hex string.
 */
export async function generateUpstreamToken(
  apiKey: string,
  email: string,
  date?: Date,
): Promise<string> {
  const now = date ?? new Date();
  const dateStr = formatGmdate(now);
  const hmacKey = `${email}:${dateStr}`;

  const keyData = new TextEncoder().encode(hmacKey);
  const msgData = new TextEncoder().encode(apiKey);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const hex = arrayBufferToHex(signature);
  return btoa(hex);
}

/**
 * Replicates PHP gmdate("y-m-d H") — 2-digit year, zero-padded month/day/hour in UTC.
 */
export function formatGmdate(date: Date): string {
  const yy = String(date.getUTCFullYear()).slice(-2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  return `${yy}-${mm}-${dd} ${hh}`;
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Returns true if the current time is within `marginMinutes` of an hour boundary.
 * Used to detect when a token retry might be needed.
 */
export function isNearHourBoundary(date?: Date, marginMinutes = 2): boolean {
  const now = date ?? new Date();
  const minutes = now.getUTCMinutes();
  return minutes < marginMinutes || minutes >= 60 - marginMinutes;
}
