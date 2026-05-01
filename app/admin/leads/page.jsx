"use client";

import { useEffect, useState } from "react";
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

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sheets?sheet=CRM_Evolution_Gym");
      const data = await response.json();

      if (data.success) {
        setLeads(data.data);
        setError("");
      } else {
        setError(data.error || "Error al cargar leads");
      }
    } catch (error) {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateLead = async (id, campo, valor) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id ? { ...lead, [campo]: valor } : lead
      )
    );

    setUpdatingId(id);

    try {
      const response = await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, campo, valor }),
      });

      if (!response.ok) {
        await fetchLeads();
      }
    } catch (error) {
      console.error("Error:", error);
      await fetchLeads();
    } finally {
      setUpdatingId(null);
    }
  };

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
        <span className="ml-2 text-gray-400">Cargando leads...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg">
        <p className="font-semibold">Error:</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchLeads}
          className="mt-3 px-4 py-2 bg-red-500/20 rounded-lg text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const isConfirmado = (lead) => {
    return (
      lead.confirmo === "Si" ||
      lead.confirmo === "Sí" ||
      lead.confirmo === true ||
      lead.confirmo === "true"
    );
  };

  const isAsistio = (lead) => {
    return (
      lead.asistio === "Si" ||
      lead.asistio === "Sí" ||
      lead.asistio === "asistio" ||
      lead.asistio === true ||
      lead.asistio === "true"
    );
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              LEADS
            </h1>
            <p className="text-gray-400 text-sm">
              Clientes que pidieron clase gratis
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Total: {leadsFiltrados.length} leads
            </p>
          </div>
          <button
            onClick={fetchLeads}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
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

      {leadsFiltrados.length === 0 ? (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">
            {filtroNombre
              ? "No hay leads que coincidan con la busqueda"
              : "No hay leads registrados aun"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">
                  Telefono
                </th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">
                  Fecha Prueba
                </th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">
                  Horario
                </th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">
                  Confirmo
                </th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">
                  Asistio
                </th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {leadsFiltrados.map((lead) => (
                <tr
                  key={`${lead.id}-${lead.asistio}-${lead.confirmo}`}
                  className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-300 font-medium">
                    {lead.nombre || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-500" />
                      {lead.telefono || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      {lead.fecha_prueba || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {lead.horario || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        updateLead(
                          lead.id,
                          "confirmo",
                          isConfirmado(lead) ? "Pendiente" : "Si"
                        )
                      }
                      disabled={updatingId === lead.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    >
                      {updatingId === lead.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isConfirmado(lead) ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {isConfirmado(lead) ? "Confirmo" : "Pendiente"}
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        updateLead(
                          lead.id,
                          "asistio",
                          isAsistio(lead) ? "Pendiente" : "Si"
                        )
                      }
                      disabled={updatingId === lead.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    >
                      {updatingId === lead.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isAsistio(lead) ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {isAsistio(lead) ? "Asistio" : "Pendiente"}
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => updateLead(lead.id, "estado", "ACTIVO")}
                      disabled={updatingId === lead.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50"
                    >
                      {updatingId === lead.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <ThumbsUp className="w-3 h-3" />
                      )}
                      Inscribir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
