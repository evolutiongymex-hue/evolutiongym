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
  UserPlus,
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
    planKey: "Mensual",
    plan: "Mensual",
    precio: 350,
    mesesIncluidos: 1,
    metodo_pago: "transferencia",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para registrar cliente activo
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newActiveClient, setNewActiveClient] = useState({
    nombre: "",
    telefono: "",
    planKey: "Mensual",
    fecha_pago: new Date().toISOString().split("T")[0],
    metodo_pago: "transferencia",
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const planes = {
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
    Promo2x1: {
      precio: 350,
      meses: 2,
      nombre: "Promo: 2x1 Mensual",
      esPromocion: true,
    },
    Promo5mas1: {
      precio: 1750,
      meses: 6,
      nombre: "Promo: 5+1 (paga 5, tiene 6)",
      esPromocion: true,
    },
  };

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

  const calcularProximoPago = (fechaPago, mesesIncluidos) => {
    if (!fechaPago) return "";
    const [año, mes, dia] = fechaPago.split("-").map(Number);
    const fecha = new Date(año, mes - 1, dia);
    fecha.setMonth(fecha.getMonth() + mesesIncluidos);
    const añoNuevo = fecha.getFullYear();
    const mesNuevo = String(fecha.getMonth() + 1).padStart(2, "0");
    const diaNuevo = String(fecha.getDate()).padStart(2, "0");
    return `${añoNuevo}-${mesNuevo}-${diaNuevo}`;
  };

  const abrirModalPago = (miembro) => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    const hoyStr = `${año}-${mes}-${dia}`;

    setSelectedMember(miembro);
    setPaymentData({
      fecha_pago: hoyStr,
      planKey: miembro.planKey || "Mensual",
      plan: miembro.plan || "Mensual",
      precio: miembro.precio || 350,
      mesesIncluidos: miembro.mesesIncluidos || 1,
      metodo_pago: "transferencia",
    });
    setShowPaymentModal(true);
  };

  const handlePlanChange = (planKey) => {
    const plan = planes[planKey];
    setPaymentData({
      ...paymentData,
      planKey: planKey,
      plan: plan.nombre,
      precio: plan.precio,
      mesesIncluidos: plan.meses,
    });
  };

  const registrarPago = async () => {
    if (!paymentData.fecha_pago) {
      alert("Selecciona una fecha de pago");
      return;
    }

    const proximoPago = calcularProximoPago(
      paymentData.fecha_pago,
      paymentData.mesesIncluidos
    );

    setIsSubmitting(true);
    try {
      const pagoResponse = await fetch("/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: selectedMember.id,
          nombre: selectedMember.nombre,
          fecha_pago: paymentData.fecha_pago,
          monto: paymentData.precio,
          metodo_pago: paymentData.metodo_pago,
          plan: paymentData.plan,
          meses: paymentData.mesesIncluidos,
          promocion: planes[paymentData.planKey]?.esPromocion ? "si" : "",
          usuario: "admin",
        }),
      });

      const pagoData = await pagoResponse.json();
      const pagoId = pagoData.id;
      const reciboUrl =
        (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") +
        "/recibo/" +
        pagoId;

      await fetch("/api/pagos/" + pagoId + "/recibo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recibo_url: reciboUrl }),
      });

      const updateResponse = await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "pago_completo",
          id: selectedMember.id,
          fecha_pago: paymentData.fecha_pago,
          proximo_pago: proximoPago,
          plan: paymentData.plan,
          precio: paymentData.precio,
          recibo_url: reciboUrl,
          metodo_pago: paymentData.metodo_pago,
          meses_incluidos: paymentData.mesesIncluidos,
        }),
      });

      if (updateResponse.ok && pagoResponse.ok) {
        await fetchActivos();
        setShowPaymentModal(false);
        alert("Pago registrado correctamente. Recibo: " + reciboUrl);
      } else {
        alert("Error al registrar pago");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const registrarClienteActivo = async () => {
    if (
      !newActiveClient.nombre ||
      !newActiveClient.telefono ||
      !newActiveClient.fecha_pago
    ) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    const telefonoLimpio = newActiveClient.telefono.replace(/\D/g, "");
    if (telefonoLimpio.length !== 10) {
      alert("El telefono debe tener 10 digitos (sin codigo pais)");
      return;
    }

    const plan = planes[newActiveClient.planKey];
    const proximoPago = calcularProximoPago(
      newActiveClient.fecha_pago,
      plan.meses
    );
    const id =
      Date.now().toString() + "-" + Math.random().toString(36).substring(2, 8);
    const reciboUrl =
      (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") +
      "/recibo/temp";

    setIsRegistering(true);
    try {
      // UN SOLO LLAMADO con todos los datos
      const response = await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "nuevo_activo",
          id: id,
          nombre: newActiveClient.nombre,
          telefono: telefonoLimpio,
          fecha_prueba: new Date().toISOString().split("T")[0],
          horario: "N/A",
          estado: "ACTIVO",
          confirmo: "Sí",
          asistio: "Sí",
          plan: plan.nombre,
          precio: plan.precio,
          fecha_pago: newActiveClient.fecha_pago,
          proximo_pago: proximoPago,
          metodo_pago: newActiveClient.metodo_pago,
          meses_incluidos: plan.meses,
          recibo_url: reciboUrl,
        }),
      });

      const data = await response.json();
      console.log("Respuesta:", data);

      if (response.ok) {
        // Registrar el pago en PAGOS
        const pagoResponse = await fetch("/api/pagos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cliente_id: id,
            nombre: newActiveClient.nombre,
            fecha_pago: newActiveClient.fecha_pago,
            monto: plan.precio,
            metodo_pago: newActiveClient.metodo_pago,
            plan: plan.nombre,
            meses: plan.meses,
            promocion: plan.esPromocion ? "si" : "",
            usuario: "admin",
          }),
        });

        const pagoData = await pagoResponse.json();
        const pagoId = pagoData.id;
        const nuevoReciboUrl =
          (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") +
          "/recibo/" +
          pagoId;

        // Actualizar recibo_url
        await fetch("/api/pagos/" + pagoId + "/recibo", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recibo_url: nuevoReciboUrl }),
        });

        await fetchActivos();
        setShowRegisterModal(false);
        alert("Cliente registrado correctamente. Recibo: " + nuevoReciboUrl);
      } else {
        alert(
          "Error al registrar cliente: " + (data.error || "Error desconocido")
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexion: " + error.message);
    } finally {
      setIsRegistering(false);
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
          <div className="flex gap-2">
            <button
              onClick={fetchActivos}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Actualizar
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2 bg-primary hover:bg-primary-600 rounded-lg text-sm flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Registrar Cliente Activo
            </button>
          </div>
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
                    ? "$" + Number(miembro.precio).toLocaleString()
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

      {/* Modal Registrar Pago */}
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
                <label className="block text-sm mb-1">Plan / Promocion</label>
                <select
                  value={paymentData.planKey}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <optgroup label="Planes normales">
                    <option value="Visita">Visita - $50 (1 dia)</option>
                    <option value="Mensual">Mensual - $350 (1 mes)</option>
                    <option value="Bimestral">
                      Bimestral - $600 (2 meses)
                    </option>
                    <option value="Trimestral">
                      Trimestral - $800 (3 meses)
                    </option>
                    <option value="Anualidad">
                      Anualidad - $3,500 (12 meses)
                    </option>
                  </optgroup>
                  <optgroup label="Promociones especiales">
                    <option value="Promo3x1">
                      🎁 3 meses por $800 (paga $800 por 3 meses)
                    </option>
                    <option value="Promo2x1">
                      🎁 2x1 Mensual (paga $350, tiene 2 meses)
                    </option>
                    <option value="Promo5mas1">
                      🎁 5+1 (paga 5 meses, tiene 6)
                    </option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Metodo de Pago</label>
                <select
                  value={paymentData.metodo_pago}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      metodo_pago: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
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

      {/* Modal Registrar Cliente Activo */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                Registrar Cliente Activo
              </h2>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-300">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={newActiveClient.nombre}
                  onChange={(e) =>
                    setNewActiveClient({
                      ...newActiveClient,
                      nombre: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
                  placeholder="Ej: Juan Perez"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-300">
                  Telefono *
                </label>
                <input
                  type="tel"
                  value={newActiveClient.telefono}
                  onChange={(e) =>
                    setNewActiveClient({
                      ...newActiveClient,
                      telefono: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
                  placeholder="Ej: 5512345678"
                />
                <p className="text-gray-500 text-xs mt-1">
                  10 digitos, sin codigo pais
                </p>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-300">Plan</label>
                <select
                  value={newActiveClient.planKey}
                  onChange={(e) =>
                    setNewActiveClient({
                      ...newActiveClient,
                      planKey: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
                >
                  <optgroup label="Planes normales">
                    <option value="Visita">Visita - $50 (1 dia)</option>
                    <option value="Mensual">Mensual - $350 (1 mes)</option>
                    <option value="Bimestral">
                      Bimestral - $600 (2 meses)
                    </option>
                    <option value="Trimestral">
                      Trimestral - $800 (3 meses)
                    </option>
                    <option value="Anualidad">
                      Anualidad - $3,500 (12 meses)
                    </option>
                  </optgroup>
                  <optgroup label="Promociones especiales">
                    <option value="Promo3x1">
                      🎁 3 meses por $800 (paga $800 por 3 meses)
                    </option>
                    <option value="Promo2x1">
                      🎁 2x1 Mensual (paga $350, tiene 2 meses)
                    </option>
                    <option value="Promo5mas1">
                      🎁 5+1 (paga 5 meses, tiene 6)
                    </option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-300">
                  Metodo de pago
                </label>
                <select
                  value={newActiveClient.metodo_pago}
                  onChange={(e) =>
                    setNewActiveClient({
                      ...newActiveClient,
                      metodo_pago: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-300">
                  Fecha de pago *
                </label>
                <input
                  type="date"
                  value={newActiveClient.fecha_pago}
                  onChange={(e) =>
                    setNewActiveClient({
                      ...newActiveClient,
                      fecha_pago: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={registrarClienteActivo}
                  disabled={isRegistering}
                  className="flex-1 py-2 bg-primary rounded-lg font-semibold disabled:opacity-50"
                >
                  {isRegistering ? "Registrando..." : "Registrar Cliente"}
                </button>
                <button
                  onClick={() => setShowRegisterModal(false)}
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
