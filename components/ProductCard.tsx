"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { StockStatus } from "@/lib/format";
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
  const isUploadedPhoto = product.imageUrl?.startsWith("/uploads/") ?? false;

  function handleAdd() {
    if (outOfStock || !onAdd) return;
    onAdd(product);
  }

  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="relative mx-auto aspect-square w-full max-h-40 shrink-0 p-1 sm:max-h-48">
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-zinc-50">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="pointer-events-none select-none object-contain p-1 sm:p-1.5"
              sizes="(max-width: 768px) 32vw, 180px"
              draggable={false}
              unoptimized={isUploadedPhoto}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xl text-zinc-300 pointer-events-none select-none">
              📦
            </div>
          )}
        </div>
        {inCartQty > 0 && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
            {inCartQty}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 p-2">
        <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-zinc-900">
          {product.name}
        </h3>

        <StockBadge
          status={product.stockStatus}
          available={product.available}
          compact
        />

        {product.description && (
          <p className="line-clamp-1 text-[10px] text-zinc-500">
            {product.description}
          </p>
        )}

        <p className="text-sm font-bold text-emerald-700">
          {formatPrice(product.priceCents)}
        </p>

        {onAdd && (
          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAdd}
            className="w-full rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white shadow-sm touch-manipulation select-none active:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {outOfStock
              ? "Esgotado"
              : inCartQty > 0
                ? `+ (${inCartQty})`
                : "Adicionar"}
          </button>
        )}
      </div>
    </article>
  );
}
