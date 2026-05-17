"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Activity,
  UserX,
  LogOut,
  DollarSign,
  Package,
  Menu,
  X,
} from "lucide-react";

const MENU_ITEMS = [
  {
    name: "Productos",
    href: "/admin/inventario",
    icon: Package,
    color: "text-purple-400",
  },
  {
    name: "Caja",
    href: "/admin/caja",
    icon: DollarSign,
    color: "text-yellow-400",
  },
  {
    name: "Activos",
    href: "/admin/activos",
    icon: Activity,
    color: "text-green-400",
  },
  { name: "Leads", href: "/admin/leads", icon: Users, color: "text-blue-400" },
  {
    name: "Inactivos",
    href: "/admin/inactivos",
    icon: UserX,
    color: "text-gray-400",
  },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin" || pathname === "/admin/login";

  // Ocultar Header/Footer del layout publico
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

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    fetch("/api/admin/login", { method: "GET" })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.push("/admin");
        }
      })
      .catch(() => router.push("/admin"))
      .finally(() => setIsLoading(false));
  }, [isLoginPage, router]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin");
  }, [router]);

  if (isLoginPage) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin w-8 h-8 text-primary"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-gray-500 text-sm">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black tracking-tight">
              <span className="text-white">EVOLUTION</span>
              <span className="text-primary">GYM</span>
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">Panel de control</p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-white"
            aria-label="Cerrar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="p-4 flex-1">
        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest px-4 mb-3">
          Modulos
        </p>
        <div className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                  }
                `}
              >
                <item.icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? "text-primary" : item.color
                  }`}
                />
                {item.name}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesion
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-30">
        <SidebarContent />
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-20">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menu"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-black">
            <span className="text-white">EVOLUTION</span>
            <span className="text-primary">GYM</span>
          </span>
          <div className="w-5" />
        </div>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
