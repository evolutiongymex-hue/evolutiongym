"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { FiCheck, FiClock, FiShield, FiCalendar } from "react-icons/fi";

const schema = z.object({
  nombre: z
    .string()
    .min(2, "Ingresa tu nombre completo")
    .max(60, "Nombre demasiado largo")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Solo letras y espacios"),
  telefono: z
    .string()
    .regex(/^\d{10}$/, "Ingresa 10 digitos sin espacios ni guiones"),
  fecha: z
    .string()
    .min(1, "Selecciona una fecha")
    .refine((val) => {
      const selected = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, "La fecha no puede ser en el pasado"),
  horario: z.enum(["Manana", "Tarde", "Noche"], {
    required_error: "Selecciona un horario",
  }),
});

const HORARIOS = [
  { value: "Manana", label: "Manana", sub: "7am – 12pm" },
  { value: "Tarde", label: "Tarde", sub: "12pm – 6pm" },
  { value: "Noche", label: "Noche", sub: "6pm – 10pm" },
];

const BENEFICIOS = [
  { icon: FiCheck, text: "Clase gratis sin compromiso" },
  { icon: FiClock, text: "Elige el dia que quieras" },
  { icon: FiShield, text: "Respuesta en menos de 15 min" },
];

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const Formulario = () => {
  const [submitStatus, setSubmitStatus] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      telefono: "",
      fecha: "",
      horario: undefined,
    },
  });

  const horarioSeleccionado = watch("horario");

  const onSubmit = useCallback(
    async (data) => {
      setSubmitStatus(null);

      try {
        const response = await fetch("/api/submit-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          setSubmitStatus({
            type: "success",
            text: result.message || "Clase agendada. Te contactamos pronto.",
          });
          reset();
        } else {
          setSubmitStatus({
            type: "error",
            text: result.error || "Error al enviar. Intenta de nuevo.",
          });
        }
      } catch {
        setSubmitStatus({
          type: "error",
          text: "Error de conexion. Intenta nuevamente.",
        });
      }
    },
    [reset]
  );

  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <section className="py-24 px-4" id="formulario">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center"
        >
          {/* Columna izquierda */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <FiCalendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-primary text-xs font-bold tracking-widest uppercase">
                Reserva tu clase
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black mb-5 tracking-tight leading-tight">
              Listo para{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                empezar?
              </span>
            </h2>

            <p className="text-gray-400 text-base mb-8 leading-relaxed">
              Completa el formulario y agenda tu{" "}
              <span className="text-primary font-semibold">clase gratis</span>{" "}
              en el dia que prefieras.
            </p>

            <ul className="space-y-4">
              {BENEFICIOS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-gray-300 text-sm">{text}</span>
                </li>
              ))}
            </ul>

            {/* Separador con glow */}
            <div className="mt-10 pt-8 border-t border-white/5">
              <p className="text-gray-600 text-xs">
                Al enviar aceptas que te contactemos por WhatsApp para confirmar
                tu clase.
              </p>
            </div>
          </motion.div>

          {/* Columna derecha — Formulario */}
          <motion.div variants={itemVariants}>
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8">
              {/* Glow decorativo */}
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

              <h3 className="text-xl font-bold mb-1 text-center text-white">
                Agenda tu clase gratis
              </h3>
              <p className="text-gray-500 text-sm text-center mb-6">
                Sin costo, sin compromiso
              </p>

              {/* Status message */}
              {submitStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-5 p-3.5 rounded-xl text-center text-sm font-medium border ${
                    submitStatus.type === "success"
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
                >
                  {submitStatus.text}
                </motion.div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-5"
              >
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    {...register("nombre")}
                    disabled={isSubmitting}
                    placeholder="Ej: Juan Perez"
                    className={`w-full px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 bg-white/5 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 ${
                      errors.nombre
                        ? "border-red-500/60 bg-red-500/5"
                        : "border-white/10 focus:border-primary/50"
                    }`}
                  />
                  {errors.nombre && (
                    <p className="text-red-400 text-xs mt-1.5">
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                {/* Telefono */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    {...register("telefono")}
                    disabled={isSubmitting}
                    placeholder="10 digitos, ej: 5512345678"
                    className={`w-full px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 bg-white/5 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 ${
                      errors.telefono
                        ? "border-red-500/60 bg-red-500/5"
                        : "border-white/10 focus:border-primary/50"
                    }`}
                  />
                  {errors.telefono ? (
                    <p className="text-red-400 text-xs mt-1.5">
                      {errors.telefono.message}
                    </p>
                  ) : (
                    <p className="text-gray-600 text-xs mt-1">
                      10 digitos sin espacios ni codigo de pais
                    </p>
                  )}
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Fecha de visita *
                  </label>
                  <input
                    type="date"
                    {...register("fecha")}
                    disabled={isSubmitting}
                    min={todayISO}
                    className={`w-full px-4 py-3 rounded-xl text-white text-sm bg-white/5 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 [color-scheme:dark] ${
                      errors.fecha
                        ? "border-red-500/60 bg-red-500/5"
                        : "border-white/10 focus:border-primary/50"
                    }`}
                  />
                  {errors.fecha && (
                    <p className="text-red-400 text-xs mt-1.5">
                      {errors.fecha.message}
                    </p>
                  )}
                </div>

                {/* Horario */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Horario preferido *
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {HORARIOS.map(({ value, label, sub }) => {
                      const isSelected = horarioSeleccionado === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            setValue("horario", value, { shouldValidate: true })
                          }
                          className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 flex flex-col items-center gap-0.5 border ${
                            isSelected
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                              : "bg-white/5 border-white/10 text-gray-400 hover:border-white/25 hover:text-white"
                          }`}
                        >
                          {label}
                          <span
                            className={`text-[10px] font-normal ${
                              isSelected ? "text-white/70" : "text-gray-600"
                            }`}
                          >
                            {sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.horario && (
                    <p className="text-red-400 text-xs mt-1.5">
                      {errors.horario.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className={`relative w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 overflow-hidden mt-2 ${
                    isSubmitting
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-primary shadow-lg shadow-primary/25 hover:brightness-110"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Agendar clase gratis"
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Formulario;
