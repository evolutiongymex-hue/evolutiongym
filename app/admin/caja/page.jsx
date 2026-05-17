"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  RefreshCw,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Loader2,
  ExternalLink,
} from "lucide-react";

const FILTROS = [
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
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("dia");

  const fetchPagos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const hoy = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Mexico_City",
      });

      const semanaAtras = new Date();
      semanaAtras.setDate(semanaAtras.getDate() - 7);
      const semanaAtrasStr = semanaAtras.toLocaleDateString("en-CA", {
        timeZone: "America/Mexico_City",
      });

      const params = new URLSearchParams();
      if (filtro === "dia") params.set("fecha", hoy);

      const response = await fetch("/api/pagos?" + params.toString());
      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Error al cargar pagos");
        return;
      }

      // Filtro semana en cliente solo cuando es necesario
      if (filtro === "semana") {
        setPagos(
          data.data.filter(
            (p) => p.fecha_pago >= semanaAtrasStr && p.fecha_pago <= hoy
          )
        );
      } else {
        setPagos(data.data);
      }
    } catch {
      setError("Error de conexion con el servidor");
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  const resumen = useMemo(
    () => ({
      total: pagos.reduce((sum, p) => sum + p.monto, 0),
      efectivo: pagos
        .filter((p) => p.metodo_pago === "efectivo")
        .reduce((sum, p) => sum + p.monto, 0),
      transferencia: pagos
        .filter((p) => p.metodo_pago === "transferencia")
        .reduce((sum, p) => sum + p.monto, 0),
    }),
    [pagos]
  );

  const exportarCSV = useCallback(() => {
    const headers = [
      "ID",
      "Cliente",
      "Fecha",
      "Monto",
      "Metodo",
      "Plan",
      "Recibo",
    ];
    const filas = pagos.map((p) => [
      p.id,
      p.nombre,
      p.fecha_pago,
      p.monto,
      p.metodo_pago,
      p.plan,
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
    a.download =
      "corte_" + filtro + "_" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [pagos, filtro]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-400">Cargando pagos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-xl">
        <p className="font-semibold mb-1">Error al cargar</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchPagos}
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            Corte de caja
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {pagos.length} pago(s) registrado(s)
          </p>
        </div>
        <button
          onClick={fetchPagos}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Tabs filtro */}
      <div className="flex gap-2 mb-6">
        {FILTROS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFiltro(key)}
            className={
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all " +
              (filtro === key
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white")
            }
          >
            <Calendar className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Cards resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Total
            </span>
          </div>
          <p className="text-3xl font-black text-white">
            ${resumen.total.toLocaleString()}
          </p>
          <p className="text-gray-600 text-xs mt-1">
            {pagos.length} transacciones
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Efectivo
            </span>
          </div>
          <p className="text-3xl font-black text-green-400">
            ${resumen.efectivo.toLocaleString()}
          </p>
          <p className="text-gray-600 text-xs mt-1">
            {pagos.filter((p) => p.metodo_pago === "efectivo").length} pagos
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Transferencia
            </span>
          </div>
          <p className="text-3xl font-black text-blue-400">
            ${resumen.transferencia.toLocaleString()}
          </p>
          <p className="text-gray-600 text-xs mt-1">
            {pagos.filter((p) => p.metodo_pago === "transferencia").length}{" "}
            pagos
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-white font-semibold text-sm">
            Pagos registrados
          </h2>
          {pagos.length > 0 && (
            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          )}
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
              {pagos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-500 text-sm"
                  >
                    No hay pagos registrados{" "}
                    {filtro === "dia" ? "hoy" : "esta semana"}
                  </td>
                </tr>
              ) : (
                pagos.map((pago) => (
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
                      ${pago.monto.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "px-2.5 py-1 rounded-lg text-xs font-semibold border " +
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
                          className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-xs font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver recibo
                        </a>
                      ) : (
                        <span className="text-gray-600 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
