// components/BotonWhatsApp.jsx
"use client";

import React, { useEffect, useState } from "react";

const BotonWhatsApp = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Número del gimnasio (cambia por el número real)
  const numeroTelefono = "56912345678"; // Formato: código país + número (sin +)

  // Mensaje predefinido que enviará al hacer clic
  const mensajePredefinido =
    "Hola, quiero información sobre los planes y agendar una clase gratis";

  const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(
    mensajePredefinido
  )}`;

  // Opcional: ocultar botón después de scrollear mucho (opcional)
  useEffect(() => {
    const handleScroll = () => {
      // Oculta el botón si el scroll es muy abajo (opcional)
      // setIsVisible(window.scrollY < 500)
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <a
      href={urlWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat de WhatsApp"
    >
      {/* Efecto de pulso (anillo alrededor) */}
      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75 group-hover:animate-none" />

      {/* Botón principal */}
      <div className="relative bg-green-500 hover:bg-green-600 rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95">
        <svg
          className="w-7 h-7 text-white"
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
      </div>

      {/* Texto flotante al hacer hover */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
        ¡Escríbenos!
      </span>
    </a>
  );
};

export default BotonWhatsApp;
