// app/api/inventario/ventas/route.js
import { NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

async function getAuthClient() {
  const isVercel = process.env.VERCEL === "1";

  if (isVercel) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return await auth.getClient();
  } else {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "service-account.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return await auth.getClient();
  }
}

// GET: Ventas por período (dia, semana, mes)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "dia";

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const [ventasRes, productosRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "VENTAS_INVENTARIO!A:E",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "INVENTARIO!A:D",
      }),
    ]);

    const ventas = ventasRes.data.values || [];
    const productos = productosRes.data.values || [];

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
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - 7);
      fechaInicio = inicioSemana.toISOString().split("T")[0];
    } else if (periodo === "mes") {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      fechaInicio = inicioMes.toISOString().split("T")[0];
    }

    const ventasFiltradas = ventas
      .slice(1)
      .filter((row) => row[4] >= fechaInicio);

    const totalUnidades = ventasFiltradas.reduce(
      (sum, row) => sum + parseInt(row[2]),
      0
    );
    const totalDinero = ventasFiltradas.reduce(
      (sum, row) => sum + parseInt(row[3]),
      0
    );

    const detalle = ventasFiltradas.map((row) => ({
      producto_id: parseInt(row[1]),
      producto_nombre: productosMap[parseInt(row[1])] || "Desconocido",
      cantidad: parseInt(row[2]),
      total: parseInt(row[3]),
      fecha: row[4],
    }));

    return NextResponse.json({
      success: true,
      totalUnidades,
      totalDinero,
      detalle,
    });
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
