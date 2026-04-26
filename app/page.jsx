import Formulario from "@/components/Formulario";
import Hero from "@/components/Hero";
import Instalaciones from "@/components/Instalaciones";
import Planes from "@/components/Planes";
import PorqueElegirnos from "@/components/PorqueElegirnos";
import Testimonios from "@/components/Testimonios";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Hero />
      <Planes />
      <Instalaciones />
      <PorqueElegirnos />
      <Testimonios />
      <Formulario />
    </div>
  );
}
