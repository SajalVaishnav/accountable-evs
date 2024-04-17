import { getMeterCreditFromMeteridPassword } from "@/server/evs-crawler";
export async function GET(request: Request): Promise<Response> {
    const res = await getMeterCreditFromMeteridPassword("10003087", "1A3087");
    return new Response(res?.toString());
}
