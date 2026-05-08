// app/api/pagos/[id]/recibo/route.js
import { NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

async function getAuthClient() {
  const isVercel = process.env.VERCEL === "1";

  if (isVercel) {
    // En Vercel: usar variable de entorno
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return await auth.getClient();
  } else {
    // En local: usar archivo
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "service-account.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return await auth.getClient();
  }
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
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
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
