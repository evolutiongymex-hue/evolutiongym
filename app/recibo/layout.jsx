"use client";

import { useEffect } from "react";

export default function ReciboLayout({ children }) {
  useEffect(() => {
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const whatsapp = document.querySelector('a[href*="wa.me"]');

    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
    if (whatsapp) whatsapp.style.display = "none";

    return () => {
      if (header) header.style.display = "";
      if (footer) footer.style.display = "";
      if (whatsapp) whatsapp.style.display = "";
    };
  }, []);

  return <>{children}</>;
}
