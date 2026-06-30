import { OrderStatus } from "@prisma/client";
import { prisma } from "./db";
import { formatPrice } from "./format";
import { releaseReservedStock, restoreSoldStock } from "./inventory";
import { ORDER_STATUS } from "./order-status";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Rascunho",
  AWAITING_PIX: "Aguardando PIX",
  PAID: "Pago",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

type OrderSummaryInput = {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  totalCents: number;
  status: OrderStatus;
  items: { quantity: number; productName: string }[];
};

export function formatOrderSummary(order: OrderSummaryInput): string {
  const lines = [
    `*Pedido #${order.id.slice(-8)}*`,
    order.customerName ? `Cliente: ${order.customerName}` : null,
    order.customerPhone ? `Telefone: ${order.customerPhone}` : null,
    "",
    ...order.items.map((item) => `• ${item.quantity}x ${item.productName}`),
    "",
    `Total: ${formatPrice(order.totalCents)}`,
    `Status: ${ORDER_STATUS_LABELS[order.status]}`,
  ];

  return lines.filter((line) => line !== null).join("\n");
}

export async function adminDeliverOrder(storeId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, storeId, status: ORDER_STATUS.PAID },
  });

  if (!order) {
    throw new Error("Somente pedidos pagos podem ser marcados como entregues");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.DELIVERED },
  });
}

export async function adminCancelOrder(storeId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, storeId },
    include: { items: true },
  });

  if (!order) {
    throw new Error("Pedido não encontrado");
  }

  if (
    order.status === ORDER_STATUS.CANCELLED ||
    order.status === ORDER_STATUS.EXPIRED ||
    order.status === ORDER_STATUS.DELIVERED
  ) {
    throw new Error("Este pedido não pode ser cancelado");
  }

  const items = order.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  if (order.status === ORDER_STATUS.AWAITING_PIX) {
    await releaseReservedStock(storeId, order.id, items);
  } else if (order.status === ORDER_STATUS.PAID) {
    await restoreSoldStock(storeId, order.id, items);
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: ORDER_STATUS.CANCELLED },
  });
}
