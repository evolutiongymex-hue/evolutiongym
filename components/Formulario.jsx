// components/Formulario.jsx
"use client";

import React, { useState } from "react";

const Formulario = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    fecha: "",
    horario: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: "", text: "" });
  };

  const validarTelefono = (telefono) => {
    const digitos = telefono.replace(/\D/g, "");
    return digitos.length >= 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      setMessage({ type: "error", text: "Por favor ingresa tu nombre" });
      return;
    }

    if (!validarTelefono(formData.telefono)) {
      setMessage({
        type: "error",
        text: "Ingresa un teléfono válido (mínimo 10 dígitos)",
      });
      return;
    }

    if (!formData.fecha) {
      setMessage({
        type: "error",
        text: "Selecciona una fecha para tu clase prueba",
      });
      return;
    }

    if (!formData.horario) {
      setMessage({
        type: "error",
        text: "Selecciona un horario de preferencia",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          telefono: formData.telefono,
          fecha: formData.fecha,
          horario: formData.horario,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message });
        setFormData({ nombre: "", telefono: "", fecha: "", horario: "" });
      } else {
        setMessage({ type: "error", text: data.error || "Error al enviar" });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error de conexión. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 px-4" id="formulario">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Columna izquierda - Texto */}
          <div>
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-primary text-sm font-semibold">
                RESERVA TU CLASE
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              ¿Listo para{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                empezar?
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-6">
              Completa el formulario y agenda tu{" "}
              <span className="text-primary font-semibold">clase gratis</span>{" "}
              en el día que prefieras.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm">
                  Clase gratis sin compromiso
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm">
                  Elige el día que quieras
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm">
                  Respuesta en menos de 15 min
                </span>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-2 text-center">
                Agenda tu clase gratis
              </h3>
              <p className="text-gray-400 text-sm text-center mb-6">
                Elige el día y horario que prefieras
              </p>

              {message.text && (
                <div
                  className={`mb-4 p-3 rounded-lg text-center text-sm ${
                    message.type === "success"
                      ? "bg-green-500/20 border border-green-500/50 text-green-400"
                      : "bg-red-500/20 border border-red-500/50 text-red-400"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="Ej: 9123456789"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    10 dígitos, sin +56
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    ¿Qué día quieres venir? *
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Horario preferido *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Mañana", "Tarde", "Noche"].map((horario) => (
                      <button
                        key={horario}
                        type="button"
                        onClick={() => setFormData({ ...formData, horario })}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.horario === horario
                            ? "bg-primary text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        {horario}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all mt-4 ${
                    isSubmitting
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-primary hover:bg-primary-600"
                  }`}
                >
                  {isSubmitting ? "Enviando..." : "Agendar clase prueba"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Formulario;
