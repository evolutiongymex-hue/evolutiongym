// app/api/leads/update/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, campo, valor } = body;

    if (!id || !campo) {
      return NextResponse.json({ error: "Falta id o campo" }, { status: 400 });
    }

    // Usar el MISMO webhook de siempre
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("❌ MAKE_WEBHOOK_URL no configurado");
      return NextResponse.json(
        { error: "Error de configuración" },
        { status: 500 }
      );
    }

    // Enviar al MISMO webhook, pero con tipo "update"
    const payload = {
      tipo: "update", // ← CLAVE: para que el router sepa qué hacer
      id: id,
      campo: campo,
      valor: valor,
    };

    console.log("📤 Enviando a MAKE:", payload);

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
