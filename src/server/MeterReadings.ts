"use server";

import { AuthenticationError } from "@/app/common/Error/Errors";
import { MeterData } from "@/app/page";
import prisma from "@/prisma/prismaSingleton";
import { getMeterCreditFromMeteridPassword } from "@/server/EvsCrawler";

const READING_EXPIRATION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface ServerResponse {
  error: string;
}

interface MeterReadingsResponse extends ServerResponse {
  readings: MeterData[] | null;
}

interface LatestReadingResponse extends ServerResponse {
  reading: MeterData | null;
}

export const getMeterReadings = async (
  meterId: string,
  password: string
): Promise<MeterReadingsResponse> => {
  const meter = await prisma.meter.findUnique({
    where: {
      meterId,
      password,
    },
    include: {
      meterReadings: true,
    },
  });

  if (!meter) {
    try {
      const reading = await createNewMeterAndReading(meterId, password);
      return { readings: [reading], error: "" };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return { readings: null, error: "AuthError: Invalid meterId or password" };
      }
      return {
        readings: null,
        error: `Failed to get meter readings for meter ${meterId}`,
      };
    }
  }

  return { readings: meter.meterReadings, error: "" };
};

export const getLatestReading = async (
  meterId: string,
  password: string
): Promise<LatestReadingResponse> => {
  const meter = await prisma.meter.findUnique({
    where: {
      meterId,
      password,
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
    try {
		const reading = await createNewMeterAndReading(meterId, password);
		return { reading: reading, error: "" };
	  } catch (error) {
		if (error instanceof AuthenticationError) {
		  return { reading: null, error: "AuthError" };
		}
		return {
		  reading: null,
		  error: `Failed to get meter readings for meter ${meterId}`,
		};
	  }
  }

  const latestReading = meter.meterReadings[0];
  const lastReadingUpdatedAt = meter.readingUpdatedAt?.getTime() || 0;
  const currentTime = Date.now();

  if (currentTime - lastReadingUpdatedAt < READING_EXPIRATION_DURATION) {
    return { reading: latestReading, error: "" };
  }

  const newReading = await getMeterCreditFromMeteridPassword(meterId, password);

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

  return { reading: createdReading, error: "" };
};

const createNewMeterAndReading = async (meterId: string, password: string): Promise<MeterData> => {
  const reading = await getMeterCreditFromMeteridPassword(meterId, password);

  const createdReading = await prisma.meterReadings.create({
    data: {
      reading,
      meter: {
        create: {
          meterId,
          password,
          readingUpdatedAt: new Date(),
        },
      },
    },
    include: {
      meter: true,
    },
  });

  return {id: createdReading.id, meterId: createdReading.meterId, createdAt: createdReading.createdAt, reading: createdReading.reading};
};
