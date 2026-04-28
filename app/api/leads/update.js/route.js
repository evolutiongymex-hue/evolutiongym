import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { rowNumber, confirmo, asistio, estado } = body;

    if (!rowNumber) {
      return NextResponse.json(
        { error: "Falta el número de fila" },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.MAKE_UPDATE_LEAD_WEBHOOK;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Webhook no configurado" },
        { status: 500 }
      );
    }

    const payload = {
      rowNumber: parseInt(rowNumber),
      ...(confirmo !== undefined && { confirmo }),
      ...(asistio !== undefined && { asistio }),
      ...(estado !== undefined && { estado }),
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`MAKE respondió con error: ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: "Actualizado correctamente",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
