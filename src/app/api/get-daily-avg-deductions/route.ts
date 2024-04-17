import prisma from "@/prisma/prismaSingleton";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const dailyAvgDeductions = await prisma.DailyAverageDeduction.findMany();
  return NextResponse.json({ averageDeductions: dailyAvgDeductions });
}
