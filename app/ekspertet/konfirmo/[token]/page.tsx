import type { Metadata } from "next";
import Link from "next/link";
import { confirmNominee } from "@/app/actions/experts";
import { NomineeConfirm } from "@/components/NomineeConfirm";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.experts.confirmTitle };

export default async function ConfirmExpertPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ vendim?: string }>;
}) {
  const { token } = await params;
  const { vendim } = await searchParams;

  // A "Refuzo" from the email link resolves immediately.
  if (vendim === "refuzo") {
    const res = await confirmNominee(token, "refuzo");
    const outcome = res.ok ? res.data?.outcome : "invalid";
    const message =
      outcome === "rejected"
        ? t.experts.confirmRejected
        : outcome === "already"
          ? t.experts.confirmAlready
          : t.experts.confirmInvalid;
    return (
      <Shell>
        <div className="rounded-[10px] bg-paper p-4 text-sm text-muted">{message}</div>
        <Link href="/ekspertet" className="btn-secondary mt-6">
          {t.experts.title}
        </Link>
      </Shell>
    );
  }

  // Otherwise present the choice; accepting collects a CV (if missing) client-side.
  return (
    <Shell>
      <p className="text-sm text-muted">{t.experts.confirmIntro}</p>
      <div className="mt-6">
        <NomineeConfirm token={token} initialAccept={vendim === "prano"} />
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-pal py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-extrabold tracking-tight">{t.experts.confirmTitle}</h1>
        <div className="card mt-4 p-6">{children}</div>
      </div>
    </div>
  );
}
