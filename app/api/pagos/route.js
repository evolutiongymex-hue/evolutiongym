// app/api/pagos/route.js
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

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      cliente_id,
      nombre,
      fecha_pago,
      monto,
      metodo_pago,
      plan,
      meses,
      promocion,
      usuario,
    } = body;

    if (!cliente_id || !fecha_pago || !monto) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PAGOS!A:A",
    });
    const lastRow = response.data.values?.length || 1;
    const nuevoId = lastRow;

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PAGOS!A:K",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            nuevoId,
            cliente_id,
            nombre,
            fecha_pago,
            monto,
            metodo_pago,
            plan,
            meses || 1,
            promocion || "",
            usuario || "admin",
            "", // recibo_url
          ],
        ],
      },
    });

    return NextResponse.json({ success: true, id: nuevoId });
  } catch (error) {
    console.error("Error al guardar pago:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");
    const metodo = searchParams.get("metodo");

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PAGOS!A:K",
    });

    let pagos = response.data.values || [];
    if (pagos.length === 0) {
      return NextResponse.json({ success: true, data: [], total: 0 });
    }

    const datos = pagos.slice(1);
    let resultados = datos.map((row) => ({
      id: row[0],
      cliente_id: row[1],
      nombre: row[2],
      fecha_pago: row[3],
      monto: parseFloat(row[4]),
      metodo_pago: row[5],
      plan: row[6],
      meses: parseInt(row[7]),
      promocion: row[8],
      usuario: row[9],
      recibo_url: row[10],
    }));

    if (fecha) {
      resultados = resultados.filter((p) => p.fecha_pago === fecha);
    }

    if (metodo) {
      resultados = resultados.filter((p) => p.metodo_pago === metodo);
    }

    const total = resultados.reduce((sum, p) => sum + p.monto, 0);
    const efectivo = resultados
      .filter((p) => p.metodo_pago === "efectivo")
      .reduce((sum, p) => sum + p.monto, 0);
    const transferencia = resultados
      .filter((p) => p.metodo_pago === "transferencia")
      .reduce((sum, p) => sum + p.monto, 0);

    return NextResponse.json({
      success: true,
      data: resultados,
      total,
      efectivo,
      transferencia,
    });
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
