// app/api/leads/update/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, campo, valor } = body;

    if (!id || !campo) {
      return NextResponse.json({ error: "Falta id o campo" }, { status: 400 });
    }

    const webhookUrl = process.env.MAKE_UPDATE_LEAD_WEBHOOK;

    if (!webhookUrl) {
      console.error("❌ MAKE_UPDATE_LEAD_WEBHOOK no configurado");
      return NextResponse.json(
        { error: "Error de configuración" },
        { status: 500 }
      );
    }

    // Enviar a MAKE
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, campo, valor }),
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
