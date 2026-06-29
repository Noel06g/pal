# Pal

**Nismë e pavarur qytetare** — a national participation platform (Albania) where citizens post ideas/solutions to the country's problems, the community discusses and supports them, and experts are matched to ideas. The entire UI is in Albanian (`sq`). It is **not** a government or party site.

> **Pal** is a temporary working name.

## The core loop

A citizen posts an idea → the community supports & comments (Pro / Kundër / Neutral, can flag "proposes a solution") → an expert is proposed for the idea or self-registers → contact happens off-platform → the idea's author archives it once an expert takes it on.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript (strict) |
| Database | PostgreSQL + Prisma ORM (migrations) |
| Auth | Auth.js (NextAuth v5), **passwordless magic links via Resend** |
| Styling | Tailwind CSS (custom design tokens, no UI kit) |
| Email | Resend (magic links + notifications) |
| File storage | Cloudflare R2 (S3-compatible, **private** bucket) |
| Bot protection | Cloudflare Turnstile (register / create idea / create comment) |
| Validation | Zod (every server input) |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) |
| Deploy | Vercel + hosted Postgres (Neon/Supabase) |

---

## Key behavior

- **Reading is public** (home, ideas, idea detail, experts, about) — no login.
- **Every write requires login.** One account per person (unique email, guaranteed by magic-link auth).
- **Ideas** have one of **14 fields** (or "Tjetër" with explanation), an optional subfield, optional **public PDF** attachments, a support count, comments, and a status that is only **AKTIVE** or **ARKIVUAR**. Only the author (or an admin) can archive; archived ideas are read-only.
- Ideas list: **most-supported first**, archived sink below active; **field filter** + **free-text search** (title/summary/author).
- **Support**: one per user per idea (DB unique constraint), toggleable.
- **Comments**: required **stance** (Pro/Kundër/Neutral) + optional **solution** flag; the idea author (and admins) can delete comments on their idea.
- **Experts** — two routes:
  1. **Vetëpropozim** → `CONFIRMED` immediately (public).
  2. **Propozim nga një postim** → `PENDING`; the nominee gets an accept/reject email (consent); accept → public, reject/expiry → removed; the idea author is notified.
  - Public directory shows **only** name, field, bio. Contact, reason, CV and proposer info are **admin-only**.
- **Moderation** is post-publication: a **Raporto** button (ideas + comments) feeds the admin queue with a snapshot of the post title and reporter email. Admins can delete ideas/comments and **ban/delete accounts** (the penalty for rule violations is account removal).
- **Notifications**: in-app bell + email for new comment on your idea, expert proposed for your idea, the nominee confirmation, and magic-link sign-in.
- **Private files** (CVs) download only for admins; public idea docs for anyone — both **only** through authenticated route handlers, never a public bucket URL.
- **GDPR**: account self-deletion cascades and removes personal data + idea documents.

All user-facing copy lives in [`lib/strings.ts`](lib/strings.ts); the field taxonomy in [`lib/fields.ts`](lib/fields.ts).

---

## Project structure

```
app/
  page.tsx                          # home
  idete/page.tsx                    # ideas list (filter + search + sort)
  idete/krijo/page.tsx              # create idea
  idete/[id]/page.tsx               # idea detail
  ekspertet/page.tsx                # experts directory
  ekspertet/konfirmo/[token]/       # nominee accept/reject
  rreth/  privatesia/  kushtet/     # about / privacy / terms
  hyr/  verifiko/  llogaria/        # sign-in / verify / account
  admin/page.tsx                    # admin (role-gated, server-side)
  api/auth/[...nextauth]/route.ts   # Auth.js
  api/files/[id]/route.ts           # public idea docs (auth route)
  api/experts/[id]/cv/route.ts      # admin-only CV stream
  actions/                          # server actions (mutations)
  robots.ts  sitemap.ts  not-found.tsx  error.tsx  loading.tsx
components/                         # Nav, Hero, FieldIndex, IdeaCard, CommentList, ExpertCard, Modal, Toast, NotificationsBell, Turnstile, admin/AdminPanel, forms…
lib/                               # auth helpers, db, email, r2, ratelimit, turnstile, fields, strings, validation, env, notify, session
auth.ts  middleware.ts
prisma/  schema.prisma  seed.ts
```

Mutations use **server actions**; data fetching uses **server components**. Client components are limited to interactive bits (modals, toasts, bell, forms, filters).

---

## Local setup

