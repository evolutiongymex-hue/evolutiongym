import { NextResponse } from "next/server";
import { getAuthClient, getSheetsClient, SHEET_ID } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "INVENTARIO!A:F",
    });

    const datos = response.data.values ?? [];
    if (datos.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const productos = datos.slice(1).map((row) => ({
      id: parseInt(row[0]) || 0,
      nombre: row[1] ?? "",
      stock: parseInt(row[2]) || 0,
      precio_venta: parseInt(row[3]) || 0,
      stock_minimo:
        row[4] !== undefined && row[4] !== "" ? parseInt(row[4]) : 0,
      ultima_actualizacion: row[5] ?? "",
    }));

    return NextResponse.json({ success: true, data: productos });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener inventario" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, stock, precio_venta, stock_minimo } = body;

    if (!nombre || !precio_venta) {
      return NextResponse.json(
        { error: "nombre y precio_venta son obligatorios" },
        { status: 400 }
      );
    }

    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "INVENTARIO!A:A",
    });

    const nuevoId = response.data.values?.length ?? 1;
    const hoy = new Date().toISOString().split("T")[0];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "INVENTARIO!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            nuevoId,
            nombre,
            stock ?? 0,
            precio_venta,
            stock_minimo !== undefined ? stock_minimo : 0,
            hoy,
          ],
        ],
      },
    });

    return NextResponse.json({ success: true, id: nuevoId });
  } catch {
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, cantidad, tipo, nombre, precio_venta, stock_minimo } = body;

    if (!id) {
      return NextResponse.json({ error: "id es obligatorio" }, { status: 400 });
    }

    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "INVENTARIO!A:F",
    });

    const productos = response.data.values ?? [];
    const rowIndex = productos.findIndex((row) => parseInt(row[0]) === id);

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const producto = productos[rowIndex];
    const hoy = new Date().toISOString().split("T")[0];

    // Modo edicion — actualiza nombre, precio y stock minimo
    if (
      nombre !== undefined ||
      precio_venta !== undefined ||
      stock_minimo !== undefined
    ) {
      const nuevoNombre = nombre ?? producto[1];
      const stockActual = parseInt(producto[2]) || 0;
      const nuevoPrecio = precio_venta ?? (parseInt(producto[3]) || 0);
      const nuevoStockMin =
        stock_minimo !== undefined
          ? parseInt(stock_minimo)
          : producto[4] !== undefined && producto[4] !== ""
          ? parseInt(producto[4])
          : 0;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `INVENTARIO!B${rowIndex + 1}:F${rowIndex + 1}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[nuevoNombre, stockActual, nuevoPrecio, nuevoStockMin, hoy]],
        },
      });

      return NextResponse.json({ success: true });
    }

    // Modo stock — agregar o vender
    if (cantidad === undefined) {
      return NextResponse.json(
        { error: "cantidad es obligatorio para actualizar stock" },
        { status: 400 }
      );
    }

    const stockActual = parseInt(producto[2]) || 0;
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

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `INVENTARIO!C${rowIndex + 1}:F${rowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[nuevoStock, producto[3], producto[4], hoy]],
      },
    });

    return NextResponse.json({ success: true, nuevoStock });
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}
