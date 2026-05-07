// app/api/pagos/[id]/route.js
import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./service-account.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return await auth.getClient();
}

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PAGOS!A:K",
    });

    const pagos = response.data.values || [];
    if (pagos.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay pagos" },
        { status: 404 }
      );
    }

    // Buscar el pago por ID (columna A)
    const pago = pagos.slice(1).find((row) => row[0] === id);

    if (!pago) {
      return NextResponse.json(
        { success: false, error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // Buscar el próximo pago en CRM_Evolution_Gym
    const crmResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "CRM_Evolution_Gym!A:Q",
    });
    const clientes = crmResponse.data.values || [];
    const cliente = clientes.slice(1).find((row) => row[0] === pago[1]);
    const proximoPago = cliente ? cliente[13] : null; // columna N

    return NextResponse.json({
      success: true,
      data: {
        id: pago[0],
        cliente_id: pago[1],
        nombre: pago[2],
        fecha_pago: pago[3],
        monto: parseFloat(pago[4]),
        metodo_pago: pago[5],
        plan: pago[6],
        meses: parseInt(pago[7]),
        promocion: pago[8],
        usuario: pago[9],
        recibo_url: pago[10],
        proximo_pago: proximoPago,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
