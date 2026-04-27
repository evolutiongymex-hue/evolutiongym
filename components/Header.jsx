"use client";

import React, { useEffect, useState } from "react";
import gsap from "gsap";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { name: "Inicio", href: "#hero" },
    { name: "Planes", href: "#planes" },
    { name: "Instalaciones", href: "#instalaciones" },
    { name: "Testimonios", href: "#testimonios" },
    { name: "Contacto", href: "#formulario" },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header
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
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => scrollToSection("#inicio")}
            >
              <div>
                <span className="text-white font-bold text-xl tracking-tight">
                  EVOLUTION
                </span>
                <span className="text-primary font-bold text-xl">GYM</span>
              </div>
            </div>

            {/* Menu Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {menuItems.map((item) => (
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

            {/* Botón CTA Desktop */}
            <div className="hidden lg:block">
              <button
                onClick={() => scrollToSection("#formulario")}
                className="relative overflow-hidden group bg-gradient-to-r from-primary to-primary-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20"
              >
                <span className="relative z-10">Clase gratis</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>

            {/* Botón Mobile Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 group"
            >
              <span
                className={`
                w-6 h-0.5 bg-white rounded-full transition-all duration-300
                ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}
              `}
              />
              <span
                className={`
                w-6 h-0.5 bg-white rounded-full transition-all duration-300
                ${isMobileMenuOpen ? "opacity-0" : ""}
              `}
              />
              <span
                className={`
                w-6 h-0.5 bg-white rounded-full transition-all duration-300
                ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}
              `}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`
        fixed inset-0 z-40 bg-background/95 backdrop-blur-lg transition-all duration-500 lg:hidden
        ${
          isMobileMenuOpen
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        }
      `}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {menuItems.map((item, index) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.href)}
              className={`
                text-2xl font-semibold text-white hover:text-primary
                transform transition-all duration-500
                ${
                  isMobileMenuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }
              `}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {item.name}
            </button>
          ))}
          <button
            onClick={() => scrollToSection("#formulario")}
            className={`
              mt-4 bg-primary text-white px-8 py-3 rounded-full font-semibold
              transform transition-all duration-500 hover:scale-105
              ${
                isMobileMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }
            `}
            style={{ transitionDelay: "400ms" }}
          >
            Clase gratis
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
