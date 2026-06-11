import { NextResponse } from "next/server";
import { getAuthClient, getSheetsClient, SHEET_ID } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "DEUDAS!A:J",
    });

    const datos = (response.data.values ?? []).slice(1);

    const deudas = datos.map((row) => ({
      id: row[0] ?? "",
      cliente_id: row[1] ?? "",
      nombre: row[2] ?? "",
      tipo: row[3] ?? "",
      concepto: row[4] ?? "",
      monto_total: parseFloat(row[5]) || 0,
      monto_pagado: parseFloat(row[6]) || 0,
      saldo: parseFloat(row[7]) || 0,
      fecha: row[8] ?? "",
      estado: row[9] ?? "pendiente",
    }));

    return NextResponse.json({ success: true, data: deudas });
  } catch (err) {
    return NextResponse.json(
      { error: "Error al obtener deudas: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { cliente_id, nombre, tipo, concepto, monto_total, monto_pagado } =
      body;

    if (!cliente_id || !nombre || !monto_total) {
      return NextResponse.json(
        { error: "cliente_id, nombre y monto_total son obligatorios" },
        { status: 400 }
      );
    }

    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "DEUDAS!A:A",
    });

    const nuevoId =
      (response.data.values?.length ?? 1).toString() +
      "-" +
      Date.now().toString().slice(-4);
    const saldo = monto_total - (monto_pagado || 0);
    const fecha = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Mexico_City",
    });
    const estado = saldo <= 0 ? "liquidada" : "pendiente";

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "DEUDAS!A:J",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            nuevoId,
            cliente_id,
            nombre,
            tipo || "membresia",
            concepto || "",
            monto_total,
            monto_pagado || 0,
            saldo,
            fecha,
            estado,
          ],
        ],
      },
    });

    return NextResponse.json({ success: true, id: nuevoId });
  } catch (err) {
    return NextResponse.json(
      { error: "Error al crear deuda: " + err.message },
      { status: 500 }
    );
  }
}
