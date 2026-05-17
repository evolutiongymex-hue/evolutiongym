import { google } from "googleapis";
import path from "path";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export async function getAuthClient() {
  const isVercel = process.env.VERCEL === "1";

  const auth = new google.auth.GoogleAuth({
    ...(isVercel
      ? { credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) }
      : { keyFile: path.join(process.cwd(), "service-account.json") }),
    scopes: SCOPES,
  });

  return auth.getClient();
}

export function getSheetsClient(auth) {
  return google.sheets({ version: "v4", auth });
}

export const SHEET_ID = process.env.GOOGLE_SHEET_ID;
