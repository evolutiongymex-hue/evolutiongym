"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("admin_auth", "true");
        router.push("/admin/leads");
      } else {
        setError(data.error || "Contraseña incorrecta");
      }
    } catch (error) {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Evolution Gym</h1>
          <p className="text-gray-500 text-sm">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Contraseña de acceso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-3 rounded-lg font-semibold text-white transition-all
              ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-600"
              }
            `}
          >
            {isLoading ? "Validando..." : "Acceder al panel"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          Área restringida - Solo personal autorizado
        </p>
      </div>
    </div>
  );
}
