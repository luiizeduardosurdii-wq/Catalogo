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

  function handleAdd() {
    if (outOfStock || !onAdd) return;
    onAdd(product);
  }

  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="relative aspect-square shrink-0 bg-zinc-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover pointer-events-none select-none"
            sizes="(max-width: 768px) 50vw, 200px"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-zinc-300 pointer-events-none select-none">
            📦
          </div>
        )}
        {inCartQty > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold text-white shadow">
            {inCartQty} no carrinho
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
          {product.name}
        </h3>

        <StockBadge
          status={product.stockStatus}
          available={product.available}
          compact
        />

        {product.description && (
          <p className="line-clamp-2 text-xs text-zinc-500">
            {product.description}
          </p>
        )}

        <p className="text-base font-bold text-emerald-700">
          {formatPrice(product.priceCents)}
        </p>

        {onAdd && (
          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAdd}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md touch-manipulation select-none active:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {outOfStock ? "Esgotado" : inCartQty > 0 ? `+ Adicionar (${inCartQty})` : "Adicionar ao carrinho"}
          </button>
        )}
      </div>
    </article>
  );
}
