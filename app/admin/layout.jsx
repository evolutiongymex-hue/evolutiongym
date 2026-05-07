"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Activity,
  UserX,
  LogOut,
  Dumbbell,
  DollarSign,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Ocultar elementos del layout principal en el panel de admin
  useEffect(() => {
    const ocultarElementos = () => {
      const elementos = document.querySelectorAll(".admin-hide");
      elementos.forEach((el) => {
        el.style.display = "none";
      });

      const header = document.querySelector("header");
      const footer = document.querySelector("footer");
      const botonWhatsApp = document.querySelector('a[href*="wa.me"]');

      if (header) header.style.display = "none";
      if (footer) footer.style.display = "none";
      if (botonWhatsApp) botonWhatsApp.style.display = "none";
    };

    const restaurarElementos = () => {
      const elementos = document.querySelectorAll(".admin-hide");
      elementos.forEach((el) => {
        el.style.display = "";
      });

      const header = document.querySelector("header");
      const footer = document.querySelector("footer");
      const botonWhatsApp = document.querySelector('a[href*="wa.me"]');

      if (header) header.style.display = "";
      if (footer) footer.style.display = "";
      if (botonWhatsApp) botonWhatsApp.style.display = "";
    };

    ocultarElementos();

    return () => {
      restaurarElementos();
    };
  }, []);

  // Verificar autenticación
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    } else {
      if (pathname !== "/admin" && pathname !== "/admin/login") {
        router.push("/admin");
      }
    }
    setIsLoading(false);
  }, [pathname, router]);

  // Si está en login, mostrar solo el contenido
  if (pathname === "/admin" || pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    {
      name: "CAJA",
      href: "/admin/caja",
      icon: DollarSign,
      color: "text-yellow-400",
    },
    {
      name: "ACTIVOS",
      href: "/admin/activos",
      icon: Activity,
      color: "text-green-400",
    },
    {
      name: "LEADS",
      href: "/admin/leads",
      icon: Users,
      color: "text-blue-400",
    },
    {
      name: "INACTIVOS",
      href: "/admin/inactivos",
      icon: UserX,
      color: "text-gray-400",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                <span className="text-white">EVOLUTION</span>
                <span className="text-primary">GYM</span>
              </h1>
              <p className="text-gray-500 text-xs">Panel de control</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <item.icon
                className={`w-4 h-4 ${
                  pathname === item.href ? "text-primary" : item.color
                }`}
              />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="ml-64">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
