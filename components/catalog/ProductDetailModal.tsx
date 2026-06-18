"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { parseProductDetails } from "@/lib/productDisplay";
import { StockBadge } from "@/components/StockBadge";
import type { CatalogProduct } from "@/components/ProductCard";

const EXIT_MS = 280;

function getImageKind(imageUrl: string | null) {
  if (!imageUrl) return "none" as const;
  if (imageUrl.startsWith("/uploads/")) return "photo" as const;
  return "icon" as const;
}

function ProductDetailImage({
  product,
  imageKind,
}: {
  product: CatalogProduct;
  imageKind: "photo" | "icon" | "none";
}) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-light via-brand-cream to-brand-beige p-3 sm:min-h-0 sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,159,110,0.1),transparent_60%)]" />

      {imageKind === "photo" && product.imageUrl && (
        <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl shadow-[0_8px_28px_rgba(14,159,110,0.15)] ring-1 ring-white/70 sm:max-w-[300px]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 45vw, 300px"
            priority
            unoptimized
          />
        </div>
      )}

      {imageKind === "icon" && product.imageUrl && (
        <div className="relative flex aspect-square w-full max-w-[220px] items-center justify-center rounded-2xl bg-white/60 ring-1 ring-brand/10 sm:max-w-[240px]">
          <Image
            src={product.imageUrl}
            alt=""
            width={112}
            height={112}
            className="opacity-70"
            unoptimized
          />
        </div>
      )}

      {imageKind === "none" && (
        <div className="flex aspect-square w-full max-w-[200px] items-center justify-center rounded-2xl bg-white/50 text-5xl opacity-40 ring-1 ring-brand/10 sm:max-w-[220px]">
          🌿
        </div>
      )}

      <div className="absolute left-3 top-3 z-10">
        <StockBadge
          status={product.stockStatus}
          available={product.available}
          compact
          overlay
        />
      </div>
    </div>
  );
}

type ProductDetailModalProps = {
  product: CatalogProduct | null;
  qtyByProduct: Record<string, number>;
  cartOpen?: boolean;
  onClose: () => void;
  onAdd: (product: CatalogProduct) => void;
};

export function ProductDetailModal({
  product,
  qtyByProduct,
  cartOpen = false,
  onClose,
  onAdd,
}: ProductDetailModalProps) {
  const [displayProduct, setDisplayProduct] = useState<CatalogProduct | null>(
    product
  );
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (product) {
      setIsExiting(false);
      setDisplayProduct(product);
      return;
    }

    if (!displayProduct) return;

    setIsExiting(true);
    const timer = window.setTimeout(() => {
      setDisplayProduct(null);
      setIsExiting(false);
    }, EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [product, displayProduct]);

  useEffect(() => {
    if (!displayProduct) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !cartOpen) onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [displayProduct, onClose, cartOpen]);

  if (!displayProduct) return null;

  const outOfStock = displayProduct.stockStatus === "out_of_stock";
  const imageKind = getImageKind(displayProduct.imageUrl);
  const inCartQty = qtyByProduct[displayProduct.id] ?? 0;
  const { sizeLabel, fragrance, ingredients, detailsText } =
    parseProductDetails(displayProduct.description, displayProduct.name);

  const cardAnimation = isExiting
    ? "animate-product-modal-out motion-reduce:animate-none"
    : "animate-product-modal-in motion-reduce:animate-none";

  const backdropAnimation = isExiting
    ? "animate-product-modal-backdrop-out motion-reduce:animate-none"
    : "animate-product-modal-backdrop-in motion-reduce:animate-none";

  return (
    <div
      className={`fixed inset-0 z-[130] overflow-hidden flex items-center justify-center p-3 sm:p-5 ${
        cartOpen
          ? "pointer-events-none sm:pr-[min(360px,92vw)]"
          : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
    >
      {!cartOpen && (
        <button
          type="button"
          className={`absolute inset-0 bg-brand-dark/40 backdrop-blur-sm ${backdropAnimation}`}
          onClick={onClose}
          aria-label="Fechar detalhes do produto"
        />
      )}

      <div
        className={`pointer-events-auto relative flex max-h-[90vh] w-full max-w-2xl flex-row overflow-hidden rounded-2xl border border-white/70 bg-brand-cream shadow-2xl transition-all duration-500 ease-out sm:max-h-[85vh] sm:max-w-3xl sm:rounded-3xl ${cardAnimation} ${
          cartOpen ? "shrink-0" : ""
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-brand/15 bg-white/95 text-brand-dark shadow-md backdrop-blur-sm transition-colors hover:bg-white touch-manipulation sm:right-3 sm:top-3 sm:h-9 sm:w-9"
          aria-label="Fechar"
        >
          ✕
        </button>

        <div className="w-[42%] shrink-0 border-r border-brand/10 sm:w-[46%] sm:max-w-[320px]">
          <ProductDetailImage product={displayProduct} imageKind={imageKind} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-white/95">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="rounded-2xl border border-brand/10 bg-brand-cream/50 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
                {displayProduct.categoryName}
              </p>
              <h2
                id="product-detail-title"
                className="mt-1 text-base font-bold leading-snug text-brand-dark sm:text-lg"
              >
                {displayProduct.name}
              </h2>

              {detailsText && (
                <p className="mt-2.5 text-xs leading-relaxed text-[#6B7280] sm:text-sm">
                  {detailsText}
                  {sizeLabel ? ` · ${sizeLabel}` : ""}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {sizeLabel && (
                  <span className="rounded-full border border-brand/15 bg-white px-2.5 py-0.5 text-[11px] font-medium text-brand-dark">
                    📦 {sizeLabel}
                  </span>
                )}
                {fragrance && (
                  <span className="rounded-full border border-brand/15 bg-white px-2.5 py-0.5 text-[11px] font-medium text-brand-dark">
                    🌸 {fragrance}
                  </span>
                )}
              </div>

              {ingredients.length > 0 && (
                <div className="mt-3 rounded-xl border border-brand/10 bg-white/80 p-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wide text-brand-dark">
                    Composição / detalhes
                  </h3>
                  <ul className="mt-1.5 space-y-1">
                    {ingredients.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs text-[#6B7280] sm:text-sm"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex items-end justify-between gap-2 border-t border-brand-light/80 pt-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand/80">
                    Valor
                  </p>
                  <p className="text-lg font-bold tabular-nums text-brand-dark sm:text-xl">
                    {formatPrice(displayProduct.priceCents)}
                  </p>
                </div>
                {inCartQty > 0 && (
                  <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-dark">
                    {inCartQty} no carrinho
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className="shrink-0 border-t border-brand/10 bg-brand-cream/60 p-3 backdrop-blur-sm sm:p-4"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <button
              type="button"
              disabled={outOfStock}
              onClick={() => onAdd(displayProduct)}
              className="w-full rounded-xl bg-gradient-to-r from-brand-dark to-brand py-3 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(14,159,110,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(14,159,110,0.38)] active:scale-[0.98] disabled:cursor-not-allowed disabled:from-zinc-300 disabled:to-zinc-300 disabled:text-zinc-500 disabled:shadow-none touch-manipulation"
            >
              {outOfStock
                ? "Indisponível"
                : inCartQty > 0
                  ? `Adicionar mais (${inCartQty})`
                  : "Adicionar ao carrinho"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
