// app/api/submit-lead/route.js
export async function POST(request) {
  console.log("📥 API Route recibió una solicitud");

  try {
    const body = await request.json();
    const { nombre, telefono, fecha, horario } = body;

    if (!nombre || !telefono || !horario || !fecha) {
      return Response.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const telefonoLimpio = telefono.replace(/\D/g, "");
    if (telefonoLimpio.length < 10) {
      return Response.json(
        { error: "El teléfono debe tener al menos 10 dígitos" },
        { status: 400 }
      );
    }

    const leadData = {
      id: Date.now().toString(), // ID único basado en timestamp
      fecha_creacion: new Date().toLocaleString("es-CL", {
        timeZone: "America/Santiago",
      }),
      nombre: nombre.trim(),
      telefono: telefonoLimpio,
      fecha_prueba: fecha,
      horario: horario,
      estado: "NUEVO", // ← Cambió: antes era "Pendiente confirmación"
      fuente: "Landing Page",
      confirmo: "Pendiente", // ← NUEVO campo
      asistio: "Pendiente", // ← NUEVO campo
      plan: "", // ← Vacío hasta que se inscriba
      precio: "", // ← Vacío hasta que se inscriba
      fecha_pago: "", // ← Vacío hasta que pague
      proximo_pago: "", // ← Vacío hasta que pague
      recibio_url: "", // ← Vacío hasta que suba recibo
      ultima_interaccion: new Date().toLocaleString("es-CL", {
        timeZone: "America/Santiago",
      }),
      actualizado_por: "sistema",
      notas: "",
    };

    console.log("📝 Datos preparados:", leadData);

    const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

    if (!MAKE_WEBHOOK_URL || MAKE_WEBHOOK_URL.includes("TU_WEBHOOK_ID_AQUI")) {
      console.log("⚠️ MODO DEMO:", leadData);
      return Response.json({
        success: true,
        message: `✅ ¡Clase agendada para el ${fecha} en horario ${horario}! (Modo demo)`,
      });
    }

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) throw new Error(`MAKE error: ${response.status}`);

    return Response.json({
      success: true,
      message: `✅ ¡Clase agendada para el ${fecha} en horario ${horario}! Te contactaremos para confirmar.`,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return Response.json(
      { error: "Error al procesar tu solicitud. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
