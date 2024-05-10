import { getMeterReadings } from "@/server/MeterReadings";
import { NextRequest, NextResponse } from "next/server";

// Get meter readings for a meter, given meterId and password
export async function POST(request: NextRequest): Promise<NextResponse> {
  // get meterId and password from request body
  const { meterId, password } = await request.json();

  // if no meterId or password is provided, return an error
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

  const {readings, error} = await getMeterReadings(meterId, password);
  if (readings) {
	return NextResponse.json({
	  readings: readings,
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
