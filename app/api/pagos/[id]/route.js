import { NextResponse } from "next/server";
import { getAuthClient, getSheetsClient, SHEET_ID } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const [pagosRes, crmRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "PAGOS!A:K",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "CRM_Evolution_Gym!A:Q",
      }),
    ]);

    const pagos = pagosRes.data.values ?? [];
    const pago = pagos.slice(1).find((row) => row[0] === id);

    if (!pago) {
      return NextResponse.json(
        { success: false, error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    const clientes = crmRes.data.values ?? [];
    const cliente = clientes.slice(1).find((row) => row[0] === pago[1]);
    const proximoPago = cliente?.[13] ?? null;

    return NextResponse.json({
      success: true,
      data: {
        id: pago[0],
        cliente_id: pago[1],
        nombre: pago[2],
        fecha_pago: pago[3],
        monto: parseFloat(pago[4]) || 0,
        metodo_pago: pago[5],
        plan: pago[6],
        meses: parseInt(pago[7]) || 1,
        promocion: pago[8] ?? "",
        usuario: pago[9] ?? "admin",
        recibo_url: pago[10] ?? "",
        proximo_pago: proximoPago,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener el pago" },
      { status: 500 }
    );
  }
}
