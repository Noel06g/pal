import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/idete",
    "/ekspertet",
    "/rreth",
    "/privatesia",
    "/kushtet",
  ].map((path) => ({
    url: `${APP_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let ideaRoutes: MetadataRoute.Sitemap = [];
  try {
    const ideas = await db.idea.findMany({
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    ideaRoutes = ideas.map((i) => ({
      url: `${APP_URL}/idete/${i.id}`,
      lastModified: i.createdAt,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));
  } catch {
    // DB may be unavailable at build time; static routes are still emitted.
  }

  return [...staticRoutes, ...ideaRoutes];
}
