"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard, type CatalogProduct } from "@/components/ProductCard";
import { CartSidebar } from "@/components/CartSidebar";
import { BrandLogo } from "@/components/BrandLogo";
import { CatalogHero } from "@/components/catalog/CatalogHero";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/components/CartDrawer";

type Category = { id: string; name: string; slug: string };

const CATEGORY_ICONS: Record<string, string> = {
  sabonetes: "🧼",
  "sache-perfumado": "🌸",
  spray: "💨",
};

const GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4";

export function CatalogView({
  storeName,
  storeSlug,
  whatsapp,
  categories,
  products,
  paymentsEnabled,
}: {
  storeName: string;
  storeSlug: string;
  whatsapp: string | null;
  categories: Category[];
  products: CatalogProduct[];
  paymentsEnabled: boolean;
}) {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    try {
      const saved = sessionStorage.getItem(`cart-${storeSlug}`);
      if (saved) setCart(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, [storeSlug]);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(`cart-${storeSlug}`, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, storeSlug, ready]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = !categoryId || p.categoryId === categoryId;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      return matchCat && matchSearch;
    });
  }, [products, categoryId, search]);

  const groupedByCategory = useMemo(() => {
    if (categoryId) return null;
    const groups: { category: Category; products: CatalogProduct[] }[] = [];
    for (const cat of categories) {
      const catProducts = filtered.filter((p) => p.categoryId === cat.id);
      if (catProducts.length > 0) {
        groups.push({ category: cat, products: catProducts });
      }
    }
    return groups;
  }, [filtered, categories, categoryId]);

  const cartTotal = cart.reduce(
    (s, i) => s + i.product.priceCents * i.quantity,
    0
  );

  const qtyByProduct = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of cart) {
      map[item.product.id] = item.quantity;
    }
    return map;
  }, [cart]);

  const cartItemCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function addToCart(product: CatalogProduct) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.available) return prev;
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setToast(`${product.name} adicionado!`);
    setCartOpen(true);
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: qty } : i
      )
    );
  }

  function updateNotes(productId: string, notes: string) {
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, notes: notes || undefined } : i
      )
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function buildWhatsAppMessage() {
    const lines = cart.map((i) => {
      const line = `• ${i.quantity}x ${i.product.name} - ${formatPrice(i.product.priceCents * i.quantity)}`;
      return i.notes?.trim() ? `${line}\n  _Obs.: ${i.notes.trim()}_` : line;
    });
    return encodeURIComponent(
      `Olá! Gostaria de pedir:\n\n${lines.join("\n")}\n\n*Total: ${formatPrice(cartTotal)}*`
    );
  }

  function openWhatsApp() {
    const phone = whatsapp?.replace(/\D/g, "") ?? "";
    const text = buildWhatsAppMessage();
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  }

  function goCheckout() {
    const items = cart.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
    }));
    sessionStorage.setItem(
      `checkout-${storeSlug}`,
      JSON.stringify({ items })
    );
    window.location.href = `/s/${storeSlug}/checkout`;
  }

  function renderProductGrid(items: CatalogProduct[]) {
    return (
      <div className={GRID_CLASS}>
        {items.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAdd={addToCart}
            inCartQty={qtyByProduct[p.id] ?? 0}
          />
        ))}
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <p className="text-zinc-600">Preparando catálogo…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white shadow-sm">
          <div className="relative px-4 pb-1 pt-3">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="absolute right-4 top-3 z-10 flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors touch-manipulation hover:bg-emerald-700 active:bg-emerald-800 sm:px-4"
              aria-label={
                cartItemCount > 0
                  ? `Abrir carrinho com ${cartItemCount} itens`
                  : "Abrir carrinho"
              }
            >
              <span className="text-base leading-none" aria-hidden>
                🛒
              </span>
              <span className="hidden sm:inline">Carrinho</span>
              {cartItemCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-emerald-700">
                  {cartItemCount}
                </span>
              )}
            </button>

            <div className="logo-container">
              <BrandLogo size="hero" centered priority />
            </div>
          </div>

          <div className="border-t border-zinc-100 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => setCategoryId(null)}
                  className={`shrink-0 touch-manipulation rounded-full px-2.5 py-1 text-xs font-medium sm:px-3 sm:py-1.5 ${
                    !categoryId
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  Todos
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={`shrink-0 touch-manipulation rounded-full px-2.5 py-1 text-xs font-medium sm:px-3 sm:py-1.5 ${
                      categoryId === c.id
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSearchOpen((open) => !open)}
                aria-label={searchOpen ? "Fechar busca" : "Buscar produtos"}
                aria-expanded={searchOpen}
                className={`shrink-0 touch-manipulation rounded-full p-2 transition-colors ${
                  searchOpen || search
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
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
              <div className="mt-2 flex items-center gap-1.5">
                <input
                  type="search"
                  placeholder="Buscar produtos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Limpar busca"
                    className="shrink-0 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
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
        </header>

        <CatalogHero />

        {toast && !cartOpen && (
          <div
            className="fixed left-4 right-4 top-[22rem] z-40 mx-auto max-w-md sm:top-80"
            role="status"
          >
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-600 px-3 py-2.5 text-left text-white shadow-lg touch-manipulation"
            >
              <span className="text-xs font-medium">✓ {toast}</span>
              <span className="shrink-0 rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                Ver →
              </span>
            </button>
          </div>
        )}

        <main id="catalog-products" className="relative z-10 flex-1 scroll-mt-4 p-2 pt-3">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              Nenhum produto encontrado
            </p>
          ) : groupedByCategory ? (
            <div className="space-y-6">
              {groupedByCategory.map(({ category, products: catProducts }) => (
                <section
                  key={category.id}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-emerald-100/60 px-4 py-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm"
                      aria-hidden
                    >
                      {CATEGORY_ICONS[category.slug] ?? "📦"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold tracking-tight text-emerald-900 sm:text-lg">
                        {category.name}
                      </h2>
                      <p className="text-xs font-medium text-emerald-700/80">
                        {catProducts.length}{" "}
                        {catProducts.length === 1 ? "produto" : "produtos"}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">{renderProductGrid(catProducts)}</div>
                </section>
              ))}
            </div>
          ) : (
            renderProductGrid(filtered)
          )}
        </main>
      </div>

      <CartSidebar
        items={cart}
        onUpdateQty={updateQty}
        onUpdateNotes={updateNotes}
        onRemove={removeFromCart}
        onWhatsApp={openWhatsApp}
        onCheckout={goCheckout}
        paymentsEnabled={paymentsEnabled}
        open={cartOpen}
        onOpenChange={setCartOpen}
      />
    </div>
  );
}
