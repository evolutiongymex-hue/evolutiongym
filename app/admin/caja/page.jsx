"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  DollarSign,
  Loader2,
  Download,
  X,
  TrendingDown,
  TrendingUp,
  Banknote,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  Wallet,
} from "lucide-react";

const inputClass =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50";
const labelClass =
  "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5";

const TABS = [
  { key: "dia", label: "Corte del dia" },
  { key: "semana", label: "Corte de la semana" },
];

const escapeCsvField = (value) => {
  const str = String(value ?? "");
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
};

export default function CajaPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("dia");
  const [pagos, setPagos] = useState([]);
  const [cajaData, setCajaData] = useState(null);

  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState({ concepto: "", monto: "" });
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [pagosRes, cajaRes] = await Promise.all([
        fetch("/api/pagos"),
        fetch("/api/caja/movimientos"),
      ]);
      const [pagosData, cajaJson] = await Promise.all([
        pagosRes.json(),
        cajaRes.json(),
      ]);
      if (pagosData.success) setPagos(pagosData.data || []);
      if (cajaJson.success) setCajaData(cajaJson);
      else setError(cajaJson.error || "Error al cargar caja");
    } catch {
      setError("Error de conexion con el servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hoy = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Mexico_City",
  });
  const semanaAtras = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
  }, []);

  const pagosFiltrados = useMemo(() => {
    return pagos.filter((p) => {
      if (tab === "dia") return p.fecha_pago === hoy;
      return p.fecha_pago >= semanaAtras && p.fecha_pago <= hoy;
    });
  }, [pagos, tab, hoy, semanaAtras]);

  const resumen = useMemo(() => {
    const total = pagosFiltrados.reduce(
      (s, p) => s + (Number(p.monto) || 0),
      0
    );
    const efectivo = pagosFiltrados
      .filter((p) => p.metodo_pago === "efectivo")
      .reduce((s, p) => s + (Number(p.monto) || 0), 0);
    const transferencia = pagosFiltrados
      .filter((p) => p.metodo_pago === "transferencia")
      .reduce((s, p) => s + (Number(p.monto) || 0), 0);
    return { total, efectivo, transferencia, count: pagosFiltrados.length };
  }, [pagosFiltrados]);

  const registrarMovimiento = useCallback(async () => {
    setModalError("");
    const monto = parseFloat(modalData.monto);
    if (!monto || monto <= 0) {
      setModalError("Ingresa un monto valido");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/caja/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: activeModal,
          concepto:
            modalData.concepto ||
            (activeModal === "retiro" ? "Retiro del dueño" : "Fondo agregado"),
          monto,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al registrar");
      await fetchData();
      setActiveModal(null);
      setModalData({ concepto: "", monto: "" });
    } catch (err) {
      setModalError(err.message || "Error al registrar movimiento");
    } finally {
      setIsSubmitting(false);
    }
  }, [activeModal, modalData, fetchData]);

  const exportarCSV = useCallback(() => {
    const headers = ["Fecha", "Cliente", "Plan", "Monto", "Metodo", "Recibo"];
    const filas = pagosFiltrados.map((p) => [
      p.fecha_pago,
      p.nombre,
      p.plan,
      p.monto,
      p.metodo_pago,
      p.recibo_url || "",
    ]);
    const csvContent = [headers, ...filas]
      .map((row) => row.map(escapeCsvField).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "caja_" + (tab === "dia" ? hoy : "semana") + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [pagosFiltrados, tab, hoy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-400">Cargando caja...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-xl">
        <p className="font-semibold mb-1">Error al cargar</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchData}
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
            <DollarSign className="w-6 h-6 text-primary" />
            Caja
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Control de ingresos y fondo de caja
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Caja chica */}
      {cajaData && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Fondo de caja
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Saldo principal */}
            <div className="sm:col-span-2 bg-primary/5 border border-primary/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  En caja ahorita
                </span>
              </div>
              <p className="text-4xl font-black text-primary">
                ${cajaData.saldoEnCaja.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Incluye efectivo del día + fondo base
              </p>
            </div>

            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Efectivo hoy
                </span>
              </div>
              <p className="text-2xl font-black text-green-400">
                ${cajaData.ingresosEfectivoHoy.toLocaleString()}
              </p>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Retiros hoy
                </span>
              </div>
              <p className="text-2xl font-black text-red-400">
                ${cajaData.retirosHoy.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setActiveModal("fondo");
                setModalData({ concepto: "", monto: "" });
                setModalError("");
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 rounded-xl text-sm font-semibold transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Agregar fondo
            </button>
            <button
              onClick={() => {
                setActiveModal("retiro");
                setModalData({ concepto: "", monto: "" });
                setModalError("");
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 rounded-xl text-sm font-semibold transition-colors"
            >
              <MinusCircle className="w-4 h-4" /> Registrar retiro
            </button>
          </div>

          {/* Movimientos del día */}
          {cajaData.movimientosHoy.length > 0 && (
            <div className="mt-4 bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800">
                <h3 className="text-white font-semibold text-sm">
                  Movimientos de hoy
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/40">
                    {["Tipo", "Concepto", "Monto", "Saldo resultante"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {cajaData.movimientosHoy.map((m, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border " +
                            (m.tipo === "retiro"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-green-500/10 text-green-400 border-green-500/20")
                          }
                        >
                          {m.tipo === "retiro" ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <TrendingUp className="w-3 h-3" />
                          )}
                          {m.tipo === "retiro" ? "Retiro" : "Fondo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{m.concepto}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        <span
                          className={
                            m.tipo === "retiro"
                              ? "text-red-400"
                              : "text-green-400"
                          }
                        >
                          {m.tipo === "retiro" ? "-" : "+"}$
                          {m.monto.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-semibold tabular-nums">
                        ${m.saldo_nuevo.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Corte de caja — tabs */}
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
        Corte de caja
      </h2>
      <div className="flex gap-2 mb-6">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              "px-4 py-2 rounded-xl text-sm font-medium transition-all " +
              (tab === key
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cards resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Total
            </span>
          </div>
          <p className="text-3xl font-black text-primary">
            ${resumen.total.toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs mt-1">{resumen.count} pagos</p>
        </div>
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Efectivo
            </span>
          </div>
          <p className="text-3xl font-black text-green-400">
            ${resumen.efectivo.toLocaleString()}
          </p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Transferencia
            </span>
          </div>
          <p className="text-3xl font-black text-blue-400">
            ${resumen.transferencia.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabla pagos */}
      <div className="bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-sm">
            Pagos registrados
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/40">
                {["Fecha", "Cliente", "Plan", "Monto", "Metodo", "Recibo"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {pagosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-500 text-sm"
                  >
                    No hay pagos {tab === "dia" ? "hoy" : "esta semana"}
                  </td>
                </tr>
              ) : (
                pagosFiltrados.map((pago) => (
                  <tr
                    key={pago.id}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400 tabular-nums">
                      {pago.fecha_pago}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      {pago.nombre || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {pago.plan || "-"}
                    </td>
                    <td className="px-4 py-3 text-white font-semibold tabular-nums">
                      ${(Number(pago.monto) || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "px-2.5 py-1 rounded-lg text-[11px] font-semibold border " +
                          (pago.metodo_pago === "efectivo"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20")
                        }
                      >
                        {pago.metodo_pago === "efectivo"
                          ? "Efectivo"
                          : "Transferencia"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {pago.recibo_url ? (
                        <a
                          href={pago.recibo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs"
                        >
                          Ver recibo
                        </a>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setActiveModal(null)}
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
                    {activeModal === "retiro"
                      ? "Registrar retiro"
                      : "Agregar fondo"}
                  </h2>
                  {cajaData && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      Saldo actual:{" "}
                      <span className="text-white font-semibold">
                        ${cajaData.saldoEnCaja.toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {modalError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Concepto</label>
                  <input
                    type="text"
                    value={modalData.concepto}
                    onChange={(e) =>
                      setModalData((p) => ({ ...p, concepto: e.target.value }))
                    }
                    className={inputClass}
                    placeholder={
                      activeModal === "retiro"
                        ? "Ej: Retiro del dueño"
                        : "Ej: Fondo para cambio"
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Monto *</label>
                  <input
                    type="number"
                    min="1"
                    value={modalData.monto}
                    onChange={(e) =>
                      setModalData((p) => ({ ...p, monto: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="Ej: 500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={registrarMovimiento}
                    disabled={isSubmitting}
                    className={
                      "flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 " +
                      (activeModal === "retiro"
                        ? "bg-red-500 hover:bg-red-400"
                        : "bg-green-500 hover:bg-green-400")
                    }
                  >
                    {isSubmitting
                      ? "Registrando..."
                      : activeModal === "retiro"
                      ? "Confirmar retiro"
                      : "Agregar fondo"}
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
