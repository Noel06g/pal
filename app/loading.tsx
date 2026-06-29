import { t } from "@/lib/strings";

export default function Loading() {
  return (
    <div className="container-pal py-24 text-center text-muted" role="status" aria-live="polite">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-teal" />
      <p className="mt-4 text-sm">{t.common.loading}</p>
    </div>
  );
}
