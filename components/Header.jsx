"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { name: "Inicio", href: "#hero" },
  { name: "Planes", href: "#planes" },
  { name: "Instalaciones", href: "#instalaciones" },
  { name: "Testimonios", href: "#testimonios" },
  { name: "Contacto", href: "#formulario" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bloquear scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = useCallback((href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-500
          ${
            isScrolled
              ? "py-3 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
              : "py-5 bg-transparent"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => scrollToSection("#hero")}
              aria-label="Ir al inicio"
              className="flex items-center gap-2 group"
            >
              <span className="text-white font-bold text-xl tracking-tight">
                EVOLUTION
              </span>
              <span className="text-primary font-bold text-xl">GYM</span>
            </button>

            {/* Nav Desktop */}
            <nav
              className="hidden lg:flex items-center gap-8"
              aria-label="Navegación principal"
            >
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="relative text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </nav>

            {/* CTA Desktop */}
            <div className="hidden lg:block">
              <button
                onClick={() => scrollToSection("#formulario")}
                className="relative overflow-hidden group bg-gradient-to-r from-primary to-primary-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20"
              >
                <span className="relative z-10">Clase gratis</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>

            {/* Hamburguesa Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            >
              <span
                className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
                  isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-hidden={!isMobileMenuOpen}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {NAV_ITEMS.map((item, index) => (
                <motion.button
                  key={item.name}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  onClick={() => scrollToSection(item.href)}
                  className="text-2xl font-semibold text-white hover:text-primary transition-colors duration-300"
                >
                  {item.name}
                </motion.button>
              ))}

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: NAV_ITEMS.length * 0.08, duration: 0.4 }}
                onClick={() => scrollToSection("#formulario")}
                className="mt-4 bg-primary text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform duration-300"
              >
                Clase gratis
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
