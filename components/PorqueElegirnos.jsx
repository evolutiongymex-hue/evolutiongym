"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiClock, FiDollarSign, FiUser, FiCheck } from "react-icons/fi";

const VENTAJAS = [
  {
    id: 1,
    titulo: "Horarios flexibles",
    descripcion:
      "Entrena cuando quieras. Abrimos de 7am a 10pm, 7 dias a la semana. Nos adaptamos a tu ritmo de vida.",
    icon: FiClock,
    gradient: "from-primary/15 to-transparent",
    border: "border-primary/25",
    glow: "shadow-primary/10",
  },
  {
    id: 2,
    titulo: "Mejores precios",
    descripcion:
      "Planes flexibles que se ajustan a tu bolsillo. Sin letras chicas, sin costos ocultos. Pagas lo que ves.",
    icon: FiDollarSign,
    gradient: "from-secondary/15 to-transparent",
    border: "border-secondary/25",
    glow: "shadow-secondary/10",
  },
  {
    id: 3,
    titulo: "Asesoria incluida",
    descripcion:
      "Entrenadores profesionales te guian en cada paso. Planes personalizados segun tus objetivos y nivel.",
    icon: FiUser,
    gradient: "from-primary/10 to-secondary/10",
    border: "border-primary/25",
    glow: "shadow-primary/10",
  },
];

const BADGES = [
  "Sin permanencia",
  "Cancela cuando quieras",
  "Estacionamiento gratis",
  "Lockers y duchas",
];

const PorqueElegirnos = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      const validCards = cardsRef.current.filter(Boolean);

      gsap.fromTo(
        validCards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(0.7)",
          stagger: 0.14,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4" id="porque-elegirnos">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary text-xs font-bold tracking-widest uppercase">
              Por que elegirnos
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
            La mejor decision para{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              tu salud
            </span>
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Mas de 180 alumnos confian en nosotros. Descubre por que.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VENTAJAS.map((ventaja, index) => {
            const Icon = ventaja.icon;
            return (
              <div
                key={ventaja.id}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className={`
                  group relative rounded-2xl p-8 overflow-hidden
                  bg-gradient-to-br ${ventaja.gradient}
                  border ${ventaja.border}
                  backdrop-blur-sm
                  transition-all duration-300
                  hover:-translate-y-2
                  hover:shadow-xl ${ventaja.glow}
                `}
              >
                {/* Icono */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                {/* Texto */}
                <h3 className="text-lg font-bold mb-3 text-white group-hover:text-primary transition-colors duration-300">
                  {ventaja.titulo}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {ventaja.descripcion}
                </p>

                {/* Linea decorativa hover */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            );
          })}
        </div>

        {/* Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {BADGES.map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-gray-400"
            >
              <FiCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PorqueElegirnos;
