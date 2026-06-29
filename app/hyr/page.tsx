import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AuthForm } from "@/components/AuthForm";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.nav.signIn };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  if (user) redirect(next && next.startsWith("/") ? next : "/");

  return (
    <div className="container-pal py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-3xl font-extrabold tracking-tight">{t.nav.signIn}</h1>
        <p className="mt-2 text-center text-muted">
          Hyr ose regjistrohu te {t.site.name} me email.
        </p>
        <div className="mt-8">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
