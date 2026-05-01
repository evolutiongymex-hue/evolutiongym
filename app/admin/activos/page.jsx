"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Users,
  AlertCircle,
  Loader2,
  UserX,
  DollarSign,
  Search,
  X,
} from "lucide-react";

export default function ActivosPage() {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [paymentData, setPaymentData] = useState({
    fecha_pago: "",
    plan: "",
    recibo_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchActivos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sheets?sheet=CRM_Evolution_Gym");
      const data = await response.json();

      if (data.success) {
        const activosFiltrados = data.data.filter(
          (lead) => lead.estado === "ACTIVO"
        );
        setActivos(activosFiltrados);
        setError("");
      } else {
        setError(data.error || "Error al cargar activos");
      }
    } catch (error) {
      setError("Error de conexion con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivos();
  }, []);

  const preciosPorPlan = {
    Visita: 50,
    Semanal: 150,
    Bimestral: 600,
    Trimestral: 800,
    Anualidad: 3500,
  };

  const calcularProximoPago = (fechaPago, plan) => {
    if (!fechaPago) return "";
    const fecha = new Date(fechaPago);
    switch (plan) {
      case "Visita":
        fecha.setDate(fecha.getDate() + 1);
        break;
      case "Semanal":
        fecha.setDate(fecha.getDate() + 7);
        break;
      case "Bimestral":
        fecha.setMonth(fecha.getMonth() + 2);
        break;
      case "Trimestral":
        fecha.setMonth(fecha.getMonth() + 3);
        break;
      case "Anualidad":
        fecha.setFullYear(fecha.getFullYear() + 1);
        break;
      default:
        fecha.setMonth(fecha.getMonth() + 1);
    }
    return fecha.toISOString().split("T")[0];
  };

  const abrirModalPago = (miembro) => {
    setSelectedMember(miembro);
    setPaymentData({
      fecha_pago: new Date().toISOString().split("T")[0],
      plan: miembro.plan || "Semanal",
      recibo_url: "",
    });
    setShowPaymentModal(true);
  };

  const handlePlanChange = (plan) => {
    setPaymentData({ ...paymentData, plan });
  };

  const registrarPago = async () => {
    if (!paymentData.fecha_pago) {
      alert("Selecciona una fecha de pago");
      return;
    }

    const proximoPago = calcularProximoPago(
      paymentData.fecha_pago,
      paymentData.plan
    );
    const precio = preciosPorPlan[paymentData.plan];

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "pago_completo",
          id: selectedMember.id,
          fecha_pago: paymentData.fecha_pago,
          proximo_pago: proximoPago,
          plan: paymentData.plan,
          precio: precio,
          recibo_url: paymentData.recibo_url || "",
        }),
      });

      if (response.ok) {
        await fetchActivos();
        setShowPaymentModal(false);
        alert("Pago registrado correctamente");
      } else {
        alert("Error al registrar pago");
      }
    } catch (error) {
      alert("Error de conexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLead = async (id, campo, valor) => {
    setUpdatingId(id);
    try {
      const response = await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "update", id, campo, valor }),
      });
      if (response.ok) await fetchActivos();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const activosFiltrados = activos.filter((miembro) => {
    if (
      filtroNombre &&
      !miembro.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
    )
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-gray-400">Cargando activos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg">
        <p className="font-semibold">Error:</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchActivos}
          className="mt-3 px-4 py-2 bg-red-500/20 rounded-lg"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (activosFiltrados.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">
          {filtroNombre
            ? "No hay activos que coincidan con la busqueda"
            : "No hay miembros activos aun"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              ACTIVOS
            </h1>
            <p className="text-gray-400 text-sm">
              Miembros actuales con membresia activa
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Total: {activosFiltrados.length} activos
            </p>
          </div>
          <button
            onClick={fetchActivos}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Actualizar
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 w-64 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {filtroNombre && (
            <button
              onClick={() => setFiltroNombre("")}
              className="inline-flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Telefono</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-left">Ultimo Pago</th>
              <th className="px-4 py-3 text-left">Proximo Pago</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activosFiltrados.map((miembro) => (
              <tr
                key={miembro.id}
                className="border-t border-gray-800 hover:bg-gray-800/30"
              >
                <td className="px-4 py-3">{miembro.nombre || "-"}</td>
                <td className="px-4 py-3">{miembro.telefono || "-"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                    {miembro.plan || "Sin plan"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {miembro.precio
                    ? `$${Number(miembro.precio).toLocaleString()}`
                    : "-"}
                </td>
                <td className="px-4 py-3">{miembro.fecha_pago || "-"}</td>
                <td className="px-4 py-3">{miembro.proximo_pago || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirModalPago(miembro)}
                      className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs"
                    >
                      Registrar Pago
                    </button>
                    <button
                      onClick={() =>
                        updateLead(miembro.id, "estado", "INACTIVO")
                      }
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs"
                    >
                      Dar de baja
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPaymentModal && selectedMember && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Registrar Pago</h2>
            <p className="text-gray-400 mb-4">
              Cliente:{" "}
              <span className="text-white">{selectedMember.nombre}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Plan</label>
                <select
                  value={paymentData.plan}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <option value="Visita">Visita - $50</option>
                  <option value="Semanal">Semanal - $150</option>
                  <option value="Bimestral">Bimestral - $600</option>
                  <option value="Trimestral">Trimestral - $800</option>
                  <option value="Anualidad">Anualidad - $3,500</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Fecha de Pago</label>
                <input
                  type="date"
                  value={paymentData.fecha_pago}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      fecha_pago: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Recibo (URL)</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/..."
                  value={paymentData.recibo_url}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      recibo_url: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={registrarPago}
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-primary rounded-lg font-semibold"
                >
                  {isSubmitting ? "Registrando..." : "Registrar Pago"}
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2 bg-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
