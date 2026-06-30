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
  buildCartLineKey,
  formatCartCustomizationSummary,
  type CustomizationOption,
} from "@/lib/customization";

import {
  CatalogCategorySection,
  CatalogProductsShell,
} from "@/components/catalog/CatalogCategorySection";

type Category = { id: string; name: string; slug: string };

const GRID_CLASS =
  "grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5";

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

function createCartItem(product: CatalogProduct, quantity = 1): CartItem {
  return {
    lineKey: buildCartLineKey(product.id),
    product,
    quantity,
  };
}

function mergeCartItems(items: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of items) {
    const existing = map.get(item.lineKey);
    if (!existing) {
      map.set(item.lineKey, item);
      continue;
    }
    map.set(item.lineKey, {
      ...existing,
      quantity: Math.min(
        existing.quantity + item.quantity,
        item.product.available
      ),
      notes: existing.notes || item.notes,
    });
  }
  return Array.from(map.values());
}

export function CatalogView({
  storeName,
  storeSlug,
  whatsapp,
  categories,
  products,
  customizationOptions,
  paymentsEnabled,
}: {
  storeName: string;
  storeSlug: string;
  whatsapp: string | null;
  categories: Category[];
  products: CatalogProduct[];
  customizationOptions: CustomizationOption[];
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
  const [cartError, setCartError] = useState("");

  const fragrances = useMemo(
    () => customizationOptions.filter((o) => o.type === "FRAGRANCE"),
    [customizationOptions]
  );
  const colors = useMemo(
    () => customizationOptions.filter((o) => o.type === "COLOR"),
    [customizationOptions]
  );

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
      map[item.product.id] = (map[item.product.id] ?? 0) + item.quantity;
    }
    return map;
  }, [cart]);

  const cartItemCount = cart.reduce((s, i) => s + i.quantity, 0);

  function addToCart(product: CatalogProduct) {
    setCartError("");
    setCart((prev) => {
      const lineKey = buildCartLineKey(product.id);
      const existing = prev.find((i) => i.lineKey === lineKey);
      if (existing) {
        if (existing.quantity >= product.available) return prev;
        return prev.map((i) =>
          i.lineKey === lineKey ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, createCartItem(product)];
    });
  }

  function addToCartFromDetail(product: CatalogProduct) {
    addToCart(product);
    setCartOpen(true);
  }

  function updateQty(lineKey: string, qty: number) {
    setCartError("");
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.lineKey !== lineKey));
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.lineKey === lineKey ? { ...i, quantity: qty } : i
      )
    );
  }

  function updateNotes(lineKey: string, notes: string) {
    setCart((prev) =>
      prev.map((i) =>
        i.lineKey === lineKey ? { ...i, notes: notes || undefined } : i
      )
    );
  }

  function updateCustomization(
    lineKey: string,
    patch: {
      fragranceId?: string;
      fragranceLabel?: string;
      colorId?: string;
      colorLabel?: string;
    }
  ) {
    setCartError("");
    setCart((prev) => {
      const item = prev.find((i) => i.lineKey === lineKey);
      if (!item) return prev;

      const next = {
        fragranceId:
          patch.fragranceId !== undefined ? patch.fragranceId : item.fragranceId,
        fragranceLabel:
          patch.fragranceLabel !== undefined
            ? patch.fragranceLabel
            : item.fragranceLabel,
        colorId: patch.colorId !== undefined ? patch.colorId : item.colorId,
        colorLabel:
          patch.colorLabel !== undefined ? patch.colorLabel : item.colorLabel,
      };
      const newLineKey = buildCartLineKey(item.product.id, next);

      if (newLineKey === lineKey) {
        return prev.map((i) =>
          i.lineKey === lineKey ? { ...i, ...next } : i
        );
      }

      const withoutCurrent = prev.filter((i) => i.lineKey !== lineKey);
      const existing = withoutCurrent.find((i) => i.lineKey === newLineKey);

      if (existing) {
        return mergeCartItems([
          ...withoutCurrent.filter((i) => i.lineKey !== newLineKey),
          {
            ...existing,
            quantity: Math.min(
              existing.quantity + item.quantity,
              item.product.available
            ),
            notes: existing.notes || item.notes,
          },
        ]);
      }

      return [...withoutCurrent, { ...item, ...next, lineKey: newLineKey }];
    });
  }

  function removeFromCart(lineKey: string) {
    setCartError("");
    setCart((prev) => prev.filter((i) => i.lineKey !== lineKey));
  }

  function validateCartForCheckout() {
    for (const item of cart) {
      if (fragrances.length > 0 && !item.fragranceId) {
        return "Selecione a fragrância de todos os produtos no carrinho.";
      }
      if (colors.length > 0 && !item.colorId) {
        return "Selecione a cor de todos os produtos no carrinho.";
      }
    }
    return "";
  }

  function formatCartLine(item: CartItem) {
    const customization = formatCartCustomizationSummary(item);
    const base = `• ${item.quantity}x ${item.product.name}`;
    const details = customization ? `\n  _${customization}_` : "";
    const notes = item.notes?.trim()
      ? `\n  _Obs.: ${item.notes.trim()}_`
      : "";
    return `${base} - ${formatPrice(item.product.priceCents * item.quantity)}${details}${notes}`;
  }

  function buildWhatsAppMessage() {
    const lines = cart.map(formatCartLine);
    return encodeURIComponent(
      `Olá! Gostaria de pedir:\n\n${lines.join("\n")}\n\n*Total: ${formatPrice(cartTotal)}*`
    );
  }

  function openWhatsApp() {
    const error = validateCartForCheckout();
    if (error) {
      setCartError(error);
      return;
    }
    setCartError("");
    const phone = whatsapp?.replace(/\D/g, "") ?? "";
    const text = buildWhatsAppMessage();
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  }

  function goCheckout() {
    const error = validateCartForCheckout();
    if (error) {
      setCartError(error);
      return;
    }
    setCartError("");
    const items = cart.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
      fragranceId: i.fragranceId,
      fragranceLabel: i.fragranceLabel,
      colorId: i.colorId,
      colorLabel: i.colorLabel,
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
      <div className="catalog-page__atmosphere" aria-hidden>
        <div className="catalog-page__texture" />
        <div className="catalog-page__blob catalog-page__blob--cream" />
        <div className="catalog-page__blob catalog-page__blob--sage" />
        <div className="catalog-page__blob catalog-page__blob--beige" />
        <div className="catalog-page__blob catalog-page__blob--green" />
        <div className="catalog-page__leaf catalog-page__leaf--tl" />
        <div className="catalog-page__leaf catalog-page__leaf--tr" />
        <div className="catalog-page__leaf catalog-page__leaf--bl" />
        <div className="catalog-page__lavender catalog-page__lavender--1" />
        <div className="catalog-page__lavender catalog-page__lavender--2" />
        <div className="catalog-page__flower catalog-page__flower--1" />
      </div>

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
          className="catalog-showcase relative isolate flex-1 scroll-mt-4"
        >
          <div
            className="catalog-showcase__glow catalog-showcase__glow--left"
            aria-hidden
          />
          <div
            className="catalog-showcase__glow catalog-showcase__glow--right"
            aria-hidden
          />

          <div className="catalog-showcase__inner">
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
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
        fragrances={fragrances}
        colors={colors}
        cartError={cartError}
        onUpdateQty={updateQty}
        onUpdateNotes={updateNotes}
        onUpdateCustomization={updateCustomization}
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
