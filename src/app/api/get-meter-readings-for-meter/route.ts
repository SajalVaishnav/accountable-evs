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
  try {
    const readings = await getMeterReadings(meterId, password);
    return NextResponse.json(
      {
        readings: readings,
        message: `Successfully fetched readings for meterId ${meterId}`,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to fetch readings for meterId ${meterId}`,
      },
      {
        status: 500,
      }
    );
  }
}
