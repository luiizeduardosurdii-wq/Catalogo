"use client";

import type { CatalogProduct } from "@/components/ProductCard";
import { formatPrice } from "@/lib/format";
import Image from "next/image";

function getThumb(imageUrl: string | null) {
  if (!imageUrl) return null;
  return imageUrl;
}

type CatalogFeaturedSectionProps = {
  products: CatalogProduct[];
  onSelect: (product: CatalogProduct) => void;
};

export function CatalogFeaturedSection({
  products,
  onSelect,
}: CatalogFeaturedSectionProps) {
  if (products.length === 0) return null;

  return (
    <section
      aria-label="Destaques da loja"
      className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-brand-cream via-white to-brand-light/60 p-4 shadow-[0_4px_6px_rgba(20,83,45,0.04),0_16px_40px_rgba(14,159,110,0.07)] sm:p-5"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand/10 blur-2xl"
        aria-hidden
      />
      <div className="relative mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            Destaques
          </p>
          <h2 className="text-lg font-bold text-brand-dark sm:text-xl">
            Mais pedidos
          </h2>
        </div>
        <span className="rounded-full border border-brand/15 bg-white/80 px-3 py-1 text-[11px] font-semibold text-brand-dark">
          Escolhas da loja
        </span>
      </div>

      <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {products.map((product) => {
          const thumb = getThumb(product.imageUrl);
          const isPhoto = thumb?.startsWith("/uploads/");

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-brand/10 bg-white/90 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_12px_28px_rgba(14,159,110,0.12)] touch-manipulation"
            >
              <div className="relative aspect-square overflow-hidden bg-brand-light/50">
                {isPhoto && thumb ? (
                  <Image
                    src={thumb}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    unoptimized
                  />
                ) : thumb ? (
                  <div className="flex h-full items-center justify-center p-4">
                    <Image
                      src={thumb}
                      alt=""
                      width={56}
                      height={56}
                      className="opacity-60"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl opacity-40">
                    🌿
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="line-clamp-2 text-xs font-semibold leading-snug text-brand-dark group-hover:text-brand">
                  {product.name}
                </p>
                <p className="mt-auto text-sm font-bold text-brand-dark">
                  {formatPrice(product.priceCents)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
