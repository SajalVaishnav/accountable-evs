import { getLatestReading } from "@/server/MeterReadings";
import { NextRequest, NextResponse } from "next/server";

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

  try {
  	const reading = await getLatestReading(meterId, password);
	return NextResponse.json({
	  reading: reading,
	  message: `Successfully fetched reading for meterId ${meterId}`,
	},
	{
	  status: 200,
	});
  } catch (error) {
	return NextResponse.json({
		message: `Failed to fetch reading for meterId ${meterId}`,
	},
	{
		status: 500,
	});
  }
}
