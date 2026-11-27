-- CreateEnum
CREATE TYPE "AdminEmailKind" AS ENUM ('AUDIT', 'QUOTE', 'GENERAL');

-- CreateEnum
CREATE TYPE "AdminEmailStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "AdminEmailSourceType" AS ENUM ('AUDIT', 'QUOTE');

-- CreateTable
CREATE TABLE "AdminEmail" (
    "id" TEXT NOT NULL,
    "kind" "AdminEmailKind" NOT NULL,
    "status" "AdminEmailStatus" NOT NULL DEFAULT 'DRAFT',
    "toEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "businessName" TEXT,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "calendlyUrl" TEXT,
    "rows" JSONB,
    "attachmentPath" TEXT,
    "attachmentName" TEXT,
    "attachmentSize" INTEGER,
    "inReplyToMessageId" TEXT,
    "sourceRequestType" "AdminEmailSourceType",
    "sourceRequestId" TEXT,
    "resendId" TEXT,
    "lastEvent" TEXT,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminEmail_resendId_key" ON "AdminEmail"("resendId");

-- CreateIndex
CREATE INDEX "AdminEmail_status_createdAt_idx" ON "AdminEmail"("status", "createdAt");


-- Supabase exposes the public schema through its REST API; keep this table
-- unreachable there. Prisma connects as the table owner and is not affected.
ALTER TABLE "AdminEmail" ENABLE ROW LEVEL SECURITY;
