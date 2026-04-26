// components/PorqueElegirnos.jsx
"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PorqueElegirnos = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación del título
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

      // Animación de las tarjetas
      cardsRef.current.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: index * 0.15,
            ease: "back.out(0.8)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const ventajas = [
    {
      id: 1,
      titulo: "Horarios Flexibles",
      descripcion:
        "Entrena cuando quieras. Abrimos de 6am a 11pm, 7 días a la semana. Nos adaptamos a tu ritmo de vida.",
      icono: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "from-primary/20 to-transparent",
      borderColor: "border-primary/30",
    },
    {
      id: 2,
      titulo: "Mejores Precios",
      descripcion:
        "Planes flexibles que se ajustan a tu bolsillo. Sin letras chicas, sin costos ocultos. Pagas lo que ves.",
      icono: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "from-secondary/20 to-transparent",
      borderColor: "border-secondary/30",
    },
    {
      id: 3,
      titulo: "Asesoría Incluida",
      descripcion:
        "Entrenadores profesionales te guían en cada paso. Planes personalizados según tus objetivos y nivel.",
      icono: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      color: "from-primary/20 to-secondary/20",
      borderColor: "border-primary/30",
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4" id="porque-elegirnos">
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary text-sm font-semibold">
              ¿POR QUÉ ELEGIRNOS?
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            La mejor decisión para{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              tu salud
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Más de 500 alumnos confían en nosotros. Descubre por qué.
          </p>
        </div>

        {/* Grid de 3 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ventajas.map((ventaja, index) => (
            <div
              key={ventaja.id}
              ref={(el) => (cardsRef.current[index] = el)}
              className={`
                group relative rounded-2xl p-8
                bg-gradient-to-br ${ventaja.color}
                border ${ventaja.borderColor}
                backdrop-blur-sm
                transition-all duration-300
                hover:-translate-y-2
                hover:shadow-xl
                hover:shadow-primary/10
              `}
            >
              {/* Icono */}
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                {ventaja.icono}
              </div>

              {/* Título */}
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                {ventaja.titulo}
              </h3>

              {/* Descripción */}
              <p className="text-gray-400 text-sm leading-relaxed">
                {ventaja.descripcion}
              </p>

              {/* Línea decorativa al hover */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))}
        </div>

        {/* Beneficios adicionales en badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <div className="px-4 py-2 rounded-full bg-gray-900/50 border border-gray-800 text-sm text-gray-300">
            ✅ Sin permanencia
          </div>
          <div className="px-4 py-2 rounded-full bg-gray-900/50 border border-gray-800 text-sm text-gray-300">
            ✅ Cancela cuando quieras
          </div>
          <div className="px-4 py-2 rounded-full bg-gray-900/50 border border-gray-800 text-sm text-gray-300">
            ✅ Estacionamiento gratis
          </div>
          <div className="px-4 py-2 rounded-full bg-gray-900/50 border border-gray-800 text-sm text-gray-300">
            ✅ Lockers y duchas
          </div>
        </div>
      </div>
    </section>
  );
};

export default PorqueElegirnos;
