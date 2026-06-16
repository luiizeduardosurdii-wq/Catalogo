"use client";

import { useEffect } from "react";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "./CartDrawer";

function CartPanel({
  items,
  onUpdateQty,
  onCheckout,
  onWhatsApp,
  paymentsEnabled,
  onClose,
}: {
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onCheckout?: () => void;
  onWhatsApp: () => void;
  paymentsEnabled: boolean;
  onClose: () => void;
}) {
  const total = items.reduce(
    (s, i) => s + i.product.priceCents * i.quantity,
    0
  );
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-200 px-3 py-3">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Carrinho</h2>
          <p className="text-xs text-zinc-500">
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-8 min-w-8 rounded-full px-2 text-xs text-zinc-500 hover:bg-zinc-100 touch-manipulation"
          aria-label="Fechar carrinho"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {items.length === 0 ? (
          <p className="py-8 text-center text-xs text-zinc-400">
            Carrinho vazio
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.product.id}
                className="border-b border-zinc-100 pb-2 last:border-0"
              >
                <p className="line-clamp-2 text-xs font-medium text-zinc-900">
                  {item.product.name}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {formatPrice(item.product.priceCents)}
                </p>
                <div className="mt-1 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded border bg-zinc-50 text-sm touch-manipulation"
                    onClick={() =>
                      onUpdateQty(item.product.id, item.quantity - 1)
                    }
                    aria-label="Remover um"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-xs font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded border bg-zinc-50 text-sm touch-manipulation disabled:opacity-40"
                    onClick={() =>
                      onUpdateQty(item.product.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.product.available}
                    aria-label="Adicionar um"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div
          className="shrink-0 space-y-2 border-t border-zinc-200 p-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <p className="text-right text-sm font-bold text-zinc-900">
            Total: {formatPrice(total)}
          </p>
          <button
            type="button"
            onClick={onWhatsApp}
            className="w-full rounded-lg bg-[#25D366] py-2.5 text-xs font-semibold text-white touch-manipulation"
          >
            Pedir no WhatsApp
          </button>
          {paymentsEnabled && onCheckout && (
            <button
              type="button"
              onClick={onCheckout}
              className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white touch-manipulation"
            >
              Pagar com PIX
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function CartSidebar({
  items,
  onUpdateQty,
  onCheckout,
  onWhatsApp,
  paymentsEnabled,
  open,
  onOpenChange,
}: {
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onCheckout?: () => void;
  onWhatsApp: () => void;
  paymentsEnabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <>
      {/* Ícone flutuante — colapsado */}
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`fixed right-4 z-[90] flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-600 bg-emerald-600 text-white shadow-lg transition-all touch-manipulation hover:bg-emerald-700 active:scale-95 ${
          open ? "top-4 md:top-6" : "bottom-6 md:bottom-8"
        }`}
        style={{ marginBottom: open ? 0 : "env(safe-area-inset-bottom)" }}
        aria-label={
          open
            ? "Fechar carrinho"
            : `Abrir carrinho${itemCount > 0 ? ` com ${itemCount} itens` : ""}`
        }
        aria-expanded={open}
      >
        <span className="text-lg leading-none" aria-hidden>
          🛒
        </span>
        {itemCount > 0 && !open && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-emerald-700 shadow">
            {itemCount}
          </span>
        )}
      </button>

      {/* Painel expandido */}
      {open && (
        <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar carrinho"
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(300px,88vw)] flex-col bg-white shadow-2xl transition-transform">
            <CartPanel
              items={items}
              onUpdateQty={onUpdateQty}
              onCheckout={onCheckout}
              onWhatsApp={onWhatsApp}
              paymentsEnabled={paymentsEnabled}
              onClose={() => onOpenChange(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
