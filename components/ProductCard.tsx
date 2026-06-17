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
  stockStatus: StockStatus;
  available: number;
};

type ImageKind = "photo" | "icon" | "none";

function getImageKind(imageUrl: string | null): ImageKind {
  if (!imageUrl) return "none";
  if (imageUrl.startsWith("/uploads/")) return "photo";
  return "icon";
}

export function ProductCard({
  product,
  onAdd,
  inCartQty = 0,
}: {
  product: CatalogProduct;
  onAdd?: (product: CatalogProduct) => void;
  inCartQty?: number;
}) {
  const outOfStock = product.stockStatus === "out_of_stock";
  const imageKind = getImageKind(product.imageUrl);
  const { subtitle, sizeLabel } = splitProductDescription(product.description);

  function handleAdd() {
    if (outOfStock || !onAdd) return;
    onAdd(product);
  }

  return (
    <article className="catalog-card group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-zinc-100">
        {imageKind === "photo" && product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            draggable={false}
            unoptimized
          />
        )}

        {imageKind === "icon" && product.imageUrl && (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 p-8 transition-colors duration-300 group-hover:from-emerald-50/40 group-hover:to-zinc-100">
            <Image
              src={product.imageUrl}
              alt=""
              width={72}
              height={72}
              className="opacity-50 transition-opacity duration-300 group-hover:opacity-70"
              draggable={false}
              unoptimized
            />
          </div>
        )}

        {imageKind === "none" && (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 text-4xl text-zinc-300 transition-colors duration-300 group-hover:from-emerald-50/40 group-hover:to-zinc-100">
            📦
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute left-2 top-2 z-10">
          <StockBadge
            status={product.stockStatus}
            available={product.available}
            compact
            overlay
          />
        </div>

        {inCartQty > 0 && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
            {inCartQty} no carrinho
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-emerald-800">
          {product.name}
        </h3>

        {subtitle && (
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">
            {subtitle}
          </p>
        )}

        {sizeLabel && (
          <p className="text-xs font-medium text-zinc-400">{sizeLabel}</p>
        )}

        <p className="pt-1 text-lg font-bold tracking-tight text-emerald-700">
          {formatPrice(product.priceCents)}
        </p>

        {onAdd && (
          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAdd}
            className="mt-1 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors touch-manipulation select-none hover:bg-emerald-700 active:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none"
          >
            {outOfStock
              ? "Indisponível"
              : inCartQty > 0
                ? `🛒 Adicionar ao carrinho (${inCartQty})`
                : "🛒 Adicionar ao carrinho"}
          </button>
        )}
      </div>
    </article>
  );
}
