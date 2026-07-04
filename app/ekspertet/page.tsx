import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { ExpertCard } from "@/components/ExpertCard";
import { SelfNominateButton } from "@/components/SelfNominateForm";
import { ProposeExpertGeneralButton } from "@/components/ProposeExpertGeneralButton";
import { FIELDS, fieldName, isValidFieldKey } from "@/lib/fields";
import { fieldColor } from "@/lib/fieldColors";
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
    where: {
      status: "PUBLISHED",
      ...(activeField ? { areas: { has: activeField } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, areas: true, bio: true },
  });

  return (
    <div className="container-pal py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.experts.title}
          </h1>
          <p className="mt-1 text-muted">{t.experts.sub}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ProposeExpertGeneralButton
            loggedIn={Boolean(user)}
            fieldKey={activeField ?? undefined}
          />
          <SelfNominateButton
            loggedIn={Boolean(user)}
            defaultName={user?.name ?? undefined}
            variant="secondary"
          />
        </div>
      </div>

      {/* Area filter */}
      <div className="stagger-in mb-6 flex flex-wrap gap-2">
        <Link
          href="/ekspertet"
          className={[
            "rounded-full border px-3 py-1.5 text-sm font-medium transition-all hover:scale-105",
            !activeField
              ? "border-ink bg-ink text-white"
              : "border-border bg-card text-ink hover:border-ink",
          ].join(" ")}
        >
          {t.experts.filterAll}
        </Link>
        {FIELDS.map((f) => {
          const c = fieldColor(f.key);
          const active = activeField === f.key;
          return (
            <Link
              key={f.key}
              href={`/ekspertet?fusha=${f.key}`}
              className="tint rounded-full border px-3 py-1.5 text-sm font-medium transition-all hover:scale-105"
              style={
                active
                  ? { backgroundColor: c.fg, borderColor: c.fg, color: "#fff" }
                  : ({
                      borderColor: c.border,
                      color: c.fg,
                      "--tint-bg": c.bg,
                      "--tint-bg-hover": c.bgHover,
                    } as React.CSSProperties)
              }
            >
              {f.name.split(",")[0]}
            </Link>
          );
        })}
      </div>

      {activeField && (
        <p className="mb-4 text-sm text-muted">
          Fusha:{" "}
          <span className="font-semibold text-ink">
            {fieldName(activeField)}
          </span>
        </p>
      )}

      {experts.length > 0 ? (
        <div className="stagger-in grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map((e) => (
            <ExpertCard key={e.id} expert={e} />
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-tint text-ink animate-icon-pulse"
            aria-hidden
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="8"
                r="3.5"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M5 19.5c.8-3 3.5-5 7-5s6.2 2 7 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <p className="max-w-sm text-muted">{t.experts.empty}</p>
        </div>
      )}
    </div>
  );
}
