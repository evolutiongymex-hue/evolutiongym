"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useInView } from "framer-motion";
import { BsCalendarCheck } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";

const PHRASES = [
  "Entrena con nosotros",
  "Ponte en forma",
  "Supera tus limites",
  "Resultados reales",
];

const PHONE = "5655382350";
const WA_MESSAGE = encodeURIComponent(
  "Hola, quiero informacion sobre los planes y agendar una clase gratis"
);

const STATS = [
  { value: "7 am", label: "Apertura" },
  { value: "10 pm", label: "Cierre" },
  { value: "7 dias", label: "A la semana" },
];

const Hero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const statsRef = useRef(null);
  const rafRef = useRef(null);

  const statsInView = useInView(statsRef, { once: true, margin: "-60px" });

  const [typedText, setTypedText] = useState("");
  const [alumnosCount, setAlumnosCount] = useState(0);

  // Efecto de tipeo
  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const tick = () => {
      const phrase = PHRASES[phraseIndex];

      if (isDeleting) {
        charIndex--;
        setTypedText(phrase.substring(0, charIndex));
      } else {
        charIndex++;
        setTypedText(phrase.substring(0, charIndex));
      }

      if (!isDeleting && charIndex === phrase.length) {
        isDeleting = true;
        timeoutId = setTimeout(tick, 2000);
        return;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % PHRASES.length;
        timeoutId = setTimeout(tick, 400);
        return;
      }

      timeoutId = setTimeout(tick, isDeleting ? 45 : 90);
    };

    timeoutId = setTimeout(tick, 600);
    return () => clearTimeout(timeoutId);
  }, []);

  // Contador de alumnos con useInView
  useEffect(() => {
    if (!statsInView) return;

    const target = 184;
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;

    const counter = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAlumnosCount(target);
        clearInterval(counter);
      } else {
        setAlumnosCount(Math.floor(current));
      }
    }, step);

    return () => clearInterval(counter);
  }, [statsInView]);

  // Animaciones GSAP de entrada
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(
        "[data-hero-badge]",
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.2"
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.3"
        )
        .fromTo(
          statsRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.2"
        )
        .fromTo(
          "[data-hero-cta]",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.2"
        );

      // Parallax en scroll
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
        onUpdate: (self) => {
          gsap.set(titleRef.current, { y: self.progress * 48 });
          gsap.set(subtitleRef.current, { y: self.progress * 28 });
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Mouse parallax con RAF throttle
  const handleMouseMove = useCallback((e) => {
    if (window.innerWidth < 768) return;

    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      const { clientX, clientY } = e;
      const { width, height } = heroRef.current.getBoundingClientRect();
      const x = (clientX / width - 0.5) * 8;
      const y = (clientY / height - 0.5) * 8;

      gsap.to(titleRef.current, {
        x: x * 1.8,
        y: y * 1.8,
        duration: 0.6,
        ease: "power1.out",
      });
      gsap.to(subtitleRef.current, {
        x: x * 0.9,
        y: y * 0.9,
        duration: 0.6,
        ease: "power1.out",
      });

      rafRef.current = null;
    });
  }, []);

  const scrollToFormulario = useCallback(() => {
    document
      .querySelector("#formulario")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      id="hero"
    >
      {/* Fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95" />
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            data-hero-badge
            className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-sm font-medium text-white">
              {alumnosCount > 0 ? `${alumnosCount}+` : "184+"} alumnos activos
            </span>
          </div>

          {/* Título */}
          <div ref={titleRef}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                EVOLUTION
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GYM
              </span>
            </h1>
          </div>

          {/* Subtítulo con tipeo */}
          <div
            ref={subtitleRef}
            className="mb-8 h-14 flex items-center justify-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {typedText}
              </span>
              <span className="inline-block w-0.5 h-8 md:h-10 bg-primary ml-1 animate-[blink_0.8s_step-end_infinite]" />
            </h2>
          </div>

          {/* Stats */}
          <div
            ref={statsRef}
            className="flex justify-center gap-6 md:gap-12 mb-6"
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="flex items-center gap-6 md:gap-12"
              >
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-primary tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {stat.label}
                  </div>
                </div>
                {i < STATS.length - 1 && (
                  <div className="w-px h-8 bg-gray-800" />
                )}
              </div>
            ))}
          </div>

          {/* Descripción */}
          <p className="text-gray-400 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Horarios flexibles · Mejores precios · Asesoria incluida · Equipos
            de ultima generacion
          </p>

          {/* CTAs */}
          <div
            data-hero-cta
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={scrollToFormulario}
              className="group relative bg-gradient-to-r from-primary to-primary-600 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden shadow-xl shadow-primary/25"
            >
              <span className="relative z-10 flex items-center gap-2 text-base">
                <BsCalendarCheck className="w-5 h-5" />
                Agendar clase gratis
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            <a
              href={`https://wa.me/${PHONE}?text=${WA_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-2 bg-transparent border-2 border-white/20 hover:border-green-500 hover:bg-green-500/10 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 text-base"
            >
              <FaWhatsapp className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors" />
              WhatsApp
            </a>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            onClick={scrollToFormulario}
            aria-label="Ir al formulario"
          >
            <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex justify-center">
              <div className="w-1 h-3 bg-primary rounded-full mt-2" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
