-- AlterTable
ALTER TABLE "Meter" ADD COLUMN     "sentEmailAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() - INTERVAL '1 day',
ALTER COLUMN "readingUpdatedAt" SET DEFAULT NOW() - INTERVAL '1 day',
ALTER COLUMN "readingCountedIntoAverageAt" SET DEFAULT NOW() - INTERVAL '1 day';
