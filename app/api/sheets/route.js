// app/api/sheets/route.js
import { NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// Función para obtener las credenciales según el entorno
async function getAuth() {
  // Detectar si estamos en Vercel (producción) o local
  const isVercel = process.env.VERCEL === "1";

  if (isVercel) {
    // En Vercel: usar variable de entorno
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheet = searchParams.get("sheet") || "CRM_Evolution_Gym";
    const estadoFiltro = searchParams.get("estado");

    const client = await getAuth();
    const sheets = google.sheets({ version: "v4", auth: client });

    const headersRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheet}!A1:R1`,
    });
    const headers = headersRes.data.values?.[0] || [];

    const dataRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheet}!A2:R`,
    });
    const datos = dataRes.data.values || [];

    let leads = datos.map((fila) => {
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = fila[idx] || "";
      });
      return obj;
    });

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
