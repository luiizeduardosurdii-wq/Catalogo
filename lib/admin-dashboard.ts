import { CustomizationOptionType, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getStockStatus } from "@/lib/format";
import { ensureStoreCustomizationOptions } from "@/lib/customization-defaults";
import { completedSaleStatuses, ORDER_STATUS } from "@/lib/order-status";

export type DashboardRecentOrder = {
  id: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: Date;
  customerName: string | null;
};

export type DashboardAttentionItem = {
  id: string;
  text: string;
  href: string;
};

export type DashboardRecentProduct = {
  id: string;
  name: string;
  updatedAt: Date;
  imageUrl: string | null;
};

export type DashboardCustomizationCounts = {
  fragrances: number;
  colors: number;
};

export type DashboardStats = {
  totalSalesCents: number;
  monthSalesCents: number;
  paidOrderCount: number;
  averageTicketCents: number | null;
  topProduct: { name: string; quantity: number } | null;
  pendingPixCount: number;
  activeProductCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentOrders: DashboardRecentOrder[];
  attentionItems: DashboardAttentionItem[];
  recentProducts: DashboardRecentProduct[];
  customizationCounts: DashboardCustomizationCounts;
};

function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function recentOrderCutoff(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
}

async function getAttentionItems(storeId: string): Promise<DashboardAttentionItem[]> {
  const items: DashboardAttentionItem[] = [];
  const recentCutoff = recentOrderCutoff();

  const [outOfStockProducts, inactiveWithOrders, emptyCategories, pendingPixCount] =
    await Promise.all([
      prisma.product.findMany({
        where: { storeId, active: true },
        select: {
          id: true,
          name: true,
          inventory: {
            select: { quantity: true, reservedQuantity: true, lowStockThreshold: true },
          },
        },
        orderBy: { name: "asc" },
        take: 20,
      }),
      prisma.product.findMany({
        where: {
          storeId,
          active: false,
          orderItems: {
            some: {
              order: {
                createdAt: { gte: recentCutoff },
                status: {
                  in: [
                    OrderStatus.PAID,
                    ...(OrderStatus.DELIVERED ? [OrderStatus.DELIVERED] : []),
                    OrderStatus.AWAITING_PIX,
                  ],
                },
              },
            },
          },
        },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
        take: 10,
      }),
      prisma.category.findMany({
        where: { storeId, active: true },
        select: {
          id: true,
          name: true,
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.order.count({
        where: { storeId, status: ORDER_STATUS.AWAITING_PIX },
      }),
    ]);

  for (const product of outOfStockProducts) {
    const qty = product.inventory?.quantity ?? 0;
    const reserved = product.inventory?.reservedQuantity ?? 0;
    const threshold = product.inventory?.lowStockThreshold ?? 5;
    if (getStockStatus(qty, reserved, threshold) !== "out_of_stock") continue;

    items.push({
      id: `stock-${product.id}`,
      text: `Sem estoque: ${product.name}`,
      href: `/admin/produtos/${product.id}`,
    });
    if (items.filter((item) => item.id.startsWith("stock-")).length >= 5) break;
  }

  for (const product of inactiveWithOrders) {
    items.push({
      id: `inactive-${product.id}`,
      text: `Inativo com pedido recente: ${product.name}`,
      href: `/admin/produtos/${product.id}`,
    });
  }

  for (const category of emptyCategories) {
    if (category._count.products > 0) continue;
    items.push({
      id: `category-${category.id}`,
      text: `Categoria vazia: ${category.name}`,
      href: "/admin/categorias",
    });
  }

  if (pendingPixCount > 0) {
    items.push({
      id: "pending-pix",
      text: `${pendingPixCount} pedido${pendingPixCount === 1 ? "" : "s"} aguardando pagamento`,
      href: "/admin/pedidos",
    });
  }

  return items;
}

export async function getDashboardStats(storeId: string): Promise<DashboardStats> {
  await ensureStoreCustomizationOptions(storeId);
  const startOfMonth = startOfCurrentMonth();

  const [
    paidAggregate,
    monthAggregate,
    topProducts,
    pendingPixCount,
    activeProductCount,
    lowStockCount,
    outOfStockCount,
    recentOrders,
    attentionItems,
    recentProducts,
    fragranceCount,
    colorCount,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        storeId,
        status: { in: completedSaleStatuses() },
      },
      _sum: { totalCents: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        storeId,
        status: { in: completedSaleStatuses() },
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalCents: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      where: {
        order: {
          storeId,
          status: { in: completedSaleStatuses() },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 1,
    }),
    prisma.order.count({
      where: { storeId, status: ORDER_STATUS.AWAITING_PIX },
    }),
    prisma.product.count({
      where: { storeId, active: true },
    }),
    prisma.inventory.count({
      where: {
        product: { storeId, active: true },
        quantity: { lte: 5 },
      },
    }),
    prisma.inventory
      .findMany({
        where: { product: { storeId, active: true } },
        select: { quantity: true, reservedQuantity: true },
      })
      .then(
        (inventoryItems) =>
          inventoryItems.filter((i) => i.quantity - i.reservedQuantity <= 0).length
      ),
    prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        totalCents: true,
        createdAt: true,
        customerName: true,
      },
    }),
    getAttentionItems(storeId),
    prisma.product.findMany({
      where: { storeId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        updatedAt: true,
        imageUrl: true,
      },
    }),
    prisma.customizationOption.count({
      where: { storeId, active: true, type: CustomizationOptionType.FRAGRANCE },
    }),
    prisma.customizationOption.count({
      where: { storeId, active: true, type: CustomizationOptionType.COLOR },
    }),
  ]);

  const totalSalesCents = paidAggregate._sum.totalCents ?? 0;
  const paidOrderCount = paidAggregate._count;
  const monthSalesCents = monthAggregate._sum.totalCents ?? 0;

  const top = topProducts[0];
  const topProduct =
    top && top._sum.quantity
      ? { name: top.productName, quantity: top._sum.quantity }
      : null;

  return {
    totalSalesCents,
    monthSalesCents,
    paidOrderCount,
    averageTicketCents:
      paidOrderCount > 0 ? Math.round(totalSalesCents / paidOrderCount) : null,
    topProduct,
    pendingPixCount,
    activeProductCount,
    lowStockCount,
    outOfStockCount,
    recentOrders,
    attentionItems,
    recentProducts,
    customizationCounts: {
      fragrances: fragranceCount,
      colors: colorCount,
    },
  };
}
