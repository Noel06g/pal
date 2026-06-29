import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendMagicLinkEmail } from "@/lib/email";

const adminEmails = env.ADMIN_EMAILS.split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Wrap the Prisma adapter so that on first sign-in we:
//  - fill `name` (required, non-null) from the register form (PendingRegistration)
//  - set isAdmin from ADMIN_EMAILS
function buildAdapter(): Adapter {
  const base = PrismaAdapter(db);
  return {
    ...base,
    async createUser(data: AdapterUser) {
      const email = data.email.toLowerCase();
      const pending = await db.pendingRegistration.findUnique({ where: { email } });
      const fallback = email.split("@")[0] ?? "Përdorues";
      const name = pending?.name?.trim() || data.name?.trim() || fallback;
      const isAdmin = adminEmails.includes(email);

      const user = await db.user.create({
        data: {
          email,
          name,
          isAdmin,
          emailVerified: data.emailVerified ?? null,
        },
      });

      if (pending) {
        await db.pendingRegistration.delete({ where: { email } }).catch(() => {});
      }
      return user as unknown as AdapterUser;
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: buildAdapter(),
  session: { strategy: "database" },
  trustHost: true,
  pages: {
    signIn: "/hyr",
    verifyRequest: "/verifiko",
    error: "/hyr",
  },
  providers: [
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        await sendMagicLinkEmail(identifier, url);
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user?.email?.toLowerCase();
      if (!email) return false;
      const existing = await db.user.findUnique({ where: { email } });
      // Banned users cannot sign in.
      if (existing?.isBanned) return false;
      // Promote to admin if listed in ADMIN_EMAILS.
      if (existing && adminEmails.includes(email) && !existing.isAdmin) {
        await db.user.update({ where: { email }, data: { isAdmin: true } });
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
        session.user.isBanned = (user as { isBanned?: boolean }).isBanned ?? false;
        if (user.name) session.user.name = user.name;
      }
      return session;
    },
  },
});

// Module augmentation: expose id/isAdmin/isBanned on the session user.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      isBanned: boolean;
    } & DefaultSession["user"];
  }
}
