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
  title: {
    default: "Evolution Gym",
    template: "%s | Evolution Gym",
  },
  description:
    "Entrena con nosotros y alcanza tus metas. Planes desde $350 MXN, horarios 24/7 y asesoría incluida. ¡Agenda tu clase gratis!",
  keywords:
    "gimnasio, fitness, entrenamiento, pesas, cardio, crossfit, boxeo, membresía gym, Evolution Gym, Neza",
  authors: [{ name: "Evolution Gym", url: "https://evolutiongymneza.com" }],
  creator: "Evolution Gym",
  publisher: "Evolution Gym",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Evolution Gym - Tu mejor versión comienza aquí",
    description:
      "Planes desde $350 MXN, horarios 24/7 y asesoría incluida. ¡Agenda tu clase gratis!",
    url: "https://evolutiongymneza.com",
    siteName: "Evolution Gym",
    images: [
      {
        url: "https://evolutiongymneza.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Evolution Gym",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Evolution Gym - Tu mejor versión comienza aquí",
    description:
      "Planes flexibles, horarios 24/7 y asesoría incluida. ¡Agenda tu clase gratis!",
    images: ["https://evolutiongymneza.com/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "tu-codigo-de-verificacion-aqui", // Opcional: cuando verifiques en Google Search Console
  },
  alternates: {
    canonical: "https://evolutiongymneza.com",
  },
};

export default function RootLayout({ children }) {
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
