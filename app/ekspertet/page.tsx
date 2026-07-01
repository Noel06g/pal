import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { ExpertCard } from "@/components/ExpertCard";
import { SelfNominateButton } from "@/components/SelfNominateForm";
import { ProposeExpertGeneralButton } from "@/components/ProposeExpertGeneralButton";
import { FIELDS, fieldName, isValidFieldKey } from "@/lib/fields";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.experts.title };

export default async function ExpertsPage({
  searchParams,
}: {
  searchParams: Promise<{ fusha?: string }>;
}) {
  const sp = await searchParams;
  const activeField = sp.fusha && isValidFieldKey(sp.fusha) ? sp.fusha : null;
  const user = await getCurrentUser();

  // PUBLIC directory: only PUBLISHED profiles; filter by ANY of an expert's areas.
  const experts = await db.expertProfile.findMany({
    where: { status: "PUBLISHED", ...(activeField ? { areas: { has: activeField } } : {}) },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, areas: true, bio: true },
  });

  return (
    <div className="container-pal py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t.experts.title}</h1>
          <p className="mt-1 text-muted">{t.experts.sub}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ProposeExpertGeneralButton loggedIn={Boolean(user)} fieldKey={activeField ?? undefined} />
          <SelfNominateButton
            loggedIn={Boolean(user)}
            defaultName={user?.name ?? undefined}
            variant="secondary"
          />
        </div>
      </div>

      {/* Area filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/ekspertet"
          className={[
            "rounded-full px-3 py-1.5 text-sm font-medium",
            !activeField ? "bg-teal text-white" : "border border-border bg-card text-ink hover:bg-teal-tint",
          ].join(" ")}
        >
          {t.experts.filterAll}
        </Link>
        {FIELDS.map((f) => (
          <Link
            key={f.key}
            href={`/ekspertet?fusha=${f.key}`}
            className={[
              "rounded-full px-3 py-1.5 text-sm font-medium",
              activeField === f.key ? "bg-teal text-white" : "border border-border bg-card text-ink hover:bg-teal-tint",
            ].join(" ")}
          >
            {f.name.split(",")[0]}
          </Link>
        ))}
      </div>

      {activeField && (
        <p className="mb-4 text-sm text-muted">
          Fusha: <span className="font-semibold text-ink">{fieldName(activeField)}</span>
        </p>
      )}

      {experts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map((e) => (
            <ExpertCard key={e.id} expert={e} />
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-muted">{t.experts.empty}</div>
      )}
    </div>
  );
}
