"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard, type CatalogProduct } from "@/components/ProductCard";
import { CartSidebar } from "@/components/CartSidebar";
import { CatalogHero } from "@/components/catalog/CatalogHero";
import { CatalogFiltersBar } from "@/components/catalog/CatalogFiltersBar";
import { FloatingCartButton } from "@/components/catalog/FloatingCartButton";
import { FloatingWhatsAppButton } from "@/components/catalog/FloatingWhatsAppButton";
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal";
import { CatalogFeaturedSection } from "@/components/catalog/CatalogFeaturedSection";
import { CatalogEmptyState } from "@/components/catalog/CatalogEmptyState";
import { formatPrice } from "@/lib/format";
import { loadCart, saveCart } from "@/lib/cartStorage";
import type { CartItem } from "@/components/CartDrawer";

import {
  CatalogCategorySection,
  CatalogProductsShell,
} from "@/components/catalog/CatalogCategorySection";

type Category = { id: string; name: string; slug: string };

const GRID_CLASS =
  "grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4";

function pickFeaturedProducts(
  products: CatalogProduct[],
  categories: Category[]
): CatalogProduct[] {
  const inStock = products.filter((p) => p.stockStatus !== "out_of_stock");
  const picked: CatalogProduct[] = [];

  for (const cat of categories) {
    const match = inStock.find((p) => p.categoryId === cat.id);
    if (match && !picked.some((x) => x.id === match.id)) {
      picked.push(match);
    }
  }

  for (const product of inStock) {
    if (picked.length >= 4) break;
    if (!picked.some((x) => x.id === product.id)) {
      picked.push(product);
    }
  }

  return picked.slice(0, 4);
}

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
  const [detailProduct, setDetailProduct] = useState<CatalogProduct | null>(
    null
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCart(loadCart(storeSlug, products));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carregar uma vez por loja
  }, [storeSlug]);

  useEffect(() => {
    if (!ready) return;
    saveCart(storeSlug, cart);
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
    if (categoryId || search) return null;
    const groups: { category: Category; products: CatalogProduct[] }[] = [];
    for (const cat of categories) {
      const catProducts = filtered.filter((p) => p.categoryId === cat.id);
      if (catProducts.length > 0) {
        groups.push({ category: cat, products: catProducts });
      }
    }
    return groups;
  }, [filtered, categories, categoryId, search]);

  const featuredProducts = useMemo(
    () => pickFeaturedProducts(products, categories),
    [products, categories]
  );

  const showFeatured =
    !categoryId && !search.trim() && featuredProducts.length > 0;

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
  }

  function addToCartFromDetail(product: CatalogProduct) {
    addToCart(product);
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
            onOpen={setDetailProduct}
            inCartQty={qtyByProduct[p.id] ?? 0}
          />
        ))}
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="catalog-page flex min-h-screen items-center justify-center p-6">
        <p className="text-zinc-600">Preparando catálogo…</p>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <FloatingCartButton
        itemCount={cartItemCount}
        onOpen={() => setCartOpen(true)}
      />

      <FloatingWhatsAppButton whatsapp={whatsapp} storeName={storeName} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <CatalogHero />

        <CatalogFiltersBar
          categories={categories}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          search={search}
          onSearchChange={setSearch}
          searchOpen={searchOpen}
          onSearchOpenChange={setSearchOpen}
        />

        <main
          id="catalog-products"
          className="relative isolate flex-1 scroll-mt-4 px-2 pb-24 pt-3 sm:px-4 sm:pb-28"
        >
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-beige via-brand-cream to-brand-light/70"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-brand/5 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-12 bottom-32 h-48 w-48 rounded-full bg-brand-light blur-3xl"
            aria-hidden
          />

          <div className="space-y-6 sm:space-y-8">
            {showFeatured && (
              <CatalogFeaturedSection
                products={featuredProducts}
                onSelect={setDetailProduct}
              />
            )}

            {filtered.length === 0 ? (
              <CatalogEmptyState
                categories={categories}
                hasSearch={Boolean(search.trim())}
                hasCategoryFilter={Boolean(categoryId)}
                onClearSearch={() => {
                  setSearch("");
                  setSearchOpen(false);
                }}
                onClearCategory={() => setCategoryId(null)}
                onSelectCategory={(id) => {
                  setCategoryId(id);
                  setSearch("");
                }}
              />
            ) : groupedByCategory ? (
              groupedByCategory.map(
                ({ category, products: catProducts }, index) => (
                  <CatalogCategorySection
                    key={category.id}
                    name={category.name}
                    slug={category.slug}
                    productCount={catProducts.length}
                    animationIndex={index}
                  >
                    {renderProductGrid(catProducts)}
                  </CatalogCategorySection>
                )
              )
            ) : (
              <CatalogProductsShell>
                {renderProductGrid(filtered)}
              </CatalogProductsShell>
            )}
          </div>
        </main>
      </div>

      <ProductDetailModal
        product={detailProduct}
        cartOpen={cartOpen}
        qtyByProduct={qtyByProduct}
        onClose={() => setDetailProduct(null)}
        onAdd={addToCartFromDetail}
      />

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
