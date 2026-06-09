"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Users,
  AlertCircle,
  Loader2,
  DollarSign,
  Search,
  X,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";

const PLANES = {
  Visita: { precio: 50, meses: 0.03, nombre: "Visita" },
  Mensual: { precio: 350, meses: 1, nombre: "Mensual" },
  Bimestral: { precio: 600, meses: 2, nombre: "Bimestral" },
  Trimestral: { precio: 800, meses: 3, nombre: "Trimestral" },
  Anualidad: { precio: 3500, meses: 12, nombre: "Anualidad" },
  Promo3x1: {
    precio: 800,
    meses: 3,
    nombre: "Promo: 3 meses por $800",
    esPromocion: true,
  },
  Promo4x1000: {
    precio: 1000,
    meses: 4,
    nombre: "Promo: 4 meses x 1000",
    esPromocion: true,
  },
  Semestre: {
    precio: 1750,
    meses: 6,
    nombre: "Promo: Semestre",
    esPromocion: true,
  },
};

const OPCIONES_PLANES = (
  <>
    <optgroup label="Planes">
      <option value="Visita">Visita — $50 (1 día)</option>
      <option value="Mensual">Mensual — $350 (1 mes)</option>
      <option value="Bimestral">Bimestral — $600 (2 meses)</option>
      <option value="Trimestral">Trimestral — $800 (3 meses)</option>
      <option value="Anualidad">Anualidad — $3,500 (12 meses)</option>
    </optgroup>
    <optgroup label="Promociones">
      <option value="Promo3x1">3 meses por $800</option>
      <option value="Promo4x1000">4 meses por $1,000</option>
      <option value="Semestre">Semestre — $1,750 (6 meses)</option>
    </optgroup>
  </>
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const calcularProximoPago = (fechaPago, mesesIncluidos) => {
  if (!fechaPago) return "";
  const [anio, mes, dia] = fechaPago.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  fecha.setMonth(fecha.getMonth() + mesesIncluidos);
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
};

const diasRestantes = (proximoPago) => {
  if (!proximoPago) return null;
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let fecha;
    if (proximoPago.includes("-")) {
      fecha = new Date(proximoPago + "T00:00:00");
    } else {
      const [d, m, y] = proximoPago.split("/").map(Number);
      fecha = new Date(y, m - 1, d);
    }
    return Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};

const getEstadoPago = (proximoPago) => {
  const dias = diasRestantes(proximoPago);
  if (dias === null) return "sin_fecha";
  if (dias < 0) return "vencido";
  if (dias <= 3) return "urgente";
  if (dias <= 10) return "proximo";
  return "corriente";
};

const ESTADO_CONFIG = {
  vencido: {
    label: "Vencido",
    color: "text-red-400",
    bg: "bg-red-500/5",
    badge: "bg-red-500/15 text-red-400 border-red-500/25",
    icon: AlertTriangle,
  },
  urgente: {
    label: "Vence pronto",
    color: "text-orange-400",
    bg: "bg-orange-500/5",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/25",
    icon: AlertTriangle,
  },
  proximo: {
    label: "Por vencer",
    color: "text-yellow-400",
    bg: "bg-yellow-500/5",
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
    icon: Clock,
  },
  corriente: {
    label: "Al corriente",
    color: "text-green-400",
    bg: "",
    badge: "bg-green-500/15 text-green-400 border-green-500/25",
    icon: CheckCircle2,
  },
  sin_fecha: {
    label: "Sin fecha",
    color: "text-gray-500",
    bg: "",
    badge: "bg-gray-700/50 text-gray-500 border-gray-700",
    icon: Clock,
  },
};

const TABS = [
  { key: "todos", label: "Todos" },
  { key: "urgente", label: "Vencen en 3 dias" },
  { key: "proximo", label: "Por vencer" },
  { key: "corriente", label: "Al corriente" },
  { key: "vencido", label: "Vencidos" },
];

const inputClass =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 [color-scheme:dark]";
const labelClass =
  "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5";
const TODAY = new Date().toISOString().split("T")[0];
const PAYMENT_DEFAULT = {
  fecha_pago: TODAY,
  planKey: "Mensual",
  metodo_pago: "transferencia",
};
const REGISTER_DEFAULT = {
  nombre: "",
  telefono: "",
  planKey: "Mensual",
  fecha_pago: TODAY,
  metodo_pago: "transferencia",
};

export default function ActivosPage() {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [tabActivo, setTabActivo] = useState("todos");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [paymentData, setPaymentData] = useState(PAYMENT_DEFAULT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newClient, setNewClient] = useState(REGISTER_DEFAULT);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerStatus, setRegisterStatus] = useState(null);
  const [registerError, setRegisterError] = useState("");

  const fetchActivos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/sheets?sheet=CRM_Evolution_Gym");
      const data = await response.json();
      if (data.success) {
        setActivos(data.data.filter((l) => l.estado === "ACTIVO"));
      } else {
        setError(data.error || "Error al cargar activos");
      }
    } catch {
      setError("Error de conexion con el servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivos();
  }, [fetchActivos]);

  const conteos = useMemo(() => {
    const base = activos.filter(
      (m) =>
        !filtroNombre ||
        m.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
    );
    return {
      todos: base.length,
      urgente: base.filter((m) => getEstadoPago(m.proximo_pago) === "urgente")
        .length,
      proximo: base.filter((m) => getEstadoPago(m.proximo_pago) === "proximo")
        .length,
      corriente: base.filter(
        (m) => getEstadoPago(m.proximo_pago) === "corriente"
      ).length,
      vencido: base.filter((m) => getEstadoPago(m.proximo_pago) === "vencido")
        .length,
    };
  }, [activos, filtroNombre]);

  const activosFiltrados = useMemo(() => {
    return activos.filter((m) => {
      if (
        filtroNombre &&
        !m.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
      )
        return false;
      if (tabActivo === "todos") return true;
      return getEstadoPago(m.proximo_pago) === tabActivo;
    });
  }, [activos, filtroNombre, tabActivo]);

  const abrirModalPago = useCallback((miembro) => {
    setSelectedMember(miembro);
    setPaymentData({
      ...PAYMENT_DEFAULT,
      planKey: miembro.planKey || "Mensual",
    });
    setPaymentStatus(null);
    setShowPaymentModal(true);
  }, []);

  const registrarPago = useCallback(async () => {
    if (!paymentData.fecha_pago) {
      setPaymentStatus({ type: "error", text: "Selecciona una fecha de pago" });
      return;
    }
    const plan = PLANES[paymentData.planKey];
    const proximoPago = calcularProximoPago(paymentData.fecha_pago, plan.meses);
    setIsSubmitting(true);
    setPaymentStatus(null);

    try {
      const pagoRes = await fetch("/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: selectedMember.id,
          nombre: selectedMember.nombre,
          fecha_pago: paymentData.fecha_pago,
          monto: plan.precio,
          metodo_pago: paymentData.metodo_pago,
          plan: plan.nombre,
          meses: plan.meses,
          promocion: plan.esPromocion ? "si" : "",
          usuario: "admin",
        }),
      });
      if (!pagoRes.ok) throw new Error("Error al guardar pago");
      const pagoData = await pagoRes.json();
      const reciboUrl = APP_URL + "/recibo/" + pagoData.id;

      await Promise.all([
        fetch("/api/pagos/" + pagoData.id + "/recibo", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recibo_url: reciboUrl }),
        }),
        fetch("/api/leads/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo: "pago_completo",
            id: selectedMember.id,
            fecha_pago: paymentData.fecha_pago,
            proximo_pago: proximoPago,
            plan: plan.nombre,
            precio: plan.precio,
            recibo_url: reciboUrl,
            metodo_pago: paymentData.metodo_pago,
            meses_incluidos: plan.meses,
          }),
        }),
      ]);

      setPaymentStatus({
        type: "success",
        text: "Pago registrado. Recibo: " + reciboUrl,
      });
      await fetchActivos();
    } catch {
      setPaymentStatus({
        type: "error",
        text: "Error al registrar el pago. Intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [paymentData, selectedMember, fetchActivos]);

  const registrarClienteActivo = useCallback(async () => {
    setRegisterError("");
    const telefonoLimpio = newClient.telefono.replace(/\D/g, "");
    if (!newClient.nombre.trim()) {
      setRegisterError("El nombre es obligatorio");
      return;
    }
    if (telefonoLimpio.length !== 10) {
      setRegisterError("El telefono debe tener 10 digitos");
      return;
    }
    if (!newClient.fecha_pago) {
      setRegisterError("La fecha de pago es obligatoria");
      return;
    }

    const plan = PLANES[newClient.planKey];
    const proximoPago = calcularProximoPago(newClient.fecha_pago, plan.meses);
    const id =
      Date.now().toString() + "-" + Math.random().toString(36).substring(2, 8);
    setIsRegistering(true);

    try {
      const pagoRes = await fetch("/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: id,
          nombre: newClient.nombre.trim(),
          fecha_pago: newClient.fecha_pago,
          monto: plan.precio,
          metodo_pago: newClient.metodo_pago,
          plan: plan.nombre,
          meses: plan.meses,
          promocion: plan.esPromocion ? "si" : "",
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

      const leadRes = await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "nuevo_activo",
          id,
          nombre: newClient.nombre.trim(),
          telefono: telefonoLimpio,
          fecha_prueba: TODAY,
          horario: "N/A",
          estado: "ACTIVO",
          confirmo: "Si",
          asistio: "Si",
          plan: plan.nombre,
          precio: plan.precio,
          fecha_pago: newClient.fecha_pago,
          proximo_pago: proximoPago,
          metodo_pago: newClient.metodo_pago,
          meses_incluidos: plan.meses,
          recibo_url: reciboUrl,
        }),
      });
      if (!leadRes.ok) throw new Error("Error al registrar cliente");

      setRegisterStatus(reciboUrl);
      await fetchActivos();
    } catch {
      setRegisterError("Error al registrar el cliente. Intenta de nuevo.");
    } finally {
      setIsRegistering(false);
    }
  }, [newClient, fetchActivos]);

  const darDeBaja = useCallback(
    async (id) => {
      setUpdatingId(id);
      try {
        await fetch("/api/leads/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo: "update",
            id,
            campo: "estado",
            valor: "INACTIVO",
          }),
        });
        await fetchActivos();
      } catch {
        // silencioso
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchActivos]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-400">Cargando activos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-xl">
        <p className="font-semibold mb-1">Error al cargar</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchActivos}
          className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-sm transition-colors"
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
              Activos
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Miembros con membresia activa
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {activosFiltrados.length}{" "}
              {filtroNombre ? "resultado(s)" : "miembros"}
              {conteos.urgente > 0 && (
                <span className="ml-2 text-orange-400 font-semibold">
                  · {conteos.urgente} vencen en 3 dias
                </span>
              )}
              {conteos.vencido > 0 && (
                <span className="ml-2 text-red-400 font-semibold">
                  · {conteos.vencido} vencidos
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchActivos}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
            <button
              onClick={() => {
                setNewClient(REGISTER_DEFAULT);
                setRegisterStatus(null);
                setRegisterError("");
                setShowRegisterModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:brightness-110 rounded-xl text-sm text-white font-semibold transition-all"
            >
              <UserPlus className="w-4 h-4" /> Registrar cliente
            </button>
          </div>
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

        <div className="mt-4 flex gap-2 flex-wrap">
          {TABS.map(({ key, label }) => {
            const count = conteos[key];
            const isActive = tabActivo === key;
            const isAlert = key === "urgente" && count > 0;
            const isVencido = key === "vencido" && count > 0;
            return (
              <button
                key={key}
                onClick={() => setTabActivo(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : isAlert
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/25 hover:bg-orange-500/20"
                    : isVencido
                    ? "bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20"
                    : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600"
                }`}
              >
                {label}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive ? "bg-white/20" : "bg-white/10"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activosFiltrados.length === 0 ? (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-10 text-center">
          <AlertCircle className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {filtroNombre
              ? "No hay activos que coincidan"
              : "No hay miembros en esta categoria"}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/40">
                  {[
                    "Nombre",
                    "Telefono",
                    "Plan",
                    "Precio",
                    "Ultimo pago",
                    "Proximo pago",
                    "Estado",
                    "Acciones",
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
                {activosFiltrados.map((miembro) => {
                  const isUpdating = updatingId === miembro.id;
                  const estadoPago = getEstadoPago(miembro.proximo_pago);
                  const config = ESTADO_CONFIG[estadoPago];
                  const dias = diasRestantes(miembro.proximo_pago);
                  const Icon = config.icon;
                  return (
                    <tr
                      key={miembro.id}
                      className={`transition-colors hover:bg-gray-800/30 ${config.bg}`}
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {miembro.nombre || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        <a
                          href={"tel:" + miembro.telefono}
                          className="hover:text-white transition-colors"
                        >
                          {miembro.telefono || "-"}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {miembro.plan || "Sin plan"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 font-medium tabular-nums">
                        {miembro.precio
                          ? "$" + Number(miembro.precio).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 tabular-nums">
                        {miembro.fecha_pago || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 tabular-nums">
                        {miembro.proximo_pago || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${config.badge}`}
                        >
                          <Icon className="w-3 h-3" />
                          {estadoPago === "urgente" && dias !== null
                            ? dias === 0
                              ? "Hoy"
                              : dias === 1
                              ? "Manana"
                              : `${dias} dias`
                            : config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirModalPago(miembro)}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                          >
                            <DollarSign className="w-3 h-3" /> Pago
                          </button>
                          <button
                            onClick={() => darDeBaja(miembro.id)}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Dar de baja"
                            )}
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

      {/* Modal Pago */}
      <AnimatePresence>
        {showPaymentModal && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Registrar pago
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {selectedMember.nombre}
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {paymentStatus && (
                <div
                  className={
                    "mb-4 px-4 py-3 rounded-xl text-sm " +
                    (paymentStatus.type === "success"
                      ? "bg-green-500/10 border border-green-500/25 text-green-400"
                      : "bg-red-500/10 border border-red-500/25 text-red-400")
                  }
                >
                  {paymentStatus.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Plan / Promocion</label>
                  <select
                    value={paymentData.planKey}
                    onChange={(e) =>
                      setPaymentData((p) => ({ ...p, planKey: e.target.value }))
                    }
                    className={inputClass}
                  >
                    {OPCIONES_PLANES}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Metodo de pago</label>
                  <select
                    value={paymentData.metodo_pago}
                    onChange={(e) =>
                      setPaymentData((p) => ({
                        ...p,
                        metodo_pago: e.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Fecha de pago</label>
                  <input
                    type="date"
                    value={paymentData.fecha_pago}
                    onChange={(e) =>
                      setPaymentData((p) => ({
                        ...p,
                        fecha_pago: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className="pt-1 text-xs text-gray-500">
                  Precio:{" "}
                  <span className="text-white font-semibold">
                    ${PLANES[paymentData.planKey]?.precio.toLocaleString()}
                  </span>
                  {" — "}Proximo pago:{" "}
                  <span className="text-white">
                    {calcularProximoPago(
                      paymentData.fecha_pago,
                      PLANES[paymentData.planKey]?.meses
                    )}
                  </span>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={registrarPago}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-primary hover:brightness-110 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Registrando..." : "Registrar pago"}
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
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

      {/* Modal Registrar Cliente */}
      <AnimatePresence>
        {showRegisterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-white">
                  Registrar cliente activo
                </h2>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {registerStatus ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-white font-semibold mb-1">
                    Cliente registrado
                  </p>
                  <p className="text-gray-400 text-sm mb-1">Recibo generado:</p>
                  <a
                    href={registerStatus}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm underline break-all"
                  >
                    {registerStatus}
                  </a>
                  <button
                    onClick={() => {
                      setShowRegisterModal(false);
                      setRegisterStatus(null);
                      setNewClient(REGISTER_DEFAULT);
                    }}
                    className="mt-5 w-full py-2.5 bg-primary rounded-xl text-sm font-semibold text-white"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {registerError && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
                      {registerError}
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>Nombre completo *</label>
                    <input
                      type="text"
                      value={newClient.nombre}
                      onChange={(e) =>
                        setNewClient((p) => ({ ...p, nombre: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="Ej: Juan Perez"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>WhatsApp *</label>
                    <input
                      type="tel"
                      value={newClient.telefono}
                      onChange={(e) =>
                        setNewClient((p) => ({
                          ...p,
                          telefono: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="10 digitos, ej: 5512345678"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Plan</label>
                    <select
                      value={newClient.planKey}
                      onChange={(e) =>
                        setNewClient((p) => ({ ...p, planKey: e.target.value }))
                      }
                      className={inputClass}
                    >
                      {OPCIONES_PLANES}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Metodo de pago</label>
                    <select
                      value={newClient.metodo_pago}
                      onChange={(e) =>
                        setNewClient((p) => ({
                          ...p,
                          metodo_pago: e.target.value,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Fecha de pago *</label>
                    <input
                      type="date"
                      value={newClient.fecha_pago}
                      onChange={(e) =>
                        setNewClient((p) => ({
                          ...p,
                          fecha_pago: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="pt-1 text-xs text-gray-500">
                    Precio:{" "}
                    <span className="text-white font-semibold">
                      ${PLANES[newClient.planKey]?.precio.toLocaleString()}
                    </span>
                    {" — "}Proximo pago:{" "}
                    <span className="text-white">
                      {calcularProximoPago(
                        newClient.fecha_pago,
                        PLANES[newClient.planKey]?.meses
                      )}
                    </span>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={registrarClienteActivo}
                      disabled={isRegistering}
                      className="flex-1 py-2.5 bg-primary hover:brightness-110 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                    >
                      {isRegistering ? "Registrando..." : "Registrar cliente"}
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(false)}
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
