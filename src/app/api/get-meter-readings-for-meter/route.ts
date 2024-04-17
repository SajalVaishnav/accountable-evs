import prisma from '@/prisma/prismaSingleton'
import { getAuthStatusAndCookie } from '@/server/evs-crawler';
import { NextRequest, NextResponse } from 'next/server';

// Get meter readings for a meter, given meterId and password
export async function POST(request: NextRequest): Promise<NextResponse> {
    // get meterId and password from request body
    const { meterId, password } = await request.json();

    // if no meterId or password is provided, return an error
    if (!meterId || !password) {
        return NextResponse.json({
            message: `Please provide meterId and password`
        }, {
            status: 400
        });
    }

    // check if meterId exists in database
    const meter = await prisma.meter.findUnique({
        where: {
            meterId
        }
    });

    // if meter doesnt exist, check if the meterId and password combination is valid
    // if valid -> create a new meter, return an empty list of readings
    // if invalid -> return an error
    if (!meter) {
        const authStatus = await getAuthStatusAndCookie(meterId, password);
        // if the meterId and password combination is invalid, return an error
        if (!authStatus.authStatus) {
            return NextResponse.json({
                message: `Invalid meterId and password combination`
            }, {
                status: 400
            });
        }

        // if meterId and password is valid, create a new meter in the database
        await prisma.meter.create({
            data: {
                meterId,
                password
            }
        });
        // return a response saying we created a new meter
        return NextResponse.json({
            message: `Successfully created new meter with meterId ${meterId}`
        }, {
            status: 200
        });
    }

    // if meter exists, return all the readings for the meter
    const readings = await prisma.meterReadings.findMany({
        where: {
            meterId
        }
    });

    // return the readings
    return NextResponse.json({
        readings: readings,
        message: `Successfully fetched readings for meterId ${meterId}`
    }, {
        status: 200
    });
}