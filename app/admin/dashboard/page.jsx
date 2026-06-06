"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  Calendar,
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

const TABS = [
  { key: "dia", label: "Hoy" },
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mes" },
];

const PLANES_ORDER = [
  "Mensual",
  "Bimestral",
  "Trimestral",
  "Anualidad",
  "Visita",
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("dia");

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

      const [
        crmRes,
        pagosRes,
        inventarioRes,
        ventasDiaRes,
        ventasSemanaRes,
        ventasMesRes,
      ] = await Promise.all([
        fetch("/api/sheets?sheet=CRM_Evolution_Gym"),
        fetch("/api/pagos"),
        fetch("/api/inventario"),
        fetch("/api/inventario/ventas?periodo=dia"),
        fetch("/api/inventario/ventas?periodo=semana"),
        fetch("/api/inventario/ventas?periodo=mes"),
      ]);

      const [
        crmData,
        pagosData,
        inventarioData,
        ventasDiaData,
        ventasSemanaData,
        ventasMesData,
      ] = await Promise.all([
        crmRes.json(),
        pagosRes.json(),
        inventarioRes.json(),
        ventasDiaRes.json(),
        ventasSemanaRes.json(),
        ventasMesRes.json(),
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
      const visitasSemana = clientes.filter((c) => {
        const fecha = (c.fecha_creacion || "").split("T")[0];
        return (
          fecha >= semanaAtrasStr &&
          fecha <= hoy &&
          c.estado !== "ACTIVO" &&
          c.estado !== "INACTIVO"
        );
      });
      const visitasMes = clientes.filter((c) => {
        const fecha = (c.fecha_creacion || "").split("T")[0];
        return (
          fecha >= mesAtrasStr &&
          fecha <= hoy &&
          c.estado !== "ACTIVO" &&
          c.estado !== "INACTIVO"
        );
      });

      // Nuevos activos por período
      const nuevosActivosSemana = clientes.filter((c) => {
        const fecha = (c.fecha_creacion || "").split("T")[0];
        return fecha >= semanaAtrasStr && fecha <= hoy && c.estado === "ACTIVO";
      });
      const nuevosActivosMes = clientes.filter((c) => {
        const fecha = (c.fecha_creacion || "").split("T")[0];
        return fecha >= mesAtrasStr && fecha <= hoy && c.estado === "ACTIVO";
      });

      // Alertas
      const vencenProximo = activos.filter((c) => {
        const dias = diasRestantes(c.proximo_pago);
        return dias !== null && dias >= 0 && dias <= 3;
      });
      const vencidos = activos.filter((c) => {
        const dias = diasRestantes(c.proximo_pago);
        return dias !== null && dias < 0;
      });

      // Pagos por período
      const pagosHoy = pagos.filter((p) => p.fecha_pago === hoy);
      const pagosSemana = pagos.filter(
        (p) => p.fecha_pago >= semanaAtrasStr && p.fecha_pago <= hoy
      );
      const pagosMes = pagos.filter(
        (p) => p.fecha_pago >= mesAtrasStr && p.fecha_pago <= hoy
      );

      const calcStats = (lista) => {
        const total = lista.reduce((s, p) => s + (Number(p.monto) || 0), 0);
        const efectivo = lista
          .filter((p) => p.metodo_pago === "efectivo")
          .reduce((s, p) => s + (Number(p.monto) || 0), 0);
        const transferencia = lista
          .filter((p) => p.metodo_pago === "transferencia")
          .reduce((s, p) => s + (Number(p.monto) || 0), 0);

        // Por plan
        const porPlan = {};
        lista.forEach((p) => {
          const plan = p.plan || "Otro";
          const base = PLANES_ORDER.find((pl) => plan.includes(pl)) || "Otro";
          porPlan[base] = (porPlan[base] || 0) + (Number(p.monto) || 0);
        });

        return { total, efectivo, transferencia, porPlan, count: lista.length };
      };

      // Inventario
      const stockBajo = productos.filter((p) => p.stock <= p.stock_minimo);

      setData({
        activos: activos.length,
        inactivos: inactivos.length,
        visitasHoy: visitasHoy.length,
        visitasSemana: visitasSemana.length,
        visitasMes: visitasMes.length,
        nuevosActivosSemana: nuevosActivosSemana.length,
        nuevosActivosMes: nuevosActivosMes.length,
        vencenProximo: vencenProximo.length,
        vencidos: vencidos.length,
        dia: calcStats(pagosHoy),
        semana: calcStats(pagosSemana),
        mes: calcStats(pagosMes),
        stockBajo: stockBajo.length,
        productosAlerta: stockBajo.map((p) => p.nombre),
        inventarioDia: {
          total: ventasDiaData.success ? ventasDiaData.totalDinero : 0,
          unidades: ventasDiaData.success ? ventasDiaData.totalUnidades : 0,
        },
        inventarioSemana: {
          total: ventasSemanaData.success ? ventasSemanaData.totalDinero : 0,
          unidades: ventasSemanaData.success
            ? ventasSemanaData.totalUnidades
            : 0,
        },
        inventarioMes: {
          total: ventasMesData.success ? ventasMesData.totalDinero : 0,
          unidades: ventasMesData.success ? ventasMesData.totalUnidades : 0,
        },
        ultimosPagos: pagosHoy.slice(-5).reverse(),
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

  const stats = useMemo(() => data?.[tab], [data, tab]);
  const visitas = useMemo(() => {
    if (!data) return 0;
    return tab === "dia"
      ? data.visitasHoy
      : tab === "semana"
      ? data.visitasSemana
      : data.visitasMes;
  }, [data, tab]);
  const nuevosActivos = useMemo(() => {
    if (!data) return 0;
    return tab === "dia"
      ? "-"
      : tab === "semana"
      ? data.nuevosActivosSemana
      : data.nuevosActivosMes;
  }, [data, tab]);
  const inventario = useMemo(() => {
    if (!data) return { total: 0, unidades: 0 };
    return tab === "dia"
      ? data.inventarioDia
      : tab === "semana"
      ? data.inventarioSemana
      : data.inventarioMes;
  }, [data, tab]);

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
      <div className="flex justify-between items-start mb-6">
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({ key, label }) => (
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
            <Calendar className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Ingresos del período */}
      <div className="mb-3">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Ingresos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total"
            value={"$" + stats.total.toLocaleString()}
            subtitle={stats.count + " pagos registrados"}
            icon={DollarSign}
            color="text-primary"
            bg="bg-primary/5 border-primary/20"
          />
          <div className="rounded-xl border bg-gray-900/40 border-gray-800 p-5">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-3">
              Metodo de pago
            </span>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm">Efectivo</span>
                </div>
                <span className="text-green-400 font-bold">
                  ${stats.efectivo.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">Transferencia</span>
                </div>
                <span className="text-blue-400 font-bold">
                  ${stats.transferencia.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-gray-900/40 border-gray-800 p-5 sm:col-span-2">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-3">
              Ingresos por plan
            </span>
            {Object.keys(stats.porPlan).length === 0 ? (
              <p className="text-gray-600 text-sm">Sin pagos en este periodo</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(stats.porPlan)
                  .sort((a, b) => b[1] - a[1])
                  .map(([plan, monto]) => (
                    <div
                      key={plan}
                      className="bg-gray-800/50 rounded-lg px-3 py-2"
                    >
                      <p className="text-gray-500 text-xs">{plan}</p>
                      <p className="text-white font-bold text-sm tabular-nums">
                        ${monto.toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Miembros */}
      <div className="mb-3 mt-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Miembros
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Activos totales"
            value={data.activos}
            subtitle="Con membresia vigente"
            icon={Users}
            color="text-green-400"
            bg="bg-green-500/5 border-green-500/20"
          />
          <StatCard
            title="Inactivos totales"
            value={data.inactivos}
            subtitle="Sin membresia activa"
            icon={UserX}
            color="text-gray-400"
            bg="bg-gray-800/40 border-gray-700"
          />
          <StatCard
            title="Visitas"
            value={visitas}
            subtitle={
              tab === "dia"
                ? "Agendadas hoy"
                : tab === "semana"
                ? "Esta semana"
                : "Este mes"
            }
            icon={CheckCircle2}
            color="text-yellow-400"
            bg="bg-yellow-500/5 border-yellow-500/20"
          />
          <StatCard
            title="Nuevos activos"
            value={nuevosActivos}
            subtitle={
              tab === "dia"
                ? "Ver semana o mes"
                : tab === "semana"
                ? "Esta semana"
                : "Este mes"
            }
            icon={TrendingUp}
            color="text-blue-400"
            bg="bg-blue-500/5 border-blue-500/20"
          />
        </div>
      </div>

      {/* Inventario */}
      <div className="mb-3 mt-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Inventario
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title={
              "Ventas " +
              (tab === "dia"
                ? "del dia"
                : tab === "semana"
                ? "de la semana"
                : "del mes")
            }
            value={"$" + inventario.total.toLocaleString()}
            subtitle={inventario.unidades + " unidades vendidas"}
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

      {/* Ultimos pagos */}
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
