"use client";

import Image from "next/image";

const BENEFITS = [
  "Ingredientes naturais",
  "Fragrâncias exclusivas",
  "Entrega rápida",
] as const;

const DEFAULT_HERO_IMAGE = "/brand/hero-banner.png";

export function CatalogHero({
  imageUrl = DEFAULT_HERO_IMAGE,
}: {
  imageUrl?: string | null;
}) {
  function scrollToProducts() {
    document
      .getElementById("catalog-products")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      aria-label="Destaque do catálogo"
      className="relative mx-2 mt-3 overflow-hidden rounded-2xl sm:mx-4"
    >
      <div className="relative min-h-[200px] sm:min-h-[280px]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Sabonetes artesanais feitos à mão"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-emerald-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-950/55 to-emerald-900/30" />

        <div className="relative flex min-h-[200px] flex-col justify-center px-5 py-6 sm:min-h-[280px] sm:px-8 sm:py-8">
          <h2 className="max-w-sm text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
            🌿 Sabonetes Artesanais Feitos à Mão
          </h2>

          <ul className="mt-3 space-y-1">
            {BENEFITS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-emerald-50/95 sm:text-base"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={scrollToProducts}
            className="mt-5 w-fit rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-colors touch-manipulation hover:bg-emerald-400 active:bg-emerald-600 sm:px-6 sm:py-3 sm:text-base"
          >
            Comprar Agora
          </button>
        </div>
      </div>
    </section>
  );
}
