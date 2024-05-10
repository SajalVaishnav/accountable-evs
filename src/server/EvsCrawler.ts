import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

import { AuthenticationError, ParsingError } from "@/app/common/Error/Errors";


const getAuthRequestConfig = (meterId: string, password: string) => ({
  url: "https://nus-utown.evs.com.sg/EVSEntApp-war/loginServlet",
  method: "POST",
  data: `txtLoginId=${meterId}&txtPassword=${password}&btnLogin=Login`,
  headers: {
    Accept: "text/html",
    Connection: "keep-alive",
  },
});

const getViewMeterCreditRequestConfig = (cookie: string[]) => ({
  url: "https://nus-utown.evs.com.sg/EVSEntApp-war/viewMeterCreditServlet",
  method: "GET",
  headers: {
    Accept: "text/html",
    Connection: "keep-alive",
    Cookie: cookie,
  },
});

const parseRemainingCredit = (html: string): number => {
  const $ = cheerio.load(html);

  var remainingCredits: string | undefined = undefined;
  $(".mainContent_normalText").each((index: number, element: any) => {
	const item = $(element).text();
	if (index == 3) {
	  remainingCredits = item;
	}
  });

  if (!remainingCredits) {
    throw new ParsingError("Failed to get remaining credits from HTML");
  }

  return Number(String(remainingCredits).trim().split("$")[1].trim());
};

const getMeterCreditFromAuthCookie = async (cookie: string[]): Promise<number> => {
  const config = getViewMeterCreditRequestConfig(cookie);
  const response = await axios(config);
  return parseRemainingCredit(response.data);
};

const getAuthStatusAndCookie = async (meterId: string, password: string): Promise<{ authStatus: boolean; cookie: string[] | undefined }> => {
  const config = getAuthRequestConfig(meterId, password);
  const response = await axios(config);
  const cookie = response.headers["set-cookie"];
  const authStatus = !response.request.res.responseUrl.includes("Invalid");
  return { authStatus, cookie };
};

export const getMeterCreditFromMeteridPassword = async (meterId: string, password: string): Promise<number> => {
    const { authStatus, cookie } = await getAuthStatusAndCookie(meterId, password);
    if (!authStatus || !cookie) {
      throw new AuthenticationError(meterId);
    }
    return await getMeterCreditFromAuthCookie(cookie);
};