import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AuthForm } from "@/components/AuthForm";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.nav.signIn };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  const { next, error } = await searchParams;

  // If there's a `next` target and the user is logged in, send them there.
  if (user && next && next.startsWith("/")) redirect(next);

  // Already signed in (no specific target): show a clear state instead of a
  // silent redirect, so it never feels like "sign-in does nothing".
  if (user) {
    return (
      <div className="container-pal py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">{t.auth.alreadyIn}</h1>
          <p className="mt-2 text-muted">
            {t.auth.alreadyInBody} <span className="font-semibold text-ink">{user.name}</span>.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/" className="btn-secondary">
              {t.common.backHome}
            </Link>
            <Link href="/llogaria" className="btn-primary">
              {t.auth.goAccount}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const errorMessage = error
    ? error === "Verification"
      ? t.auth.errorVerification
      : t.auth.errorGeneric
    : null;

  return (
    <div className="container-pal py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-3xl font-extrabold tracking-tight">{t.nav.signIn}</h1>
        <p className="mt-2 text-center text-muted">
          Hyr ose regjistrohu te {t.site.name} me email.
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-[12px] border border-danger/40 bg-danger-tint px-4 py-3 text-sm font-medium text-danger"
          >
            {errorMessage}
          </div>
        )}

        <div className="mt-8">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
