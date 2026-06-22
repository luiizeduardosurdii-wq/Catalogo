"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { splitProductDescription } from "@/lib/productDisplay";
import {
  formatCartCustomizationSummary,
  isSoapProduct,
  type CustomizationOption,
} from "@/lib/customization";
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
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-light/60 ring-1 ring-brand/15">
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
        <div className="flex h-full items-center justify-center text-xl text-brand/30">
          🌿
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

function CustomizationSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: CustomizationOption[];
  onChange: (id: string, optionLabel: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-[#6B7280]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => {
          const selected = options.find((o) => o.id === e.target.value);
          if (selected) onChange(selected.id, selected.label);
        }}
        className="w-full rounded-xl border border-brand/15 bg-brand-cream px-2.5 py-1.5 text-xs text-brand-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.type === "COLOR" && option.hexColor
              ? `● ${option.label}`
              : option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CartLineItem({
  item,
  fragrances,
  colors,
  onUpdateQty,
  onUpdateNotes,
  onUpdateCustomization,
  onRemove,
}: {
  item: CartItem;
  fragrances: CustomizationOption[];
  colors: CustomizationOption[];
  onUpdateQty: (lineKey: string, qty: number) => void;
  onUpdateNotes: (lineKey: string, notes: string) => void;
  onUpdateCustomization: (
    lineKey: string,
    patch: {
      fragranceId?: string;
      fragranceLabel?: string;
      colorId?: string;
      colorLabel?: string;
    }
  ) => void;
  onRemove: (lineKey: string) => void;
}) {
  const { sizeLabel } = splitProductDescription(item.product.description);
  const lineTotal = item.product.priceCents * item.quantity;
  const isSoap = isSoapProduct(item.product.categorySlug);
  const customizationSummary = formatCartCustomizationSummary(item);
  const selectedColor = colors.find((c) => c.id === item.colorId);

  return (
    <li className="rounded-2xl border border-brand/10 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
      <div className="flex gap-3">
        <CartProductThumb
          imageUrl={item.product.imageUrl}
          name={item.product.name}
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-brand-dark">
            {item.product.name}
          </p>
          {sizeLabel && (
            <p className="mt-0.5 text-xs text-[#6B7280]">{sizeLabel}</p>
          )}
          {customizationSummary && (
            <p className="mt-1 text-xs font-medium text-brand">
              {customizationSummary}
            </p>
          )}
          <p className="mt-1 text-sm text-[#6B7280]">
            {formatPrice(item.product.priceCents)}
            {item.quantity > 1 && (
              <span className="text-[#6B7280]/70"> × {item.quantity}</span>
            )}
          </p>
          {item.quantity > 1 && (
            <p className="mt-0.5 text-sm font-semibold text-brand">
              Subtotal: {formatPrice(lineTotal)}
            </p>
          )}
        </div>
      </div>

      {isSoap && (fragrances.length > 0 || colors.length > 0) && (
        <div className="mt-3 space-y-2 rounded-xl border border-brand/10 bg-brand-cream/40 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand/80">
            Personalização
          </p>
          {fragrances.length > 0 && (
            <CustomizationSelect
              label="Fragrância"
              value={item.fragranceId ?? ""}
              placeholder="Selecione a fragrância"
              options={fragrances}
              onChange={(id, label) =>
                onUpdateCustomization(item.lineKey, {
                  fragranceId: id,
                  fragranceLabel: label,
                })
              }
            />
          )}
          {colors.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <CustomizationSelect
                  label="Cor"
                  value={item.colorId ?? ""}
                  placeholder="Selecione a cor"
                  options={colors}
                  onChange={(id, label) =>
                    onUpdateCustomization(item.lineKey, {
                      colorId: id,
                      colorLabel: label,
                    })
                  }
                />
              </div>
              {selectedColor?.hexColor && (
                <span
                  className="mb-0.5 h-8 w-8 shrink-0 rounded-full ring-1 ring-brand/20"
                  style={{ backgroundColor: selectedColor.hexColor }}
                  title={selectedColor.label}
                  aria-hidden
                />
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-3">
        <label
          htmlFor={`cart-notes-${item.lineKey}`}
          className="mb-1 block text-[11px] font-medium text-[#6B7280]"
        >
          Observações
        </label>
        <input
          id={`cart-notes-${item.lineKey}`}
          type="text"
          value={item.notes ?? ""}
          onChange={(e) => onUpdateNotes(item.lineKey, e.target.value)}
          placeholder="Ex.: embalagem para presente"
          className="w-full rounded-xl border border-brand/15 bg-brand-cream px-2.5 py-1.5 text-xs text-brand-dark placeholder:text-[#6B7280]/60 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-brand-dark to-brand text-lg font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95 touch-manipulation"
            onClick={() => onUpdateQty(item.lineKey, item.quantity - 1)}
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-brand-light px-2 text-base font-bold text-brand-dark ring-1 ring-brand/15">
            {item.quantity}
          </span>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-brand-dark to-brand text-lg font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 touch-manipulation"
            onClick={() => onUpdateQty(item.lineKey, item.quantity + 1)}
            disabled={item.quantity >= item.product.available}
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.lineKey)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200/80 bg-red-50/80 text-red-600 transition-colors touch-manipulation hover:bg-red-100 active:bg-red-200"
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
  fragrances,
  colors,
  cartError,
  onUpdateQty,
  onUpdateNotes,
  onUpdateCustomization,
  onRemove,
  onCheckout,
  onWhatsApp,
  paymentsEnabled,
  onClose,
  onBrowseProducts,
}: {
  items: CartItem[];
  fragrances: CustomizationOption[];
  colors: CustomizationOption[];
  cartError: string;
  onUpdateQty: (lineKey: string, qty: number) => void;
  onUpdateNotes: (lineKey: string, notes: string) => void;
  onUpdateCustomization: (
    lineKey: string,
    patch: {
      fragranceId?: string;
      fragranceLabel?: string;
      colorId?: string;
      colorLabel?: string;
    }
  ) => void;
  onRemove: (lineKey: string) => void;
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
    <div className="flex h-full flex-col bg-gradient-to-b from-brand-cream via-white to-brand-light/40">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-brand/10 bg-brand-cream/80 px-4 py-4 backdrop-blur-md">
        <div>
          <h2 className="text-base font-bold text-brand-dark">Carrinho</h2>
          <p className="text-xs text-[#6B7280]">
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/15 bg-white/80 text-brand-dark transition-colors hover:bg-brand-light/50 touch-manipulation"
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
            <p className="mt-4 text-base font-semibold text-brand-dark">
              Seu carrinho está vazio
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              Adicione alguns produtos para começar.
            </p>
            <button
              type="button"
              onClick={onBrowseProducts}
              className="mt-6 rounded-2xl bg-gradient-to-r from-brand-dark to-brand px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(14,159,110,0.28)] touch-manipulation"
            >
              Ver Produtos
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <CartLineItem
                key={item.lineKey}
                item={item}
                fragrances={fragrances}
                colors={colors}
                onUpdateQty={onUpdateQty}
                onUpdateNotes={onUpdateNotes}
                onUpdateCustomization={onUpdateCustomization}
                onRemove={onRemove}
              />
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div
          className="shrink-0 space-y-3 border-t border-brand/10 bg-brand-cream/90 p-4 backdrop-blur-md"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {cartError && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 ring-1 ring-red-100">
              {cartError}
            </p>
          )}

          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span>Subtotal</span>
              <span className="font-medium text-brand-dark">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="border-t border-dashed border-brand/15" />
            <div className="flex items-center justify-between font-bold text-brand-dark">
              <span>Total</span>
              <span className="text-base">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onWhatsApp}
            className="w-full rounded-2xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-[0_6px_20px_rgba(37,211,102,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#20bd5a] active:scale-[0.98] touch-manipulation"
          >
            Finalizar Pedido no WhatsApp
          </button>
          {paymentsEnabled && onCheckout && (
            <button
              type="button"
              onClick={onCheckout}
              className="w-full rounded-2xl border-2 border-brand bg-white py-2.5 text-sm font-semibold text-brand-dark transition-colors touch-manipulation hover:bg-brand-light/50"
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
  fragrances,
  colors,
  cartError,
  onUpdateQty,
  onUpdateNotes,
  onUpdateCustomization,
  onRemove,
  onCheckout,
  onWhatsApp,
  paymentsEnabled,
  open,
  onOpenChange,
}: {
  items: CartItem[];
  fragrances: CustomizationOption[];
  colors: CustomizationOption[];
  cartError: string;
  onUpdateQty: (lineKey: string, qty: number) => void;
  onUpdateNotes: (lineKey: string, notes: string) => void;
  onUpdateCustomization: (
    lineKey: string,
    patch: {
      fragranceId?: string;
      fragranceLabel?: string;
      colorId?: string;
      colorLabel?: string;
    }
  ) => void;
  onRemove: (lineKey: string) => void;
  onCheckout?: () => void;
  onWhatsApp: () => void;
  paymentsEnabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [visible, setVisible] = useState(open);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setIsExiting(false);
      setVisible(true);
      return;
    }

    if (!visible) return;

    setIsExiting(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      setIsExiting(false);
    }, 380);

    return () => window.clearTimeout(timer);
  }, [open, visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, onOpenChange]);

  if (!visible) return null;

  const backdropAnimation = isExiting
    ? "animate-cart-backdrop-out motion-reduce:animate-none"
    : "animate-cart-backdrop-in motion-reduce:animate-none";

  const panelAnimation = isExiting
    ? "animate-cart-slide-out motion-reduce:animate-none"
    : "animate-cart-slide-in motion-reduce:animate-none";

  return (
    <div
      className="fixed inset-0 z-[110] overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-brand-dark/35 backdrop-blur-sm ${backdropAnimation}`}
        onClick={() => onOpenChange(false)}
        aria-label="Fechar carrinho"
      />
      <div className="absolute inset-y-0 right-0 w-[min(360px,92vw)] overflow-hidden">
        <div
          className={`flex h-full w-full flex-col border-l border-white/60 shadow-2xl ${panelAnimation}`}
        >
          <CartPanel
            items={items}
            fragrances={fragrances}
            colors={colors}
            cartError={cartError}
            onUpdateQty={onUpdateQty}
            onUpdateNotes={onUpdateNotes}
            onUpdateCustomization={onUpdateCustomization}
            onRemove={onRemove}
            onCheckout={onCheckout}
            onWhatsApp={onWhatsApp}
            paymentsEnabled={paymentsEnabled}
            onClose={() => onOpenChange(false)}
            onBrowseProducts={() => onOpenChange(false)}
          />
        </div>
      </div>
    </div>
  );
}
