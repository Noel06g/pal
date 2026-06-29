import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/strings";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${t.site.name} — ${t.site.tagline}`,
    template: `%s · ${t.site.name}`,
  },
  description:
    "Pal — nismë e pavarur qytetare ku qytetarët propozojnë ide e zgjidhje për problemet e Shqipërisë.",
  openGraph: {
    title: `${t.site.name} — ${t.site.tagline}`,
    description:
      "Nismë e pavarur qytetare: ide, zgjidhje dhe ekspertë për problemet e vendit.",
    type: "website",
    locale: "sq_AL",
    siteName: t.site.name,
  },
  twitter: { card: "summary_large_image", title: t.site.name },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? null;

  let unreadCount = 0;
  let notifications: {
    id: string;
    message: string;
    link: string | null;
    read: boolean;
    createdAt: Date;
  }[] = [];
  if (user?.id) {
    notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, message: true, link: true, read: true, createdAt: true },
    });
    unreadCount = notifications.filter((n) => !n.read).length;
  }

  return (
    <html lang="sq" className={`${archivo.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <ToastProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-teal focus:px-4 focus:py-2 focus:text-white"
          >
            Kalo te përmbajtja
          </a>
          <Nav
            user={
              user
                ? { name: user.name ?? "", isAdmin: user.isAdmin }
                : null
            }
            notifications={notifications}
            unreadCount={unreadCount}
          />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <SpeedInsights />
        </ToastProvider>
      </body>
    </html>
  );
}
