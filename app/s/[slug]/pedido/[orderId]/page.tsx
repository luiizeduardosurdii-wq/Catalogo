"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/format";

type OrderData = {
  orderId: string;
  totalCents: number;
  pixCopyPaste: string;
  pixQrCode?: string;
  expiresAt: string;
};

type OrderStatus = {
  status: string;
  totalCents: number;
  payment?: { status: string; paidAt?: string };
};

export default function OrderPage() {
  const { slug, orderId } = useParams<{ slug: string; orderId: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(`order-${orderId}`);
    if (raw) setOrder(JSON.parse(raw));
  }, [orderId]);

  const pollStatus = useCallback(async () => {
    const res = await fetch(`/api/orders/${orderId}`);
    if (res.ok) {
      const data = await res.json();
      setStatus(data);
    }
  }, [orderId]);

  useEffect(() => {
    pollStatus();
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [pollStatus]);

  async function simulatePay() {
    await fetch(`/api/orders/${orderId}/simulate-pay`, { method: "POST" });
    pollStatus();
  }

  function copyPix() {
    if (!order?.pixCopyPaste) return;
    navigator.clipboard.writeText(order.pixCopyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const paid = status?.status === "PAID";

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-zinc-50 p-4">
      <h1 className="mb-2 text-2xl font-bold">
        {paid ? "Pagamento confirmado!" : "Aguardando PIX"}
      </h1>
      {order && (
        <p className="mb-6 text-lg text-emerald-700">
          Total: {formatPrice(order.totalCents)}
        </p>
      )}

      {paid ? (
        <div className="rounded-2xl bg-emerald-50 p-6 text-center">
          <p className="text-4xl">✓</p>
          <p className="mt-2 font-medium text-emerald-800">
            Seu pedido foi confirmado e o estoque foi atualizado.
          </p>
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
          {order?.pixQrCode && (
            <img
              src={`data:image/png;base64,${order.pixQrCode}`}
              alt="QR Code PIX"
              className="mx-auto h-48 w-48"
            />
          )}
          {order?.pixCopyPaste && (
            <>
              <p className="text-sm text-zinc-600">PIX copia e cola:</p>
              <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs break-all whitespace-pre-wrap">
                {order.pixCopyPaste}
              </pre>
              <button
                type="button"
                onClick={copyPix}
                className="w-full rounded-xl border border-emerald-600 py-2 font-medium text-emerald-700"
              >
                {copied ? "Copiado!" : "Copiar código PIX"}
              </button>
            </>
          )}
          <p className="text-center text-sm text-zinc-500">
            Status: {status?.payment?.status ?? status?.status ?? "..."}
          </p>
          {process.env.NODE_ENV !== "production" && (
            <button
              type="button"
              onClick={simulatePay}
              className="w-full rounded-xl bg-amber-500 py-2 text-sm font-medium text-white"
            >
              [DEV] Simular pagamento PIX
            </button>
          )}
        </div>
      )}

      <a
        href={`/s/${slug}`}
        className="mt-6 block text-center text-sm text-emerald-600"
      >
        Voltar ao catálogo
      </a>
    </div>
  );
}
