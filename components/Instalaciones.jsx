"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Instalaciones = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const galleryRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      const items = galleryRef.current?.querySelectorAll(".gallery-item");
      if (items) {
        gsap.fromTo(
          items,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const fotos = [
    {
      id: 1,
      titulo: "Área de Pesas",
      descripcion: "Equipos de última generación para tus entrenamientos",
      imagen: "/images/pesas.jpg",
      categoria: "Pesas",
    },
    {
      id: 2,
      titulo: "Area de cables",
      descripcion: "Espacio para todo tipo de musculos",
      imagen: "/images/pista.jpg",
      categoria: "Cableado",
    },
    {
      id: 3,
      titulo: "Máquinas",
      descripcion: "Tecnología de punta para resultados óptimos",
      imagen: "/images/maquinas.jpg",
      categoria: "Máquinas",
    },
    {
      id: 4,
      titulo: "Area de pierna",
      descripcion: "Área dedicada para pierna",
      imagen: "/images/box.jpg",
      categoria: "Pierna",
    },
    {
      id: 5,
      titulo: "Maquinas",
      descripcion: "Pecho",
      imagen: "/images/vestidores.jpg",
      categoria: "Comodidad",
    },
    {
      id: 6,
      titulo: "Zona de prensa",
      descripcion: "Prensa para pierna",
      imagen: "/images/boxeo.jpg",
      categoria: "Pierna",
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4" id="instalaciones">
      <div className="max-w-7xl mx-auto">
        <div ref={titleRef} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
            <span className="text-secondary text-sm font-semibold">
              CONOCE TU ESPACIO
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Nuestras{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Instalaciones
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            +500m² diseñados para tu comodidad y rendimiento
          </p>
        </div>

        <div
          ref={galleryRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {fotos.map((foto, index) => (
            <div
              key={foto.id}
              className="gallery-item group relative overflow-hidden rounded-2xl cursor-pointer"
              onClick={() => setSelectedImage(foto)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={foto.imagen}
                  alt={foto.titulo}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <div className="absolute top-3 left-3 z-20">
                  <span className="px-2 py-1 bg-primary/90 backdrop-blur-sm rounded-md text-xs font-semibold">
                    {foto.categoria}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
                  <h3 className="text-white font-bold text-lg">
                    {foto.titulo}
                  </h3>
                  <p className="text-gray-300 text-sm">{foto.descripcion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="aspect-video">
                <img
                  src={selectedImage.imagen}
                  alt={selectedImage.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-xl font-bold">{selectedImage.titulo}</h3>
                <p className="text-gray-400">{selectedImage.descripcion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Instalaciones;
