import { NextResponse } from "next/server";
import { getAuthClient, getSheetsClient, SHEET_ID } from "@/lib/google-sheets";

export const runtime = "nodejs";

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
        { error: "Faltan datos obligatorios: cliente_id, fecha_pago, monto" },
        { status: 400 }
      );
    }

    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "PAGOS!A:A",
    });

    const nuevoId = response.data.values?.length ?? 1;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
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
            meses ?? 1,
            promocion ?? "",
            usuario ?? "admin",
            "",
          ],
        ],
      },
    });

    return NextResponse.json({ success: true, id: nuevoId });
  } catch {
    return NextResponse.json(
      { error: "Error al guardar el pago" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");
    const metodo = searchParams.get("metodo");

    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "PAGOS!A:K",
    });

    const raw = response.data.values ?? [];
    if (raw.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        efectivo: 0,
        transferencia: 0,
      });
    }

    let resultados = raw.slice(1).map((row) => ({
      id: row[0],
      cliente_id: row[1],
      nombre: row[2],
      fecha_pago: row[3],
      monto: parseFloat(row[4]) || 0,
      metodo_pago: row[5],
      plan: row[6],
      meses: parseInt(row[7]) || 1,
      promocion: row[8] ?? "",
      usuario: row[9] ?? "admin",
      recibo_url: row[10] ?? "",
    }));

    if (fecha) resultados = resultados.filter((p) => p.fecha_pago === fecha);
    if (metodo) resultados = resultados.filter((p) => p.metodo_pago === metodo);

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
  } catch {
    return NextResponse.json(
      { error: "Error al obtener pagos" },
      { status: 500 }
    );
  }
}
