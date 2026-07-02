import type { Metadata } from "next";
import Link from "next/link";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.auth.checkEmail };

export default function VerifyPage() {
  return (
    <div className="container-pal py-20">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-tint text-teal-dk">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 6.5h18v11H3v-11Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="m4 7 8 6 8-6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          {t.auth.checkEmail}
        </h1>
        <p className="mt-3 text-muted">{t.auth.checkEmailBody}</p>
        <Link href="/" className="btn-ghost mt-6">
          {t.common.backHome}
        </Link>
      </div>
    </div>
  );
}
