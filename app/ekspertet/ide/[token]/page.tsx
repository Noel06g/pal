import type { Metadata } from "next";
import { LinkConfirm } from "@/components/LinkConfirm";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.experts.linkConfirmTitle };

/**
 * Email-token page for approving/refusing an idea link. IMPORTANT: the GET
 * render must never mutate — email scanners prefetch these links. The actual
 * decision happens in <LinkConfirm> on an explicit click.
 */
export default async function ConfirmLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="container-pal py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-extrabold tracking-tight">{t.experts.linkConfirmTitle}</h1>
        <div className="card mt-4 p-6">
          <p className="text-sm text-muted">{t.experts.linkIntro}</p>
          <div className="mt-6">
            <LinkConfirm token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}
