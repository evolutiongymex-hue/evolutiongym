// components/Hero.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Hero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const statsRef = useRef(null);
  const badgeRef = useRef(null);

  // Estado para el efecto de tipeo
  const [typedText, setTypedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const phrases = [
    "Entrena con nosotros",
    "Ponte en forma",
    "Supera tus límites",
    "Resultados reales",
  ];

  // Contador de alumnos
  const [alumnosCount, setAlumnosCount] = useState(0);
  const targetAlumnos = 584;

  // Efecto de tipeo (ligero, sin librerías externas)
  useEffect(() => {
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const typeEffect = () => {
      const currentPhrase = phrases[currentPhraseIndex];

      if (isDeleting) {
        setTypedText(currentPhrase.substring(0, currentCharIndex - 1));
        currentCharIndex--;
      } else {
        setTypedText(currentPhrase.substring(0, currentCharIndex + 1));
        currentCharIndex++;
      }

      if (!isDeleting && currentCharIndex === currentPhrase.length) {
        isDeleting = true;
        timeoutId = setTimeout(typeEffect, 2000);
        return;
      }

      if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        timeoutId = setTimeout(typeEffect, 500);
        return;
      }

      const speed = isDeleting ? 50 : 100;
      timeoutId = setTimeout(typeEffect, speed);
    };

    timeoutId = setTimeout(typeEffect, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  // Contador de alumnos (cuando entra en viewport)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const duration = 2000;
          const step = 20;
          const increment = targetAlumnos / (duration / step);

          const counter = setInterval(() => {
            start += increment;
            if (start >= targetAlumnos) {
              setAlumnosCount(targetAlumnos);
              clearInterval(counter);
            } else {
              setAlumnosCount(Math.floor(start));
            }
          }, step);

          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animaciones GSAP (optimizadas)
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación del badge
      gsap.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

      // Animación del título (solo fade, sin translate pesado)
      gsap.fromTo(
        titleRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.2 }
      );

      // Subtítulo con fade-up
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "back.out(0.6)", delay: 0.4 }
      );

      // Estadísticas
      gsap.fromTo(
        statsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.6 }
      );

      // Botones
      gsap.fromTo(
        buttonsRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, delay: 0.8 }
      );

      // Parallax suave al scroll
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
        onUpdate: (self) => {
          gsap.set(titleRef.current, { y: self.progress * 50 });
          gsap.set(subtitleRef.current, { y: self.progress * 30 });
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToFormulario = () => {
    const formulario = document.querySelector("#formulario");
    if (formulario) {
      formulario.scrollIntoView({ behavior: "smooth" });
    }
  };

  const abrirWhatsApp = () => {
    const numeroTelefono = "56912345678"; // Cambia por el número real
    const mensaje =
      "Hola, quiero información sobre los planes y agendar una clase gratis";
    const url = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
  };

  // Mouse parallax sutil
  const handleMouseMove = (e) => {
    if (!heroRef.current || window.innerWidth < 768) return;

    const { clientX, clientY } = e;
    const { width, height } = heroRef.current.getBoundingClientRect();
    const x = (clientX / width - 0.5) * 10;
    const y = (clientY / height - 0.5) * 10;

    gsap.to(titleRef.current, {
      x: x * 2,
      y: y * 2,
      duration: 0.5,
      ease: "power1.out",
    });

    gsap.to(subtitleRef.current, {
      x: x,
      y: y,
      duration: 0.5,
      ease: "power1.out",
    });
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      id="inicio"
    >
      {/* Fondo optimizado - solo elementos necesarios */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95" />
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge flotante */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-sm font-medium">
              {alumnosCount > 0 ? `${alumnosCount}+` : "500+"} alumnos activos
            </span>
          </div>

          {/* Título principal */}
          <div ref={titleRef}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                EVOLUTION
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GYM
              </span>
            </h1>
          </div>

          {/* Subtítulo con efecto de tipeo */}
          <div ref={subtitleRef} className="mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {typedText}
              </span>
              <span className="animate-blink inline-block w-1 h-8 md:h-10 bg-primary ml-1" />
            </h2>
          </div>

          {/* Estadísticas rápidas */}
          <div
            ref={statsRef}
            className="flex justify-center gap-6 md:gap-12 mb-8"
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                7 a.m
              </div>
              <div className="text-xs text-gray-500">Apertura</div>
            </div>
            <div className="w-px h-10 bg-gray-800 my-auto" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-secondary">
                10:00 pm
              </div>
              <div className="text-xs text-gray-500">Cierre</div>
            </div>
            <div className="w-px h-10 bg-gray-800 my-auto" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                Toda la semana
              </div>
              <div className="text-xs text-gray-500">Días</div>
            </div>
          </div>

          {/* Descripción */}
          <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
            Horarios flexibles · Mejores precios · Asesoría incluida · Equipos
            de última generación
          </p>

          {/* Botones CTA */}
          <div
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={scrollToFormulario}
              className="group relative bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden shadow-xl shadow-primary/25"
            >
              <span className="relative z-10 flex items-center gap-2 text-base">
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
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            <button
              onClick={abrirWhatsApp}
              className="group relative bg-transparent border-2 border-secondary hover:bg-secondary/10 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2 text-base">
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

          {/* Scroll indicator */}
          <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 animate-bounce cursor-pointer">
            <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex justify-center">
              <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Estilo para el cursor que parpadea */}
      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 0.8s step-end infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
