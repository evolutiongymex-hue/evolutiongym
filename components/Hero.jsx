// components/Hero.jsx
"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registrar el plugin de ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Hero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const badgeRef = useRef(null);
  const buttonsRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const glowRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación inicial - Fade up para todo el contenido
      gsap.fromTo(
        badgeRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );

      // Título principal - Split text effect
      const titleChars = titleRef.current?.querySelectorAll(".char");
      if (titleChars) {
        gsap.fromTo(
          titleChars,
          { opacity: 0, y: 50, rotationX: -90 },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.6,
            stagger: 0.03,
            ease: "back.out(1.2)",
            delay: 0.4,
          }
        );
      }

      // Subtítulo
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)",
          delay: 0.8,
        }
      );

      // Botones
      gsap.fromTo(
        buttonsRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1)", delay: 1 }
      );

      // Scroll indicator
      gsap.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, delay: 1.3 }
      );

      // Animación de glows flotantes
      glowRefs.current.forEach((glow, index) => {
        gsap.to(glow, {
          x: 30,
          y: 30,
          scale: 1.2,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.5,
        });
      });

      // Animación parallax al hacer scroll
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(titleRef.current, {
            y: progress * 100,
            opacity: 1 - progress * 0.5,
          });
          gsap.set(buttonsRef.current, {
            y: progress * 50,
            opacity: 1 - progress,
          });
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Fondo con gradientes animados */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95" />

        {/* Glows flotantes */}
        <div
          ref={(el) => (glowRefs.current[0] = el)}
          className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"
        />
        <div
          ref={(el) => (glowRefs.current[1] = el)}
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]"
        />
        <div
          ref={(el) => (glowRefs.current[2] = el)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]"
        />
      </div>

      {/* Patrón de fondo sutil */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge con estadística */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all duration-300 group cursor-default"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-sm text-gray-300 group-hover:text-primary transition-colors">
              🔥 Más de 500+ alumnos transformados
            </span>
          </div>

          {/* Título principal con efecto de letras */}
          <div ref={titleRef} className="mb-6">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[1.1]">
              {"EVOLUTION GYM".split("").map((char, index) => (
                <span
                  key={index}
                  className="char inline-block"
                  style={{
                    display: "inline-block",
                    background:
                      char === " "
                        ? "none"
                        : index < 8
                        ? "linear-gradient(135deg, #FFFFFF 0%, #CCCCCC 100%)"
                        : "linear-gradient(135deg, #fa3131 0%, #0248a8 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    textShadow:
                      index >= 9 ? "0 0 20px rgba(250,49,49,0.3)" : "none",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
          </div>

          {/* Subtítulo */}
          <p
            ref={subtitleRef}
            className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            Entrena con nosotros
          </p>

          {/* Beneficio rápido con contador animado */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">30</div>
              <div className="text-xs text-gray-500">DÍAS</div>
              <div className="text-sm text-gray-400">Resultados reales</div>
            </div>
            <div className="w-px h-12 bg-gray-800 my-auto" />
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">24/7</div>
              <div className="text-xs text-gray-500">HORAS</div>
              <div className="text-sm text-gray-400">Acceso libre</div>
            </div>
            <div className="w-px h-12 bg-gray-800 my-auto" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">+50</div>
              <div className="text-xs text-gray-500">CLASES</div>
              <div className="text-sm text-gray-400">Grupales</div>
            </div>
          </div>

          {/* Descripción */}
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-sm sm:text-base">
            Horarios flexibles · Mejores precios · Asesoría incluida · Equipos
            de última generación
          </p>

          {/* Botones CTA */}
          <div
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            {/* Botón principal */}
            <button className="group relative bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden shadow-2xl shadow-primary/30">
              <span className="relative z-10 flex items-center gap-3 text-lg">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Agendar clase gratis
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
              {/* Efecto de brillo al hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-translate -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            {/* Botón secundario */}
            <button className="group relative bg-transparent border-2 border-secondary hover:bg-secondary/10 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden">
              <span className="relative z-10 flex items-center gap-3 text-lg">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                WhatsApp
              </span>
            </button>
          </div>

          {/* Micro-animación de confianza */}
          <div className="mt-12 flex justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>4.9 (500+ reseñas)</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Garantía de satisfacción</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer opacity-0"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: "smooth",
          });
        }}
      >
        <div className="relative w-8 h-12 rounded-full border-2 border-gray-500 flex justify-center group hover:border-primary transition-colors duration-300">
          <div className="absolute w-1.5 h-3 bg-primary rounded-full mt-2 animate-scroll-down" />
        </div>
        <p className="text-xs text-gray-500 mt-2">Scroll</p>
      </div>
    </section>
  );
};

export default Hero;
