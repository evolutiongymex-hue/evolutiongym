// components/Testimonios.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Testimonios = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const testimoniosRef = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

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

      // Animación de los testimonios
      testimoniosRef.current.forEach((testimonio, index) => {
        gsap.fromTo(
          testimonio,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
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

  const testimonios = [
    {
      id: 1,
      nombre: "Carlos Rodríguez",
      edad: 34,
      ocupacion: "Ingeniero",
      foto: "/images/cliente1.jpg", // Cambia por tu foto real
      meses: 6,
      testimonio:
        "Llevo 6 meses aquí y he notado cambios increíbles. Perdí 12 kilos y gané mucha fuerza. Los entrenadores son muy profesionales.",
      rating: 5,
      logro: "-12 kg",
      iniciales: "CR",
    },
    {
      id: 2,
      nombre: "María Fernández",
      edad: 28,
      ocupacion: "Nutricionista",
      foto: "/images/cliente2.jpg",
      meses: 3,
      testimonio:
        "El mejor gimnasio al que he ido. Las máquinas son nuevas, el ambiente es motivador y los horarios flexibles me salvan.",
      rating: 5,
      logro: "+40% fuerza",
      iniciales: "MF",
    },
    {
      id: 3,
      nombre: "Javier Méndez",
      edad: 42,
      ocupacion: "Empresario",
      foto: "/images/cliente3.jpg",
      meses: 12,
      testimonio:
        "Después de probar 5 gimnasios, este es el único donde realmente vi resultados. La asesoría personalizada marca la diferencia.",
      rating: 5,
      logro: "Meta cumplida",
      iniciales: "JM",
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4" id="testimonios">
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <div ref={titleRef} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary text-sm font-semibold">
              🗣️ CLIENTES FELICES
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Lo que dicen{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              nuestros alumnos
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Resultados reales, personas reales. Historias que inspiran.
          </p>
        </div>

        {/* Grid de testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonios.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => (testimoniosRef.current[index] = el)}
              className="group relative bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Rating estrellas */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-500 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonio */}
              <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                "{item.testimonio}"
              </p>

              {/* Logro destacado */}
              <div className="inline-block mb-4 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-semibold">
                🏆 {item.logro} en {item.meses} meses
              </div>

              {/* Información del cliente */}
              <div className="flex items-center gap-3">
                {/* Foto o placeholder */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                  {item.foto ? (
                    <img
                      src={item.foto}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{item.iniciales}</span>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-white">{item.nombre}</h4>
                  <p className="text-gray-500 text-xs">
                    {item.ocupacion} · {item.meses} meses
                  </p>
                </div>
              </div>

              {/* Comillas decorativas */}
              <div className="absolute bottom-4 right-4 opacity-10 text-6xl font-serif">
                "
              </div>
            </div>
          ))}
        </div>

        {/* Estadísticas de satisfacción */}
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-xs text-gray-500">Alumnos activos</div>
          </div>
          <div className="w-px h-10 bg-gray-800 my-auto" />
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary">4.9</div>
            <div className="text-xs text-gray-500">Calificación promedio</div>
          </div>
          <div className="w-px h-10 bg-gray-800 my-auto" />
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">95%</div>
            <div className="text-xs text-gray-500">Renovación anual</div>
          </div>
        </div>

        {/* Botón para ver más reseñas */}
        <div className="text-center mt-10">
          <button className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm">
            Ver más reseñas en Google
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonios;
