"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AiFillStar } from "react-icons/ai";
import { FiAward } from "react-icons/fi";

const TESTIMONIOS = [
  {
    id: 1,
    nombre: "Carlos Rodriguez",
    ocupacion: "Ingeniero",
    meses: 6,
    testimonio:
      "Llevo 6 meses aqui y he notado cambios increibles. Perdi 12 kilos y gane mucha fuerza. Los entrenadores son muy profesionales.",
    rating: 5,
    logro: "-12 kg",
    iniciales: "CR",
    accentColor: "primary",
  },
  {
    id: 2,
    nombre: "Maria Fernandez",
    ocupacion: "Nutricionista",
    meses: 3,
    testimonio:
      "El mejor gimnasio al que he ido. Las maquinas son nuevas, el ambiente es motivador y los horarios flexibles me salvan la vida.",
    rating: 5,
    logro: "+40% fuerza",
    iniciales: "MF",
    accentColor: "secondary",
  },
  {
    id: 3,
    nombre: "Javier Mendez",
    ocupacion: "Empresario",
    meses: 12,
    testimonio:
      "Despues de probar 5 gimnasios, este es el unico donde realmente vi resultados. La asesoria personalizada marca la diferencia.",
    rating: 5,
    logro: "Meta cumplida",
    iniciales: "JM",
    accentColor: "primary",
  },
];

const Testimonios = () => {
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
        { opacity: 0, scale: 0.92, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.55,
          ease: "back.out(0.7)",
          stagger: 0.12,
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
    <section ref={sectionRef} className="py-24 px-4" id="testimonios">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div ref={titleRef} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary text-xs font-bold tracking-widest uppercase">
              Clientes felices
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
            Lo que dicen{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              nuestros alumnos
            </span>
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Resultados reales, personas reales. Historias que inspiran.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIOS.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="group relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 overflow-hidden flex flex-col"
            >
              {/* Comilla decorativa con CSS */}
              <div
                className="absolute -top-2 right-4 text-8xl font-serif text-white/[0.04] select-none leading-none pointer-events-none"
                aria-hidden="true"
              >
                &ldquo;
              </div>

              {/* Estrellas */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <AiFillStar key={i} className="w-4 h-4 text-yellow-500" />
                ))}
              </div>

              {/* Testimonio */}
              <p className="text-gray-300 text-sm leading-relaxed mb-5 italic flex-1">
                &ldquo;{item.testimonio}&rdquo;
              </p>

              {/* Badge logro */}
              <div className="inline-flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 self-start">
                <FiAward className="w-3 h-3 text-primary" />
                <span className="text-primary text-[11px] font-bold">
                  {item.logro} en {item.meses} meses
                </span>
              </div>

              {/* Cliente */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                {/* Avatar con iniciales */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold tracking-wide">
                    {item.iniciales}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    {item.nombre}
                  </h4>
                  <p className="text-gray-500 text-xs">
                    {item.ocupacion} · {item.meses} meses entrenando
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rating global */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <AiFillStar key={i} className="w-5 h-5 text-yellow-500" />
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            <span className="text-white font-semibold">5.0</span> de 5 — basado
            en opiniones de alumnos activos
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonios;
