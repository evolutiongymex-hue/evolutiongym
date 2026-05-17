"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Printer,
  Calendar,
  User,
  Package,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function ReciboPage() {
  const { id } = useParams();
  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchPago = async () => {
      try {
        const response = await fetch("/api/pagos/" + id);
        const data = await response.json();
        if (data.success) {
          setPago(data.data);
        } else {
          setError(data.error || "Recibo no encontrado");
        }
      } catch {
        setError("Error al cargar el recibo");
      } finally {
        setLoading(false);
      }
    };

    fetchPago();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Cargando recibo...</p>
        </div>
      </div>
    );
  }

  if (error || !pago) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 font-semibold">
            {error || "Recibo no encontrado"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Verifica el enlace e intenta de nuevo
          </p>
        </div>
      </div>
    );
  }

  const FILAS = [
    {
      icon: Calendar,
      label: "Fecha",
      value: pago.fecha_pago,
      color: "text-gray-400",
    },
    {
      icon: User,
      label: "Cliente",
      value: pago.nombre,
      color: "text-gray-400",
    },
    { icon: Package, label: "Plan", value: pago.plan, color: "text-gray-400" },
    {
      icon: CreditCard,
      label: "Metodo",
      value: pago.metodo_pago === "efectivo" ? "Efectivo" : "Transferencia",
      color: "text-gray-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-white text-center">
            <h1 className="text-3xl font-black tracking-tight">
              EVOLUTION GYM
            </h1>
            <p className="text-red-200 text-sm mt-1">
              Angel del Campo #69, Nezahualcoyotl, Mexico 57620
            </p>
            <p className="text-red-200 text-sm">56 5538 2350</p>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="text-center pb-5 mb-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-widest">
                Recibo de pago
              </h2>
              <p className="text-gray-400 text-xs mt-1">Folio: {pago.id}</p>
            </div>

            {/* Filas de datos */}
            <div className="space-y-0">
              {FILAS.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 text-sm font-medium">
                      {label}
                    </span>
                  </div>
                  <span className="text-gray-900 text-sm font-semibold">
                    {value || "-"}
                  </span>
                </div>
              ))}

              {/* Monto destacado */}
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 text-sm font-medium">
                    Monto
                  </span>
                </div>
                <span className="text-green-600 font-black text-2xl">
                  ${pago.monto.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Proximo pago */}
            {pago.proximo_pago && (
              <div className="mt-5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-gray-600 text-sm">
                  Proximo pago:{" "}
                  <span className="font-bold text-blue-600">
                    {pago.proximo_pago}
                  </span>
                </p>
              </div>
            )}

            {/* Agradecimiento */}
            <div className="text-center mt-7 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-gray-700 font-semibold text-sm">
                  Gracias por confiar en Evolution Gym
                </p>
              </div>
              <p className="text-gray-400 text-xs">
                Este recibo es un comprobante de pago valido.
              </p>
            </div>
          </div>

          {/* Footer con boton imprimir */}
          <div className="bg-gray-50 border-t border-gray-100 p-4 text-center print:hidden">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Guardar como PDF
            </button>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-4 print:hidden">
          Evolution Gym &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
