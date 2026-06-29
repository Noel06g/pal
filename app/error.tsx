"use client";

import { useEffect } from "react";
import { t } from "@/lib/strings";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-pal py-24 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight">{t.common.errorTitle}</h1>
      <p className="mt-2 text-muted">{t.common.errorBody}</p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        {t.common.retry}
      </button>
    </div>
  );
}
