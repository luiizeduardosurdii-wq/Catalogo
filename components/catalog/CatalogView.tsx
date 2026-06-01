"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard, type CatalogProduct } from "@/components/ProductCard";
import { CartDrawer, type CartItem } from "@/components/CartDrawer";
import { CartBar } from "@/components/CartBar";

type Category = { id: string; name: string; slug: string };

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

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
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

  function buildWhatsAppMessage() {
    const lines = cart.map(
      (i) =>
        `• ${i.quantity}x ${i.product.name} - ${(i.product.priceCents * i.quantity / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
    );
    return encodeURIComponent(
      `Olá! Gostaria de pedir:\n\n${lines.join("\n")}\n\n*Total: ${(cartTotal / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}*`
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

  const hasCart = cartCount > 0;

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <p className="text-zinc-600">Preparando catálogo…</p>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen bg-zinc-50 ${hasCart ? "pb-36" : "pb-4"}`}
    >
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-2 px-4 pt-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-zinc-900">
              {storeName}
            </h1>
            <p className="text-sm text-zinc-500">Catálogo online</p>
          </div>
          {hasCart && (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex shrink-0 flex-col items-center rounded-2xl border-2 border-emerald-600 bg-emerald-50 px-3 py-2 touch-manipulation active:bg-emerald-100"
              aria-label="Abrir carrinho"
            >
              <span className="text-lg leading-none" aria-hidden>
                🛒
              </span>
              <span className="mt-0.5 text-[10px] font-bold uppercase text-emerald-800">
                Carrinho
              </span>
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            </button>
          )}
        </div>

        <div className="px-4 pb-3 pt-3">
          <input
            type="search"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-base"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setCategoryId(null)}
            className={`shrink-0 touch-manipulation rounded-full px-4 py-2.5 text-sm font-medium ${
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
              className={`shrink-0 touch-manipulation rounded-full px-4 py-2.5 text-sm font-medium ${
                categoryId === c.id
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </header>

      {toast && (
        <div
          className="fixed left-4 right-4 top-20 z-40 mx-auto max-w-md"
          role="status"
        >
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex w-full items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-600 px-4 py-3 text-left text-white shadow-lg touch-manipulation"
          >
            <span className="text-sm font-medium">✓ {toast}</span>
            <span className="shrink-0 rounded-lg bg-white/20 px-3 py-1 text-xs font-bold">
              Ver carrinho →
            </span>
          </button>
        </div>
      )}

      <main className="relative z-10 grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAdd={addToCart}
            inCartQty={qtyByProduct[p.id] ?? 0}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-zinc-500">
            Nenhum produto encontrado
          </p>
        )}
      </main>

      <CartBar
        itemCount={cartCount}
        totalCents={cartTotal}
        onOpen={() => setCartOpen(true)}
      />

      <CartDrawer
        items={cart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateQty}
        onWhatsApp={openWhatsApp}
        onCheckout={goCheckout}
        paymentsEnabled={paymentsEnabled}
      />
    </div>
  );
}
