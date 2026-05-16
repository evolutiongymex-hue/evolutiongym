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

    console.log("📥 API leads/update recibió:", {
      tipo,
      id,
      nombre,
      plan,
      precio,
      estado,
    });

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

    // Caso: nuevo cliente activo (crear directamente en CRM)
    if (tipo === "nuevo_activo") {
      payload = {
        tipo: "nuevo_activo",
        id: id,
        nombre: nombre || "",
        telefono: telefono || "",
        fecha_prueba: fecha_prueba || "",
        horario: horario || "N/A",
        estado: estado || "ACTIVO",
        confirmo: confirmo || "Sí",
        asistio: asistio || "Sí",
        plan: plan || "",
        precio: precio || 0,
        fecha_pago: fecha_pago || "",
        proximo_pago: proximo_pago || "",
        recibo_url: recibo_url || "",
        metodo_pago: metodo_pago || "transferencia",
        meses_incluidos: meses_incluidos || 1,
      };
      console.log("📤 Enviando nuevo activo a MAKE:", payload);
    }
    // Caso: pago completo (actualizar lead existente)
    else if (tipo === "pago_completo") {
      payload = {
        tipo: "pago_completo",
        id: id,
        nombre: nombre || "",
        telefono: telefono || "",
        fecha_pago: fecha_pago,
        proximo_pago: proximo_pago,
        plan: plan,
        precio: precio,
        recibo_url: recibo_url || "",
        metodo_pago: metodo_pago || "transferencia",
        meses_incluidos: meses_incluidos || 1,
        estado: estado || "ACTIVO",
        confirmo: confirmo || "Sí",
        asistio: asistio || "Sí",
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
