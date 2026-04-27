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
      // Animación del título
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

      // Animación de las imágenes (stagger)
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

  // Fotos del gimnasio (actualiza con tus imágenes reales)
  const fotos = [
    {
      id: 1,
      titulo: "Área de Pesas",
      descripcion: "Equipos de última generación para tus entrenamientos",
      imagen: "/images/pesas.jpg", // Cambia por tu imagen real
      categoria: "Pesas",
    },
    {
      id: 2,
      titulo: "Pista de Entrenamiento",
      descripcion: "Espacio para funcional, cardio y HIIT",
      imagen: "/images/pista.jpg",
      categoria: "Cardio",
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
      titulo: "Box CrossFit",
      descripcion: "Área dedicada para entrenamiento intensivo",
      imagen: "/images/box.jpg",
      categoria: "CrossFit",
    },
    {
      id: 5,
      titulo: "Vestidores",
      descripcion: "Lockers, duchas y espacio cómodo",
      imagen: "/images/vestidores.jpg",
      categoria: "Comodidad",
    },
    {
      id: 6,
      titulo: "Zona de Boxeo",
      descripcion: "Sacos, guantes y entrenamiento de contacto",
      imagen: "/images/boxeo.jpg",
      categoria: "Boxeo",
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4" id="instalaciones">
      <div className="max-w-7xl mx-auto">
        {/* Título de sección */}
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
            +1,500m² diseñados para tu comodidad y rendimiento
          </p>
        </div>

        {/* Grid de fotos - Masonry style */}
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
              {/* Imagen placeholder mientras no tengas las reales */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                {/* Gradiente de overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                {/* Contenido de la imagen (placeholder) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    {/* Icono de cámara */}
                    <svg
                      className="w-12 h-12 text-gray-600 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm">{foto.titulo}</p>
                    <p className="text-gray-600 text-xs mt-1">
                      (Añade tu foto)
                    </p>
                  </div>
                </div>

                {/* Categoría badge */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="px-2 py-1 bg-primary/90 backdrop-blur-sm rounded-md text-xs font-semibold">
                    {foto.categoria}
                  </span>
                </div>

                {/* Info que aparece al hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
                  <h3 className="text-white font-bold text-lg">
                    {foto.titulo}
                  </h3>
                  <p className="text-gray-300 text-sm">{foto.descripcion}</p>
                </div>

                {/* Efecto zoom al hover */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para ver imagen ampliada */}
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
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-20 h-20 text-gray-600 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-400">{selectedImage.titulo}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    (Sube tu imagen a /public/images/
                    {selectedImage.imagen.split("/").pop()})
                  </p>
                </div>
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
