import type { CartItem } from "@/components/CartDrawer";
import type { CatalogProduct } from "@/components/ProductCard";
import { buildCartLineKey } from "@/lib/customization";

const CART_PREFIX = "cart";

export function getCartStorageKey(storeSlug: string) {
  return `${CART_PREFIX}-${storeSlug}`;
}

function hydrateCartItem(
  item: CartItem,
  products: CatalogProduct[]
): CartItem | null {
  const fresh = products.find((p) => p.id === item.product?.id);
  if (!fresh || fresh.stockStatus === "out_of_stock") return null;

  const customization = {
    fragranceId: item.fragranceId,
    fragranceLabel: item.fragranceLabel,
    colorId: item.colorId,
    colorLabel: item.colorLabel,
  };
  const lineKey = buildCartLineKey(fresh.id, customization);
  const quantity = Math.min(
    Math.max(1, item.quantity ?? 1),
    fresh.available
  );

  return {
    lineKey,
    product: fresh,
    quantity,
    notes: item.notes,
    ...customization,
  };
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
      .map((item) => hydrateCartItem(item, products))
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
