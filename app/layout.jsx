// app/layout.jsx
import { Inter, Poppins } from "next/font/google";
import Background from "../components/Background";
import Header from "../components/Header";
import BotonWhatsApp from "../components/BotonWhatsApp"; // ← NUEVO
import "./globals.css";
import Footer from "@/components/Footer";

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
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-background text-white font-sans antialiased">
        <Background />
        <Header />
        <div className="relative z-10">{children}</div>
        <BotonWhatsApp />
        <Footer />
      </body>
    </html>
  );
}
