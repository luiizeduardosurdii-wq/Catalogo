import type { CartItem } from "@/components/CartDrawer";
import type { CatalogProduct } from "@/components/ProductCard";

const CART_PREFIX = "cart";

export function getCartStorageKey(storeSlug: string) {
  return `${CART_PREFIX}-${storeSlug}`;
}

export function loadCart(
  storeSlug: string,
  products: CatalogProduct[]
): CartItem[] {
  try {
    const key = getCartStorageKey(storeSlug);
    const raw =
      localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];

    const hydrated = parsed
      .map((item) => {
        const fresh = products.find((p) => p.id === item.product?.id);
        if (!fresh || fresh.stockStatus === "out_of_stock") return null;
        const quantity = Math.min(
          Math.max(1, item.quantity ?? 1),
          fresh.available
        );
        return {
          product: fresh,
          quantity,
          notes: item.notes,
        } satisfies CartItem;
      })
      .filter((item): item is CartItem => item !== null);

    if (localStorage.getItem(key) === null && hydrated.length > 0) {
      saveCart(storeSlug, hydrated);
    }

    return hydrated;
  } catch {
    return [];
  }
}

export function saveCart(storeSlug: string, cart: CartItem[]) {
  try {
    localStorage.setItem(getCartStorageKey(storeSlug), JSON.stringify(cart));
    sessionStorage.removeItem(getCartStorageKey(storeSlug));
  } catch {
    /* ignore */
  }
}
