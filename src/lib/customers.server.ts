import { getRequest } from "@tanstack/react-start/server";

async function verifySession(token: string, secret: string): Promise<string | null> {
  const [data, sigB64] = token.split(".");
  if (!data || !sigB64) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
  const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(data));
  if (!valid) return null;
  const payload = JSON.parse(atob(data)) as { sub: string; exp: number };
  if (payload.exp < Date.now()) return null;
  return payload.sub;
}

export async function getCurrentCustomerId(): Promise<string | null> {
  const cookieHeader = getRequest().headers.get("cookie") ?? "";
  const match = cookieHeader.match(/customer_session=([^;]+)/);
  if (!match) return null;
  return verifySession(match[1], process.env["SESSION_SECRET"]!);
}