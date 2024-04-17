import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

const getAuthRequestConfig = (meterId: string, password: string) => {
  return {
    url: "https://nus-utown.evs.com.sg/EVSEntApp-war/loginServlet",
    method: "POST",
    data: `txtLoginId=${meterId}&txtPassword=${password}&btnLogin=Login`,
    headers: {
      Accept: "text/html",
      Connection: "keep-alive",
    },
  };
};

const getCreditRequestConfig = (cookie: string[]) => {
  return {
    url: "https://nus-utown.evs.com.sg/EVSEntApp-war/viewMeterCreditServlet",
    method: "GET",
    headers: {
      Accept: "text/html",
      Connection: "keep-alive",
      Cookie: cookie,
    },
  };
};

const getMeterCreditFromHtml = (getCreditRes: AxiosResponse): number => {
  const $ = cheerio.load(getCreditRes.data);
  var remainingCredits: string | undefined = undefined;
  $(".mainContent_normalText").each((index: number, element: any) => {
    const item = $(element).text();
    if (index == 3) {
      remainingCredits = item;
    }
  });

  if (!remainingCredits) {
    throw Error("Failed to get remaining credits from HTML");
  }

  return Number(String(remainingCredits).trim().split("$")[1].trim());
};

export const getMeterCreditFromAuthCookie = async (cookie: string[]): Promise<number> => {
  const creditConfig = getCreditRequestConfig(cookie);
  const creditRes = await axios(creditConfig);
  const remainingCredits = getMeterCreditFromHtml(creditRes);
  return remainingCredits;
};

export const getAuthStatusAndCookie = async (
  meterId: string,
  password: string
): Promise<{ authStatus: boolean; cookie: string[] | undefined }> => {
  const authConfig = getAuthRequestConfig(meterId, password);
  const authRes = await axios(authConfig);
  const cookie = authRes.headers["set-cookie"];
  var checkAuthUrl = authRes.request.res.responseUrl.toString();
  var authStatus = !checkAuthUrl.includes("Invalid");
  return { authStatus, cookie };
};

export const getMeterCreditFromMeteridPassword = async (meterId: string, password: string): Promise<number | undefined> => {
  try {
    const { authStatus, cookie } = await getAuthStatusAndCookie(
      meterId,
      password
    );
    if (!authStatus || !cookie) {
      throw Error("Invalid meterId or password!");
    }
    return await getMeterCreditFromAuthCookie(cookie);
  } catch (error) {
    console.error(error);
  }
};
