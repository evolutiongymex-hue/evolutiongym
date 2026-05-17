"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Users,
  AlertCircle,
  Loader2,
  UserCheck,
  Trash2,
  Search,
  X,
} from "lucide-react";

export default function InactivosPage() {
  const [inactivos, setInactivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchInactivos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/sheets?sheet=CRM_Evolution_Gym");
      const data = await response.json();
      if (data.success) {
        setInactivos(data.data.filter((l) => l.estado === "INACTIVO"));
      } else {
        setError(data.error || "Error al cargar inactivos");
      }
    } catch {
      setError("Error de conexion con el servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInactivos();
  }, [fetchInactivos]);

  const reactivar = useCallback(
    async (id) => {
      setUpdatingId(id);
      setUpdateError("");
      try {
        const response = await fetch("/api/leads/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo: "update",
            id,
            campo: "estado",
            valor: "ACTIVO",
          }),
        });
        if (response.ok) {
          await fetchInactivos();
        } else {
          setUpdateError("Error al reactivar el miembro. Intenta de nuevo.");
        }
      } catch {
        setUpdateError("Error de conexion al reactivar.");
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchInactivos]
  );

  const eliminar = useCallback(
    async (id) => {
      setUpdatingId(id);
      setUpdateError("");
      setConfirmDelete(null);
      try {
        const response = await fetch("/api/leads/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo: "update",
            id,
            campo: "estado",
            valor: "ELIMINADO",
          }),
        });
        if (response.ok) {
          await fetchInactivos();
        } else {
          setUpdateError("Error al eliminar el registro. Intenta de nuevo.");
        }
      } catch {
        setUpdateError("Error de conexion al eliminar.");
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchInactivos]
  );

  const inactivosFiltrados = inactivos.filter(
    (m) =>
      !filtroNombre ||
      m.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-400">Cargando inactivos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-xl">
        <p className="font-semibold mb-1">Error al cargar</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchInactivos}
          className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-sm transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-gray-400" />
              Inactivos
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Ex-miembros que ya no asisten
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {inactivosFiltrados.length}{" "}
              {filtroNombre ? "resultado(s)" : "miembros inactivos"}
            </p>
          </div>
          <button
            onClick={fetchInactivos}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        <div className="mt-4 flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {filtroNombre && (
            <button
              onClick={() => setFiltroNombre("")}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm text-gray-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Limpiar
            </button>
          )}
        </div>

        {updateError && (
          <div className="mt-3 px-4 py-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm flex items-center justify-between">
            {updateError}
            <button onClick={() => setUpdateError("")}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {inactivosFiltrados.length === 0 ? (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-10 text-center">
          <AlertCircle className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {filtroNombre
              ? "No hay inactivos que coincidan"
              : "No hay miembros inactivos"}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/40">
                  {[
                    "Nombre",
                    "Telefono",
                    "Ultimo plan",
                    "Ultimo pago",
                    "Acciones",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {inactivosFiltrados.map((miembro) => {
                  const isUpdating = updatingId === miembro.id;
                  return (
                    <tr
                      key={miembro.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {miembro.nombre || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        <a
                          href={"tel:" + miembro.telefono}
                          className="hover:text-white transition-colors"
                        >
                          {miembro.telefono || "-"}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-700/50 text-gray-400 border border-gray-700">
                          {miembro.plan || "Sin plan"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {miembro.fecha_pago ||
                          miembro.ultima_interaccion ||
                          "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => reactivar(miembro.id)}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 transition-colors disabled:opacity-40"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <UserCheck className="w-3 h-3" />
                            )}
                            Reactivar
                          </button>
                          <button
                            onClick={() => setConfirmDelete(miembro)}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="w-3 h-3" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal confirmacion eliminar */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-900 rounded-2xl max-w-sm w-full p-6 border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Eliminar registro</h3>
                  <p className="text-gray-500 text-xs">
                    Esta accion no se puede deshacer
                  </p>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-5">
                Estas a punto de eliminar a{" "}
                <span className="text-white font-semibold">
                  {confirmDelete.nombre}
                </span>
                . El registro cambiara a estado ELIMINADO.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => eliminar(confirmDelete.id)}
                  className="flex-1 py-2.5 bg-red-500/80 hover:bg-red-500 rounded-xl text-sm font-semibold text-white transition-colors"
                >
                  Si, eliminar
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
