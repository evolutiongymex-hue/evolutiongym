// app/recibo/layout.jsx
"use client";

import { useEffect } from "react";

export default function ReciboLayout({ children }) {
  useEffect(() => {
    // Ocultar header, footer y botón de WhatsApp
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const botonWhatsApp = document.querySelector('a[href*="wa.me"]');
    const adminHide = document.querySelectorAll(".admin-hide");

    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
    if (botonWhatsApp) botonWhatsApp.style.display = "none";
    adminHide.forEach((el) => {
      el.style.display = "none";
    });

    return () => {
      // Restaurar al salir
      if (header) header.style.display = "";
      if (footer) footer.style.display = "";
      if (botonWhatsApp) botonWhatsApp.style.display = "";
      adminHide.forEach((el) => {
        el.style.display = "";
      });
    };
  }, []);

  return <div className="min-h-screen bg-gray-100">{children}</div>;
}
