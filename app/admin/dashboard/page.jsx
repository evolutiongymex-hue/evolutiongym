"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Users,
  UserX,
  TrendingUp,
  AlertTriangle,
  Package,
  RefreshCw,
  Loader2,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle2,
} from "lucide-react";

const diasRestantes = (proximoPago) => {
  if (!proximoPago) return null;
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let fecha;
    if (proximoPago.includes("-")) {
      fecha = new Date(proximoPago + "T00:00:00");
    } else {
      const parts = proximoPago.split("/");
      if (parts.length === 3) {
        fecha = new Date(parts[2], parts[1] - 1, parts[0]);
      } else return null;
    }
    return Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};

const StatCard = ({ title, value, subtitle, icon: Icon, color, bg }) => (
  <div className={`rounded-xl border p-5 ${bg}`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
        {title}
      </span>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}
      >
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
    {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const hoy = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Mexico_City",
      });
      const semanaAtras = new Date();
      semanaAtras.setDate(semanaAtras.getDate() - 7);
      const semanaAtrasStr = semanaAtras.toLocaleDateString("en-CA", {
        timeZone: "America/Mexico_City",
      });
      const mesAtras = new Date();
      mesAtras.setDate(1);
      const mesAtrasStr = mesAtras.toLocaleDateString("en-CA", {
        timeZone: "America/Mexico_City",
      });

      const [crmRes, pagosRes, inventarioRes, ventasRes] = await Promise.all([
        fetch("/api/sheets?sheet=CRM_Evolution_Gym"),
        fetch("/api/pagos"),
        fetch("/api/inventario"),
        fetch("/api/inventario/ventas?periodo=dia"),
      ]);

      const [crmData, pagosData, inventarioData, ventasData] =
        await Promise.all([
          crmRes.json(),
          pagosRes.json(),
          inventarioRes.json(),
          ventasRes.json(),
        ]);

      const clientes = crmData.success ? crmData.data : [];
      const pagos = pagosData.success ? pagosData.data : [];
      const productos = inventarioData.success ? inventarioData.data : [];

      // Miembros
      const activos = clientes.filter((c) => c.estado === "ACTIVO");
      const inactivos = clientes.filter((c) => c.estado === "INACTIVO");
      const visitasHoy = clientes.filter((c) => {
        const fecha = c.fecha_creacion || "";
        return (
          fecha.startsWith(hoy) &&
          c.estado !== "ACTIVO" &&
          c.estado !== "INACTIVO"
        );
      });

      // Alertas de pago
      const vencenProximo = activos.filter((c) => {
        const dias = diasRestantes(c.proximo_pago);
        return dias !== null && dias >= 0 && dias <= 3;
      });
      const vencidos = activos.filter((c) => {
        const dias = diasRestantes(c.proximo_pago);
        return dias !== null && dias < 0;
      });

      // Ingresos
      const pagosHoy = pagos.filter((p) => p.fecha_pago === hoy);
      const pagosSemana = pagos.filter(
        (p) => p.fecha_pago >= semanaAtrasStr && p.fecha_pago <= hoy
      );
      const pagosMes = pagos.filter(
        (p) => p.fecha_pago >= mesAtrasStr && p.fecha_pago <= hoy
      );

      const totalHoy = pagosHoy.reduce((s, p) => s + p.monto, 0);
      const totalSemana = pagosSemana.reduce((s, p) => s + p.monto, 0);
      const totalMes = pagosMes.reduce((s, p) => s + p.monto, 0);

      const efectivoHoy = pagosHoy
        .filter((p) => p.metodo_pago === "efectivo")
        .reduce((s, p) => s + p.monto, 0);
      const transferenciaHoy = pagosHoy
        .filter((p) => p.metodo_pago === "transferencia")
        .reduce((s, p) => s + p.monto, 0);

      // Inventario
      const stockBajo = productos.filter((p) => p.stock <= p.stock_minimo);
      const ventasDia = ventasData.success ? ventasData.totalDinero : 0;
      const unidadesDia = ventasData.success ? ventasData.totalUnidades : 0;

      // Ultimos pagos del dia
      const ultimosPagos = pagosHoy.slice(-5).reverse();

      setData({
        activos: activos.length,
        inactivos: inactivos.length,
        visitasHoy: visitasHoy.length,
        vencenProximo: vencenProximo.length,
        vencidos: vencidos.length,
        totalHoy,
        totalSemana,
        totalMes,
        efectivoHoy,
        transferenciaHoy,
        stockBajo: stockBajo.length,
        ventasDia,
        unidadesDia,
        ultimosPagos,
        productosAlerta: stockBajo.map((p) => p.nombre),
      });
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-400">Cargando dashboard...</span>
      </div>
    );
  }

  if (!data) return null;

  const ahora = new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const fechaHoy = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5 capitalize">
            {fechaHoy} · {ahora}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Alertas */}
      {(data.vencenProximo > 0 || data.vencidos > 0 || data.stockBajo > 0) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {data.vencidos > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>
                <strong>{data.vencidos}</strong> miembros con pago vencido
              </span>
              <button
                onClick={() => router.push("/admin/activos")}
                className="ml-1 underline text-red-300 text-xs"
              >
                Ver
              </button>
            </div>
          )}
          {data.vencenProximo > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 border border-orange-500/25 rounded-xl text-orange-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                <strong>{data.vencenProximo}</strong> vencen en 3 dias
              </span>
              <button
                onClick={() => router.push("/admin/activos")}
                className="ml-1 underline text-orange-300 text-xs"
              >
                Ver
              </button>
            </div>
          )}
          {data.stockBajo > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/25 rounded-xl text-yellow-400 text-sm">
              <Package className="w-4 h-4" />
              <span>
                <strong>{data.stockBajo}</strong> productos con stock bajo
              </span>
              <button
                onClick={() => router.push("/admin/inventario")}
                className="ml-1 underline text-yellow-300 text-xs"
              >
                Ver
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ingresos */}
      <div className="mb-3">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Ingresos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Hoy"
            value={"$" + data.totalHoy.toLocaleString()}
            subtitle={data.ultimosPagos.length + " pagos registrados"}
            icon={DollarSign}
            color="text-primary"
            bg="bg-primary/5 border-primary/20"
          />
          <StatCard
            title="Esta semana"
            value={"$" + data.totalSemana.toLocaleString()}
            icon={TrendingUp}
            color="text-blue-400"
            bg="bg-blue-500/5 border-blue-500/20"
          />
          <StatCard
            title="Este mes"
            value={"$" + data.totalMes.toLocaleString()}
            icon={TrendingUp}
            color="text-purple-400"
            bg="bg-purple-500/5 border-purple-500/20"
          />
          <div className="rounded-xl border bg-gray-900/40 border-gray-800 p-5">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-3">
              Metodo hoy
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm">Efectivo</span>
                </div>
                <span className="text-green-400 font-bold">
                  ${data.efectivoHoy.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">Transferencia</span>
                </div>
                <span className="text-blue-400 font-bold">
                  ${data.transferenciaHoy.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Miembros */}
      <div className="mb-3 mt-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Miembros
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Activos"
            value={data.activos}
            subtitle="Con membresia vigente"
            icon={Users}
            color="text-green-400"
            bg="bg-green-500/5 border-green-500/20"
          />
          <StatCard
            title="Inactivos"
            value={data.inactivos}
            subtitle="Sin membresia activa"
            icon={UserX}
            color="text-gray-400"
            bg="bg-gray-800/40 border-gray-700"
          />
          <StatCard
            title="Visitas hoy"
            value={data.visitasHoy}
            subtitle="Registros del dia"
            icon={CheckCircle2}
            color="text-yellow-400"
            bg="bg-yellow-500/5 border-yellow-500/20"
          />
        </div>
      </div>

      {/* Inventario */}
      <div className="mb-3 mt-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Inventario hoy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Ventas del dia"
            value={"$" + data.ventasDia.toLocaleString()}
            subtitle={data.unidadesDia + " unidades vendidas"}
            icon={Package}
            color="text-blue-400"
            bg="bg-blue-500/5 border-blue-500/20"
          />
          <div className="rounded-xl border bg-gray-900/40 border-gray-800 p-5">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-3">
              Stock bajo
            </span>
            {data.productosAlerta.length === 0 ? (
              <p className="text-green-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Todo el inventario al
                corriente
              </p>
            ) : (
              <ul className="space-y-1">
                {data.productosAlerta.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 text-sm text-red-400"
                  >
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Ultimos pagos del dia */}
      {data.ultimosPagos.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Ultimos pagos del dia
          </h2>
          <div className="bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/40">
                  {["Cliente", "Plan", "Monto", "Metodo"].map((h) => (
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
                {data.ultimosPagos.map((pago) => (
                  <tr
                    key={pago.id}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
