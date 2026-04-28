"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sheets?sheet=Leads");
      const data = await response.json();

      if (data.success) {
        setLeads(data.data);
        setError("");
      } else {
        setError(data.error || "Error al cargar leads");
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando leads...</div>
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
          className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const columnas = [
    "ID",
    "Fecha Consulta",
    "Nombre",
    "Teléfono",
    "Fecha Prueba",
    "Horario",
    "Estado",
    "Fuente",
    "¿Confirmó?",
    "¿Asistió?",
    "Fecha Contacto",
    "Notas",
  ];

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              LEADS
            </h1>
            <p className="text-gray-400 text-sm ml-8">
              Clientes nuevos que pidieron clase gratis
            </p>
            <p className="text-gray-500 text-xs mt-1 ml-8">
              Total: {leads.length} leads
            </p>
          </div>
          <button
            onClick={fetchLeads}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No hay leads registrados aún</p>
          <p className="text-gray-500 text-sm mt-2">
            Los leads del formulario aparecerán aquí automáticamente
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 sticky top-0">
              <tr>
                {columnas.map((col, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-gray-300 font-medium"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, idx) => {
                // Determinar colores según estado
                const confirmo =
                  lead[8] === "Sí" ? "text-green-400" : "text-yellow-500";
                const asistio =
                  lead[9] === "Sí" ? "text-green-400" : "text-yellow-500";

                return (
                  <tr
                    key={idx}
                    className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
                  >
                    {lead.map((cell, cellIdx) => {
                      // Iconos especiales para ciertas columnas
                      if (cellIdx === 3 && cell) {
                        // Teléfono
                        return (
                          <td key={cellIdx} className="px-4 py-3 text-gray-300">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-500" />
                              {cell || "-"}
                            </div>
                          </td>
                        );
                      }
                      if (cellIdx === 4 && cell) {
                        // Fecha Prueba
                        return (
                          <td key={cellIdx} className="px-4 py-3 text-gray-300">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              {cell || "-"}
                            </div>
                          </td>
                        );
                      }
                      if (cellIdx === 5 && cell) {
                        // Horario
                        return (
                          <td key={cellIdx} className="px-4 py-3 text-gray-300">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              {cell || "-"}
                            </div>
                          </td>
                        );
                      }
                      if (cellIdx === 8) {
                        // ¿Confirmó?
                        return (
                          <td key={cellIdx} className="px-4 py-3">
                            <div
                              className={`flex items-center gap-1 ${confirmo}`}
                            >
                              {cell === "Sí" ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              {cell || "Pendiente"}
                            </div>
                          </td>
                        );
                      }
                      if (cellIdx === 9) {
                        // ¿Asistió?
                        return (
                          <td key={cellIdx} className="px-4 py-3">
                            <div
                              className={`flex items-center gap-1 ${asistio}`}
                            >
                              {cell === "Sí" ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              {cell || "Pendiente"}
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={cellIdx} className="px-4 py-3 text-gray-300">
                          {cell || "-"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
