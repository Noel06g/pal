import { db } from "@/lib/db";

/**
 * Create an in-app notification. Email is sent separately by the caller via
 * lib/email so failures there never roll back the user-facing action.
 */
export async function createNotification(params: {
  userId: string;
  type: string;
  message: string;
  link?: string;
}) {
  await db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      message: params.message,
      link: params.link ?? null,
    },
  });
}
