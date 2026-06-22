"use client";

type Category = { id: string; name: string };

type CatalogEmptyStateProps = {
  categories: Category[];
  hasSearch: boolean;
  hasCategoryFilter: boolean;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onSelectCategory: (id: string) => void;
};

export function CatalogEmptyState({
  categories,
  hasSearch,
  hasCategoryFilter,
  onClearSearch,
  onClearCategory,
  onSelectCategory,
}: CatalogEmptyStateProps) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-[#ddd5c8]/70 bg-gradient-to-br from-brand-cream via-brand-warm/70 to-brand-sage/60 px-6 py-10 text-center shadow-[0_8px_30px_rgba(14,159,110,0.08)]">
      <span className="text-4xl" aria-hidden>
        🔍
      </span>
      <h2 className="mt-4 text-lg font-bold text-brand-dark">
        Nenhum produto encontrado
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
        {hasSearch
          ? "Não encontramos resultados para sua busca. Tente outro termo ou explore as categorias."
          : "Não há produtos nesta categoria no momento."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {hasSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="rounded-full border border-brand/20 bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-light/50 touch-manipulation"
          >
            Limpar busca
          </button>
        )}
        {hasCategoryFilter && (
          <button
            type="button"
            onClick={onClearCategory}
            className="rounded-full bg-gradient-to-r from-brand-dark to-brand px-4 py-2 text-sm font-semibold text-white shadow-sm touch-manipulation"
          >
            Ver todos
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div className="mt-6 border-t border-brand-light/80 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand">
            Explorar categorias
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="rounded-full border border-brand/15 bg-brand-cream/90 px-3 py-1.5 text-xs font-medium text-brand-dark transition-colors hover:border-brand/30 hover:bg-brand-light/40 touch-manipulation"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
