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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPago = async () => {
      try {
        const response = await fetch(`/api/pagos/${id}`);
        const data = await response.json();
        if (data.success) {
          setPago(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
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
        <div className="text-gray-600">Cargando recibo...</div>
      </div>
    );
  }

  if (error || !pago) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-600">Recibo no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Encabezado */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
            <div className="text-center">
              <h1 className="text-3xl font-bold">EVOLUTION GYM</h1>
              <p className="text-red-100 mt-1">
                {" "}
                Angel del Campo #69, Nezahualcóyotl, Mexico, 57620
              </p>
              <p className="text-red-100">5655382350</p>
            </div>
          </div>

          {/* Cuerpo del recibo */}
          <div className="p-6">
            <div className="text-center border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                RECIBO DE PAGO
              </h2>
              <p className="text-gray-500 text-sm">Folio: {pago.id}</p>
            </div>

            <div className="space-y-4">
              {/* Fecha */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-700">Fecha:</span>
                </div>
                <span className="text-gray-800">{pago.fecha_pago}</span>
              </div>

              {/* Cliente */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-700">Cliente:</span>
                </div>
                <span className="text-gray-800">{pago.nombre}</span>
              </div>

              {/* Plan */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-700">Plan:</span>
                </div>
                <span className="text-gray-800">{pago.plan}</span>
              </div>

              {/* Monto */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-gray-700">Monto:</span>
                </div>
                <span className="text-green-600 font-bold text-xl">
                  ${pago.monto.toLocaleString()}
                </span>
              </div>

              {/* Método de pago */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-700">Método:</span>
                </div>
                <span className="text-gray-800">
                  {pago.metodo_pago === "efectivo"
                    ? "Efectivo"
                    : "Transferencia"}
                </span>
              </div>
            </div>

            {/* Próximo pago */}
            {pago.proximo_pago && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600 text-sm">
                    <span className="font-semibold">Próximo pago:</span>{" "}
                    {pago.proximo_pago}
                  </span>
                </div>
              </div>
            )}

            {/* Mensaje de agradecimiento */}
            <div className="text-center mt-8 pt-4 border-t">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-gray-600">
                  ¡Gracias por confiar en Evolution Gym!
                </p>
              </div>
              <p className="text-gray-400 text-sm">
                Este recibo es un comprobante de pago válido.
              </p>
            </div>
          </div>

          {/* Botón imprimir */}
          <div className="bg-gray-50 p-4 text-center">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Guardar como PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
