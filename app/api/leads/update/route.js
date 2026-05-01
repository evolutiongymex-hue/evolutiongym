// app/api/leads/update/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      tipo,
      id,
      campo,
      valor,
      fecha_pago,
      proximo_pago,
      plan,
      precio,
      recibo_url,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("❌ MAKE_WEBHOOK_URL no configurado");
      return NextResponse.json(
        { error: "Error de configuración" },
        { status: 500 }
      );
    }

    let payload;

    // Caso: pago completo (una sola petición con todos los datos)
    if (tipo === "pago_completo") {
      payload = {
        tipo: "pago_completo",
        id: id,
        fecha_pago: fecha_pago,
        proximo_pago: proximo_pago,
        plan: plan,
        precio: precio,
        recibo_url: recibo_url || "",
      };
      console.log("📤 Enviando pago completo a MAKE:", payload);
    }
    // Caso: update normal (campo + valor)
    else {
      payload = {
        tipo: tipo || "update",
        id: id,
        campo: campo,
        valor: valor,
      };
      console.log("📤 Enviando update a MAKE:", payload);
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`MAKE error: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
