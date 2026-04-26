// components/Formulario.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Formulario = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    horario: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.3,
          ease: "back.out(0.8)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      setSubmitStatus({
        type: "error",
        message: "Por favor ingresa tu nombre",
      });
      setTimeout(() => setSubmitStatus(null), 3000);
      return;
    }

    if (!formData.telefono.trim()) {
      setSubmitStatus({
        type: "error",
        message: "Por favor ingresa tu teléfono",
      });
      setTimeout(() => setSubmitStatus(null), 3000);
      return;
    }

    if (!formData.horario) {
      setSubmitStatus({
        type: "error",
        message: "Selecciona un horario de preferencia",
      });
      setTimeout(() => setSubmitStatus(null), 3000);
      return;
    }

    setIsSubmitting(true);

    // Simulación de envío (luego conectaremos a Google Sheets)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Datos enviados:", formData);

      setSubmitStatus({
        type: "success",
        message: "¡Clase agendada con éxito! Te contactaremos pronto.",
      });
      setFormData({ nombre: "", telefono: "", horario: "" });

      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Error al enviar. Intenta nuevamente.",
      });
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={sectionRef} className="py-24 px-4" id="formulario">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Columna izquierda - Texto */}
          <div ref={titleRef}>
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-primary text-sm font-semibold">
                📋 RESERVA TU LUGAR
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
              <span className="text-primary font-semibold">clase gratis</span>.
              Un asesor te contactará en menos de 15 minutos.
            </p>

            {/* Beneficios rápidos */}
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
                  Respuesta en menos de 15 min
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
                  Sin spam, solo información útil
                </span>
              </div>
            </div>

            {/* Testimonio mini */}
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <span className="text-secondary font-bold">AR</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 italic">
                    "Agendé mi clase gratis y a la semana ya era socio. Súper
                    recomendado."
                  </p>
                  <p className="text-xs text-gray-500 mt-1">— Ana R.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div ref={formRef}>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-2 text-center">
                Agenda tu clase gratis
              </h3>
              <p className="text-gray-400 text-sm text-center mb-6">
                Completa el formulario y te contactamos
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Campo Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Campo Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej: +56 9 1234 5678"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Campo Horario */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    ¿Qué horario te interesa? *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Mañana", "Tarde", "Noche"].map((horario) => (
                      <button
                        key={horario}
                        type="button"
                        onClick={() => setFormData({ ...formData, horario })}
                        className={`
                          py-2 px-3 rounded-lg text-sm font-medium transition-all
                          ${
                            formData.horario === horario
                              ? "bg-primary text-white"
                              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                          }
                        `}
                      >
                        {horario}
                        {horario === "Mañana" && " 🌅"}
                        {horario === "Tarde" && " ☀️"}
                        {horario === "Noche" && " 🌙"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    w-full py-3 rounded-lg font-semibold text-white transition-all mt-6
                    ${
                      isSubmitting
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-primary hover:bg-primary-600 hover:scale-105 active:scale-95"
                    }
                  `}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Agendar clase prueba"
                  )}
                </button>

                {/* Mensaje de privacidad */}
                <p className="text-center text-gray-500 text-xs mt-4">
                  Al enviar, aceptas nuestros{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                  >
                    términos y condiciones
                  </button>
                </p>
              </form>

              {/* Mensaje de éxito/error */}
              {submitStatus && (
                <div
                  className={`
                  mt-4 p-3 rounded-lg text-center text-sm
                  ${
                    submitStatus.type === "success"
                      ? "bg-green-500/20 border border-green-500/50 text-green-400"
                      : "bg-red-500/20 border border-red-500/50 text-red-400"
                  }
                `}
                >
                  {submitStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Formulario;
