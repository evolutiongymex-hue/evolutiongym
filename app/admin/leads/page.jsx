"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Users,
  Calendar,
  Phone,
  Clock,
  AlertCircle,
  Loader2,
  ThumbsUp,
  Search,
  X,
  DollarSign,
  CheckCircle,
} from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [updateError, setUpdateError] = useState("");

  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagoStatus, setPagoStatus] = useState(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/sheets?sheet=CRM_Evolution_Gym");
      const data = await response.json();
      if (data.success) {
        setLeads(data.data);
      } else {
        setError(data.error || "Error al cargar visitas");
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

  const inscribir = useCallback(async (id) => {
    setUpdatingId(id);
    setUpdateError("");

    try {
      const response = await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, campo: "estado", valor: "ACTIVO" }),
      });
      if (response.ok) {
        // Remover de la lista local inmediatamente
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
      } else {
        setUpdateError("Error al inscribir. Intenta de nuevo.");
      }
    } catch {
      setUpdateError("Error de conexion al inscribir.");
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const abrirModalPago = useCallback((lead) => {
    setSelectedLead(lead);
    setMetodoPago("efectivo");
    setPagoStatus(null);
    setShowPagoModal(true);
  }, []);

  const registrarPago = useCallback(async () => {
    if (!selectedLead) return;
    setIsSubmitting(true);
    setPagoStatus(null);

    try {
      const fechaHoy = new Date().toISOString().split("T")[0];

      const pagoRes = await fetch("/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: selectedLead.id,
          nombre: selectedLead.nombre,
          fecha_pago: fechaHoy,
          monto: 50,
          metodo_pago: metodoPago,
          plan: "Visita",
          meses: 0,
          promocion: "",
          usuario: "admin",
        }),
      });

      if (!pagoRes.ok) throw new Error("Error al registrar pago");
      const pagoData = await pagoRes.json();
      const reciboUrl = APP_URL + "/recibo/" + pagoData.id;

      await fetch("/api/pagos/" + pagoData.id + "/recibo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recibo_url: reciboUrl }),
      });

      setPagoStatus({
        type: "success",
        text: "Pago de $50 registrado. Recibo: " + reciboUrl,
      });
      await fetchLeads();
    } catch {
      setPagoStatus({
        type: "error",
        text: "Error al registrar el pago. Intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedLead, metodoPago, fetchLeads]);

  // Ahora
  const leadsFiltrados = leads.filter((lead) => {
    if (lead.estado === "ACTIVO") return false;
    if (lead.estado === "INACTIVO") return false;
    if (lead.estado === "ELIMINADO") return false;
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
        <span className="ml-3 text-gray-400">Cargando visitas...</span>
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
              Visitas
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Clientes que agendaron su visita
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {leadsFiltrados.length}{" "}
              {filtroNombre
                ? "resultado(s) encontrado(s)"
                : "visitas pendientes"}
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

      {leadsFiltrados.length === 0 ? (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-10 text-center">
          <AlertCircle className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {filtroNombre
              ? "No hay visitas que coincidan"
              : "No hay visitas pendientes"}
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
                    Fecha visita
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Horario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {leadsFiltrados.map((lead) => {
                  const isUpdating = updatingId === lead.id;
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirModalPago(lead)}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 hover:bg-yellow-500/25 transition-colors disabled:opacity-40"
                          >
                            <DollarSign className="w-3 h-3" />
                            Pago $50
                          </button>
                          <button
                            onClick={() => inscribir(lead.id)}
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

      {/* Modal Pago $50 */}
      <AnimatePresence>
        {showPagoModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowPagoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-900 rounded-2xl max-w-sm w-full p-6 border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Registrar visita
                  </h2>
                  <p className="text-gray-500 text-sm">{selectedLead.nombre}</p>
                </div>
                <button
                  onClick={() => setShowPagoModal(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {pagoStatus ? (
                <div className="text-center py-2">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                  <p
                    className={`text-sm font-medium mb-4 ${
                      pagoStatus.type === "success"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {pagoStatus.text}
                  </p>
                  <button
                    onClick={() => setShowPagoModal(false)}
                    className="w-full py-2.5 bg-primary rounded-xl text-sm font-semibold text-white"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Monto fijo */}
                  <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Monto visita</span>
                    <span className="text-2xl font-black text-yellow-400">
                      $50
                    </span>
                  </div>

                  {/* Metodo de pago */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Metodo de pago
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {["efectivo", "transferencia"].map((metodo) => (
                        <button
                          key={metodo}
                          type="button"
                          onClick={() => setMetodoPago(metodo)}
                          className={`py-2.5 rounded-xl text-xs font-semibold transition-all border capitalize ${
                            metodoPago === metodo
                              ? "bg-primary border-primary text-white"
                              : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                          }`}
                        >
                          {metodo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={registrarPago}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 bg-primary hover:brightness-110 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Registrando...
                        </span>
                      ) : (
                        "Confirmar pago"
                      )}
                    </button>
                    <button
                      onClick={() => setShowPagoModal(false)}
                      className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
