import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Tuned per spec §11.
export const limiters = {
  idea: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "pal:rl:idea",
  }),
  comment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 h"),
    prefix: "pal:rl:comment",
  }),
  support: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    prefix: "pal:rl:support",
  }),
  // Shared limiter for the lower-frequency write actions.
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, "1 h"),
    prefix: "pal:rl:general",
  }),
};

/**
 * Returns true if the action is allowed. Identify by user id (preferred) or IP.
 */
export async function checkRate(
  limiter: keyof typeof limiters,
  identifier: string,
): Promise<boolean> {
  const { success } = await limiters[limiter].limit(identifier);
  return success;
}
