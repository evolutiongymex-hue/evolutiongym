// app/layout.jsx
import { Inter, Poppins } from "next/font/google";
import Background from "../components/Background";
import Header from "../components/Header";
import BotonWhatsApp from "../components/BotonWhatsApp";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Evolution Gym - Tu mejor versión comienza aquí",
  description:
    "Entrena con nosotros y alcanza tus metas. Planes flexibles, horarios 24/7 y asesoría incluida.",
};

export default function RootLayout({ children }) {
  // Detectar si estamos en el panel de admin
  // Nota: Esto se ejecuta en el servidor, usamos headers o simplemente pasamos un prop
  // Solución: Usaremos un approach diferente en el cliente, pero por ahora simplificamos

  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-background text-white font-sans antialiased">
        <Background />

        <div className="admin-hide">
          <Header />
        </div>

        <div className="relative z-10">{children}</div>

        <div className="admin-hide">
          <BotonWhatsApp />
          <Footer />
        </div>
      </body>
    </html>
  );
}
