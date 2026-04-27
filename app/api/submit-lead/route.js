// app/api/submit-lead/route.js

export async function POST(request) {
  console.log("📥 API Route recibió una solicitud");

  try {
    const body = await request.json();
    const { nombre, telefono, fecha, horario } = body;

    // Validar campos
    if (!nombre || !telefono || !horario) {
      return Response.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    // Validar fecha
    if (!fecha) {
      return Response.json(
        { error: "Debes seleccionar una fecha" },
        { status: 400 }
      );
    }

    // Validar teléfono (10 dígitos)
    const telefonoLimpio = telefono.replace(/\D/g, "");
    if (telefonoLimpio.length < 10) {
      return Response.json(
        { error: "El teléfono debe tener al menos 10 dígitos" },
        { status: 400 }
      );
    }

    // Preparar datos para Google Sheets
    const leadData = {
      fechaConsulta: new Date().toLocaleString("es-CL", {
        timeZone: "America/Santiago",
      }),
      nombre: nombre.trim(),
      telefono: telefonoLimpio,
      fechaPrueba: fecha,
      horario: horario,
      estado: "Pendiente confirmación",
      fuente: "Landing Page",
      asistio: "Pendiente",
      notas: "",
    };

    console.log("📝 Datos preparados:", leadData);

    // Obtener webhook de MAKE desde .env.local
    const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

    // 🔥 CORRECCIÓN: Verificar si hay webhook REAL configurado
    const esWebhookReal =
      MAKE_WEBHOOK_URL &&
      MAKE_WEBHOOK_URL !== "" &&
      !MAKE_WEBHOOK_URL.includes("TU_WEBHOOK_ID_AQUI");

    if (!esWebhookReal) {
      // MODO DEMO: Solo simulamos
      console.log("⚠️ MODO DEMO: Webhook no configurado, simulando envío");
      console.log("📤 (Simulado) Datos guardados:", leadData);

      return Response.json({
        success: true,
        message: `✅ ¡Clase agendada para el ${fecha} en horario ${horario}! (Modo demo) Te contactaremos pronto.`,
      });
    }

    // MODO REAL: Enviar a MAKE
    console.log("📤 Enviando a MAKE real:", MAKE_WEBHOOK_URL);

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      throw new Error(`MAKE respondió con error: ${response.status}`);
    }

    console.log("✅ Datos enviados correctamente a MAKE");

    return Response.json({
      success: true,
      message: `✅ ¡Clase agendada para el ${fecha} en horario ${horario}! Te contactaremos para confirmar.`,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);

    return Response.json(
      { error: "Error al procesar tu solicitud. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
