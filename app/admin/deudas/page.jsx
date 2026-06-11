"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Loader2,
  X,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Users,
  TrendingDown,
  Plus,
  ChevronDown,
} from "lucide-react";

const inputClass =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50";
const labelClass =
  "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5";

const TABS = [
  { key: "pendiente", label: "Pendientes" },
  { key: "liquidada", label: "Liquidadas" },
];

export default function DeudasPage() {
  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pendiente");

  const [showAbonoModal, setShowAbonoModal] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState(null);
  const [abonoMonto, setAbonoMonto] = useState("");
  const [abonoError, setAbonoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [abonoSuccess, setAbonoSuccess] = useState("");

  const fetchDeudas = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/deudas");
      const data = await response.json();
      if (data.success) setDeudas(data.data);
      else setError(data.error || "Error al cargar deudas");
    } catch {
      setError("Error de conexion con el servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeudas();
  }, [fetchDeudas]);

  const deudas_filtradas = useMemo(
    () => deudas.filter((d) => d.estado === tab),
    [deudas, tab]
  );

  const resumen = useMemo(() => {
    const pendientes = deudas.filter((d) => d.estado === "pendiente");
    const totalPorCobrar = pendientes.reduce((s, d) => s + d.saldo, 0);
    const count = pendientes.length;
    const promedio = count > 0 ? totalPorCobrar / count : 0;
    return { totalPorCobrar, count, promedio };
  }, [deudas]);

  const abrirAbonoModal = useCallback((deuda) => {
    setSelectedDeuda(deuda);
    setAbonoMonto("");
    setAbonoError("");
    setAbonoSuccess("");
    setShowAbonoModal(true);
  }, []);

  const registrarAbono = useCallback(async () => {
    setAbonoError("");
    const abono = parseFloat(abonoMonto);
    if (!abono || abono <= 0) {
      setAbonoError("Ingresa un monto valido");
      return;
    }
    if (abono > selectedDeuda.saldo) {
      setAbonoError(
        "El abono supera el saldo pendiente ($" +
          selectedDeuda.saldo.toLocaleString() +
          ")"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/deudas/" + selectedDeuda.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abono }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Error al registrar abono");

      if (data.estado === "liquidada") {
        setAbonoSuccess("¡Deuda liquidada completamente!");
      } else {
        setAbonoSuccess(
          "Abono registrado. Saldo restante: $" +
            data.nuevoSaldo.toLocaleString()
        );
      }
      await fetchDeudas();
      setTimeout(() => setShowAbonoModal(false), 2000);
    } catch (err) {
      setAbonoError(err.message || "Error al registrar el abono");
    } finally {
      setIsSubmitting(false);
    }
  }, [abonoMonto, selectedDeuda, fetchDeudas]);

  const porcentajePagado = (deuda) => {
    if (!deuda.monto_total) return 0;
    return Math.round((deuda.monto_pagado / deuda.monto_total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-400">Cargando deudas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-xl">
        <p className="font-semibold mb-1">Error al cargar</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchDeudas}
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
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-primary" />
            Cuentas por cobrar
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Pagos parciales y deudas pendientes
          </p>
        </div>
        <button
          onClick={fetchDeudas}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Cards resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-red-400" />
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Total por cobrar
            </span>
          </div>
          <p className="text-3xl font-black text-red-400">
            ${resumen.totalPorCobrar.toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-orange-400" />
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Deudas pendientes
            </span>
          </div>
          <p className="text-3xl font-black text-orange-400">{resumen.count}</p>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Deuda promedio
            </span>
          </div>
          <p className="text-3xl font-black text-yellow-400">
            ${Math.round(resumen.promedio).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({ key, label }) => {
          const count = deudas.filter((d) => d.estado === key).length;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all " +
                (tab === key
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white")
              }
            >
              {label}
              <span
                className={
                  "px-1.5 py-0.5 rounded-md text-[10px] font-bold " +
                  (tab === key ? "bg-white/20" : "bg-white/10")
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista deudas */}
      {deudas_filtradas.length === 0 ? (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-10 text-center">
          <CheckCircle2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {tab === "pendiente"
              ? "No hay deudas pendientes"
              : "No hay deudas liquidadas"}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/40">
                  {[
                    "Cliente",
                    "Tipo",
                    "Concepto",
                    "Total",
                    "Pagado",
                    "Saldo",
                    "Progreso",
                    tab === "pendiente" ? "Accion" : "Estado",
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
                {deudas_filtradas.map((deuda) => {
                  const pct = porcentajePagado(deuda);
                  return (
                    <tr
                      key={deuda.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {deuda.nombre || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "px-2.5 py-1 rounded-lg text-[11px] font-semibold border " +
                            (deuda.tipo === "producto"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-purple-500/10 text-purple-400 border-purple-500/20")
                          }
                        >
                          {deuda.tipo === "producto" ? "Producto" : "Membresia"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {deuda.concepto || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-300 font-semibold tabular-nums">
                        ${deuda.monto_total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-green-400 font-semibold tabular-nums">
                        ${deuda.monto_pagado.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-red-400 font-bold tabular-nums">
                        ${deuda.saldo.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: pct + "%" }}
                            />
                          </div>
                          <span className="text-gray-500 text-xs tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {tab === "pendiente" ? (
                          <button
                            onClick={() => abrirAbonoModal(deuda)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Abonar
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Liquidada
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Abono */}
      <AnimatePresence>
        {showAbonoModal && selectedDeuda && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAbonoModal(false)}
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
                    Registrar abono
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {selectedDeuda.nombre} — {selectedDeuda.concepto}
                  </p>
                </div>
                <button
                  onClick={() => setShowAbonoModal(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {abonoSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-green-400 font-semibold">{abonoSuccess}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Resumen deuda */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-gray-500 text-xs mb-1">Total</p>
                      <p className="text-white font-bold text-sm">
                        ${selectedDeuda.monto_total.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-gray-500 text-xs mb-1">Pagado</p>
                      <p className="text-green-400 font-bold text-sm">
                        ${selectedDeuda.monto_pagado.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <p className="text-gray-500 text-xs mb-1">Saldo</p>
                      <p className="text-red-400 font-bold text-sm">
                        ${selectedDeuda.saldo.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {abonoError && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {abonoError}
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>Monto del abono *</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedDeuda.saldo}
                      value={abonoMonto}
                      onChange={(e) => {
                        setAbonoMonto(e.target.value);
                        setAbonoError("");
                      }}
                      className={inputClass}
                      placeholder={
                        "Max: $" + selectedDeuda.saldo.toLocaleString()
                      }
                      autoFocus
                    />
                  </div>

                  {/* Botón liquidar todo */}
                  <button
                    onClick={() => setAbonoMonto(String(selectedDeuda.saldo))}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ChevronDown className="w-3 h-3" /> Liquidar todo ($
                    {selectedDeuda.saldo.toLocaleString()})
                  </button>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={registrarAbono}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 bg-primary hover:brightness-110 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Registrando..." : "Confirmar abono"}
                    </button>
                    <button
                      onClick={() => setShowAbonoModal(false)}
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
