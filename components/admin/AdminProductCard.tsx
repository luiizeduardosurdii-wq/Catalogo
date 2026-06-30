"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, getStockStatus } from "@/lib/format";
import { StockBadge } from "@/components/StockBadge";
import { InventoryPanel } from "@/components/admin/InventoryPanel";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export type AdminProductItem = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  active: boolean;
  category: { name: string };
  inventory: {
    quantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
  } | null;
};

export function AdminProductCard({ product }: { product: AdminProductItem }) {
  const qty = product.inventory?.quantity ?? 0;
  const reserved = product.inventory?.reservedQuantity ?? 0;
  const threshold = product.inventory?.lowStockThreshold ?? 5;
  const available = Math.max(0, qty - reserved);
  const stockStatus = getStockStatus(qty, reserved, threshold);

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md dark:bg-zinc-900 dark:shadow-none dark:ring-1 dark:ring-zinc-800 dark:hover:ring-zinc-700 ${
        product.active ? "border-zinc-200 dark:border-zinc-800" : "border-zinc-200 opacity-75 dark:border-zinc-800"
      }`}
    >
      <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-zinc-300">
            📦
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-zinc-700 shadow-sm backdrop-blur-sm">
            {product.category.name}
          </span>
          {!product.active && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
              Inativo
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h2 className="line-clamp-3 font-semibold leading-snug text-zinc-900 lg:line-clamp-2 dark:text-zinc-100">
            {product.name}
          </h2>
          {product.description && (
            <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {formatPrice(product.priceCents)}
          </p>
          <StockBadge status={stockStatus} available={available} />
        </div>

        <div className="mt-auto flex gap-2">
          <Link
            href={`/admin/produtos/${product.id}`}
            className="flex min-h-[2.75rem] flex-1 items-center justify-center rounded-xl bg-emerald-600 py-2 text-center text-sm font-medium text-white hover:bg-emerald-700 lg:min-h-0"
          >
            Editar
          </Link>
          <DeleteProductButton
            productId={product.id}
            productName={product.name}
            compact
          />
        </div>

        <details className="group rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
          <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-zinc-600 marker:content-none dark:text-zinc-400 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between">
              Estoque: {available} disponível
              <span className="text-zinc-400 transition group-open:rotate-180">
                ▾
              </span>
            </span>
          </summary>
          <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
            <InventoryPanel
              productId={product.id}
              currentQty={qty}
              reserved={reserved}
              compact
            />
          </div>
        </details>
      </div>
    </article>
  );
}
