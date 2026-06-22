import { prisma } from "./db";
import { getStockStatus } from "./format";
import type { CustomizationOption } from "./customization";

export async function getStoreBySlug(slug: string) {
  return prisma.store.findFirst({
    where: { slug, active: true },
  });
}

export async function getStoreCustomizationOptions(
  storeId: string
): Promise<CustomizationOption[]> {
  const options = await prisma.customizationOption.findMany({
    where: { storeId, active: true },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
  });

  return options.map((o) => ({
    id: o.id,
    type: o.type,
    label: o.label,
    hexColor: o.hexColor,
  }));
}

export async function getStoreCatalog(storeId: string) {
  const [categories, products, customizationOptions] = await Promise.all([
    prisma.category.findMany({
      where: { storeId, active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { storeId, active: true },
      include: { inventory: true, category: true },
      orderBy: { name: "asc" },
    }),
    getStoreCustomizationOptions(storeId),
  ]);

  const productsWithStock = products.map((p) => {
    const qty = p.inventory?.quantity ?? 0;
    const reserved = p.inventory?.reservedQuantity ?? 0;
    const threshold = p.inventory?.lowStockThreshold ?? 5;
    const stockStatus = getStockStatus(qty, reserved, threshold);
    const available = Math.max(0, qty - reserved);
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      imageUrl: p.imageUrl,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      stockStatus,
      available,
    };
  });

  return { categories, products: productsWithStock, customizationOptions };
}
