// components/Planes.jsx
"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Planes = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

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

      cardsRef.current.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 80, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: index * 0.12,
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

  const planes = [
    {
      nombre: "Por Día",
      precio: "$6.900",
      periodo: "día",
      descripcion: "Perfecto para probar",
      ahorro: null,
      incluye: [
        "Acceso por 1 día completo",
        "Todas las máquinas",
        "Lockers y duchas",
        "Sin compromiso",
      ],
      popular: false,
      badge: "🔑 PRUEBA",
    },
    {
      nombre: "Mensual",
      precio: "$39.900",
      periodo: "mes",
      descripcion: "El más elegido",
      ahorro: null,
      incluye: [
        "Acceso 24/7",
        "Todas las máquinas",
        "Lockers y duchas",
        "Clases grupales",
        "App exclusiva",
        "Sin permanencia",
      ],
      popular: true,
      badge: "🔥 MÁS POPULAR",
    },
    {
      nombre: "Trimestral",
      precio: "$99.900",
      periodo: "3 meses",
      descripcion: "Ahorro garantizado",
      ahorro: "Ahorras $20.000",
      incluye: [
        "Todo del plan Mensual",
        "1 mes gratis",
        "Evaluación física",
        "Estacionamiento gratis",
        "Nutricionista 1 vez",
      ],
      popular: false,
      badge: "💰 AHORRA",
    },
    {
      nombre: "Anual",
      precio: "$359.900",
      periodo: "año",
      descripcion: "Super ahorro",
      ahorro: "Ahorras $119.000",
      incluye: [
        "Todo del plan Trimestral",
        "2 meses gratis",
        "Camiseta oficial",
        "Congelación hasta 2 meses",
        "Eventos exclusivos",
        "10% off en tienda",
      ],
      popular: false,
      badge: "🏆 SUPER AHORRO",
    },
  ];

  // Calcular precio por día para cada plan
  const getPrecioPorDia = (precio, periodo) => {
    const precioNum = parseInt(precio.replace(/[^0-9]/g, ""));
    if (periodo === "día") return precioNum;
    if (periodo === "mes") return Math.round(precioNum / 30);
    if (periodo === "3 meses") return Math.round(precioNum / 90);
    if (periodo === "año") return Math.round(precioNum / 365);
    return 0;
  };

  return (
    <section ref={sectionRef} className="py-24 px-4" id="planes">
      <div className="max-w-7xl mx-auto">
        {/* Título de sección */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary text-sm font-semibold">
              💰 PRECIOS TRANSPARENTES
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Elige tu{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              plan
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Paga como quieras. Día, mes, trimestre o año. Tú decides.
          </p>
        </div>

        {/* Grid de planes - 4 columnas en desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {planes.map((plan, index) => {
            const precioPorDia = getPrecioPorDia(plan.precio, plan.periodo);

            return (
              <div
                key={index}
                ref={(el) => (cardsRef.current[index] = el)}
                className={`
                  relative rounded-2xl overflow-hidden
                  bg-gray-900/50 backdrop-blur-sm
                  border ${plan.popular ? "border-primary" : "border-gray-800"}
                  transition-all duration-300
                  hover:transform hover:-translate-y-2
                  hover:shadow-2xl
                  ${
                    plan.popular
                      ? "hover:shadow-primary/20"
                      : "hover:shadow-gray-800/50"
                  }
                `}
              >
                {/* Badge */}
                <div
                  className={`
                  absolute top-4 left-4 z-10
                  px-2 py-1 rounded-md text-xs font-bold
                  ${plan.popular ? "bg-primary" : "bg-gray-800"}
                `}
                >
                  {plan.badge}
                </div>

                {/* Contenido */}
                <div className="p-6">
                  {/* Nombre y precio */}
                  <div className="text-center mb-6 mt-4">
                    <h3 className="text-xl font-bold mb-1">{plan.nombre}</h3>
                    <p className="text-gray-400 text-xs mb-3">
                      {plan.descripcion}
                    </p>

                    {/* PRECIO PRINCIPAL - Bien visible */}
                    <div className="mb-1">
                      <span className="text-4xl font-bold">{plan.precio}</span>
                      <span className="text-gray-400 text-sm">
                        {" "}
                        / {plan.periodo}
                      </span>
                    </div>

                    {/* Precio por día (referencia) */}
                    <p className="text-xs text-primary">
                      ≈ ${precioPorDia.toLocaleString()} por día
                    </p>

                    {/* Ahorro si aplica */}
                    {plan.ahorro && (
                      <p className="text-xs text-green-500 font-semibold mt-2">
                        {plan.ahorro}
                      </p>
                    )}
                  </div>

                  <div className="h-px bg-gray-800 my-4" />

                  {/* Incluye */}
                  <ul className="space-y-2 mb-6">
                    {plan.incluye.map((item, i) => (
                      <li
                        key={i}
                        className="text-gray-300 text-xs flex items-start gap-2"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0"
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
                  </ul>

                  {/* Botón CTA */}
                  <button
                    className={`
                    w-full py-2.5 rounded-lg font-semibold text-sm
                    transition-all duration-300
                    ${
                      plan.popular
                        ? "bg-primary hover:bg-primary-600 shadow-lg shadow-primary/30"
                        : "bg-gray-800 hover:bg-gray-700"
                    }
                    hover:scale-105 active:scale-95
                  `}
                  >
                    Elegir {plan.nombre}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aviso de transparencia */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2 flex-wrap">
            <svg
              className="w-4 h-4"
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
            Sin permanencia · Cancela cuando quieras · Sin multas
          </p>
          <p className="text-gray-600 text-xs mt-2">
            *Precios sujetos a cambios. Promociones especiales para familias y
            estudiantes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Planes;
