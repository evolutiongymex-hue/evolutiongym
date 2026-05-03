"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Planes = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      cardsRef.current.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: index * 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const planes = [
    {
      id: "visita",
      nombre: "Visita",
      precio: "$50",
      periodo: "día",
      descripcion: "Perfecto para probar",
      ahorro: null,
      incluye: [
        "Acceso por 1 día completo",
        "Todas las máquinas",
        "Lockers y duchas",
        "Sin compromiso",
      ],
      color: "from-gray-800/50 to-gray-900/50",
      borderColor: "border-gray-700",
      btnColor: "bg-gray-700 hover:bg-gray-600",
      popular: false,
      badge: "🎟️ VISITA",
    },
    {
      id: "semanal",
      nombre: "Semanal",
      precio: "$150",
      periodo: "semana",
      descripcion: "Ideal para empezar",
      ahorro: null,
      incluye: [
        "Acceso por 7 días",
        "Todas las máquinas",
        "Lockers y duchas",
        "Clases grupales",
        "Sin permanencia",
      ],
      color: "from-primary/10 to-secondary/10",
      borderColor: "border-primary",
      btnColor: "bg-primary hover:bg-primary-600",
      popular: true,
      badge: "🔥 MÁS POPULAR",
    },
    {
      id: "bimestral",
      nombre: "Bimestral",
      precio: "$600",
      periodo: "2 meses",
      descripcion: "Ahorro garantizado",
      ahorro: "Ahorras $300",
      incluye: [
        "Todo del plan Semanal",
        "Evaluación física",
        "Estacionamiento gratis",
        "Nutricionista 1 vez",
      ],
      color: "from-gray-800/50 to-gray-900/50",
      borderColor: "border-gray-700",
      btnColor: "bg-gray-700 hover:bg-gray-600",
      popular: false,
      badge: "💰 AHORRA",
    },
    {
      id: "trimestral",
      nombre: "Trimestral",
      precio: "$800",
      periodo: "3 meses",
      descripcion: "Super ahorro",
      ahorro: "Ahorras $550",
      incluye: [
        "Todo del plan Bimestral",
        "App exclusiva",
        "Eventos exclusivos",
        "Invitado gratis 1 vez",
      ],
      color: "from-gray-800/50 to-gray-900/50",
      borderColor: "border-gray-700",
      btnColor: "bg-gray-700 hover:bg-gray-600",
      popular: false,
      badge: "🏆 RECOMENDADO",
    },
    {
      id: "anual",
      nombre: "Anualidad",
      precio: "$3,500",
      periodo: "año",
      descripcion: "Máximo ahorro",
      ahorro: "Ahorras $3,000",
      incluye: [
        "Todo del plan Trimestral",
        "2 meses gratis",
        "Camiseta oficial",
        "Congelación hasta 2 meses",
        "10% off en tienda",
      ],
      color: "from-gray-800/50 to-gray-900/50",
      borderColor: "border-gray-700",
      btnColor: "bg-gray-700 hover:bg-gray-600",
      popular: false,
      badge: "💎 MEJOR OFERTA",
    },
  ];

  const getPrecioPorDia = (precio, periodo) => {
    const precioNum = parseInt(precio.replace(/[^0-9]/g, ""));
    if (periodo === "día") return precioNum;
    if (periodo === "semana") return Math.round(precioNum / 7);
    if (periodo === "2 meses") return Math.round(precioNum / 60);
    if (periodo === "3 meses") return Math.round(precioNum / 90);
    if (periodo === "año") return Math.round(precioNum / 365);
    return 0;
  };

  const scrollToFormulario = () => {
    const formulario = document.querySelector("#formulario");
    if (formulario) {
      formulario.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section ref={sectionRef} className="py-20 px-4" id="planes">
      <div className="max-w-7xl mx-auto">
        <div ref={titleRef} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary text-xs font-semibold tracking-wide">
              PRECIOS CLAROS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Elige tu{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              plan
            </span>
          </h2>

          <p className="text-gray-400 text-base max-w-2xl mx-auto">
            Paga como quieras. Sin letras chicas, sin costos ocultos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {planes.map((plan, index) => {
            const precioPorDia = getPrecioPorDia(plan.precio, plan.periodo);

            return (
              <div
                key={plan.id}
                ref={(el) => (cardsRef.current[index] = el)}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`
                  relative rounded-xl overflow-hidden
                  bg-gradient-to-b ${plan.color}
                  border ${plan.borderColor}
                  backdrop-blur-sm
                  transition-all duration-300
                  ${hoveredCard === index ? "-translate-y-1" : "translate-y-0"}
                  ${
                    plan.popular
                      ? "shadow-lg shadow-primary/10"
                      : "shadow-md shadow-black/20"
                  }
                `}
              >
                <div
                  className={`
                    absolute top-3 right-3 z-10
                    px-2 py-0.5 rounded-md text-[10px] font-bold
                    tracking-wide
                    ${
                      plan.popular
                        ? "bg-primary text-white"
                        : "bg-gray-800/80 text-gray-300"
                    }
                  `}
                >
                  {plan.badge}
                </div>

                <div className="p-5">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold mb-0.5">{plan.nombre}</h3>
                    <p className="text-gray-500 text-[11px] mb-2">
                      {plan.descripcion}
                    </p>

                    <div className="mb-0.5">
                      <span className="text-3xl font-bold">{plan.precio}</span>
                      <span className="text-gray-500 text-xs">
                        {" "}
                        / {plan.periodo}
                      </span>
                    </div>

                    <p className="text-[11px] text-primary">
                      ≈ ${precioPorDia.toLocaleString()} por día
                    </p>

                    {plan.ahorro && (
                      <p className="text-[11px] text-green-500 font-semibold mt-1">
                        {plan.ahorro}
                      </p>
                    )}
                  </div>

                  <div className="h-px bg-gray-700/50 my-3" />

                  <ul className="space-y-1.5 mb-4">
                    {plan.incluye.slice(0, 5).map((item, i) => (
                      <li
                        key={i}
                        className="text-gray-400 text-[11px] flex items-start gap-1.5"
                      >
                        <svg
                          className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0"
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
                        <span>{item}</span>
                      </li>
                    ))}
                    {plan.incluye.length > 5 && (
                      <li className="text-gray-500 text-[10px] text-center pt-1">
                        +{plan.incluye.length - 5} beneficios más
                      </li>
                    )}
                  </ul>

                  <button
                    onClick={scrollToFormulario}
                    className={`
                      w-full py-2 rounded-lg font-semibold text-sm
                      transition-all duration-300
                      ${plan.btnColor}
                      ${
                        plan.popular
                          ? "shadow-md shadow-primary/20"
                          : "shadow-sm"
                      }
                      hover:scale-[1.02] active:scale-98
                    `}
                  >
                    Elegir {plan.nombre}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-500 text-xs flex items-center justify-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
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
              Sin permanencia
            </span>
            <span className="text-gray-600">•</span>
            <span>Cancela cuando quieras</span>
            <span className="text-gray-600">•</span>
            <span>Sin multas</span>
          </p>
        </div>
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl max-w-sm w-full p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-2">
              Seleccionaste {selectedPlan.nombre}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Completa tus datos para continuar con la inscripción
            </p>
            <button
              onClick={() => {
                setSelectedPlan(null);
                scrollToFormulario();
              }}
              className="w-full bg-primary text-white py-2 rounded-lg font-semibold"
            >
              Continuar
            </button>
            <button
              onClick={() => setSelectedPlan(null)}
              className="w-full text-gray-400 text-sm mt-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Planes;
