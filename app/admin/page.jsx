"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

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
        router.push("/admin/leads");
        router.refresh();
      } else {
        setError(data.error || "Contrasena incorrecta");
        setPassword("");
      }
    } catch {
      setError("Error de conexion. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      {/* Glow de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-sm"
      >
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {/* Header del card */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <FiLock className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              EVOLUTION<span className="text-primary">GYM</span>
            </h1>
            <p className="text-gray-500 text-xs mt-1">
              Panel de administracion
            </p>
          </div>

          {/* Formulario */}
          <div className="px-8 py-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Contrasena de acceso
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Ingresa la contrasena"
                    autoFocus
                    autoComplete="current-password"
                    disabled={isLoading}
                    className={`w-full px-4 py-3 pr-11 rounded-xl text-white text-sm placeholder-gray-600 bg-white/5 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 ${
                      error
                        ? "border-red-500/50 bg-red-500/5"
                        : "border-white/10 focus:border-primary/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label={
                      showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !password.trim()}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 ${
                  isLoading || !password.trim()
                    ? "bg-gray-700 cursor-not-allowed opacity-60"
                    : "bg-primary hover:brightness-110 shadow-lg shadow-primary/25"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4"
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
                    Validando...
                  </span>
                ) : (
                  "Acceder al panel"
                )}
              </motion.button>
            </form>
          </div>

          {/* Footer del card */}
          <div className="px-8 pb-6 text-center">
            <p className="text-gray-600 text-xs">
              Area restringida — Solo personal autorizado
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
