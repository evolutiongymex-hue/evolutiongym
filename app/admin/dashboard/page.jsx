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
  Wallet,
  TrendingDown,
  ChevronRight,
  BarChart2,
  ShoppingCart,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const diasRestantes = (proximoPago) => {
  if (!proximoPago) return null;
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = proximoPago.includes("-")
      ? new Date(proximoPago + "T00:00:00")
      : (() => {
          const [d, m, y] = proximoPago.split("/");
          return new Date(y, m - 1, d);
        })();
    return Math.ceil((fecha - hoy) / 86400000);
  } catch {
    return null;
  }
};

const fmt = (n) => "$" + (Number(n) || 0).toLocaleString("es-MX");

const TABS = [
  { key: "dia", label: "Hoy" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mes" },
];

const PLANES_ORDER = [
  "Mensual",
  "Bimestral",
  "Trimestral",
  "Anualidad",
  "Visita",
  "Promo",
];

// ─── Sub-componentes ─────────────────────────────────────────────────────────

const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border bg-gray-900/50 border-gray-800 p-5 ${className}`}
  >
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
    {children}
  </h2>
);

const KPI = ({ label, value, sub, icon: Icon, color, border }) => (
  <div className={`rounded-2xl border p-5 ${border}`}>
    <div className="flex items-start justify-between mb-3">
      <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider leading-tight max-w-[120px]">
        {label}
      </span>
      <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
    </div>
    <p className={`text-3xl font-black tabular-nums ${color}`}>{value}</p>
    {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
  </div>
);

// Mini bar chart con SVG
const MiniBarChart = ({ data, color = "#50ff05" }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.v), 1);
  const W = 280,
    H = 56,
    barW = Math.floor(W / data.length) - 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14">
      {data.map((d, i) => {
        const h = Math.max(3, Math.round((d.v / max) * (H - 18)));
        const x = i * (W / data.length);
        const y = H - h - 14;
        return (
          <g key={i}>
            <rect
              x={x + 1}
              y={y}
              width={barW}
              height={h}
              rx="3"
              fill={color}
              fillOpacity={d.v > 0 ? 0.85 : 0.15}
            />
            <text
              x={x + barW / 2 + 1}
              y={H - 2}
              textAnchor="middle"
              fontSize="9"
              fill="#6b7280"
            >
              {d.l}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Progress bar
const ProgressBar = ({ value, max, color = "bg-primary" }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: pct + "%" }}
      />
    </div>
  );
};

// ─── Página ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("dia");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const tz = { timeZone: "America/Mexico_City" };
      const hoy = new Date().toLocaleDateString("en-CA", tz);
      const d7 = new Date();
      d7.setDate(d7.getDate() - 7);
      const semanaStr = d7.toLocaleDateString("en-CA", tz);
      const mesStr = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toLocaleDateString("en-CA", tz);

      const [
        crmRes,
        pagosRes,
        invRes,
        vDia,
        vSem,
        vMes,
        cajaMemRes,
        cajaProdRes,
        deudasRes,
      ] = await Promise.all([
        fetch("/api/sheets?sheet=CRM_Evolution_Gym"),
        fetch("/api/pagos"),
        fetch("/api/inventario"),
        fetch("/api/inventario/ventas?periodo=dia"),
        fetch("/api/inventario/ventas?periodo=semana"),
        fetch("/api/inventario/ventas?periodo=mes"),
        fetch("/api/caja/movimientos"),
        fetch("/api/caja/productos"),
        fetch("/api/deudas"),
      ]);

      const [
        crm,
        pagos,
        inv,
        ventasDia,
        ventasSem,
        ventasMes,
        cajaMem,
        cajaProd,
        deudas,
      ] = await Promise.all([
        crmRes.json(),
        pagosRes.json(),
        invRes.json(),
        vDia.json(),
        vSem.json(),
        vMes.json(),
        cajaMemRes.json(),
        cajaProdRes.json(),
        deudasRes.json(),
      ]);

      const clientes = crm.success ? crm.data : [];
      const todosPagos = pagos.success ? pagos.data : [];
      const productos = inv.success ? inv.data : [];
      const todasDeudas = deudas.success ? deudas.data : [];

      // Miembros
      const activos = clientes.filter((c) => c.estado === "ACTIVO");
      const inactivos = clientes.filter((c) => c.estado === "INACTIVO");

      // Alertas de vencimiento
      const vencenHoy = activos.filter((c) => {
        const d = diasRestantes(c.proximo_pago);
        return d !== null && d >= 0 && d <= 3;
      });
      const vencidos = activos.filter((c) => {
        const d = diasRestantes(c.proximo_pago);
        return d !== null && d < 0;
      });
      const vencenSemana = activos.filter((c) => {
        const d = diasRestantes(c.proximo_pago);
        return d !== null && d >= 0 && d <= 7;
      });

      // Pagos por período
      const pagosHoy = todosPagos.filter((p) => p.fecha_pago === hoy);
      const pagosSem = todosPagos.filter(
        (p) => p.fecha_pago >= semanaStr && p.fecha_pago <= hoy
      );
      const pagosMes = todosPagos.filter(
        (p) => p.fecha_pago >= mesStr && p.fecha_pago <= hoy
      );

      const calcStats = (lista) => {
        const total = lista.reduce((s, p) => s + (Number(p.monto) || 0), 0);
        const efectivo = lista
          .filter((p) => p.metodo_pago === "efectivo")
          .reduce((s, p) => s + (Number(p.monto) || 0), 0);
        const transferencia = lista
          .filter((p) => p.metodo_pago === "transferencia")
          .reduce((s, p) => s + (Number(p.monto) || 0), 0);
        const porPlan = {};
        lista.forEach((p) => {
          const plan = p.plan || "Otro";
          const base = PLANES_ORDER.find((pl) => plan.includes(pl)) || "Otro";
          porPlan[base] = (porPlan[base] || 0) + (Number(p.monto) || 0);
        });
        return { total, efectivo, transferencia, porPlan, count: lista.length };
      };

      // Gráfica últimos 7 días
      const grafica7dias = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const str = d.toLocaleDateString("en-CA", tz);
        const v = todosPagos
          .filter((p) => p.fecha_pago === str)
          .reduce((s, p) => s + (Number(p.monto) || 0), 0);
        const l = d
          .toLocaleDateString("es-MX", { weekday: "short" })
          .slice(0, 2);
        return { l, v, fecha: str };
      });

      // Nuevos activos esta semana/mes
      const nuevosActivosSem = clientes.filter((c) => {
        const f = (c.fecha_creacion || "").split("T")[0];
        return f >= semanaStr && f <= hoy && c.estado === "ACTIVO";
      });
      const nuevosActivosMes = clientes.filter((c) => {
        const f = (c.fecha_creacion || "").split("T")[0];
        return f >= mesStr && f <= hoy && c.estado === "ACTIVO";
      });

      // Cajas
      const saldoMem = cajaMem.success ? cajaMem.saldoEnCaja : 0;
      const saldoProd = cajaProd.success ? cajaProd.saldoEnCaja : 0;

      // Deudas
      const deudasPendientes = todasDeudas.filter(
        (d) => d.estado === "pendiente"
      );
      const totalDeudas = deudasPendientes.reduce(
        (s, d) => s + (d.saldo || 0),
        0
      );

      // Stock bajo
      const stockBajo = productos.filter((p) => p.stock <= p.stock_minimo);

      setData({
        activos: activos.length,
        inactivos: inactivos.length,
        vencenHoy: vencenHoy.length,
        vencidos: vencidos.length,
        vencenSemana,
        nuevosActivosSem: nuevosActivosSem.length,
        nuevosActivosMes: nuevosActivosMes.length,
        dia: calcStats(pagosHoy),
        semana: calcStats(pagosSem),
        mes: calcStats(pagosMes),
        stockBajo: stockBajo.length,
        productosAlerta: stockBajo.map((p) => ({
          nombre: p.nombre,
          stock: p.stock,
        })),
        ventasDia: {
          total: ventasDia.success ? ventasDia.totalDinero : 0,
          unidades: ventasDia.success ? ventasDia.totalUnidades : 0,
        },
        ventasSem: {
          total: ventasSem.success ? ventasSem.totalDinero : 0,
          unidades: ventasSem.success ? ventasSem.totalUnidades : 0,
        },
        ventasMes: {
          total: ventasMes.success ? ventasMes.totalDinero : 0,
          unidades: ventasMes.success ? ventasMes.totalUnidades : 0,
        },
        grafica7dias,
        saldoMem,
        saldoProd,
        saldoTotal: saldoMem + saldoProd,
        deudasPendientes: deudasPendientes.length,
        totalDeudas,
        ultimosPagos: pagosHoy.slice(-6).reverse(),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => data?.[tab], [data, tab]);
  const ventas = useMemo(
    () =>
      !data
        ? { total: 0, unidades: 0 }
        : tab === "dia"
        ? data.ventasDia
        : tab === "semana"
        ? data.ventasSem
        : data.ventasMes,
    [data, tab]
  );
  const nuevos = useMemo(
    () =>
      !data
        ? 0
        : tab === "semana"
        ? data.nuevosActivosSem
        : tab === "mes"
        ? data.nuevosActivosMes
        : "-",
    [data, tab]
  );
  const topPlanes = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.porPlan)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-400">Cargando dashboard...</span>
      </div>
    );
  }
  if (!data) return null;

  const fechaHoy = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const ahora = new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const maxPlan = topPlanes[0]?.[1] || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
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
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Alertas */}
      {(data.vencidos > 0 ||
        data.vencenHoy > 0 ||
        data.stockBajo > 0 ||
        data.deudasPendientes > 0) && (
        <div className="flex flex-wrap gap-2">
          {data.vencidos > 0 && (
            <button
              onClick={() => router.push("/admin/activos")}
              className="flex items-center gap-2 px-3.5 py-2 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs font-semibold hover:bg-red-500/15 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> {data.vencidos} pagos
              vencidos <ChevronRight className="w-3 h-3" />
            </button>
          )}
          {data.vencenHoy > 0 && (
            <button
              onClick={() => router.push("/admin/activos")}
              className="flex items-center gap-2 px-3.5 py-2 bg-orange-500/10 border border-orange-500/25 rounded-xl text-orange-400 text-xs font-semibold hover:bg-orange-500/15 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" /> {data.vencenHoy} vencen en 3
              días <ChevronRight className="w-3 h-3" />
            </button>
          )}
          {data.deudasPendientes > 0 && (
            <button
              onClick={() => router.push("/admin/deudas")}
              className="flex items-center gap-2 px-3.5 py-2 bg-yellow-500/10 border border-yellow-500/25 rounded-xl text-yellow-400 text-xs font-semibold hover:bg-yellow-500/15 transition-colors"
            >
              <TrendingDown className="w-3.5 h-3.5" /> {data.deudasPendientes}{" "}
              deudas · {fmt(data.totalDeudas)}{" "}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
          {data.stockBajo > 0 && (
            <button
              onClick={() => router.push("/admin/inventario")}
              className="flex items-center gap-2 px-3.5 py-2 bg-purple-500/10 border border-purple-500/25 rounded-xl text-purple-400 text-xs font-semibold hover:bg-purple-500/15 transition-colors"
            >
              <Package className="w-3.5 h-3.5" /> {data.stockBajo} productos con
              stock bajo <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Caja en tiempo real */}
      <div>
        <SectionTitle>Caja en tiempo real</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1 rounded-2xl border border-primary/25 bg-primary/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Total en caja
              </span>
            </div>
            <p className="text-4xl font-black text-primary tabular-nums">
              {fmt(data.saldoTotal)}
            </p>
            <p className="text-gray-500 text-xs mt-1">Membresías + Productos</p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Caja membresías
              </span>
            </div>
            <p className="text-2xl font-black text-green-400 tabular-nums">
              {fmt(data.saldoMem)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Caja productos
              </span>
            </div>
            <p className="text-2xl font-black text-blue-400 tabular-nums">
              {fmt(data.saldoProd)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all " +
              (tab === key
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white")
            }
          >
            <Calendar className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Ingresos */}
      <div>
        <SectionTitle>
          Ingresos ·{" "}
          {tab === "dia"
            ? "hoy"
            : tab === "semana"
            ? "esta semana"
            : "este mes"}
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI
            label="Total membresías"
            value={fmt(stats.total)}
            sub={stats.count + " pagos"}
            icon={DollarSign}
            color="text-primary"
            border="bg-primary/5 border-primary/20"
          />
          <KPI
            label="Ventas productos"
            value={fmt(ventas.total)}
            sub={ventas.unidades + " unidades"}
            icon={ShoppingCart}
            color="text-blue-400"
            border="bg-blue-500/5 border-blue-500/20"
          />
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-3">
              Método de pago
            </span>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-gray-400 text-sm">Efectivo</span>
                </div>
                <span className="text-green-400 font-bold tabular-nums">
                  {fmt(stats.efectivo)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Transferencia</span>
                </div>
                <span className="text-blue-400 font-bold tabular-nums">
                  {fmt(stats.transferencia)}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Por plan
              </span>
            </div>
            {topPlanes.length === 0 ? (
              <p className="text-gray-600 text-sm">Sin pagos</p>
            ) : (
              <div className="space-y-2.5">
                {topPlanes.map(([plan, monto]) => (
                  <div key={plan}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{plan}</span>
                      <span className="text-white font-semibold tabular-nums">
                        {fmt(monto)}
                      </span>
                    </div>
                    <ProgressBar value={monto} max={maxPlan} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gráfica 7 días */}
      <div>
        <SectionTitle>Ingresos últimos 7 días</SectionTitle>
        <Card>
          <div className="flex items-end justify-between mb-2">
            <span className="text-gray-500 text-xs">Membresías por día</span>
            <span className="text-primary text-sm font-bold tabular-nums">
              {fmt(data.grafica7dias.reduce((s, d) => s + d.v, 0))} total
            </span>
          </div>
          <MiniBarChart data={data.grafica7dias} color="#50ff05" />
        </Card>
      </div>

      {/* Miembros + Deudas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Miembros */}
        <div>
          <SectionTitle>Miembros</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <KPI
              label="Activos"
              value={data.activos}
              sub="Con membresía vigente"
              icon={Users}
              color="text-green-400"
              border="bg-green-500/5 border-green-500/20"
            />
            <KPI
              label="Inactivos"
              value={data.inactivos}
              sub="Sin membresía"
              icon={UserX}
              color="text-gray-400"
              border="bg-gray-800/40 border-gray-700"
            />
            <KPI
              label="Vencidos"
              value={data.vencidos}
              sub="Pago vencido"
              icon={AlertTriangle}
              color="text-red-400"
              border="bg-red-500/5 border-red-500/20"
            />
            <KPI
              label={
                tab === "dia"
                  ? "Nuevos semana"
                  : "Nuevos " + (tab === "semana" ? "semana" : "mes")
              }
              value={nuevos}
              sub="Clientes nuevos"
              icon={TrendingUp}
              color="text-blue-400"
              border="bg-blue-500/5 border-blue-500/20"
            />
          </div>

          {/* Vencen esta semana */}
          {data.vencenSemana.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-white text-sm font-semibold">
                  Vencen esta semana
                </span>
                <span className="ml-auto px-2 py-0.5 bg-orange-500/15 text-orange-400 text-[10px] font-bold rounded-md">
                  {data.vencenSemana.length}
                </span>
              </div>
              <div className="space-y-2">
                {data.vencenSemana.slice(0, 5).map((m) => {
                  const dias = diasRestantes(m.proximo_pago);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-1.5 border-b border-gray-800/60 last:border-0"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">
                          {m.nombre}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {m.plan} · {m.proximo_pago}
                        </p>
                      </div>
                      <span
                        className={
                          "px-2 py-0.5 rounded-lg text-[11px] font-bold " +
                          (dias <= 0
                            ? "bg-red-500/15 text-red-400"
                            : dias <= 1
                            ? "bg-orange-500/15 text-orange-400"
                            : "bg-yellow-500/15 text-yellow-400")
                        }
                      >
                        {dias <= 0
                          ? "Vencido"
                          : dias === 1
                          ? "Mañana"
                          : `${dias} días`}
                      </span>
                    </div>
                  );
                })}
                {data.vencenSemana.length > 5 && (
                  <button
                    onClick={() => router.push("/admin/activos")}
                    className="w-full text-center text-xs text-primary hover:underline pt-1"
                  >
                    Ver {data.vencenSemana.length - 5} más →
                  </button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Deudas + Inventario */}
        <div className="space-y-4">
          <SectionTitle>Cuentas por cobrar</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <KPI
              label="Deudas pendientes"
              value={data.deudasPendientes}
              sub="Sin liquidar"
              icon={TrendingDown}
              color="text-red-400"
              border="bg-red-500/5 border-red-500/20"
            />
            <KPI
              label="Total por cobrar"
              value={fmt(data.totalDeudas)}
              sub="Saldo acumulado"
              icon={DollarSign}
              color="text-orange-400"
              border="bg-orange-500/5 border-orange-500/20"
            />
          </div>
          {data.deudasPendientes > 0 && (
            <button
              onClick={() => router.push("/admin/deudas")}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
            >
              <span>Ver todas las deudas</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <SectionTitle>Inventario</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <KPI
              label={
                "Ventas " +
                (tab === "dia" ? "hoy" : tab === "semana" ? "semana" : "mes")
              }
              value={fmt(ventas.total)}
              sub={ventas.unidades + " piezas"}
              icon={Package}
              color="text-blue-400"
              border="bg-blue-500/5 border-blue-500/20"
            />
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Stock bajo
                </span>
              </div>
              {data.productosAlerta.length === 0 ? (
                <p className="text-green-400 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Todo al corriente
                </p>
              ) : (
                <div className="space-y-1">
                  {data.productosAlerta.slice(0, 3).map((p) => (
                    <div
                      key={p.nombre}
                      className="flex items-center justify-between"
                    >
                      <span className="text-red-400 text-xs truncate max-w-[110px]">
                        {p.nombre}
                      </span>
                      <span className="text-red-400 text-xs font-bold">
                        {p.stock} uds
                      </span>
                    </div>
                  ))}
                  {data.productosAlerta.length > 3 && (
                    <p className="text-gray-600 text-xs">
                      +{data.productosAlerta.length - 3} más
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Últimos pagos del día */}
      {data.ultimosPagos.length > 0 && (
        <div>
          <SectionTitle>Últimos pagos del día</SectionTitle>
          <Card className="overflow-hidden !p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/40">
                  {["Cliente", "Plan", "Monto", "Método"].map((h) => (
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
                      {fmt(pago.monto)}
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
          </Card>
        </div>
      )}
    </div>
  );
}
