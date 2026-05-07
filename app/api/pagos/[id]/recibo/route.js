// app/api/pagos/[id]/recibo/route.js
import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./service-account.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return await auth.getClient();
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { recibo_url } = await request.json();

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PAGOS!A:K",
    });

    const pagos = response.data.values || [];
    const rowIndex = pagos.findIndex((row) => row[0] === id);
    
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    const rowNumber = rowIndex + 1;

    // Actualizar la columna K (recibo_url)
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `PAGOS!K${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[recibo_url]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}