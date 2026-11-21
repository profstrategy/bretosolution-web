-- AlterTable
ALTER TABLE "AuditRequest"
ADD COLUMN "consentAcceptedAt" TIMESTAMP(3),
ADD COLUMN "consentVersion" TEXT;

-- AlterTable
ALTER TABLE "QuoteRequest"
ADD COLUMN "consentAcceptedAt" TIMESTAMP(3),
ADD COLUMN "consentVersion" TEXT;
