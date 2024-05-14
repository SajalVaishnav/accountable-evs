import { getLatestReading } from "@/server/MeterReadings";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { meterId, password } = await request.json();

  if (!meterId || !password) {
    return NextResponse.json(
      {
        message: `Please provide meterId and password`,
      },
      {
        status: 400,
      }
    );
  }

  const {reading, error} = await getLatestReading(meterId, password);
  if (reading) {
	return NextResponse.json({
	  reading: reading,
	  message: `Successfully fetched reading for meterId ${meterId}`,
	},
	{
	  status: 200,
	});
  } else {
	return NextResponse.json({
		message: error,
	},
	{
		status: 405,
	});
  }
}
