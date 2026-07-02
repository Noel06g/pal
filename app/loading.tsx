import { t } from "@/lib/strings";

export default function Loading() {
  return (
    <div
      className="container-pal py-24 text-center text-muted"
      role="status"
      aria-live="polite"
    >
      {/* A pulsing stamp instead of a spinner — squares are the brand. */}
      <div className="mx-auto h-8 w-8 animate-pulse bg-stamp" />
      <p className="mt-4 text-sm">{t.common.loading}</p>
    </div>
  );
}
