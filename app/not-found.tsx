import Link from "next/link";
import { t } from "@/lib/strings";

export default function NotFound() {
  return (
    <div className="container-pal py-24 text-center">
      <p className="font-display text-6xl font-bold text-teal">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        {t.common.notFoundTitle}
      </h1>
      <p className="mt-2 text-muted">{t.common.notFoundBody}</p>
      <Link href="/" className="btn-primary mt-6">
        {t.common.backHome}
      </Link>
    </div>
  );
}
