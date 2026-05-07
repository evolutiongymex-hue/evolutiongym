"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Loader2,
} from "lucide-react";

export default function CajaPage() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("dia");
  const [resumen, setResumen] = useState({
    total: 0,
    efectivo: 0,
    transferencia: 0,
  });

  const fetchPagos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pagos");
      const data = await response.json();

      if (data.success) {
        // Zona horaria CDMX
        const hoy = new Date();
        const hoyStr = hoy.toLocaleDateString("en-CA", {
          timeZone: "America/Mexico_City",
        });

        const semanaAtras = new Date(hoy);
        semanaAtras.setDate(hoy.getDate() - 7);
        const semanaAtrasStr = semanaAtras.toLocaleDateString("en-CA", {
          timeZone: "America/Mexico_City",
        });

        let pagosFiltrados = [];

        if (filtro === "dia") {
          pagosFiltrados = data.data.filter((p) => p.fecha_pago === hoyStr);
        } else if (filtro === "semana") {
          pagosFiltrados = data.data.filter((p) => {
            return p.fecha_pago >= semanaAtrasStr && p.fecha_pago <= hoyStr;
          });
        }

        setPagos(pagosFiltrados);

        const total = pagosFiltrados.reduce((sum, p) => sum + p.monto, 0);
        const efectivo = pagosFiltrados
          .filter((p) => p.metodo_pago === "efectivo")
          .reduce((sum, p) => sum + p.monto, 0);
        const transferencia = pagosFiltrados
          .filter((p) => p.metodo_pago === "transferencia")
          .reduce((sum, p) => sum + p.monto, 0);

        setResumen({ total, efectivo, transferencia });
      }
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, [filtro]);

  const exportarCSV = () => {
    const headers = ["ID", "Cliente", "Fecha", "Monto", "Metodo", "Plan"];
    const filas = pagos.map((p) => [
      p.id,
      p.nombre,
      p.fecha_pago,
      p.monto,
      p.metodo_pago,
      p.plan,
    ]);

    const csvContent = [headers, ...filas]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `corte_${filtro}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-gray-400">Cargando pagos...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            Corte de Caja
          </h1>
          <button
            onClick={fetchPagos}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFiltro("dia")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filtro === "dia"
              ? "bg-primary text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Corte del Día
        </button>
        <button
          onClick={() => setFiltro("semana")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filtro === "semana"
              ? "bg-primary text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Corte de la Semana
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-primary" />
            <h2 className="text-gray-400 text-sm">Total</h2>
          </div>
          <p className="text-3xl font-bold text-white">
            ${resumen.total.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-gray-400 text-sm">Efectivo</h2>
          </div>
          <p className="text-3xl font-bold text-green-400">
            ${resumen.efectivo.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h2 className="text-gray-400 text-sm">Transferencia</h2>
          </div>
          <p className="text-3xl font-bold text-blue-400">
            ${resumen.transferencia.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-white font-semibold">Pagos Registrados</h2>
          <button
            onClick={exportarCSV}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-300">Fecha</th>
                <th className="px-4 py-3 text-left text-gray-300">Cliente</th>
                <th className="px-4 py-3 text-left text-gray-300">Plan</th>
                <th className="px-4 py-3 text-left text-gray-300">Monto</th>
                <th className="px-4 py-3 text-left text-gray-300">Método</th>
              </tr>
            </thead>
            <tbody>
              {pagos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">
                    No hay pagos registrados{" "}
                    {filtro === "dia" ? "hoy" : "esta semana"}
                  </td>
                </tr>
              ) : (
                pagos.map((pago, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-gray-800 hover:bg-gray-800/30"
                  >
                    <td className="px-4 py-3 text-gray-300">
                      {pago.fecha_pago}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{pago.nombre}</td>
                    <td className="px-4 py-3 text-gray-300">{pago.plan}</td>
                    <td className="px-4 py-3 text-gray-300">
                      ${pago.monto.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          pago.metodo_pago === "efectivo"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {pago.metodo_pago === "efectivo"
                          ? "Efectivo"
                          : "Transferencia"}
                      </span>
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
