import { NextResponse } from "next/server";
import { getAuthClient, getSheetsClient, SHEET_ID } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { abono } = body;

    if (!abono || abono <= 0) {
      return NextResponse.json(
        { error: "El abono debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "DEUDAS!A:J",
    });

    const rows = response.data.values ?? [];
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: "Deuda no encontrada" },
        { status: 404 }
      );
    }

    const row = rows[rowIndex];
    const montoTotal = parseFloat(row[5]) || 0;
    const montoPagadoActual = parseFloat(row[6]) || 0;
    const nuevoPagado = Math.min(montoPagadoActual + abono, montoTotal);
    const nuevoSaldo = montoTotal - nuevoPagado;
    const nuevoEstado = nuevoSaldo <= 0 ? "liquidada" : "pendiente";

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `DEUDAS!G${rowIndex + 1}:J${rowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[nuevoPagado, nuevoSaldo, row[8], nuevoEstado]],
      },
    });

    return NextResponse.json({
      success: true,
      nuevoSaldo,
      estado: nuevoEstado,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error al registrar abono: " + err.message },
      { status: 500 }
    );
  }
}
