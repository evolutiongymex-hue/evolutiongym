import { NextResponse } from "next/server";
import { getAuthClient, getSheetsClient, SHEET_ID } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const [movimientosRes, ventasRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "CAJA_PRODUCTOS_MOVIMIENTOS!A:H",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "VENTAS_INVENTARIO!A:F",
      }),
    ]);

    const movimientos = (movimientosRes.data.values ?? [])
      .slice(1)
      .map((row) => ({
        id: row[0] ?? "",
        fecha: row[1] ?? "",
        tipo: row[2] ?? "",
        concepto: row[3] ?? "",
        monto: parseFloat(row[4]) || 0,
        saldo_anterior: parseFloat(row[5]) || 0,
        saldo_nuevo: parseFloat(row[6]) || 0,
        registrado_por: row[7] ?? "",
      }));

    const ventas = (ventasRes.data.values ?? []).slice(1);
    const hoy = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Mexico_City",
    });

    // Ventas en efectivo del día
    const ventasEfectivoHoy = ventas
      .filter(
        (v) => v[4] === hoy && (v[5] ?? "efectivo").toLowerCase() === "efectivo"
      )
      .reduce((s, v) => s + (parseFloat(v[3]) || 0), 0);

    const movimientosHoy = movimientos.filter((m) => m.fecha === hoy);

    const ultimoMovimiento = movimientos[movimientos.length - 1];
    const saldoBase = ultimoMovimiento ? ultimoMovimiento.saldo_nuevo : 0;

    const retirosHoy = movimientosHoy
      .filter((m) => m.tipo === "retiro")
      .reduce((s, m) => s + m.monto, 0);

    const fondosHoy = movimientosHoy
      .filter((m) => m.tipo === "fondo")
      .reduce((s, m) => s + m.monto, 0);

    const saldoEnCaja = saldoBase + ventasEfectivoHoy;

    return NextResponse.json({
      success: true,
      saldoEnCaja,
      ventasEfectivoHoy,
      retirosHoy,
      fondosHoy,
      movimientosHoy,
      movimientos,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error al obtener caja productos: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tipo, concepto, monto } = body;

    if (!tipo || !monto || monto <= 0) {
      return NextResponse.json(
        { error: "tipo y monto son obligatorios" },
        { status: 400 }
      );
    }

    const auth = await getAuthClient();
    const sheets = getSheetsClient(auth);

    const [movRes, ventasRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "CAJA_PRODUCTOS_MOVIMIENTOS!A:H",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "VENTAS_INVENTARIO!A:F",
      }),
    ]);

    const movimientos = (movRes.data.values ?? []).slice(1);
    const ventas = (ventasRes.data.values ?? []).slice(1);
    const hoy = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Mexico_City",
    });

    const ultimoMov = movimientos[movimientos.length - 1];
    const saldoBase = ultimoMov ? parseFloat(ultimoMov[6]) || 0 : 0;

    const ventasEfectivoHoy = ventas
      .filter(
        (v) => v[4] === hoy && (v[5] ?? "efectivo").toLowerCase() === "efectivo"
      )
      .reduce((s, v) => s + (parseFloat(v[3]) || 0), 0);

    const saldoActual = saldoBase + ventasEfectivoHoy;

    let saldoNuevo;
    if (tipo === "retiro") {
      if (monto > saldoActual) {
        return NextResponse.json(
          {
            error:
              "El retiro supera el saldo disponible ($" +
              saldoActual.toLocaleString() +
              ")",
          },
          { status: 400 }
        );
      }
      saldoNuevo = saldoActual - monto;
    } else {
      saldoNuevo = saldoActual + monto;
    }

    const nuevoId = movimientos.length + 1;
    const ahora = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Mexico_City",
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "CAJA_PRODUCTOS_MOVIMIENTOS!A:H",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            nuevoId,
            ahora,
            tipo,
            concepto || tipo,
            monto,
            saldoActual,
            saldoNuevo,
            "admin",
          ],
        ],
      },
    });

    return NextResponse.json({ success: true, saldoNuevo });
  } catch (err) {
    return NextResponse.json(
      { error: "Error al registrar movimiento: " + err.message },
      { status: 500 }
    );
  }
}
