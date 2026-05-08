"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Package,
  AlertCircle,
  Loader2,
  DollarSign,
  Download,
  X,
  ShoppingCart,
  Calendar,
  Plus
} from "lucide-react";

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
  const [filtro, setFiltro] = useState("dia"); // dia, semana, mes

  const [showProductModal, setShowProductModal] = useState(false);
  const [showVentaModal, setShowVentaModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio_venta: "",
    stock: "",
    stock_minimo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productosRes, ventasRes] = await Promise.all([
        fetch("/api/inventario"),
        fetch("/api/inventario/ventas?periodo=" + filtro),
      ]);

      const productosData = await productosRes.json();
      const ventasData = await ventasRes.json();

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
    } catch (error) {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filtro]);

  const actualizarStock = async (id, cantidad, tipo) => {
    if (!cantidad || cantidad <= 0) {
      alert("Ingresa una cantidad valida");
      return;
    }

    setUpdatingId(id);
    try {
      const response = await fetch("/api/inventario", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, cantidad, tipo }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al actualizar stock");
      }
    } catch (error) {
      alert("Error de conexion");
    } finally {
      setUpdatingId(null);
    }
  };

  const registrarVenta = async () => {
    if (!cantidad || cantidad <= 0) {
      alert("Ingresa una cantidad valida");
      return;
    }

    if (cantidad > selectedProducto.stock) {
      alert(
        "Stock insuficiente. Solo hay " + selectedProducto.stock + " unidades"
      );
      return;
    }

    const total = cantidad * selectedProducto.precio_venta;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inventario/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producto_id: selectedProducto.id,
          cantidad: cantidad,
          total: total,
        }),
      });

      if (response.ok) {
        await actualizarStock(selectedProducto.id, cantidad, "vender");
        setShowVentaModal(false);
        setCantidad(1);
        alert("Venta registrada correctamente");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al registrar venta");
      }
    } catch (error) {
      alert("Error de conexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgregarStock = async () => {
    if (!cantidad || cantidad <= 0) {
      alert("Ingresa una cantidad valida");
      return;
    }
    await actualizarStock(selectedProducto.id, cantidad, "agregar");
    setShowStockModal(false);
    setCantidad(1);
    alert("Stock agregado correctamente");
  };

  const crearProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio_venta) {
      alert("Nombre y precio son obligatorios");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoProducto.nombre,
          stock: parseInt(nuevoProducto.stock) || 0,
          precio_venta: parseInt(nuevoProducto.precio_venta),
          stock_minimo: parseInt(nuevoProducto.stock_minimo) || 5,
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowProductModal(false);
        setNuevoProducto({
          nombre: "",
          precio_venta: "",
          stock: "",
          stock_minimo: "",
        });
        alert("Producto agregado correctamente");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al crear producto");
      }
    } catch (error) {
      alert("Error de conexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportarCSV = () => {
    const headers = ["ID", "Nombre", "Stock", "Precio", "Stock Minimo"];
    const filas = productos.map((p) => [
      p.id,
      p.nombre,
      p.stock,
      p.precio_venta,
      p.stock_minimo,
    ]);

    const csvContent = [headers, ...filas]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "inventario_" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const abrirModalStock = (producto, tipo) => {
    setSelectedProducto(producto);
    setCantidad(1);
    if (tipo === "agregar") {
      setShowStockModal(true);
    } else if (tipo === "vender") {
      setShowVentaModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-gray-400">Cargando inventario...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg">
        <p className="font-semibold">Error:</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchData}
          className="mt-3 px-4 py-2 bg-red-500/20 rounded-lg text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Inventario y Ventas
          </h1>
          <div className="flex gap-3">
            <button
              onClick={exportarCSV}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              onClick={() => setShowProductModal(true)}
              className="px-4 py-2 bg-primary hover:bg-primary-600 rounded-lg text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
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
          Ventas del Día
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
          Ventas de la Semana
        </button>
        <button
          onClick={() => setFiltro("mes")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filtro === "mes"
              ? "bg-primary text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Ventas del Mes
        </button>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-6 h-6 text-green-400" />
            <h2 className="text-gray-400 text-sm">
              Unidades Vendidas (
              {filtro === "dia"
                ? "Hoy"
                : filtro === "semana"
                ? "Esta Semana"
                : "Este Mes"}
              )
            </h2>
          </div>
          <p className="text-3xl font-bold text-green-400">
            {ventas.totalUnidades} unidades
          </p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-blue-400" />
            <h2 className="text-gray-400 text-sm">
              Total en Ventas (
              {filtro === "dia"
                ? "Hoy"
                : filtro === "semana"
                ? "Esta Semana"
                : "Este Mes"}
              )
            </h2>
          </div>
          <p className="text-3xl font-bold text-blue-400">
            ${ventas.totalDinero.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">Productos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-300">Nombre</th>
                <th className="px-4 py-3 text-left text-gray-300">Stock</th>
                <th className="px-4 py-3 text-left text-gray-300">Precio</th>
                <th className="px-4 py-3 text-left text-gray-300">
                  Stock Minimo
                </th>
                <th className="px-4 py-3 text-left text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map((producto) => {
                  const isLowStock = producto.stock <= producto.stock_minimo;
                  return (
                    <tr
                      key={producto.id}
                      className={
                        "border-t border-gray-800 hover:bg-gray-800/30 " +
                        (isLowStock ? "bg-red-500/10" : "")
                      }
                    >
                      <td className="px-4 py-3 text-gray-300 font-medium">
                        {producto.nombre}
                        {isLowStock && (
                          <span className="ml-2 text-xs text-red-400">
                            (Stock bajo)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              isLowStock ? "text-red-400 font-bold" : ""
                            }
                          >
                            {producto.stock}
                          </span>
                          {updatingId === producto.id && (
                            <Loader2 className="w-3 h-3 animate-spin ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        ${producto.precio_venta.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {producto.stock_minimo}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirModalStock(producto, "agregar")}
                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs"
                          >
                            + Stock
                          </button>
                          <button
                            onClick={() => abrirModalStock(producto, "vender")}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs"
                          >
                            Vender
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

      {/* Tabla de ventas del período */}
      <div className="mt-8 bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            Ventas realizadas (
            {filtro === "dia"
              ? "hoy"
              : filtro === "semana"
              ? "esta semana"
              : "este mes"}
            )
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-300">Producto</th>
                <th className="px-4 py-3 text-left text-gray-300">Cantidad</th>
                <th className="px-4 py-3 text-left text-gray-300">Total</th>
                <th className="px-4 py-3 text-left text-gray-300">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ventas.detalle && ventas.detalle.length > 0 ? (
                ventas.detalle.map((venta, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-gray-800 hover:bg-gray-800/30"
                  >
                    <td className="px-4 py-3 text-gray-300">
                      {venta.producto_nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {venta.cantidad}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      ${venta.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {venta.fecha || venta.hora || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
                    No hay ventas en este período
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Producto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Nuevo Producto</h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-300">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nuevoProducto.nombre}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      nombre: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
                  placeholder="Ej: Agua 500ml"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-300">
                  Precio de venta *
                </label>
                <input
                  type="number"
                  value={nuevoProducto.precio_venta}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      precio_venta: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
                  placeholder="Ej: 20"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-300">
                  Stock inicial
                </label>
                <input
                  type="number"
                  value={nuevoProducto.stock}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      stock: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
                  placeholder="Ej: 50"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-300">
                  Stock minimo (alerta)
                </label>
                <input
                  type="number"
                  value={nuevoProducto.stock_minimo}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      stock_minimo: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
                  placeholder="Ej: 10"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={crearProducto}
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-primary rounded-lg font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Producto"}
                </button>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2 bg-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Venta */}
      {showVentaModal && selectedProducto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Registrar Venta</h2>
              <button
                onClick={() => setShowVentaModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 mb-4">
              Producto:{" "}
              <span className="text-white font-medium">
                {selectedProducto.nombre}
              </span>
            </p>
            <p className="text-gray-400 mb-4">
              Precio unitario:{" "}
              <span className="text-white">
                ${selectedProducto.precio_venta}
              </span>
            </p>
            <p className="text-gray-400 mb-4">
              Stock actual:{" "}
              <span className="text-white">{selectedProducto.stock}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-gray-300">
                Cantidad a vender
              </label>
              <input
                type="number"
                min="1"
                max={selectedProducto.stock}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
              />
            </div>
            <div className="mb-4 p-3 bg-gray-800 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="text-xl font-bold text-green-400">
                  ${(cantidad * selectedProducto.precio_venta).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={registrarVenta}
                disabled={isSubmitting || cantidad <= 0}
                className="flex-1 py-2 bg-blue-500 rounded-lg font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Registrando..." : "Registrar Venta"}
              </button>
              <button
                onClick={() => setShowVentaModal(false)}
                className="flex-1 py-2 bg-gray-700 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Stock */}
      {showStockModal && selectedProducto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Agregar Stock</h2>
              <button
                onClick={() => setShowStockModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 mb-4">
              Producto:{" "}
              <span className="text-white font-medium">
                {selectedProducto.nombre}
              </span>
            </p>
            <p className="text-gray-400 mb-4">
              Stock actual:{" "}
              <span className="text-white">{selectedProducto.stock}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-gray-300">
                Cantidad a agregar
              </label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAgregarStock}
                disabled={isSubmitting || cantidad <= 0}
                className="flex-1 py-2 bg-green-500 rounded-lg font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Agregando..." : "Agregar Stock"}
              </button>
              <button
                onClick={() => setShowStockModal(false)}
                className="flex-1 py-2 bg-gray-700 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
