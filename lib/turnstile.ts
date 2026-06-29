import { env } from "@/lib/env";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Cloudflare Turnstile token server-side. Required on registration,
 * create-idea and create-comment (spec §11).
 */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams();
  body.set("secret", env.TURNSTILE_SECRET_KEY);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
