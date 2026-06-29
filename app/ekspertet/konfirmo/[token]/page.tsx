import type { Metadata } from "next";
import Link from "next/link";
import { confirmExpert } from "@/app/actions/experts";
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

  // If a decision was passed (from the email link), process it.
  if (vendim === "prano" || vendim === "refuzo") {
    const res = await confirmExpert(token, vendim);
    const outcome = res.ok ? res.data?.outcome : "invalid";

    let message: string = t.experts.confirmInvalid;
    let tone: "ok" | "muted" | "err" = "err";
    if (outcome === "accepted") {
      message = t.experts.confirmAccepted;
      tone = "ok";
    } else if (outcome === "rejected") {
      message = t.experts.confirmRejected;
      tone = "muted";
    } else if (outcome === "already") {
      message = t.experts.confirmAlready;
      tone = "muted";
    }

    return (
      <Shell>
        <div
          className={[
            "rounded-[10px] p-4 text-sm",
            tone === "ok" ? "bg-teal-tint text-teal-dk" : tone === "muted" ? "bg-paper text-muted" : "bg-danger-tint text-danger",
          ].join(" ")}
        >
          {message}
        </div>
        <Link href="/ekspertet" className="btn-secondary mt-6">
          {t.experts.title}
        </Link>
      </Shell>
    );
  }

  // Otherwise, present the choice (links carry the decision back here).
  return (
    <Shell>
      <p className="text-sm text-muted">{t.experts.confirmIntro}</p>
      <div className="mt-6 flex gap-3">
        <Link href={`/ekspertet/konfirmo/${token}?vendim=prano`} className="btn-primary">
          {t.experts.confirmAccept}
        </Link>
        <Link href={`/ekspertet/konfirmo/${token}?vendim=refuzo`} className="btn-danger-soft">
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
        <h1 className="text-2xl font-extrabold tracking-tight">{t.experts.confirmTitle}</h1>
        <div className="mt-4 card p-6">{children}</div>
      </div>
    </div>
  );
}
