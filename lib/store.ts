import { prisma } from "./db";
import { getStockStatus } from "./format";

export async function getStoreBySlug(slug: string) {
  return prisma.store.findFirst({
    where: { slug, active: true },
  });
}

export async function getStoreCatalog(storeId: string) {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { storeId, active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { storeId, active: true },
      include: { inventory: true, category: true },
      orderBy: { name: "asc" },
    }),
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
      stockStatus,
      available,
    };
  });

  return { categories, products: productsWithStock };
}
