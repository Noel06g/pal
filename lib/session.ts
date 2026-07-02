import { auth } from "@/auth";
import { db } from "@/lib/db";

/** The current session user (id, email, name, isAdmin, isBanned) or null. */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

/** Throws-free guard: returns a non-banned user or null. */
export async function getActiveUser() {
  const user = await getCurrentUser();
  if (!user || user.isBanned) return null;
  return user;
}

/** Re-reads the user from DB to get the freshest isAdmin/isBanned. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;
  const fresh = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      isBanned: true,
    },
  });
  if (!fresh || !fresh.isAdmin || fresh.isBanned) return null;
  return fresh;
}
