"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { formatPrice } from "@/lib/format";
import { formatApiError } from "@/lib/apiError";
import { formatOrderSummary, ORDER_STATUS_LABELS } from "@/lib/order-admin";
import { parseOrderOptions } from "@/lib/customization";

type OrderItem = {
  id: string;
  quantity: number;
  productName: string;
  optionsJson: string | null;
};

type OrderCardProps = {
  order: {
    id: string;
    status: OrderStatus;
    totalCents: number;
    customerName: string | null;
    customerPhone: string | null;
    items: OrderItem[];
    payment: { status: string; provider: string } | null;
  };
  storeWhatsapp: string | null;
};

export function OrderCard({ order, storeWhatsapp }: OrderCardProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const summary = formatOrderSummary(order);
  const canDeliver = order.status === OrderStatus.PAID;
  const canCancel =
    order.status === OrderStatus.AWAITING_PIX ||
    order.status === OrderStatus.PAID ||
    order.status === OrderStatus.DRAFT;

  async function runAction(action: "deliver" | "cancel") {
    setLoadingAction(action);
    setError("");
    setMessage("");

    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json().catch(() => ({}));
    setLoadingAction(null);

    if (!res.ok) {
      setError(formatApiError(data.error, "Erro ao atualizar pedido"));
      return;
    }

    setMessage(
      action === "deliver" ? "Pedido marcado como entregue." : "Pedido cancelado."
    );
    router.refresh();
  }

  async function resendSummary() {
    setError("");
    setMessage("");

    try {
      await navigator.clipboard.writeText(summary);
      setMessage("Resumo copiado para a área de transferência.");
    } catch {
      setMessage("");
    }

    const phone = order.customerPhone?.replace(/\D/g, "") || storeWhatsapp?.replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(summary)}`
      : `https://wa.me/?text=${encodeURIComponent(summary)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <li id={`order-${order.id}`} className="admin-card scroll-mt-24 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="font-mono text-sm text-[#14532d] dark:text-zinc-300">
            #{order.id.slice(-8)}
          </span>
          {order.customerName && (
            <p className="mt-0.5 text-sm text-[#6b7280] dark:text-zinc-400">
              {order.customerName}
              {order.customerPhone ? ` · ${order.customerPhone}` : ""}
            </p>
          )}
        </div>
        <span className="rounded-full bg-[#e4ebe0] px-2.5 py-1 text-xs font-medium text-[#14532d] dark:bg-zinc-800 dark:text-zinc-200">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <p className="mt-2 font-bold text-emerald-700 dark:text-emerald-400">
        {formatPrice(order.totalCents)}
      </p>

      <ul className="mt-2 space-y-1 text-sm text-[#6b7280] dark:text-zinc-400">
        {order.items.map((item) => {
          const options = parseOrderOptions(item.optionsJson);
          return (
            <li key={item.id}>
              {item.quantity}x {item.productName}
              {options && (
                <span className="block text-xs text-[#6b7280]/80 dark:text-zinc-500">
                  {[
                    options.fragranceLabel && `Fragrância: ${options.fragranceLabel}`,
                    options.colorLabel && `Cor: ${options.colorLabel}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {order.payment && (
        <p className="mt-2 text-xs text-[#6b7280] dark:text-zinc-500">
          Pagamento: {order.payment.status} | {order.payment.provider}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {canDeliver && (
          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={() => runAction("deliver")}
            className="admin-btn-primary min-h-[2.75rem] px-3 py-2 text-xs md:min-h-0"
          >
            {loadingAction === "deliver" ? "Salvando..." : "Marcar entregue"}
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={() => runAction("cancel")}
            className="min-h-[2.75rem] rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 md:min-h-0 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            {loadingAction === "cancel" ? "Cancelando..." : "Cancelar"}
          </button>
        )}
        <button
          type="button"
          onClick={resendSummary}
          className="admin-btn-secondary min-h-[2.75rem] px-3 py-2 text-xs md:min-h-0"
        >
          Reenviar resumo
        </button>
      </div>

      {message && (
        <p className="mt-3 text-xs text-emerald-700 dark:text-emerald-400">{message}</p>
      )}
      {error && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </li>
  );
}
