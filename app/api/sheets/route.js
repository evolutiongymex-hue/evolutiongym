// app/api/sheets/route.js
import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheet = searchParams.get("sheet") || "CRM_Evolution_Gym";
    const estadoFiltro = searchParams.get("estado");

    // Usar el archivo JSON de credenciales
    const auth = new google.auth.GoogleAuth({
      keyFile: "./service-account.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // Leer encabezados (fila 1)
    const headersRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheet}!A1:R1`,
    });
    const headers = headersRes.data.values?.[0] || [];

    // Leer datos (desde fila 2 hasta R)
    const dataRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheet}!A2:R`,
    });
    const datos = dataRes.data.values || [];

    // Convertir a objetos con nombres de columna
    let leads = datos.map((fila) => {
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = fila[idx] || "";
      });
      return obj;
    });

    // Filtrar por estado si viene el parámetro
    if (estadoFiltro) {
      leads = leads.filter((lead) => lead.estado === estadoFiltro);
    }

    return NextResponse.json({
      success: true,
      data: leads,
      total: leads.length,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
