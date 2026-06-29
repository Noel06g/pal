"use server";

import { db } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { verifyTurnstile } from "@/lib/turnstile";
import { registerSchema } from "@/lib/validation";
import { checkRate } from "@/lib/ratelimit";
import { t } from "@/lib/strings";
import { ok, fail, getClientIp, type ActionResult } from "./_helpers";

/**
 * Sign-in / register entry point. Captures the display name on the register
 * path (stored in PendingRegistration, applied when Auth.js creates the user),
 * verifies Turnstile, then sends the magic link.
 */
export async function startSignIn(formData: FormData): Promise<ActionResult> {
  const turnstileToken = String(formData.get("turnstileToken") ?? "");
  const ip = await getClientIp();
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return fail(t.toast.turnstileFailed);
  }
  if (!(await checkRate("general", ip))) return fail(t.toast.rateLimited);

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? t.common.error);
  const { email, name } = parsed.data;

  const existing = await db.user.findUnique({
    where: { email },
    select: { isBanned: true },
  });
  if (existing?.isBanned) return fail(t.auth.banned);

  // Stash the typed name so the adapter can apply it on first sign-in.
  await db.pendingRegistration.upsert({
    where: { email },
    update: { name },
    create: { email, name },
  });

  await signIn("resend", {
    email,
    redirect: false,
    redirectTo: "/",
  });

  return ok();
}

export async function doSignOut(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
