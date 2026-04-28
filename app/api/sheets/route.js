import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheet = searchParams.get("sheet") || "Leads";

    const auth = new google.auth.GoogleAuth({
      keyFile: "./service-account.json", // 👈 USA EL JSON
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();

    const sheets = google.sheets({ version: "v4", auth: client });

    const range = `${sheet}!A2:L`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1IAL6deCQyj0HkfvRAFVM-zj-orwE_cdoZrayplM0P3Y",
      range: range,
    });

    return NextResponse.json({
      success: true,
      data: response.data.values || [],
    });
  } catch (error) {
    console.error("❌ ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
