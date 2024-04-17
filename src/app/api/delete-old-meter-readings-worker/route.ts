import prisma from '@/prisma/prismaSingleton'
import { NextResponse } from 'next/server'

// Delete all meter readings older than 2 months
// runs every day
export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", {
            status: 401
        })
    }
    const startTime = new Date().toISOString()
    console.log(
        "Starting delete-old-meter-readings-worker at",
        startTime
    )
    const date = new Date()
    date.setMonth(date.getMonth() - 2)
    await prisma.meterReadings.deleteMany({
        where: {
            createdAt: {
                lt: date
            }
        }
    })
    const endTime = new Date().toISOString()
    console.log(
        "Finished delete-old-meter-readings-worker at",
        endTime
    )

    const timeTaken = new Date(endTime).getTime() - new Date(startTime).getTime()
    const message = `Finished delete-old-meter-readings-worker in ${timeTaken} ms`
    return NextResponse.json({ message: message })
}