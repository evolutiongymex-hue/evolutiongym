"use client";

import { useEffect, useState } from "react";
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
  const [filtroNombre, setFiltroNombre] = useState("");

  const fetchInactivos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sheets?sheet=CRM_Evolution_Gym");
      const data = await response.json();

      if (data.success) {
        const inactivosFiltrados = data.data.filter(
          (lead) => lead.estado === "INACTIVO"
        );
        setInactivos(inactivosFiltrados);
        setError("");
      } else {
        setError(data.error || "Error al cargar inactivos");
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactivos();
  }, []);

  const updateLead = async (id, campo, valor) => {
    setUpdatingId(id);
    try {
      const response = await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "update", id, campo, valor }),
      });
      if (response.ok) {
        await fetchInactivos();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const eliminarInactivo = async (id) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    setUpdatingId(id);
    try {
      const response = await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "update",
          id: id,
          campo: "estado",
          valor: "ELIMINADO",
        }),
      });
      if (response.ok) {
        await fetchInactivos();
        alert("Registro eliminado correctamente");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const inactivosFiltrados = inactivos.filter((miembro) => {
    if (
      filtroNombre &&
      !miembro.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
    )
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-gray-400">Cargando inactivos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg">
        <p className="font-semibold">Error:</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchInactivos}
          className="mt-3 px-4 py-2 bg-red-500/20 rounded-lg"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (inactivosFiltrados.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">
          {filtroNombre
            ? "No hay inactivos que coincidan con la búsqueda"
            : "No hay miembros inactivos"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              INACTIVOS
            </h1>
            <p className="text-gray-400 text-sm">
              Ex-miembros que ya no asisten
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Total: {inactivosFiltrados.length} inactivos
            </p>
          </div>
          <button
            onClick={fetchInactivos}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Actualizar
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 w-64 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {filtroNombre && (
            <button
              onClick={() => setFiltroNombre("")}
              className="inline-flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Teléfono</th>
              <th className="px-4 py-3 text-left">Fecha Baja</th>
              <th className="px-4 py-3 text-left">Último Plan</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inactivosFiltrados.map((miembro) => (
              <tr
                key={miembro.id}
                className="border-t border-gray-800 hover:bg-gray-800/30"
              >
                <td className="px-4 py-3">{miembro.nombre || "-"}</td>
                <td className="px-4 py-3">{miembro.telefono || "-"}</td>
                <td className="px-4 py-3">
                  {miembro.fecha_baja ||
                    miembro.ultima_interaccion ||
                    "No registrada"}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-600/50 text-gray-300">
                    {miembro.plan || "Sin plan"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateLead(miembro.id, "estado", "ACTIVO")}
                      disabled={updatingId === miembro.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                      <UserCheck className="w-3 h-3" />
                      Reactivar
                    </button>
                    <button
                      onClick={() => eliminarInactivo(miembro.id)}
                      disabled={updatingId === miembro.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
