# Accountable-EVS

[Accountable-EVS](https://accountable-evs.vercel.app) is a web application designed to address some of the issues faced by students living in on-campus housing at NUS with the EVS air-conditioning credit system.

## Features

- **Automated Meter Reading**: An automated worker fetches meter readings from the EVS website for registered users once every 24 hours.
- **Historical Credit Data**: Users can log in with their meter ID and password to view their up-to-date credit balance and usage history.
- **Complaint Management**: Users can easily email EVS with complaints about discrepancies in their credits.

## Architecture

### Back-end

The back-end logic is powered by Cloudflare Workers, which are serverless functions written in TypeScript.

- **Meter Reading Worker**: A dedicated worker fetches meter readings from the EVS website in batches of 100 meters at a time. The code is available [here](https://github.com/SajalVaishnav/accountable-evs-create-new-readings-worker)

- **Data Cleanup Worker**: Another worker runs periodically to delete meter readings older than 3 months. The code is available [here](https://github.com/SajalVaishnav/accountable-evs-delete-readings-worker)

- **Database**: All meter readings and user data are stored on a postgres instance managed by [Supabase](https://supabase.com/).

### Front-end

The front-end is built with Next.js and material-ui components. The front-end is hosted on Vercel.

## Scalability

The current restriction I have had to optimize for is the runtime limitation for cloudflare workers. The free tier allows a maximum of 10ms of CPU time.

The create reading worker is currently configured to run once every hour, that means it can get the latest reading for 100 meters 24 times a day equalling 2400 readings per day. But I have tested the worker for upto 96 triggers per day which would allow the application to **scale up to 9600 users** easily.
