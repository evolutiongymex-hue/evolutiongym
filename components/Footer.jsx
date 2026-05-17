"use client";

import { useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { MdLocationOn, MdPhone, MdEmail } from "react-icons/md";

const NAV_LINKS = [
  { name: "Inicio", href: "#hero" },
  { name: "Planes y precios", href: "#planes" },
  { name: "Instalaciones", href: "#instalaciones" },
  { name: "Testimonios", href: "#testimonios" },
  { name: "Contacto", href: "#formulario" },
];

const SCHEDULE = [
  { day: "Lunes — Viernes", hours: "7:00 – 22:00" },
  { day: "Sabado", hours: "8:00 – 13:00" },
  { day: "Domingo", hours: "8:00 – 13:00" },
];

const CONTACT = [
  {
    icon: MdLocationOn,
    label: "Ubicacion",
    value: "Angel del Campo #69, Nezahualcoyotl, CDMX 57620",
    href: "https://maps.google.com/?q=Angel+del+Campo+69+Nezahualcoyotl",
    external: true,
  },
  {
    icon: MdPhone,
    label: "Telefono",
    value: "56 5538 2350",
    href: "tel:5655382350",
    external: false,
  },
  {
    icon: MdEmail,
    label: "Email",
    value: "evolutiongymex@gmail.com",
    href: "mailto:evolutiongymex@gmail.com",
    external: false,
  },
];

const SOCIALS = [
  {
    icon: FaFacebookF,
    href: "https://facebook.com",
    label: "Facebook",
  },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/evolutiongymneza/",
    label: "Instagram",
  },
  {
    icon: FaWhatsapp,
    href: "https://wa.me/5655382350?text=Hola%2C%20quiero%20informacion%20sobre%20los%20planes",
    label: "WhatsApp",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const columnVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const scrollToSection = useCallback((href) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer ref={ref} className="relative z-20 mt-auto overflow-hidden">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      <div className="absolute inset-0 bg-black/95" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8"
        >
          <motion.div variants={columnVariants} className="lg:col-span-1">
            <button
              onClick={() => scrollToSection("#hero")}
              aria-label="Ir al inicio"
              className="mb-5 block group"
            >
              <span className="text-white font-black text-2xl tracking-tight group-hover:opacity-80 transition-opacity">
                EVOLUTION
              </span>
              <span className="text-primary font-black text-2xl">GYM</span>
            </button>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Tu mejor version comienza aqui. Entrenamiento de calidad, horarios
              flexibles y los mejores precios en Nezahualcoyotl.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-primary hover:border-primary flex items-center justify-center transition-all duration-300 group"
                >
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={columnVariants}>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Navegacion
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-primary text-sm transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-primary group-hover:w-4 transition-all duration-300" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={columnVariants}>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Horarios
            </h3>
            <ul className="space-y-3">
              {SCHEDULE.map(({ day, hours }) => (
                <li
                  key={day}
                  className="flex justify-between items-center text-sm gap-4"
                >
                  <span className="text-gray-400">{day}</span>
                  <span className="text-white font-medium tabular-nums">
                    {hours}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 px-3 py-2.5 rounded-lg border border-primary/25 bg-primary/5">
              <p className="text-primary text-xs font-bold tracking-widest uppercase">
                Abiertos 7 dias a la semana
              </p>
            </div>
          </motion.div>

          <motion.div variants={columnVariants}>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Contacto
            </h3>
            <ul className="space-y-4 mb-5">
              {CONTACT.map(({ icon: Icon, label, value, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="flex items-start gap-3 group"
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-gray-400 group-hover:text-white text-sm leading-snug transition-colors duration-300">
                      {value}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/5655382350?text=Hola%2C%20quiero%20informacion%20sobre%20los%20planes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaWhatsapp className="w-4 h-4" />
              WhatsApp directo
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-12 mb-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent origin-left"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-3"
        >
          <p className="text-gray-600 text-xs">
            Copyright {new Date().getFullYear()} Evolution Gym. Todos los
            derechos reservados.
          </p>
          <div className="flex gap-5">
            <button className="text-gray-600 hover:text-primary text-xs transition-colors duration-300">
              Terminos y condiciones
            </button>
            <button className="text-gray-600 hover:text-primary text-xs transition-colors duration-300">
              Politica de privacidad
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
