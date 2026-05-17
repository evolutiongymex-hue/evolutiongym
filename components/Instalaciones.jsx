"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiZoomIn } from "react-icons/fi";

const FOTOS = [
  {
    id: 1,
    titulo: "Area de pesas",
    descripcion: "Equipos de ultima generacion para entrenamientos de fuerza",
    imagen: "/images/pesas.jpg",
    categoria: "Pesas",
  },
  {
    id: 2,
    titulo: "Area de cables",
    descripcion:
      "Cables y poleas para trabajo funcional y aislamiento muscular",
    imagen: "/images/pista.jpg",
    categoria: "Cables",
  },
  {
    id: 3,
    titulo: "Maquinas",
    descripcion: "Tecnologia de punta para resultados optimos y seguros",
    imagen: "/images/maquinas.jpg",
    categoria: "Maquinas",
  },
  {
    id: 4,
    titulo: "Area de pierna",
    descripcion: "Zona dedicada exclusivamente al trabajo de tren inferior",
    imagen: "/images/box.jpg",
    categoria: "Pierna",
  },
  {
    id: 5,
    titulo: "Area de pecho",
    descripcion: "Equipos especializados para pectoral y hombros",
    imagen: "/images/vestidores.jpg",
    categoria: "Pecho",
  },
  {
    id: 6,
    titulo: "Zona de prensa",
    descripcion: "Prensa para pierna de alto rendimiento",
    imagen: "/images/boxeo.jpg",
    categoria: "Pierna",
  },
];

const Instalaciones = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      const validCards = cardsRef.current.filter(Boolean);

      gsap.fromTo(
        validCards,
        { opacity: 0, scale: 0.92, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.09,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    if (!selectedImage) return;

    const handleKey = (e) => {
      if (e.key === "Escape") setSelectedImage(null);
    };

    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  const handleOpen = useCallback((foto) => setSelectedImage(foto), []);
  const handleClose = useCallback(() => setSelectedImage(null), []);

  return (
    <section ref={sectionRef} className="py-24 px-4" id="instalaciones">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div ref={titleRef} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
            <span className="text-secondary text-xs font-bold tracking-widest uppercase">
              Conoce tu espacio
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
            Nuestras{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              instalaciones
            </span>
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            +500m² disenados para tu comodidad y rendimiento
          </p>
        </div>

        {/* Galería */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FOTOS.map((foto, index) => (
            <div
              key={foto.id}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              onClick={() => handleOpen(foto)}
              className="group relative overflow-hidden rounded-2xl cursor-pointer bg-gray-900"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={foto.imagen}
                  alt={foto.titulo}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-10" />

                {/* Badge categoria */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="px-2.5 py-1 bg-primary/90 backdrop-blur-sm rounded-lg text-[11px] font-bold tracking-wide">
                    {foto.categoria}
                  </span>
                </div>

                {/* Icono zoom */}
                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <FiZoomIn className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Info en hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out z-20">
                  <h3 className="text-white font-bold text-base mb-0.5">
                    {foto.titulo}
                  </h3>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    {foto.descripcion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/92 backdrop-blur-md"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label={selectedImage.titulo}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                onClick={handleClose}
                aria-label="Cerrar imagen"
                className="absolute -top-12 right-0 w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="bg-gray-950 rounded-2xl overflow-hidden border border-white/10">
                <div className="relative aspect-video">
                  <Image
                    src={selectedImage.imagen}
                    alt={selectedImage.titulo}
                    fill
                    sizes="(max-width: 1024px) 100vw, 896px"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-base">
                      {selectedImage.titulo}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {selectedImage.descripcion}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                    {selectedImage.categoria}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Instalaciones;
