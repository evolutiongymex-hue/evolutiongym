import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, telefono, fecha, horario } = body;

    if (!nombre || !telefono || !horario || !fecha) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const telefonoLimpio = telefono.replace(/\D/g, "");
    if (telefonoLimpio.length !== 10) {
      return NextResponse.json(
        { error: "El telefono debe tener exactamente 10 digitos" },
        { status: 400 }
      );
    }

    const ahora = new Date().toISOString();
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const leadData = {
      id,
      fecha_creacion: ahora,
      nombre: nombre.trim(),
      telefono: telefonoLimpio,
      fecha_prueba: fecha,
      horario,
      estado: "NUEVO",
      fuente: "Landing Page",
      confirmo: "Pendiente",
      asistio: "Pendiente",
      plan: "",
      precio: "",
      fecha_pago: "",
      proximo_pago: "",
      recibo_url: "",
      ultima_interaccion: ahora,
      actualizado_por: "sistema",
      notas: "",
    };

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;

    if (!webhookUrl || webhookUrl.includes("TU_WEBHOOK_ID_AQUI")) {
      return NextResponse.json({
        success: true,
        message: `Clase agendada para el ${fecha} en horario ${horario}. (Modo demo)`,
      });
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      throw new Error(`Make webhook error: ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: `Clase agendada para el ${fecha} en horario ${horario}. Te contactaremos pronto para confirmar.`,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al procesar tu solicitud. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
