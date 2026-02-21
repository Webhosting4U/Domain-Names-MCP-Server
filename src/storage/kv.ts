import type { Env, SessionData } from "../types.js";
import { encrypt, decrypt } from "../crypto/encryption.js";

const SESSION_PREFIX = "session:";

function sessionKey(token: string): string {
  return `${SESSION_PREFIX}${token}`;
}

export async function createSession(
  env: Env,
  email: string,
  apiKey: string,
): Promise<string> {
  const token = generateToken();
  const ttlSeconds = parseInt(env.SESSION_TTL_SECONDS, 10) || 43200;
  const now = Date.now();

  const encryptedApiKey = await encrypt(apiKey, env.APIKEY_ENC_KEY);

  const data: SessionData = {
    email,
    encryptedApiKey,
    createdAt: now,
    expiresAt: now + ttlSeconds * 1000,
  };

  await env.SESSIONS.put(sessionKey(token), JSON.stringify(data), {
    expirationTtl: ttlSeconds,
  });

  return token;
}

export async function getSession(
  env: Env,
  token: string,
): Promise<{ email: string; apiKey: string } | null> {
  const raw = await env.SESSIONS.get(sessionKey(token));
  if (!raw) return null;

  let data: SessionData;
  try {
    data = JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }

  if (Date.now() > data.expiresAt) {
    await env.SESSIONS.delete(sessionKey(token));
    return null;
  }

  const apiKey = await decrypt(data.encryptedApiKey, env.APIKEY_ENC_KEY);
  return { email: data.email, apiKey };
}

export async function deleteSession(
  env: Env,
  token: string,
): Promise<void> {
  await env.SESSIONS.delete(sessionKey(token));
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let hex = "";
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, "0");
  }
  return hex;
}
