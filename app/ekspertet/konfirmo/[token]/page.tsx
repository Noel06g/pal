import type { Metadata } from "next";
import { NomineeConfirm } from "@/components/NomineeConfirm";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.experts.confirmTitle };

/**
 * Email-token page for a nominated expert. IMPORTANT: the GET render must
 * never mutate — email scanners prefetch these links, and an auto-executed
 * "refuzo" would silently destroy the nomination. Both decisions happen in
 * <NomineeConfirm> on an explicit click; `vendim` only pre-selects the view.
 */
export default async function ConfirmExpertPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ vendim?: string }>;
}) {
  const { token } = await params;
  const { vendim } = await searchParams;

  return (
    <div className="container-pal py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.experts.confirmTitle}
        </h1>
        <div className="card mt-4 p-6">
          <p className="text-sm text-muted">{t.experts.confirmIntro}</p>
          <div className="mt-6">
            <NomineeConfirm token={token} initialAccept={vendim === "prano"} />
          </div>
        </div>
      </div>
    </div>
  );
}
