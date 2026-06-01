"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem(`checkout-${slug}`);
    if (!raw) router.replace(`/s/${slug}`);
  }, [slug, router]);

  async function handlePay() {
    setLoading(true);
    setError("");
    const raw = sessionStorage.getItem(`checkout-${slug}`);
    if (!raw) {
      setError("Carrinho expirado");
      setLoading(false);
      return;
    }

    const { items } = JSON.parse(raw) as {
      items: { productId: string; quantity: number }[];
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeSlug: slug,
        items,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao criar pedido");
      return;
    }

    sessionStorage.setItem(
      `order-${data.orderId}`,
      JSON.stringify(data)
    );
    router.push(`/s/${slug}/pedido/${data.orderId}`);
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-zinc-50 p-4">
      <h1 className="mb-6 text-2xl font-bold">Checkout PIX</h1>
      <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <label className="text-sm text-zinc-600">Nome (opcional)</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-zinc-600">Telefone (opcional)</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={handlePay}
          className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Gerando PIX..." : "Gerar cobrança PIX"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/s/${slug}`)}
          className="w-full text-sm text-zinc-500"
        >
          Voltar ao catálogo
        </button>
      </div>
    </div>
  );
}
