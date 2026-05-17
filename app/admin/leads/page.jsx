"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Users,
  Calendar,
  Phone,
  Clock,
  AlertCircle,
  Loader2,
  ThumbsUp,
  CheckCircle,
  XCircle,
  Search,
  X,
} from "lucide-react";

const normalizeBoolean = (value) =>
  value === "Si" || value === "Si" || value === true || value === "true";

const getLeadStatus = (lead) => {
  if (normalizeBoolean(lead.asistio)) return "asistio";
  if (normalizeBoolean(lead.confirmo)) return "confirmo";
  return "nuevo";
};

const STATUS_CONFIG = {
  nuevo: {
    label: "Nuevo",
    class: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  confirmo: {
    label: "Confirmo",
    class: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  },
  asistio: {
    label: "Asistio",
    class: "bg-green-500/10 text-green-400 border border-green-500/20",
  },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [updateError, setUpdateError] = useState("");

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/sheets?sheet=CRM_Evolution_Gym");
      const data = await response.json();
      if (data.success) {
        setLeads(data.data);
      } else {
        setError(data.error || "Error al cargar leads");
      }
    } catch {
      setError("Error de conexion. Verifica tu red.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateLead = useCallback(
    async (id, campo, valor) => {
      const snapshot = leads.find((l) => l.id === id);

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id ? { ...lead, [campo]: valor } : lead
        )
      );
      setUpdatingId(id);
      setUpdateError("");

      try {
        const response = await fetch("/api/leads/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, campo, valor }),
        });
        if (!response.ok) {
          setLeads((prev) =>
            prev.map((lead) => (lead.id === id ? snapshot : lead))
          );
          setUpdateError("Error al actualizar. Intenta de nuevo.");
        }
      } catch {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? snapshot : lead))
        );
        setUpdateError("Error de conexion al actualizar.");
      } finally {
        setUpdatingId(null);
      }
    },
    [leads]
  );

  const leadsFiltrados = leads.filter((lead) => {
    if (lead.estado === "ACTIVO") return false;
    if (
      filtroNombre &&
      !lead.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
    )
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-400">Cargando leads...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-xl">
        <p className="font-semibold mb-1">Error al cargar</p>
        <p className="text-sm text-red-400/80">{error}</p>
        <button
          onClick={fetchLeads}
          className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Leads
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Clientes que agendaron clase gratis
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {leadsFiltrados.length}{" "}
              {filtroNombre ? "resultado(s) encontrado(s)" : "leads activos"}
            </p>
          </div>
          <button
            onClick={fetchLeads}
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
              <X className="w-3.5 h-3.5" />
              Limpiar
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

      {leadsFiltrados.length === 0 ? (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-10 text-center">
          <AlertCircle className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {filtroNombre
              ? "No hay leads que coincidan con la busqueda"
              : "No hay leads registrados aun"}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Telefono
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fecha prueba
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Horario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Confirmo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Asistio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Accion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {leadsFiltrados.map((lead) => {
                  const status = getLeadStatus(lead);
                  const isUpdating = updatingId === lead.id;
                  const confirmo = normalizeBoolean(lead.confirmo);
                  const asistio = normalizeBoolean(lead.asistio);

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {lead.nombre || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        <a
                          href={"tel:" + lead.telefono}
                          className="flex items-center gap-1.5 hover:text-white transition-colors"
                        >
                          <Phone className="w-3 h-3 text-gray-600" />
                          {lead.telefono || "-"}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-gray-600" />
                          {lead.fecha_prueba || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-gray-600" />
                          {lead.horario || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold " +
                            STATUS_CONFIG[status].class
                          }
                        >
                          {STATUS_CONFIG[status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            updateLead(
                              lead.id,
                              "confirmo",
                              confirmo ? "Pendiente" : "Si"
                            )
                          }
                          disabled={isUpdating}
                          className={
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 " +
                            (confirmo
                              ? "bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25"
                              : "bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300")
                          }
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : confirmo ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {confirmo ? "Si" : "No"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            updateLead(
                              lead.id,
                              "asistio",
                              asistio ? "Pendiente" : "Si"
                            )
                          }
                          disabled={isUpdating}
                          className={
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 " +
                            (asistio
                              ? "bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25"
                              : "bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300")
                          }
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : asistio ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {asistio ? "Si" : "No"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            updateLead(lead.id, "estado", "ACTIVO")
                          }
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors disabled:opacity-40"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ThumbsUp className="w-3 h-3" />
                          )}
                          Inscribir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
