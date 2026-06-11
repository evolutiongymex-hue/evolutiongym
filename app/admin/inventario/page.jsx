"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Package,
  Loader2,
  DollarSign,
  Download,
  X,
  ShoppingCart,
  Calendar,
  Plus,
  AlertTriangle,
  Search,
  Pencil,
  Wallet,
  TrendingDown,
  TrendingUp,
  PlusCircle,
  MinusCircle,
  User,
  Users,
} from "lucide-react";

const FILTROS = [
  { key: "dia", label: "Ventas del dia" },
  { key: "semana", label: "Ventas de la semana" },
  { key: "mes", label: "Ventas del mes" },
];

const PERIODO_LABEL = { dia: "hoy", semana: "esta semana", mes: "este mes" };

const inputClass =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50";
const labelClass =
  "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5";

const NUEVO_PRODUCTO_DEFAULT = {
  nombre: "",
  precio_venta: "",
  stock: "",
  stock_minimo: "",
};
const EDITAR_DEFAULT = { nombre: "", precio_venta: "", stock_minimo: "" };

const escapeCsvField = (value) => {
  const str = String(value ?? "");
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
};

export default function InventarioPage() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [ventas, setVentas] = useState({
    totalUnidades: 0,
    totalDinero: 0,
    detalle: [],
  });
  const [filtro, setFiltro] = useState("dia");
  const [busqueda, setBusqueda] = useState("");
  const [cajaProductos, setCajaProductos] = useState(null);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [metodoPagoVenta, setMetodoPagoVenta] = useState("efectivo");
  const [parcialVenta, setParcialVenta] = useState(false);
  const [montoParcialVenta, setMontoParcialVenta] = useState("");
  // Cliente para deuda
  const [clienteEsMiembro, setClienteEsMiembro] = useState(null); // null = no elegido, true/false
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null); // miembro del CRM
  const [nombreClienteLibre, setNombreClienteLibre] = useState("");
  const [cantidadError, setCantidadError] = useState("");
  const [nuevoProducto, setNuevoProducto] = useState(NUEVO_PRODUCTO_DEFAULT);
  const [editarData, setEditarData] = useState(EDITAR_DEFAULT);
  const [productoError, setProductoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const [cajaModal, setCajaModal] = useState(null);
  const [cajaModalData, setCajaModalData] = useState({
    concepto: "",
    monto: "",
  });
  const [cajaModalError, setCajaModalError] = useState("");
  const [cajaSubmitting, setCajaSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [productosRes, ventasRes, cajaRes, crmRes] = await Promise.all([
        fetch("/api/inventario"),
        fetch("/api/inventario/ventas?periodo=" + filtro),
        fetch("/api/caja/productos"),
        fetch("/api/sheets?sheet=CRM_Evolution_Gym"),
      ]);
      const [productosData, ventasData, cajaData, crmData] = await Promise.all([
        productosRes.json(),
        ventasRes.json(),
        cajaRes.json(),
        crmRes.json(),
      ]);
      if (productosData.success) setProductos(productosData.data);
      else setError(productosData.error || "Error al cargar productos");
      if (ventasData.success) {
        setVentas({
          totalUnidades: ventasData.totalUnidades || 0,
          totalDinero: ventasData.totalDinero || 0,
          detalle: ventasData.detalle || [],
        });
      }
      if (cajaData.success) setCajaProductos(cajaData);
      if (crmData.success)
        setClientes(crmData.data.filter((c) => c.estado === "ACTIVO"));
    } catch {
      setError("Error de conexion con el servidor");
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clientesFiltrados = useMemo(() => {
    if (!busquedaCliente.trim()) return [];
    return clientes
      .filter((c) =>
        c.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase())
      )
      .slice(0, 5);
  }, [clientes, busquedaCliente]);

  const ventasPorProducto = useMemo(() => {
    const mapa = {};
    ventas.detalle.forEach((v) => {
      mapa[v.producto_id] = (mapa[v.producto_id] || 0) + v.cantidad;
    });
    return mapa;
  }, [ventas.detalle]);

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos;
    return productos.filter((p) =>
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [productos, busqueda]);

  const resetClienteState = () => {
    setClienteEsMiembro(null);
    setBusquedaCliente("");
    setClienteSeleccionado(null);
    setNombreClienteLibre("");
  };

  const abrirModal = useCallback((tipo, producto = null) => {
    setSelectedProducto(producto);
    setCantidad(1);
    setMetodoPagoVenta("efectivo");
    setParcialVenta(false);
    setMontoParcialVenta("");
    resetClienteState();
    setCantidadError("");
    setProductoError("");
    setActionSuccess("");
    if (tipo === "editar" && producto) {
      setEditarData({
        nombre: producto.nombre,
        precio_venta: String(producto.precio_venta),
        stock_minimo: String(producto.stock_minimo),
      });
    }
    setActiveModal(tipo);
  }, []);

  const cerrarModal = useCallback(() => {
    setActiveModal(null);
    setSelectedProducto(null);
    setCantidad(1);
    setMetodoPagoVenta("efectivo");
    setParcialVenta(false);
    setMontoParcialVenta("");
    resetClienteState();
    setCantidadError("");
    setProductoError("");
    setActionSuccess("");
    setNuevoProducto(NUEVO_PRODUCTO_DEFAULT);
    setEditarData(EDITAR_DEFAULT);
  }, []);

  const actualizarStock = useCallback(
    async (id, cant, tipo) => {
      setUpdatingId(id);
      try {
        const response = await fetch("/api/inventario", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, cantidad: cant, tipo }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Error al actualizar stock");
        await fetchData();
        return true;
      } catch (err) {
        return err.message;
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchData]
  );

  const registrarVenta = useCallback(async () => {
    setCantidadError("");
    if (!cantidad || cantidad <= 0) {
      setCantidadError("Ingresa una cantidad valida");
      return;
    }
    if (cantidad > selectedProducto.stock) {
      setCantidadError(
        "Stock insuficiente. Solo hay " + selectedProducto.stock + " unidades"
      );
      return;
    }

    const total = cantidad * selectedProducto.precio_venta;
    const montoRecibido = parcialVenta ? parseFloat(montoParcialVenta) : total;

    if (parcialVenta) {
      if (!montoRecibido || montoRecibido <= 0) {
        setCantidadError("Ingresa un monto valido");
        return;
      }
      if (montoRecibido >= total) {
        setCantidadError(
          "El anticipo debe ser menor al total ($" +
            total.toLocaleString() +
            ")"
        );
        return;
      }
      if (clienteEsMiembro === null) {
        setCantidadError("Indica si el cliente es miembro o no");
        return;
      }
      if (clienteEsMiembro && !clienteSeleccionado) {
        setCantidadError("Selecciona el miembro de la lista");
        return;
      }
      if (!clienteEsMiembro && !nombreClienteLibre.trim()) {
        setCantidadError("Ingresa el nombre del cliente");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const ventaRes = await fetch("/api/inventario/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producto_id: selectedProducto.id,
          cantidad,
          total: montoRecibido,
          metodo_pago: metodoPagoVenta,
        }),
      });
      if (!ventaRes.ok) {
        const d = await ventaRes.json();
        throw new Error(d.error || "Error al registrar venta");
      }
      const resultado = await actualizarStock(
        selectedProducto.id,
        cantidad,
        "vender"
      );
      if (resultado !== true) throw new Error(resultado);

      if (parcialVenta) {
        const saldo = total - montoRecibido;
        const clienteId = clienteEsMiembro
          ? clienteSeleccionado.id
          : "ext-" + Date.now();
        const nombreCliente = clienteEsMiembro
          ? clienteSeleccionado.nombre
          : nombreClienteLibre.trim();
        await fetch("/api/deudas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cliente_id: clienteId,
            nombre: nombreCliente,
            tipo: "producto",
            concepto: selectedProducto.nombre + " x" + cantidad,
            monto_total: total,
            monto_pagado: montoRecibido,
          }),
        });
        setActionSuccess(
          "Venta registrada. Anticipo: $" +
            montoRecibido.toLocaleString() +
            " — " +
            nombreCliente +
            " debe: $" +
            saldo.toLocaleString()
        );
      } else {
        setActionSuccess("Venta registrada: $" + total.toLocaleString());
      }
      setTimeout(cerrarModal, 2000);
    } catch (err) {
      setCantidadError(err.message || "Error al registrar la venta");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    cantidad,
    metodoPagoVenta,
    parcialVenta,
    montoParcialVenta,
    clienteEsMiembro,
    clienteSeleccionado,
    nombreClienteLibre,
    selectedProducto,
    actualizarStock,
    cerrarModal,
  ]);

  const agregarStock = useCallback(async () => {
    setCantidadError("");
    if (!cantidad || cantidad <= 0) {
      setCantidadError("Ingresa una cantidad valida");
      return;
    }
    setIsSubmitting(true);
    const resultado = await actualizarStock(
      selectedProducto.id,
      cantidad,
      "agregar"
    );
    setIsSubmitting(false);
    if (resultado === true) {
      setActionSuccess("Stock actualizado correctamente");
      setTimeout(cerrarModal, 1500);
    } else {
      setCantidadError(resultado || "Error al agregar stock");
    }
  }, [cantidad, selectedProducto, actualizarStock, cerrarModal]);

  const crearProducto = useCallback(async () => {
    setProductoError("");
    if (!nuevoProducto.nombre.trim()) {
      setProductoError("El nombre es obligatorio");
      return;
    }
    if (
      !nuevoProducto.precio_venta ||
      Number(nuevoProducto.precio_venta) <= 0
    ) {
      setProductoError("El precio debe ser mayor a 0");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoProducto.nombre.trim(),
          stock: parseInt(nuevoProducto.stock) || 0,
          precio_venta: parseInt(nuevoProducto.precio_venta),
          stock_minimo:
            nuevoProducto.stock_minimo !== ""
              ? parseInt(nuevoProducto.stock_minimo)
              : 0,
        }),
      });
      if (!response.ok) {
        const d = await response.json();
        throw new Error(d.error || "Error al crear producto");
      }
      await fetchData();
      setActionSuccess("Producto agregado correctamente");
      setTimeout(cerrarModal, 1500);
    } catch (err) {
      setProductoError(err.message || "Error al crear el producto");
    } finally {
      setIsSubmitting(false);
    }
  }, [nuevoProducto, fetchData, cerrarModal]);

  const guardarEdicion = useCallback(async () => {
    setProductoError("");
    if (!editarData.nombre.trim()) {
      setProductoError("El nombre es obligatorio");
      return;
    }
    if (!editarData.precio_venta || Number(editarData.precio_venta) <= 0) {
      setProductoError("El precio debe ser mayor a 0");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inventario", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedProducto.id,
          nombre: editarData.nombre.trim(),
          precio_venta: parseInt(editarData.precio_venta),
          stock_minimo:
            editarData.stock_minimo !== ""
              ? parseInt(editarData.stock_minimo)
              : 0,
        }),
      });
      if (!response.ok) {
        const d = await response.json();
        throw new Error(d.error || "Error al actualizar");
      }
      await fetchData();
      setActionSuccess("Producto actualizado correctamente");
      setTimeout(cerrarModal, 1500);
    } catch (err) {
      setProductoError(err.message || "Error al actualizar el producto");
    } finally {
      setIsSubmitting(false);
    }
  }, [editarData, selectedProducto, fetchData, cerrarModal]);

  const registrarMovimientoCaja = useCallback(async () => {
    setCajaModalError("");
    const monto = parseFloat(cajaModalData.monto);
    if (!monto || monto <= 0) {
      setCajaModalError("Ingresa un monto valido");
      return;
    }
    setCajaSubmitting(true);
    try {
      const response = await fetch("/api/caja/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: cajaModal,
          concepto:
            cajaModalData.concepto ||
            (cajaModal === "retiro" ? "Retiro del dueño" : "Fondo agregado"),
          monto,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al registrar");
      await fetchData();
      setCajaModal(null);
      setCajaModalData({ concepto: "", monto: "" });
    } catch (err) {
      setCajaModalError(err.message || "Error al registrar movimiento");
    } finally {
      setCajaSubmitting(false);
    }
  }, [cajaModal, cajaModalData, fetchData]);

  const exportarCSV = useCallback(() => {
    const headers = [
      "ID",
      "Nombre",
      "Stock",
      "Precio",
      "Stock Minimo",
      "Vendido " + PERIODO_LABEL[filtro],
    ];
    const filas = productos.map((p) => [
      p.id,
      p.nombre,
      p.stock,
      p.precio_venta,
      p.stock_minimo,
      ventasPorProducto[p.id] || 0,
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
      "inventario_" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [productos, ventasPorProducto, filtro]);

  const productosConAlerta = useMemo(
    () => productos.filter((p) => p.stock <= p.stock_minimo).length,
    [productos]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-400">Cargando inventario...</span>
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
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Inventario y ventas
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {productos.length} productos
            {productosConAlerta > 0 && (
              <span className="ml-2 text-red-400 font-medium">
                · {productosConAlerta} con stock bajo
              </span>
            )}
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
            onClick={() => abrirModal("producto")}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:brightness-110 rounded-xl text-sm text-white font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo producto
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
      {cajaProductos && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Caja chica — Productos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="sm:col-span-2 bg-primary/5 border border-primary/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  En caja ahorita
                </span>
              </div>
              <p className="text-4xl font-black text-primary">
                ${cajaProductos.saldoEnCaja.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Incluye ventas efectivo del día + fondo base
              </p>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Ventas efectivo hoy
                </span>
              </div>
              <p className="text-2xl font-black text-green-400">
                ${cajaProductos.ventasEfectivoHoy.toLocaleString()}
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
                ${cajaProductos.retirosHoy.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setCajaModal("fondo");
                setCajaModalData({ concepto: "", monto: "" });
                setCajaModalError("");
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 rounded-xl text-sm font-semibold transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Agregar fondo
            </button>
            <button
              onClick={() => {
                setCajaModal("retiro");
                setCajaModalData({ concepto: "", monto: "" });
                setCajaModalError("");
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 rounded-xl text-sm font-semibold transition-colors"
            >
              <MinusCircle className="w-4 h-4" /> Registrar retiro
            </button>
          </div>
          {cajaProductos.movimientosHoy.length > 0 && (
            <div className="mt-4 bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800">
                <h3 className="text-white font-semibold text-sm">
                  Movimientos de caja hoy
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
                  {cajaProductos.movimientosHoy.map((m, idx) => (
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

      {/* Tabs */}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-green-500/5 rounded-xl border border-green-500/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Unidades vendidas ({PERIODO_LABEL[filtro]})
            </span>
          </div>
          <p className="text-3xl font-black text-green-400">
            {ventas.totalUnidades}
          </p>
        </div>
        <div className="bg-blue-500/5 rounded-xl border border-blue-500/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Total en ventas ({PERIODO_LABEL[filtro]})
            </span>
          </div>
          <p className="text-3xl font-black text-blue-400">
            ${ventas.totalDinero.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabla productos */}
      <div className="bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between gap-4">
          <h2 className="text-white font-semibold text-sm flex-shrink-0">
            Productos
          </h2>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/40">
                {[
                  "Nombre",
                  "Stock",
                  "Vendido",
                  "Precio",
                  "Stock minimo",
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
              <tr className="border-b border-gray-800/40 bg-gray-800/20">
                <td
                  colSpan={6}
                  className="px-4 py-1.5 text-[10px] text-gray-600 italic"
                >
                  Vendido = piezas vendidas {PERIODO_LABEL[filtro]}
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-500 text-sm"
                  >
                    {busqueda
                      ? "No hay productos que coincidan"
                      : "No hay productos registrados"}
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((producto) => {
                  const isLow = producto.stock <= producto.stock_minimo;
                  const vendido = ventasPorProducto[producto.id] || 0;
                  return (
                    <tr
                      key={producto.id}
                      className={
                        "hover:bg-gray-800/30 transition-colors " +
                        (isLow ? "bg-red-500/5" : "")
                      }
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        <div className="flex items-center gap-2">
                          {producto.nombre}
                          {isLow && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400 text-[10px] font-bold border border-red-500/20">
                              <AlertTriangle className="w-2.5 h-2.5" /> Bajo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              "font-semibold tabular-nums " +
                              (isLow ? "text-red-400" : "text-white")
                            }
                          >
                            {producto.stock}
                          </span>
                          {updatingId === producto.id && (
                            <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {vendido > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold tabular-nums">
                            <ShoppingCart className="w-3 h-3" /> {vendido}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300 tabular-nums">
                        ${producto.precio_venta.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500 tabular-nums">
                        {producto.stock_minimo}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirModal("stock", producto)}
                            disabled={updatingId === producto.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" /> Stock
                          </button>
                          <button
                            onClick={() => abrirModal("venta", producto)}
                            disabled={
                              updatingId === producto.id || producto.stock === 0
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                          >
                            <ShoppingCart className="w-3 h-3" /> Vender
                          </button>
                          <button
                            onClick={() => abrirModal("editar", producto)}
                            disabled={updatingId === producto.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla ventas */}
      <div className="bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-sm flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            Ventas realizadas ({PERIODO_LABEL[filtro]})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/40">
                {["Producto", "Cantidad", "Total", "Metodo", "Fecha"].map(
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
              {ventas.detalle.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-gray-500 text-sm"
                  >
                    No hay ventas {PERIODO_LABEL[filtro]}
                  </td>
                </tr>
              ) : (
                ventas.detalle.map((venta, idx) => (
                  <tr
                    key={venta.producto_id + "-" + venta.fecha + "-" + idx}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {venta.producto_nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-400 tabular-nums">
                      {venta.cantidad}
                    </td>
                    <td className="px-4 py-3 text-gray-300 font-semibold tabular-nums">
                      ${venta.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "px-2.5 py-1 rounded-lg text-[11px] font-semibold border " +
                          (venta.metodo_pago === "efectivo"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20")
                        }
                      >
                        {venta.metodo_pago === "efectivo"
                          ? "Efectivo"
                          : "Transferencia"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {venta.fecha || "-"}
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
            onClick={cerrarModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-800 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-white">
                  {activeModal === "producto" && "Nuevo producto"}
                  {activeModal === "venta" && "Registrar venta"}
                  {activeModal === "stock" && "Agregar stock"}
                  {activeModal === "editar" && "Editar producto"}
                </h2>
                <button
                  onClick={cerrarModal}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {actionSuccess && (
                <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/25 rounded-xl text-green-400 text-sm">
                  {actionSuccess}
                </div>
              )}

              {activeModal === "producto" && (
                <div className="space-y-4">
                  {productoError && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
                      {productoError}
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>Nombre *</label>
                    <input
                      type="text"
                      value={nuevoProducto.nombre}
                      onChange={(e) =>
                        setNuevoProducto((p) => ({
                          ...p,
                          nombre: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Ej: Agua 500ml"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Precio de venta *</label>
                    <input
                      type="number"
                      min="1"
                      value={nuevoProducto.precio_venta}
                      onChange={(e) =>
                        setNuevoProducto((p) => ({
                          ...p,
                          precio_venta: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Ej: 20"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Stock inicial</label>
                    <input
                      type="number"
                      min="0"
                      value={nuevoProducto.stock}
                      onChange={(e) =>
                        setNuevoProducto((p) => ({
                          ...p,
                          stock: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Ej: 50"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Stock minimo (alerta)</label>
                    <input
                      type="number"
                      min="0"
                      value={nuevoProducto.stock_minimo}
                      onChange={(e) =>
                        setNuevoProducto((p) => ({
                          ...p,
                          stock_minimo: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Ej: 0"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={crearProducto}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 bg-primary hover:brightness-110 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? "Guardando..." : "Guardar producto"}
                    </button>
                    <button
                      onClick={cerrarModal}
                      className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {activeModal === "editar" && selectedProducto && (
                <div className="space-y-4">
                  {productoError && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
                      {productoError}
                    </div>
                  )}
                  <div className="px-4 py-3 bg-gray-800/50 rounded-xl text-xs text-gray-500">
                    Stock actual:{" "}
                    <span className="text-white font-semibold">
                      {selectedProducto.stock} unidades
                    </span>{" "}
                    — para cambiar stock usa el boton +Stock
                  </div>
                  <div>
                    <label className={labelClass}>Nombre *</label>
                    <input
                      type="text"
                      value={editarData.nombre}
                      onChange={(e) =>
                        setEditarData((p) => ({ ...p, nombre: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Precio de venta *</label>
                    <input
                      type="number"
                      min="1"
                      value={editarData.precio_venta}
                      onChange={(e) =>
                        setEditarData((p) => ({
                          ...p,
                          precio_venta: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Stock minimo (alerta)</label>
                    <input
                      type="number"
                      min="0"
                      value={editarData.stock_minimo}
                      onChange={(e) =>
                        setEditarData((p) => ({
                          ...p,
                          stock_minimo: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={guardarEdicion}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 bg-primary hover:brightness-110 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                      onClick={cerrarModal}
                      className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {activeModal === "venta" && selectedProducto && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-gray-500 text-xs mb-1">Producto</p>
                      <p className="text-white font-medium">
                        {selectedProducto.nombre}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-gray-500 text-xs mb-1">
                        Stock disponible
                      </p>
                      <p className="text-white font-medium">
                        {selectedProducto.stock} unidades
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Cantidad a vender</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedProducto.stock}
                      value={cantidad}
                      onChange={(e) => {
                        setCantidad(parseInt(e.target.value) || 0);
                        setCantidadError("");
                      }}
                      className={inputClass}
                    />
                    {cantidadError && (
                      <p className="text-red-400 text-xs mt-1.5">
                        {cantidadError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Metodo de pago</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {["efectivo", "transferencia"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMetodoPagoVenta(m)}
                          className={
                            "py-2.5 rounded-xl text-xs font-semibold transition-all border capitalize " +
                            (metodoPagoVenta === m
                              ? "bg-primary border-primary text-white"
                              : "bg-white/5 border-white/10 text-gray-400 hover:text-white")
                          }
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle anticipo */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 rounded-xl">
                    <div>
                      <p className="text-white text-sm font-medium">
                        Anticipo / Pago parcial
                      </p>
                      <p className="text-gray-500 text-xs">
                        El cliente no paga el total
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setParcialVenta((v) => !v);
                        setMontoParcialVenta("");
                        resetClienteState();
                      }}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        parcialVenta ? "bg-primary" : "bg-gray-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          parcialVenta ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {parcialVenta && (
                    <div className="space-y-3">
                      {/* Monto parcial */}
                      <div>
                        <label className={labelClass}>
                          Monto que paga ahora *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={montoParcialVenta}
                          onChange={(e) => setMontoParcialVenta(e.target.value)}
                          className={inputClass}
                          placeholder={
                            "Total: $" +
                            (
                              cantidad * selectedProducto.precio_venta
                            ).toLocaleString()
                          }
                        />
                        {montoParcialVenta && (
                          <p className="text-orange-400 text-xs mt-1.5">
                            Queda debiendo: $
                            {Math.max(
                              0,
                              cantidad * selectedProducto.precio_venta -
                                parseFloat(montoParcialVenta || 0)
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* ¿Es miembro? */}
                      <div>
                        <label className={labelClass}>
                          ¿El cliente es miembro?
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setClienteEsMiembro(true);
                              setNombreClienteLibre("");
                            }}
                            className={
                              "py-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 " +
                              (clienteEsMiembro === true
                                ? "bg-primary border-primary text-white"
                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white")
                            }
                          >
                            <Users className="w-3.5 h-3.5" /> Sí, es miembro
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setClienteEsMiembro(false);
                              setClienteSeleccionado(null);
                              setBusquedaCliente("");
                            }}
                            className={
                              "py-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 " +
                              (clienteEsMiembro === false
                                ? "bg-primary border-primary text-white"
                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white")
                            }
                          >
                            <User className="w-3.5 h-3.5" /> No, es externo
                          </button>
                        </div>
                      </div>

                      {/* Buscador de miembro */}
                      {clienteEsMiembro === true && (
                        <div>
                          <label className={labelClass}>Buscar miembro</label>
                          {clienteSeleccionado ? (
                            <div className="flex items-center justify-between px-3 py-2.5 bg-primary/10 border border-primary/25 rounded-xl">
                              <div>
                                <p className="text-white text-sm font-medium">
                                  {clienteSeleccionado.nombre}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {clienteSeleccionado.plan} ·{" "}
                                  {clienteSeleccionado.telefono}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setClienteSeleccionado(null);
                                  setBusquedaCliente("");
                                }}
                                className="text-gray-500 hover:text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input
                                type="text"
                                value={busquedaCliente}
                                onChange={(e) =>
                                  setBusquedaCliente(e.target.value)
                                }
                                placeholder="Escribe el nombre del miembro..."
                                className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                              {clientesFiltrados.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden z-10 shadow-xl">
                                  {clientesFiltrados.map((c) => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => {
                                        setClienteSeleccionado(c);
                                        setBusquedaCliente("");
                                      }}
                                      className="w-full px-3 py-2.5 text-left hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                                    >
                                      <p className="text-white text-sm font-medium">
                                        {c.nombre}
                                      </p>
                                      <p className="text-gray-500 text-xs">
                                        {c.plan} · {c.telefono || "Sin tel"}
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Nombre libre */}
                      {clienteEsMiembro === false && (
                        <div>
                          <label className={labelClass}>
                            Nombre del cliente *
                          </label>
                          <input
                            type="text"
                            value={nombreClienteLibre}
                            onChange={(e) =>
                              setNombreClienteLibre(e.target.value)
                            }
                            className={inputClass}
                            placeholder="Ej: Juan Perez"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="px-4 py-3 bg-gray-800/50 rounded-xl flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      {parcialVenta ? "Anticipo" : "Total"}
                    </span>
                    <span className="text-xl font-black text-green-400">
                      $
                      {parcialVenta && montoParcialVenta
                        ? parseFloat(montoParcialVenta).toLocaleString()
                        : (
                            cantidad * selectedProducto.precio_venta
                          ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={registrarVenta}
                      disabled={isSubmitting || cantidad <= 0}
                      className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-400 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? "Registrando..." : "Registrar venta"}
                    </button>
                    <button
                      onClick={cerrarModal}
                      className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {activeModal === "stock" && selectedProducto && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-gray-500 text-xs mb-1">Producto</p>
                      <p className="text-white font-medium">
                        {selectedProducto.nombre}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-gray-500 text-xs mb-1">Stock actual</p>
                      <p className="text-white font-medium">
                        {selectedProducto.stock} unidades
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Cantidad a agregar</label>
                    <input
                      type="number"
                      min="1"
                      value={cantidad}
                      onChange={(e) => {
                        setCantidad(parseInt(e.target.value) || 0);
                        setCantidadError("");
                      }}
                      className={inputClass}
                    />
                    {cantidadError && (
                      <p className="text-red-400 text-xs mt-1.5">
                        {cantidadError}
                      </p>
                    )}
                  </div>
                  <div className="px-4 py-3 bg-gray-800/50 rounded-xl flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Nuevo stock</span>
                    <span className="text-xl font-black text-green-400">
                      {selectedProducto.stock + cantidad}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={agregarStock}
                      disabled={isSubmitting || cantidad <= 0}
                      className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? "Agregando..." : "Agregar stock"}
                    </button>
                    <button
                      onClick={cerrarModal}
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

      {/* Modal caja chica */}
      <AnimatePresence>
        {cajaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setCajaModal(null)}
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
                    {cajaModal === "retiro"
                      ? "Registrar retiro"
                      : "Agregar fondo"}
                  </h2>
                  {cajaProductos && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      Saldo actual:{" "}
                      <span className="text-white font-semibold">
                        ${cajaProductos.saldoEnCaja.toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setCajaModal(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {cajaModalError && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
                  {cajaModalError}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Concepto</label>
                  <input
                    type="text"
                    value={cajaModalData.concepto}
                    onChange={(e) =>
                      setCajaModalData((p) => ({
                        ...p,
                        concepto: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder={
                      cajaModal === "retiro"
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
                    value={cajaModalData.monto}
                    onChange={(e) =>
                      setCajaModalData((p) => ({ ...p, monto: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="Ej: 200"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={registrarMovimientoCaja}
                    disabled={cajaSubmitting}
                    className={
                      "flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 " +
                      (cajaModal === "retiro"
                        ? "bg-red-500 hover:bg-red-400"
                        : "bg-green-500 hover:bg-green-400")
                    }
                  >
                    {cajaSubmitting
                      ? "Registrando..."
                      : cajaModal === "retiro"
                      ? "Confirmar retiro"
                      : "Agregar fondo"}
                  </button>
                  <button
                    onClick={() => setCajaModal(null)}
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
