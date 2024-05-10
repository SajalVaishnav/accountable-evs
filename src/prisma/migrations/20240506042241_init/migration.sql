-- CreateTable
CREATE TABLE "Meter" (
    "id" TEXT NOT NULL,
    "meterId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "readingUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() - INTERVAL '1 day',
    "readingCountedIntoAverageAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() - INTERVAL '1 day',

    CONSTRAINT "Meter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeterReadings" (
    "id" SERIAL NOT NULL,
    "meterId" TEXT NOT NULL,
    "reading" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeterReadings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyAverageDeduction" (
    "id" TEXT NOT NULL,
    "totalDeduction" DOUBLE PRECISION NOT NULL,
    "metersCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyAverageDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Meter_meterId_key" ON "Meter"("meterId");

-- CreateIndex
CREATE INDEX "Meter_readingUpdatedAt_idx" ON "Meter"("readingUpdatedAt" DESC);

-- CreateIndex
CREATE INDEX "Meter_readingCountedIntoAverageAt_idx" ON "Meter"("readingCountedIntoAverageAt");

-- CreateIndex
CREATE INDEX "MeterReadings_createdAt_idx" ON "MeterReadings"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "DailyAverageDeduction_createdAt_idx" ON "DailyAverageDeduction"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "MeterReadings" ADD CONSTRAINT "MeterReadings_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "Meter"("meterId") ON DELETE RESTRICT ON UPDATE CASCADE;
