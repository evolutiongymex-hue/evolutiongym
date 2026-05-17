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

const escapeCsvField = (value) => {
  const str = String(value ?? "");
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
};

export default function InventarioPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [ventas, setVentas] = useState({
    totalUnidades: 0,
    totalDinero: 0,
    detalle: [],
  });
  const [filtro, setFiltro] = useState("dia");

  const [activeModal, setActiveModal] = useState(null);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cantidadError, setCantidadError] = useState("");
  const [nuevoProducto, setNuevoProducto] = useState(NUEVO_PRODUCTO_DEFAULT);
  const [productoError, setProductoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [productosRes, ventasRes] = await Promise.all([
        fetch("/api/inventario"),
        fetch("/api/inventario/ventas?periodo=" + filtro),
      ]);
      const [productosData, ventasData] = await Promise.all([
        productosRes.json(),
        ventasRes.json(),
      ]);

      if (productosData.success) {
        setProductos(productosData.data);
      } else {
        setError(productosData.error || "Error al cargar productos");
      }

      if (ventasData.success) {
        setVentas({
          totalUnidades: ventasData.totalUnidades || 0,
          totalDinero: ventasData.totalDinero || 0,
          detalle: ventasData.detalle || [],
        });
      }
    } catch {
      setError("Error de conexion con el servidor");
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const abrirModal = useCallback((tipo, producto = null) => {
    setSelectedProducto(producto);
    setCantidad(1);
    setCantidadError("");
    setProductoError("");
    setActionSuccess("");
    setActiveModal(tipo);
  }, []);

  const cerrarModal = useCallback(() => {
    setActiveModal(null);
    setSelectedProducto(null);
    setCantidad(1);
    setCantidadError("");
    setProductoError("");
    setActionSuccess("");
    setNuevoProducto(NUEVO_PRODUCTO_DEFAULT);
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

    setIsSubmitting(true);
    try {
      const total = cantidad * selectedProducto.precio_venta;
      const [ventaRes] = await Promise.all([
        fetch("/api/inventario/ventas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            producto_id: selectedProducto.id,
            cantidad,
            total,
          }),
        }),
      ]);

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

      setActionSuccess("Venta registrada: $" + total.toLocaleString());
      setTimeout(cerrarModal, 1800);
    } catch (err) {
      setCantidadError(err.message || "Error al registrar la venta");
    } finally {
      setIsSubmitting(false);
    }
  }, [cantidad, selectedProducto, actualizarStock, cerrarModal]);

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
          stock_minimo: parseInt(nuevoProducto.stock_minimo) || 5,
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

  const exportarCSV = useCallback(() => {
    const headers = ["ID", "Nombre", "Stock", "Precio", "Stock Minimo"];
    const filas = productos.map((p) => [
      p.id,
      p.nombre,
      p.stock,
      p.precio_venta,
      p.stock_minimo,
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
  }, [productos]);

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
      {/* Header */}
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

      {/* Cards resumen ventas */}
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
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-sm">Productos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/40">
                {["Nombre", "Stock", "Precio", "Stock minimo", "Acciones"].map(
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
              {productos.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-gray-500 text-sm"
                  >
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map((producto) => {
                  const isLow = producto.stock <= producto.stock_minimo;
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

      {/* Tabla ventas periodo */}
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
                {["Producto", "Cantidad", "Total", "Fecha"].map((h) => (
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
              {ventas.detalle.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
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
              className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header modal */}
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-white">
                  {activeModal === "producto" && "Nuevo producto"}
                  {activeModal === "venta" && "Registrar venta"}
                  {activeModal === "stock" && "Agregar stock"}
                </h2>
                <button
                  onClick={cerrarModal}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Exito */}
              {actionSuccess && (
                <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/25 rounded-xl text-green-400 text-sm">
                  {actionSuccess}
                </div>
              )}

              {/* Modal Nuevo Producto */}
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
                      placeholder="Ej: 10"
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

              {/* Modal Venta */}
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
                  <div className="px-4 py-3 bg-gray-800/50 rounded-xl flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total</span>
                    <span className="text-xl font-black text-green-400">
                      $
                      {(
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

              {/* Modal Stock */}
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
    </div>
  );
}