### Prerequisites
- Node.js 20+ and npm
- A PostgreSQL database (local or hosted Neon/Supabase)
- Accounts/keys for: Resend, Cloudflare R2, Cloudflare Turnstile, Upstash Redis

### Steps

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
#   then fill in every value (see "Environment variables" below).
#   Generate AUTH_SECRET with:  npx auth secret

# 3. Create the schema + seed example data
npx prisma migrate dev --name init
npx prisma db seed

# 4. Run
npm run dev
# → http://localhost:3000
```

Useful scripts: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run db:seed`.

> **Turnstile in dev:** Cloudflare provides always-pass test keys —
> site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA` —
> handy for local testing.

---

## Environment variables

All are validated at startup by [`lib/env.ts`](lib/env.ts). See [`.env.example`](.env.example).

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection (pooled URL on Neon) |
| `DIRECT_URL` | Direct (non-pooled) URL for migrations |
| `AUTH_SECRET` | Auth.js secret (`npx auth secret`) |
| `AUTH_URL` | App origin, e.g. `https://pal.al` |
| `ADMIN_EMAILS` | Comma-separated admin emails (auto-promoted on sign-in) |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Verified sender, e.g. `Pal <no-reply@yourdomain.al>` |
| `S3_ENDPOINT` / `S3_REGION` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_BUCKET` | Cloudflare R2 (private bucket) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis (rate limiting) |
| `NEXT_PUBLIC_APP_URL` | Public URL used in emails/sitemap |
| `NEXT_PUBLIC_SITE_NAME` | Brand name shown in UI (`Pal`) |

---

## Deploy to Vercel

1. **Push** this repo to GitHub and **import** it in Vercel.
2. **Postgres**: create a Neon (or Supabase) database. Set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) in Vercel env.
3. **Resend**: add and **verify your sending domain**, create an API key → `RESEND_API_KEY`, set `EMAIL_FROM` to an address on that domain.
4. **Cloudflare R2**: create a **private** bucket, generate S3 API credentials → set the five `S3_*` vars. Do **not** enable public access.
5. **Cloudflare Turnstile**: create a widget → set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
6. **Upstash Redis**: create a database → set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
7. **Auth**: set `AUTH_SECRET`, `AUTH_URL` (your production URL), and `ADMIN_EMAILS`.
8. Set `NEXT_PUBLIC_APP_URL` to your production URL.
9. **Run migrations** against production:
   ```bash
   npx prisma migrate deploy
   # optional one-time seed:
   npx prisma db seed
   ```
   (Run from CI or locally with production `DATABASE_URL`/`DIRECT_URL`.)
10. **Deploy.** The `build` script runs `prisma generate && next build`.

### Production notes / sensible defaults
- **Sessions** are database-backed (Auth.js Prisma adapter). Cookies are httpOnly/secure/sameSite=lax.
- **Security headers** (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options) are set in [`next.config.mjs`](next.config.mjs). The CSP allows Turnstile; widen it only if you add third-party scripts.
- **Route protection**: `middleware.ts` is a cheap cookie gate for `/admin` and `/llogaria`; the **authoritative** checks (`isAdmin`, ownership, `isBanned`) run server-side in every page/layout and server action.
- **Rate limits** (tune in [`lib/ratelimit.ts`](lib/ratelimit.ts)): 5 ideas/h, 30 comments/h, 20 supports/min, 15 other writes/h.
- **Uploads**: PDF only, validated by MIME **and** magic bytes, max 10 MB; stored in the private bucket and streamed through authenticated routes.
- **Admin bootstrap**: any email in `ADMIN_EMAILS` is promoted to admin on sign-in.

---

## Seed data

`prisma/seed.ts` is idempotent and creates: admin user(s) from `ADMIN_EMAILS` (plus a fallback `admin@pal.al`), ~6 example ideas (one ARCHIVED), example supports/comments, 5 confirmed experts + 1 PENDING nomination (to exercise the admin approve flow), and 2 reports.

---

## Decisions made where the spec left them open

- **Next.js 15 / React 19 / Prisma 6 / NextAuth v5 beta** chosen for current-stable compatibility with modern Node.
- **Auth.js Resend provider** sends the magic link; the email body is overridden with a custom Albanian template (`lib/email.ts`).
- **Name capture**: the register form's name is stashed in a `PendingRegistration` row and applied by a wrapped Prisma adapter when the user is first created (keeps `User.name` non-null).
- **Database sessions** (not JWT) so `isBanned` is enforced live.
- Reports may target an **idea or a comment** (`Report.commentId` added).
- A dynamic OG image was not added; static OpenGraph metadata is present.
```
