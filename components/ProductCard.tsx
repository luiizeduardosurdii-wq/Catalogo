"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { StockStatus } from "@/lib/format";
import { splitProductDescription } from "@/lib/productDisplay";
import { StockBadge } from "./StockBadge";

export type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  stockStatus: StockStatus;
  available: number;
};

type ImageKind = "photo" | "icon" | "none";

function getImageKind(imageUrl: string | null): ImageKind {
  if (!imageUrl) return "none";
  if (imageUrl.startsWith("/uploads/")) return "photo";
  return "icon";
}

function ProductImagePlaceholder({ kind }: { kind: "icon" | "none" }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-cream via-brand-light/80 to-brand-beige">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,159,110,0.08),transparent_55%)]" />
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent motion-reduce:animate-none" />
      {kind === "none" ? (
        <span className="relative text-4xl opacity-40">🌿</span>
      ) : (
        <div className="relative h-10 w-10 rounded-full border-2 border-brand/20 border-t-brand animate-spin motion-reduce:animate-none" />
      )}
    </div>
  );
}

export function ProductCard({
  product,
  onAdd,
  onOpen,
  inCartQty = 0,
}: {
  product: CatalogProduct;
  onAdd?: (product: CatalogProduct) => void;
  onOpen?: (product: CatalogProduct) => void;
  inCartQty?: number;
}) {
  const outOfStock = product.stockStatus === "out_of_stock";
  const imageKind = getImageKind(product.imageUrl);
  const { subtitle, sizeLabel } = splitProductDescription(product.description);

  function handleAdd() {
    if (outOfStock || !onAdd) return;
    onAdd(product);
  }

  function handleOpen() {
    onOpen?.(product);
  }

  return (
    <article className="catalog-product-card group relative flex flex-col overflow-hidden rounded-[22px] border border-[#d8cfc0]/75 bg-[#f8f5ef]/95 shadow-[0_8px_24px_rgba(20,83,45,0.07),0_22px_55px_rgba(14,159,110,0.06)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-brand/22 hover:shadow-[0_18px_34px_rgba(20,83,45,0.09),0_30px_70px_rgba(14,159,110,0.11)] sm:rounded-3xl">
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[22px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-3xl bg-gradient-to-br from-brand-cream/50 via-transparent to-brand/5"
        aria-hidden
      />

      <button
        type="button"
        onClick={handleOpen}
        className="flex flex-1 flex-col text-left touch-manipulation"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <div className="relative p-2.5 pb-0 sm:p-3 sm:pb-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-brand-light/50 shadow-[inset_0_1px_8px_rgba(20,83,45,0.08)]">
            {imageKind === "photo" && product.imageUrl && (
              <>
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  draggable={false}
                  unoptimized
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark/15 via-transparent to-white/10" />
              </>
            )}

            {imageKind === "icon" && product.imageUrl && (
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-cream via-brand-light/80 to-brand-beige transition-colors duration-300 group-hover:from-[#F0FDF4] group-hover:to-brand-light">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,159,110,0.1),transparent_55%)]" />
                <Image
                  src={product.imageUrl}
                  alt=""
                  width={80}
                  height={80}
                  className="relative opacity-55 transition-all duration-300 group-hover:scale-105 group-hover:opacity-75"
                  draggable={false}
                  unoptimized
                />
              </div>
            )}

            {imageKind === "none" && <ProductImagePlaceholder kind="none" />}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="absolute left-2 top-2 z-20">
              <StockBadge
                status={product.stockStatus}
                available={product.available}
                compact
                overlay
              />
            </div>

            {inCartQty > 0 && (
              <span className="absolute right-2 top-2 z-20 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_4px_12px_rgba(14,159,110,0.35)] lg:px-2.5">
                <span className="lg:hidden">{inCartQty}</span>
                <span className="hidden lg:inline">{inCartQty} no carrinho</span>
              </span>
            )}
          </div>
        </div>

        <div className="relative flex flex-col gap-1.5 p-3.5 pt-3 sm:p-4 sm:pt-3.5">
          <h3 className="line-clamp-3 text-[0.875rem] font-bold leading-snug tracking-[-0.01em] text-brand-dark transition-colors duration-200 group-hover:text-brand lg:line-clamp-2 lg:text-[0.95rem]">
            {product.name}
          </h3>

          {subtitle && (
            <p className="line-clamp-2 text-xs leading-relaxed text-[#59645d]">
              {subtitle}
            </p>
          )}

          {sizeLabel && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#59645d]/80">
              {sizeLabel}
            </p>
          )}

          <div className="mt-auto flex items-end justify-between gap-2 border-t border-brand-light/80 pt-3">
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-brand/80 lg:inline">
              Valor
            </span>
            <p className="text-lg font-extrabold tabular-nums tracking-tight text-brand-dark sm:text-xl">
              {formatPrice(product.priceCents)}
            </p>
          </div>
        </div>
      </button>

      {onAdd && (
        <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4">
          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAdd}
            className="w-full min-h-[2.85rem] rounded-2xl bg-gradient-to-r from-brand-dark to-brand py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(14,159,110,0.26)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:from-[#0b8a5f] hover:to-[#12b981] hover:shadow-[0_12px_30px_rgba(14,159,110,0.36)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-zinc-300 disabled:to-zinc-300 disabled:text-zinc-500 disabled:shadow-none touch-manipulation select-none"
          >
            {outOfStock ? (
              "Indisponível"
            ) : (
              <>
                <span className="lg:hidden">
                  {inCartQty > 0 ? `Adicionar (${inCartQty})` : "Adicionar"}
                </span>
                <span className="hidden lg:inline">
                  {inCartQty > 0
                    ? `Adicionar ao carrinho (${inCartQty})`
                    : "Adicionar ao carrinho"}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </article>
  );
}
