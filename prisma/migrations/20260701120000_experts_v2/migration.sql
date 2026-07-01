-- Experts v2: canonical profiles with 1–3 areas, per-idea links (IdeaExpert),
-- edit-suggestion queue (ExpertEdit), account ownership. Data-safe migration.

-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('AWAITING_EXPERT', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EditStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum: ExpertStatus (PENDING/CONFIRMED/REJECTED -> AWAITING_NOMINEE/PENDING_REVIEW/PUBLISHED/REJECTED)
CREATE TYPE "ExpertStatus_new" AS ENUM ('AWAITING_NOMINEE', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED');
ALTER TABLE "ExpertProfile" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ExpertProfile" ALTER COLUMN "status" TYPE "ExpertStatus_new" USING (
  CASE "status"::text
    WHEN 'PENDING' THEN 'PENDING_REVIEW'
    WHEN 'CONFIRMED' THEN 'PUBLISHED'
    WHEN 'REJECTED' THEN 'REJECTED'
    ELSE 'PENDING_REVIEW'
  END::"ExpertStatus_new"
);
ALTER TYPE "ExpertStatus" RENAME TO "ExpertStatus_old";
ALTER TYPE "ExpertStatus_new" RENAME TO "ExpertStatus";
DROP TYPE "ExpertStatus_old";
ALTER TABLE "ExpertProfile" ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW';

-- DropForeignKey
ALTER TABLE "ExpertProfile" DROP CONSTRAINT IF EXISTS "ExpertProfile_fromIdeaId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "ExpertProfile_fieldKey_idx";

-- AlterTable: add new columns (keep fieldKey/fromIdeaId until data is migrated)
ALTER TABLE "ExpertProfile"
  ADD COLUMN "areas" TEXT[],
  ADD COLUMN "contactEmail" TEXT,
  ADD COLUMN "ownerUserId" TEXT;

-- Backfill areas from the old single fieldKey
UPDATE "ExpertProfile" SET "areas" = ARRAY["fieldKey"] WHERE "fieldKey" IS NOT NULL;

-- Backfill normalized contactEmail from contact when it looks like an email
UPDATE "ExpertProfile"
  SET "contactEmail" = lower(trim("contact"))
  WHERE "contact" ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$';

-- CreateTable
CREATE TABLE "IdeaExpert" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "proposedById" TEXT,
    "status" "LinkStatus" NOT NULL DEFAULT 'AWAITING_EXPERT',
    "contactsSharedAt" TIMESTAMP(3),
    "takenOn" BOOLEAN NOT NULL DEFAULT false,
    "authorConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "approveToken" TEXT,
    "approveTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeaExpert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertEdit" (
    "id" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "proposedById" TEXT,
    "changes" JSONB NOT NULL,
    "status" "EditStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpertEdit_pkey" PRIMARY KEY ("id")
);

-- Preserve existing idea<->expert associations as APPROVED links
INSERT INTO "IdeaExpert" ("id", "ideaId", "expertId", "status", "contactsSharedAt", "createdAt")
SELECT gen_random_uuid()::text, "fromIdeaId", "id", 'APPROVED'::"LinkStatus", now(), now()
FROM "ExpertProfile"
WHERE "fromIdeaId" IS NOT NULL;

-- Drop old columns now that data is migrated
ALTER TABLE "ExpertProfile" DROP COLUMN "fieldKey", DROP COLUMN "fromIdeaId";

-- CreateIndex
CREATE UNIQUE INDEX "IdeaExpert_approveToken_key" ON "IdeaExpert"("approveToken");
CREATE INDEX "IdeaExpert_status_idx" ON "IdeaExpert"("status");
CREATE UNIQUE INDEX "IdeaExpert_ideaId_expertId_key" ON "IdeaExpert"("ideaId", "expertId");
CREATE UNIQUE INDEX "ExpertProfile_ownerUserId_key" ON "ExpertProfile"("ownerUserId");
CREATE INDEX "ExpertProfile_contactEmail_idx" ON "ExpertProfile"("contactEmail");

-- AddForeignKey
ALTER TABLE "ExpertProfile" ADD CONSTRAINT "ExpertProfile_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "IdeaExpert" ADD CONSTRAINT "IdeaExpert_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IdeaExpert" ADD CONSTRAINT "IdeaExpert_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IdeaExpert" ADD CONSTRAINT "IdeaExpert_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExpertEdit" ADD CONSTRAINT "ExpertEdit_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertEdit" ADD CONSTRAINT "ExpertEdit_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
