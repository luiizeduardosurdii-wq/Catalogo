import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "./db";
import { config } from "./config";
import {
  commitReservedStock,
  releaseReservedStock,
  reserveStock,
} from "./inventory";
import { getPaymentProvider } from "./payments";

export async function createOrderWithPix(params: {
  storeId: string;
  storeSlug: string;
  items: {
    productId: string;
    quantity: number;
    fragranceId?: string;
    fragranceLabel?: string;
    colorId?: string;
    colorLabel?: string;
  }[];
  customerName?: string;
  customerPhone?: string;
}) {
  if (!config.paymentsEnabled) {
    throw new Error("Pagamentos desabilitados");
  }

  const productIds = [...new Set(params.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      storeId: params.storeId,
      active: true,
    },
    include: { inventory: true },
  });

  if (products.length !== productIds.length) {
    throw new Error("Um ou mais produtos inválidos");
  }

  const orderItems = params.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const options =
      item.fragranceLabel || item.colorLabel
        ? {
            fragranceId: item.fragranceId,
            fragranceLabel: item.fragranceLabel,
            colorId: item.colorId,
            colorLabel: item.colorLabel,
          }
        : null;
    const optionSuffix = options
      ? [
          options.fragranceLabel ? `Fragrância: ${options.fragranceLabel}` : null,
          options.colorLabel ? `Cor: ${options.colorLabel}` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : "";
    return {
      productId: product.id,
      productName: optionSuffix
        ? `${product.name} (${optionSuffix})`
        : product.name,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
      optionsJson: options ? JSON.stringify(options) : null,
    };
  });

  const totalCents = orderItems.reduce(
    (sum, i) => sum + i.unitPriceCents * i.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      storeId: params.storeId,
      status: OrderStatus.AWAITING_PIX,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      totalCents,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  await reserveStock(params.storeId, order.id, params.items);

  const provider = getPaymentProvider();
  const charge = await provider.createPixCharge({
    orderId: order.id,
    amountCents: totalCents,
    description: `Pedido ${order.id.slice(-8)} - ${params.storeSlug}`,
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: config.mercadoPagoAccessToken ? "mercadopago" : "mock",
      externalId: charge.externalId,
      status: PaymentStatus.PENDING,
      pixCopyPaste: charge.pixCopyPaste,
      pixQrCode: charge.pixQrCode,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { pixExpiresAt: charge.expiresAt },
  });

  return { order, charge };
}

export async function confirmOrderPayment(
  externalPaymentId: string,
  provider: string
) {
  const payment = await prisma.payment.findFirst({
    where: { externalId: externalPaymentId, provider },
    include: {
      order: { include: { items: true } },
    },
  });

  if (!payment || payment.status === PaymentStatus.APPROVED) {
    return payment;
  }

  if (payment.order.status === OrderStatus.PAID) {
    return payment;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.APPROVED, paidAt: new Date() },
    });
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: OrderStatus.PAID },
    });
  });

  await commitReservedStock(
    payment.order.storeId,
    payment.orderId,
    payment.order.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }))
  );

  return prisma.payment.findUnique({
    where: { id: payment.id },
    include: { order: true },
  });
}

export async function cancelExpiredOrders() {
  const expired = await prisma.order.findMany({
    where: {
      status: OrderStatus.AWAITING_PIX,
      pixExpiresAt: { lt: new Date() },
    },
    include: { items: true },
  });

  for (const order of expired) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.EXPIRED },
    });
    await releaseReservedStock(
      order.storeId,
      order.id,
      order.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }))
    );
  }

  return expired.length;
}
