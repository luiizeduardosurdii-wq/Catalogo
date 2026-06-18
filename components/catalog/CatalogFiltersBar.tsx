"use client";

type Category = { id: string; name: string; slug: string };

type CatalogFiltersBarProps = {
  categories: Category[];
  categoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
  searchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
};

export function CatalogFiltersBar({
  categories,
  categoryId,
  onCategoryChange,
  search,
  onSearchChange,
  searchOpen,
  onSearchOpenChange,
}: CatalogFiltersBarProps) {
  return (
    <div className="catalog-filters-wrapper sticky top-0 z-30">
      <nav
        aria-label="Filtros do catálogo"
        className="catalog-filters-premium catalog-filters-animate"
      >
        <div className="catalog-filters-premium__leaf catalog-filters-premium__leaf--1" aria-hidden />
        <div className="catalog-filters-premium__leaf catalog-filters-premium__leaf--2" aria-hidden />
        <div className="catalog-filters-premium__blob" aria-hidden />

        <div className="catalog-filters-premium__glass">
          <p className="catalog-filters-premium__label">Explore por categoria</p>

          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => onCategoryChange(null)}
                className={`catalog-filter-pill shrink-0 touch-manipulation ${
                  !categoryId ? "catalog-filter-pill--active" : "catalog-filter-pill--idle"
                }`}
              >
                Todos
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCategoryChange(c.id)}
                  className={`catalog-filter-pill shrink-0 touch-manipulation ${
                    categoryId === c.id
                      ? "catalog-filter-pill--active"
                      : "catalog-filter-pill--idle"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onSearchOpenChange(!searchOpen)}
              aria-label={searchOpen ? "Fechar busca" : "Buscar produtos"}
              aria-expanded={searchOpen}
              className={`catalog-filter-search shrink-0 touch-manipulation ${
                searchOpen || search ? "catalog-filter-search--active" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>

          {searchOpen && (
            <div className="catalog-filters-premium__search mt-3 flex items-center gap-1.5">
              <input
                type="search"
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
                className="catalog-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Limpar busca"
                  className="catalog-filter-search shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
