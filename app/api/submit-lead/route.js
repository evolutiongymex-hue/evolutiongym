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

    // Validar teléfono (10 dígitos para México)
    const telefonoLimpio = telefono.replace(/\D/g, "");
    if (telefonoLimpio.length < 10) {
      return Response.json(
        { error: "El teléfono debe tener al menos 10 dígitos" },
        { status: 400 }
      );
    }

    // ID más único (evita duplicados)
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const leadData = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      fecha_creacion: new Date().toISOString(), // ← Formato ISO
      nombre: nombre.trim(),
      telefono: telefonoLimpio,
      fecha_prueba: fecha, // ← Esta viene del input date (YYYY-MM-DD)
      horario: horario,
      estado: "NUEVO",
      fuente: "Landing Page",
      confirmo: "Pendiente",
      asistio: "Pendiente",
      plan: "",
      precio: "",
      fecha_pago: "",
      proximo_pago: "",
      recibio_url: "",
      ultima_interaccion: new Date().toISOString(), // ← Formato ISO
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
      message: `¡Clase agendada para el ${fecha} en horario ${horario}! Te contactaremos para confirmar.`,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return Response.json(
      { error: "Error al procesar tu solicitud. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
