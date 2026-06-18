"use client";

const BENEFITS = [
  "Ingredientes naturais",
  "Fragrâncias exclusivas",
  "Entrega rápida",
] as const;

export function CatalogHero() {
  function scrollToProducts() {
    document
      .getElementById("catalog-products")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      aria-label="Destaque do catálogo"
      className="catalog-hero relative mx-2 mt-3 sm:mx-4"
    >
      <div className="relative z-10 flex min-h-[200px] flex-col justify-center px-5 py-6 sm:min-h-[280px] sm:px-8 sm:py-8">
        <h2 className="max-w-sm text-xl font-bold leading-tight tracking-tight text-[#14532D] sm:text-2xl">
          🌿 Sabonetes Artesanais Feitos à Mão
        </h2>

        <ul className="mt-3 space-y-1">
          {BENEFITS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm text-[#6B7280] sm:text-base"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0E9F6E]"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={scrollToProducts}
          className="mt-5 w-fit rounded-xl bg-[#0E9F6E] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors touch-manipulation hover:bg-[#0b8a5f] active:bg-[#14532D] sm:px-6 sm:py-3 sm:text-base"
        >
          Comprar Agora
        </button>
      </div>
    </section>
  );
}
