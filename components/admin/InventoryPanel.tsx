"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatApiError } from "@/lib/apiError";

export function InventoryPanel({
  productId,
  currentQty,
  reserved,
  compact = false,
}: {
  productId: string;
  currentQty: number;
  reserved: number;
  compact?: boolean;
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
      body: JSON.stringify({ type, quantity: qty, note }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(formatApiError(data.error, "Erro"));
      return;
    }
    setMessage(`Saldo atual: ${data.balance}`);
    router.refresh();
  }

  const available = currentQty - reserved;

  return (
    <div className={compact ? "space-y-3" : "admin-card p-4"}>
      {!compact && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Estoque: <strong>{currentQty}</strong> · Reservado:{" "}
          <strong>{reserved}</strong> · Disponível:{" "}
          <strong>{available}</strong>
        </p>
      )}

      <div
        className={`flex flex-wrap items-end gap-2 ${compact ? "" : "mt-3"}`}
      >
        <div className={compact ? "w-full" : ""}>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            Quantidade
          </label>
          <input
            type="number"
            min={0}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 0)}
            className="w-20 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            Observação
          </label>
          <input
            placeholder="Opcional"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={loading}
          onClick={() => move("in")}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          + Entrada
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => move("out")}
          className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
        >
          − Saída
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => move("adjust")}
          className="rounded-lg bg-zinc-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          Ajustar p/ {qty}
        </button>
      </div>

      {message && (
        <p className="text-xs font-medium text-emerald-700">{message}</p>
      )}
    </div>
  );
}
