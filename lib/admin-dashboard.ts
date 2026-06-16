import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export type DashboardRecentOrder = {
  id: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: Date;
  customerName: string | null;
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
};

function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getDashboardStats(storeId: string): Promise<DashboardStats> {
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
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { storeId, status: OrderStatus.PAID },
      _sum: { totalCents: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        storeId,
        status: OrderStatus.PAID,
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalCents: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      where: { order: { storeId, status: OrderStatus.PAID } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 1,
    }),
    prisma.order.count({
      where: { storeId, status: OrderStatus.AWAITING_PIX },
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
        (items) =>
          items.filter((i) => i.quantity - i.reservedQuantity <= 0).length
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
  };
}
