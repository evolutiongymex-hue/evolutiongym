"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiCheck, FiShield, FiX } from "react-icons/fi";

const PLANES = [
  {
    id: "visita",
    nombre: "Visita",
    precio: 50,
    periodo: "dia",
    periodoLabel: "dia",
    diasBase: 1,
    descripcion: "Perfecto para probar",
    ahorro: null,
    popular: false,
    badge: "VISITA",
    incluye: [
      "Acceso por 1 dia completo",
      "Todas las maquinas",
      "Lockers y duchas",
      "Sin compromiso",
    ],
  },
  {
    id: "mensual",
    nombre: "Mensual",
    precio: 350,
    periodo: "mes",
    periodoLabel: "mensual",
    diasBase: 30,
    descripcion: "Ideal para empezar",
    ahorro: null,
    popular: true,
    badge: "MAS POPULAR",
    incluye: [
      "Acceso por 30 dias",
      "Todas las maquinas",
      "Lockers y duchas",
      "Clases grupales",
      "Sin permanencia",
    ],
  },
  {
    id: "bimestral",
    nombre: "Bimestral",
    precio: 600,
    periodo: "2 meses",
    periodoLabel: "2 meses",
    diasBase: 60,
    descripcion: "Ahorro garantizado",
    ahorro: "Ahorras $100",
    popular: false,
    badge: "AHORRA",
    incluye: [
      "Todo del plan Mensual",
      "Evaluacion fisica",
      "Estacionamiento gratis",
      "Nutricionista 1 vez",
    ],
  },
  {
    id: "trimestral",
    nombre: "Trimestral",
    precio: 800,
    periodo: "3 meses",
    periodoLabel: "3 meses",
    diasBase: 90,
    descripcion: "Super ahorro",
    ahorro: "Ahorras $250",
    popular: false,
    badge: "RECOMENDADO",
    incluye: [
      "Todo del plan Bimestral",
      "App exclusiva",
      "Eventos exclusivos",
      "Invitado gratis 1 vez",
    ],
  },
  {
    id: "anual",
    nombre: "Anualidad",
    precio: 3500,
    periodo: "ano",
    periodoLabel: "anual",
    diasBase: 365,
    descripcion: "Maximo ahorro",
    ahorro: "Ahorras $700",
    popular: false,
    badge: "MEJOR OFERTA",
    incluye: [
      "Todo del plan Trimestral",
      "2 meses gratis",
      "Camiseta oficial",
      "Congelacion hasta 2 meses",
      "10% off en tienda",
    ],
  },
];

const getPrecioPorDia = (precio, diasBase) =>
  diasBase === 1 ? precio : Math.round(precio / diasBase);

const Planes = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      const validCards = cardsRef.current.filter(Boolean);

      gsap.fromTo(
        validCards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.09,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToFormulario = useCallback(() => {
    document
      .querySelector("#formulario")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4" id="planes">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div ref={titleRef} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary text-xs font-bold tracking-widest uppercase">
              Precios claros
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
            Elige tu{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              plan
            </span>
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Sin letras chicas, sin costos ocultos. Paga como quieras.
          </p>
        </div>

        {/* Grid de planes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {PLANES.map((plan, index) => {
            const precioDia = getPrecioPorDia(plan.precio, plan.diasBase);
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className={`
                  relative rounded-2xl overflow-hidden flex flex-col
                  border backdrop-blur-sm
                  transition-all duration-300 cursor-default
                  hover:-translate-y-1.5 hover:shadow-xl
                  ${
                    isPopular
                      ? "bg-gradient-to-b from-primary/15 to-primary/5 border-primary shadow-lg shadow-primary/15 hover:shadow-primary/25"
                      : "bg-gradient-to-b from-white/[0.04] to-white/[0.02] border-white/10 hover:border-white/20"
                  }
                `}
              >
                {/* Badge */}
                <div
                  className={`
                    absolute top-3 right-3 z-10
                    px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase
                    ${
                      isPopular
                        ? "bg-primary text-white"
                        : "bg-white/10 text-gray-400"
                    }
                  `}
                >
                  {plan.badge}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  {/* Info del plan */}
                  <div className="text-center mb-5">
                    <h3 className="text-base font-bold mb-1 text-white">
                      {plan.nombre}
                    </h3>
                    <p className="text-gray-500 text-[11px] mb-3">
                      {plan.descripcion}
                    </p>

                    <div className="mb-1">
                      <span className="text-3xl font-black text-white">
                        ${plan.precio.toLocaleString()}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {" "}
                        / {plan.periodoLabel}
                      </span>
                    </div>

                    <p
                      className={`text-[11px] font-medium ${
                        isPopular ? "text-primary" : "text-gray-500"
                      }`}
                    >
                      ~${precioDia} por dia
                    </p>

                    {plan.ahorro && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
                        {plan.ahorro}
                      </span>
                    )}
                  </div>

                  {/* Divisor */}
                  <div
                    className={`h-px mb-4 ${
                      isPopular ? "bg-primary/30" : "bg-white/10"
                    }`}
                  />

                  {/* Beneficios */}
                  <ul className="space-y-2 mb-5 flex-1">
                    {plan.incluye.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[11px] text-gray-400"
                      >
                        <FiCheck
                          className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                            isPopular ? "text-primary" : "text-green-500"
                          }`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={scrollToFormulario}
                    className={`
                      w-full py-2.5 rounded-xl font-bold text-sm
                      transition-all duration-300
                      hover:scale-[1.03] active:scale-[0.98]
                      ${
                        isPopular
                          ? "bg-primary text-white shadow-lg shadow-primary/25 hover:brightness-110"
                          : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                      }
                    `}
                  >
                    Elegir {plan.nombre}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Garantias */}
        <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
          {[
            { icon: FiShield, text: "Sin permanencia" },
            { icon: FiX, text: "Cancela cuando quieras" },
            { icon: FiCheck, text: "Sin multas" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-gray-500 text-xs"
            >
              <Icon className="w-3.5 h-3.5 text-primary" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Planes;
