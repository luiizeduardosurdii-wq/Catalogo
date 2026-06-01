"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InventoryPanel({
  productId,
  currentQty,
  reserved,
}: {
  productId: string;
  currentQty: number;
  reserved: number;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function move(type: "in" | "out" | "adjust") {
    setLoading(true);
    setMessage("");
    const res = await fetch(`/api/admin/inventory/${productId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, quantity: type === "adjust" ? qty : qty, note }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "Erro");
      return;
    }
    setMessage(`Saldo atual: ${data.balance}`);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-sm">
        Estoque: <strong>{currentQty}</strong> | Reservado: <strong>{reserved}</strong> |
        Disponível: <strong>{currentQty - reserved}</strong>
      </p>
      <div className="mt-3 flex flex-wrap gap-2 items-end">
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value) || 0)}
          className="w-20 rounded-lg border px-2 py-1 text-sm"
        />
        <input
          placeholder="Observação"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1 min-w-[120px] rounded-lg border px-2 py-1 text-sm"
        />
        <button type="button" disabled={loading} onClick={() => move("in")} className="rounded-lg bg-emerald-600 px-3 py-1 text-sm text-white">
          + Entrada
        </button>
        <button type="button" disabled={loading} onClick={() => move("out")} className="rounded-lg bg-amber-600 px-3 py-1 text-sm text-white">
          − Saída
        </button>
        <button type="button" disabled={loading} onClick={() => move("adjust")} className="rounded-lg bg-zinc-600 px-3 py-1 text-sm text-white">
          Ajustar para {qty}
        </button>
      </div>
      {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
    </div>
  );
}
