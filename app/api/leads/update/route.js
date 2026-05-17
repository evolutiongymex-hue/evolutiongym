import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      tipo,
      id,
      campo,
      valor,
      nombre,
      telefono,
      fecha_pago,
      proximo_pago,
      plan,
      precio,
      recibo_url,
      metodo_pago,
      meses_incluidos,
      estado,
      confirmo,
      asistio,
      fecha_prueba,
      horario,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta el campo id" }, { status: 400 });
    }

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Error de configuracion del servidor" },
        { status: 500 }
      );
    }

    let payload;

    if (tipo === "nuevo_activo") {
      payload = {
        tipo: "nuevo_activo",
        id,
        nombre: nombre ?? "",
        telefono: telefono ?? "",
        fecha_prueba: fecha_prueba ?? "",
        horario: horario ?? "N/A",
        estado: estado ?? "ACTIVO",
        confirmo: confirmo ?? "Si",
        asistio: asistio ?? "Si",
        plan: plan ?? "",
        precio: precio ?? 0,
        fecha_pago: fecha_pago ?? "",
        proximo_pago: proximo_pago ?? "",
        recibo_url: recibo_url ?? "",
        metodo_pago: metodo_pago ?? "transferencia",
        meses_incluidos: meses_incluidos ?? 1,
      };
    } else if (tipo === "pago_completo") {
      payload = {
        tipo: "pago_completo",
        id,
        nombre: nombre ?? "",
        telefono: telefono ?? "",
        fecha_pago,
        proximo_pago,
        plan,
        precio,
        recibo_url: recibo_url ?? "",
        metodo_pago: metodo_pago ?? "transferencia",
        meses_incluidos: meses_incluidos ?? 1,
        estado: estado ?? "ACTIVO",
        confirmo: confirmo ?? "Si",
        asistio: asistio ?? "Si",
      };
    } else {
      payload = {
        tipo: tipo ?? "update",
        id,
        campo,
        valor,
      };
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Make webhook error: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
