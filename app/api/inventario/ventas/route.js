import { NextResponse } from "next/server";
import { getAuthClient, getSheetsClient, SHEET_ID } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") ?? "dia";

    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const [ventasRes, productosRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "VENTAS_INVENTARIO!A:E",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "INVENTARIO!A:D",
      }),
    ]);

    const ventas = ventasRes.data.values ?? [];
    const productos = productosRes.data.values ?? [];

    if (ventas.length === 0) {
      return NextResponse.json({
        success: true,
        totalUnidades: 0,
        totalDinero: 0,
        detalle: [],
      });
    }

    const productosMap = {};
    productos.slice(1).forEach((p) => {
      productosMap[parseInt(p[0])] = p[1];
    });

    const hoy = new Date();
    let fechaInicio;

    if (periodo === "dia") {
      fechaInicio = hoy.toISOString().split("T")[0];
    } else if (periodo === "semana") {
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - 7);
      fechaInicio = inicio.toISOString().split("T")[0];
    } else if (periodo === "mes") {
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
        .toISOString()
        .split("T")[0];
    }

    const filtradas = ventas.slice(1).filter((row) => row[4] >= fechaInicio);

    const totalUnidades = filtradas.reduce(
      (sum, row) => sum + (parseInt(row[2]) || 0),
      0
    );
    const totalDinero = filtradas.reduce(
      (sum, row) => sum + (parseInt(row[3]) || 0),
      0
    );

    const detalle = filtradas.map((row) => ({
      producto_id: parseInt(row[1]) || 0,
      producto_nombre: productosMap[parseInt(row[1])] ?? "Desconocido",
      cantidad: parseInt(row[2]) || 0,
      total: parseInt(row[3]) || 0,
      fecha: row[4],
    }));

    return NextResponse.json({
      success: true,
      totalUnidades,
      totalDinero,
      detalle,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  }
}
