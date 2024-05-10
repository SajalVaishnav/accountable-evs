"use server";

import prisma from "@/prisma/prismaSingleton";
import { getMeterCreditFromMeteridPassword } from "@/server/EvsCrawler";

const READING_EXPIRATION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getMeterReadings = async (meterId: string, password: string) => {
  const meter = await prisma.meter.findUnique({
    where: {
      meterId,
	  password
    },
    include: {
		meterReadings: true
    },
  });

  if (!meter) {
    const reading = await createNewMeterAndReading(meterId, password);
    return [reading];
  }

  return meter.meterReadings;
};

export const getLatestReading = async (meterId: string, password: string) => {
  const meter = await prisma.meter.findUnique({
    where: {
      meterId,
	  password
    },
    include: {
      meterReadings: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!meter) {
    return await createNewMeterAndReading(meterId, password);
  }

  const latestReading = meter.meterReadings[0];
  const lastReadingUpdatedAt = meter.readingUpdatedAt?.getTime() || 0;
  const currentTime = Date.now();

  if (currentTime - lastReadingUpdatedAt < READING_EXPIRATION_DURATION) {
    return latestReading;
  }

  const newReading = await getMeterCreditFromMeteridPassword(meterId, password);

  if (newReading === undefined) {
    throw new Error(`Failed to fetch reading for meterId ${meterId}`);
  }

  const createdReading = await prisma.meterReadings.create({
    data: {
      meterId,
      reading: newReading,
    },
  });

  await prisma.meter.update({
    where: {
      meterId,
    },
    data: {
      readingUpdatedAt: new Date(),
    },
  });

  return createdReading;
};

const createNewMeterAndReading = async (meterId: string, password: string) => {
  const reading = await getMeterCreditFromMeteridPassword(meterId, password);

  if (reading === undefined || reading === null) {
    throw new Error(`Failed to fetch reading for meterId ${meterId}`);
  }

  const createdReading = await prisma.meterReadings.create({
    data: {
	  reading,
	  meter: {
		create: {
		  meterId,
		  password,
		  readingUpdatedAt: new Date(),
		},
	  }
    },
	include: {
		meter: true
	}
  });

  return createdReading;
};