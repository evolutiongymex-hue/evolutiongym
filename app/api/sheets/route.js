import { NextResponse } from "next/server";
import { getAuthClient, getSheetsClient, SHEET_ID } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheet = searchParams.get("sheet") ?? "CRM_Evolution_Gym";
    const estadoFiltro = searchParams.get("estado");

    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const [headersRes, dataRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${sheet}!A1:R1`,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${sheet}!A2:R`,
      }),
    ]);

    const headers = headersRes.data.values?.[0] ?? [];
    const datos = dataRes.data.values ?? [];

    let leads = datos.map((fila) => {
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = fila[idx] ?? "";
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
  } catch {
    return NextResponse.json(
      { success: false, error: "Error al obtener datos" },
      { status: 500 }
    );
  }
}
