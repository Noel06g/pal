import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveUser } from "@/lib/session";
import { CreateIdeaForm } from "@/components/CreateIdeaForm";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.nav.newIdea };

export default async function CreateIdeaPage() {
  const user = await getActiveUser();
  if (!user) redirect("/hyr?next=/idete/krijo");

  return (
    <div className="container-pal py-10">
      <Link href="/idete" className="text-sm text-muted hover:text-teal">
        {t.idea.backToList}
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{t.nav.newIdea}</h1>
      <p className="mt-1 text-muted">
        Nënshkruan si <span className="font-semibold text-ink">{user.name}</span>.
      </p>

      <div className="mt-6 max-w-2xl">
        <div className="card p-6">
          <CreateIdeaForm />
        </div>
      </div>
    </div>
  );
}
