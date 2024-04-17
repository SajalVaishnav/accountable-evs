import { getMeterCreditFromMeteridPassword } from "@/server/evs-crawler";
import prisma from "@/prisma/prismaSingleton";
import { Readable } from "stream";
import { Meter } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import streamMeters from "@/prisma/meters/streamMeters";
// Create new meter readings for all meters
// runs every day
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  const startTime = new Date().toISOString();
  console.log("Starting create-new-meter-readings-worker at", startTime);

  const meterStream = streamMeters(100);
  for await (const meters of meterStream) {
    const promises = meters.map(async (meter: Meter) => {
      try {
        const { meterId, password } = meter;
        const reading = await getMeterCreditFromMeteridPassword(
          meterId,
          password
        );

        if (reading === undefined) {
          throw new Error(`Failed fetching reading for meterId ${meterId}`);
        }

        const result = await prisma.meterReadings.create({
          data: {
            meterId,
            reading,
          },
        });

        console.log(
          `Successfully created MeterReading for meterId ${meterId}:`,
          result
        );
      } catch (error: any) {
        console.error(
          `Error creating MeterReading for meterId ${meter.meterId}:`,
          error
        );
      }
    });

    await Promise.all(promises);
  }

  const endTime = new Date().toISOString();
  console.log("Finished create-new-meter-readings-worker at", endTime);

  const timeTaken = new Date(endTime).getTime() - new Date(startTime).getTime();
  const message = `Finished create-new-meter-readings-worker in ${timeTaken} ms`;
  return NextResponse.json({ message: message });
}
