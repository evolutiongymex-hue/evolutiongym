// app/api/inventario/route.js
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

// GET: Obtener todos los productos
export async function GET() {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "INVENTARIO!A:F",
    });

    const datos = response.data.values || [];
    if (datos.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const productos = datos.slice(1).map((row) => ({
      id: parseInt(row[0]),
      nombre: row[1],
      stock: parseInt(row[2]),
      precio_venta: parseInt(row[3]),
      stock_minimo: parseInt(row[4]),
      ultima_actualizacion: row[5],
    }));

    return NextResponse.json({ success: true, data: productos });
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear nuevo producto
export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, stock, precio_venta, stock_minimo } = body;

    if (!nombre || !precio_venta) {
      return NextResponse.json(
        { error: "Faltan datos: nombre y precio_venta son obligatorios" },
        { status: 400 }
      );
    }

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    // Obtener el último ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "INVENTARIO!A:A",
    });
    const filas = response.data.values || [];
    const nuevoId = filas.length; // Encabezado + IDs existentes

    const hoy = new Date().toISOString().split("T")[0];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "INVENTARIO!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [nuevoId, nombre, stock || 0, precio_venta, stock_minimo || 5, hoy],
        ],
      },
    });

    return NextResponse.json({ success: true, id: nuevoId });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Actualizar stock de un producto
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, cantidad, tipo } = body; // tipo: "agregar", "quitar", "vender"

    if (!id || cantidad === undefined) {
      return NextResponse.json(
        { error: "Faltan datos: id y cantidad" },
        { status: 400 }
      );
    }

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    // Obtener el producto actual
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "INVENTARIO!A:F",
    });

    const productos = response.data.values || [];
    if (productos.length === 0) {
      return NextResponse.json({ error: "No hay productos" }, { status: 404 });
    }

    const rowIndex = productos.findIndex((row) => parseInt(row[0]) === id);
    if (rowIndex === -1) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const producto = productos[rowIndex];
    const stockActual = parseInt(producto[2]);
    let nuevoStock = stockActual;

    if (tipo === "agregar") {
      nuevoStock = stockActual + cantidad;
    } else if (tipo === "quitar" || tipo === "vender") {
      if (stockActual < cantidad) {
        return NextResponse.json(
          { error: "Stock insuficiente" },
          { status: 400 }
        );
      }
      nuevoStock = stockActual - cantidad;
    }

    const rowNumber = rowIndex + 1; // +1 porque la fila 1 son encabezados
    const hoy = new Date().toISOString().split("T")[0];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `INVENTARIO!C${rowNumber}:F${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[nuevoStock, producto[3], producto[4], hoy]],
      },
    });

    return NextResponse.json({ success: true, nuevoStock });
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
