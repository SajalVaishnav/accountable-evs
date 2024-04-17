import prisma from "@/prisma/prismaSingleton";
import { Meter } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import streamMeters from "@/prisma/meters/streamMeters";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  const startTime = new Date().toISOString();
  console.log("Starting calculate average deduction worker at", startTime);

  const meterStream = streamMeters(100);
  let totalDeduction = 0;
  let count = 0;
  for await (const meters of meterStream) {
    const promises = meters.map(async (meter: Meter) => {
      try {
        const { meterId } = meter;
        const readings = await prisma.meterReadings.findMany({
          where: {
            meterId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 2,
        });

        if (readings.length < 2) {
          throw new Error(
            `Not enough readings for meterId ${meterId} to calculate deduction`
          );
        }

        const [reading1, reading2] = readings;
        const deduction = reading1.reading - reading2.reading;
        totalDeduction += deduction;
        count++;
      } catch (error: any) {
        console.error(
          `Error calculating deduction for meterId ${meter.meterId}:`,
          error
        );
      }
    });

    await Promise.all(promises);
  }

  await prisma.dailyAverageDeduction.create({
    data: {
      totalDeduction,
      metersCount: count,
    },
  });

  const endTime = new Date().toISOString();
  console.log("Finished calculate average deduction worker at", endTime);

  const timeTaken = new Date(endTime).getTime() - new Date(startTime).getTime();
  const message = `Finished calculate average deduction worker in ${timeTaken} ms`;
  return NextResponse.json({ message: message });
}
