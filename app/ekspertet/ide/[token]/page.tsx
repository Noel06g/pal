import type { Metadata } from "next";
import Link from "next/link";
import { respondToLinkByToken } from "@/app/actions/experts";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.experts.linkConfirmTitle };

export default async function ConfirmLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ vendim?: string }>;
}) {
  const { token } = await params;
  const { vendim } = await searchParams;

  if (vendim === "prano" || vendim === "refuzo") {
    const res = await respondToLinkByToken(token, vendim);
    const outcome = res.ok ? res.data?.outcome : "invalid";
    const message =
      outcome === "accepted"
        ? t.experts.linkAccepted
        : outcome === "rejected"
          ? t.experts.linkRejected
          : outcome === "already"
            ? t.experts.confirmAlready
            : t.experts.confirmInvalid;
    const tone = outcome === "accepted" ? "bg-teal-tint text-teal-dk" : "bg-paper text-muted";
    return (
      <Shell>
        <div className={`rounded-[10px] p-4 text-sm ${tone}`}>{message}</div>
        <Link href="/ekspertet" className="btn-secondary mt-6">
          {t.experts.title}
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-sm text-muted">{t.experts.linkIntro}</p>
      <div className="mt-6 flex gap-3">
        <Link href={`/ekspertet/ide/${token}?vendim=prano`} className="btn-primary">
          {t.experts.confirmAccept}
        </Link>
        <Link href={`/ekspertet/ide/${token}?vendim=refuzo`} className="btn-danger-soft">
          {t.experts.confirmReject}
        </Link>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-pal py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-extrabold tracking-tight">{t.experts.linkConfirmTitle}</h1>
        <div className="card mt-4 p-6">{children}</div>
      </div>
    </div>
  );
}
