import { NextResponse } from "next/server";
import { getAuthClient, getSheetsClient, SHEET_ID } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { recibo_url } = await request.json();

    if (!recibo_url) {
      return NextResponse.json(
        { error: "recibo_url es obligatorio" },
        { status: 400 }
      );
    }

    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "PAGOS!A:A",
    });

    const ids = response.data.values ?? [];
    const rowIndex = ids.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `PAGOS!K${rowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[recibo_url]] },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar el recibo" },
      { status: 500 }
    );
  }
}
