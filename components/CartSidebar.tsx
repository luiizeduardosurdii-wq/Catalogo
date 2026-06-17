"use client";

import { useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { splitProductDescription } from "@/lib/productDisplay";
import type { CartItem } from "./CartDrawer";

function CartProductThumb({
  imageUrl,
  name,
}: {
  imageUrl: string | null;
  name: string;
}) {
  const isPhoto = imageUrl?.startsWith("/uploads/") ?? false;

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200">
      {isPhoto && imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="64px"
          unoptimized
        />
      ) : imageUrl ? (
        <div className="flex h-full items-center justify-center p-2">
          <Image
            src={imageUrl}
            alt=""
            width={40}
            height={40}
            className="opacity-50"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-xl text-zinc-300">
          📦
        </div>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function CartLineItem({
  item,
  onUpdateQty,
  onUpdateNotes,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (productId: string, qty: number) => void;
  onUpdateNotes: (productId: string, notes: string) => void;
  onRemove: (productId: string) => void;
}) {
  const { sizeLabel } = splitProductDescription(item.product.description);
  const lineTotal = item.product.priceCents * item.quantity;

  return (
    <li className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
      <div className="flex gap-3">
        <CartProductThumb
          imageUrl={item.product.imageUrl}
          name={item.product.name}
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
            {item.product.name}
          </p>
          {sizeLabel && (
            <p className="mt-0.5 text-xs text-zinc-500">{sizeLabel}</p>
          )}
          <p className="mt-1 text-sm text-zinc-600">
            {formatPrice(item.product.priceCents)}
            {item.quantity > 1 && (
              <span className="text-zinc-400"> × {item.quantity}</span>
            )}
          </p>
          {item.quantity > 1 && (
            <p className="mt-0.5 text-sm font-semibold text-emerald-700">
              Subtotal: {formatPrice(lineTotal)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3">
        <label
          htmlFor={`cart-notes-${item.product.id}`}
          className="mb-1 block text-[11px] font-medium text-zinc-500"
        >
          Observações
        </label>
        <input
          id={`cart-notes-${item.product.id}`}
          type="text"
          value={item.notes ?? ""}
          onChange={(e) => onUpdateNotes(item.product.id, e.target.value)}
          placeholder="Ex.: Sem fragrância"
          className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-lg font-bold text-white shadow-sm transition-colors touch-manipulation hover:bg-emerald-700 active:bg-emerald-800"
            onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-emerald-50 px-2 text-base font-bold text-emerald-800 ring-1 ring-emerald-200">
            {item.quantity}
          </span>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-lg font-bold text-white shadow-sm transition-colors touch-manipulation hover:bg-emerald-700 active:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
            disabled={item.quantity >= item.product.available}
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.product.id)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-colors touch-manipulation hover:bg-red-100 active:bg-red-200"
          aria-label={`Remover ${item.product.name} do carrinho`}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

function CartPanel({
  items,
  onUpdateQty,
  onUpdateNotes,
  onRemove,
  onCheckout,
  onWhatsApp,
  paymentsEnabled,
  onClose,
  onBrowseProducts,
}: {
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onUpdateNotes: (productId: string, notes: string) => void;
  onRemove: (productId: string) => void;
  onCheckout?: () => void;
  onWhatsApp: () => void;
  paymentsEnabled: boolean;
  onClose: () => void;
  onBrowseProducts: () => void;
}) {
  const subtotal = items.reduce(
    (s, i) => s + i.product.priceCents * i.quantity,
    0
  );
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900">Carrinho</h2>
          <p className="text-xs text-zinc-500">
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 touch-manipulation"
          aria-label="Fechar carrinho"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <span className="text-4xl" aria-hidden>
              🛒
            </span>
            <p className="mt-4 text-base font-semibold text-zinc-800">
              Seu carrinho está vazio
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Adicione alguns produtos para começar.
            </p>
            <button
              type="button"
              onClick={onBrowseProducts}
              className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors touch-manipulation hover:bg-emerald-700"
            >
              Ver Produtos
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <CartLineItem
                key={item.product.id}
                item={item}
                onUpdateQty={onUpdateQty}
                onUpdateNotes={onUpdateNotes}
                onRemove={onRemove}
              />
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div
          className="shrink-0 space-y-3 border-t border-zinc-200 p-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="border-t border-dashed border-zinc-200" />
            <div className="flex items-center justify-between font-bold text-zinc-900">
              <span>Total</span>
              <span className="text-base">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onWhatsApp}
            className="w-full rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-sm transition-colors touch-manipulation hover:bg-[#20bd5a] active:bg-[#1da851]"
          >
            Finalizar Pedido no WhatsApp
          </button>
          {paymentsEnabled && onCheckout && (
            <button
              type="button"
              onClick={onCheckout}
              className="w-full rounded-xl border-2 border-emerald-600 bg-white py-2.5 text-sm font-semibold text-emerald-700 transition-colors touch-manipulation hover:bg-emerald-50"
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
  onUpdateNotes,
  onRemove,
  onCheckout,
  onWhatsApp,
  paymentsEnabled,
  open,
  onOpenChange,
}: {
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onUpdateNotes: (productId: string, notes: string) => void;
  onRemove: (productId: string) => void;
  onCheckout?: () => void;
  onWhatsApp: () => void;
  paymentsEnabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
        aria-label="Fechar carrinho"
      />
      <div className="absolute inset-y-0 right-0 flex w-[min(360px,92vw)] flex-col bg-white shadow-2xl transition-transform">
        <CartPanel
          items={items}
          onUpdateQty={onUpdateQty}
          onUpdateNotes={onUpdateNotes}
          onRemove={onRemove}
          onCheckout={onCheckout}
          onWhatsApp={onWhatsApp}
          paymentsEnabled={paymentsEnabled}
          onClose={() => onOpenChange(false)}
          onBrowseProducts={() => onOpenChange(false)}
        />
      </div>
    </div>
  );
}
