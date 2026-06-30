import { MovementType, Prisma } from "@prisma/client";
import { prisma } from "./db";

export class InventoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryError";
  }
}

async function getOrCreateInventory(
  tx: Prisma.TransactionClient,
  productId: string
) {
  const existing = await tx.inventory.findUnique({ where: { productId } });
  if (existing) return existing;
  return tx.inventory.create({
    data: { productId, quantity: 0, reservedQuantity: 0 },
  });
}

async function recordMovement(
  tx: Prisma.TransactionClient,
  params: {
    storeId: string;
    productId: string;
    type: MovementType;
    quantity: number;
    balanceAfter: number;
    note?: string;
    orderId?: string;
  }
) {
  return tx.inventoryMovement.create({ data: params });
}

export async function manualStockIn(
  storeId: string,
  productId: string,
  quantity: number,
  note?: string
) {
  if (quantity <= 0) throw new InventoryError("Quantidade deve ser positiva");

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: { id: productId, storeId },
    });
    if (!product) throw new InventoryError("Produto não encontrado");

    const inv = await getOrCreateInventory(tx, productId);
    const newQty = inv.quantity + quantity;

    await tx.inventory.update({
      where: { productId },
      data: { quantity: newQty },
    });

    await recordMovement(tx, {
      storeId,
      productId,
      type: MovementType.MANUAL_IN,
      quantity,
      balanceAfter: newQty,
      note,
    });

    return newQty;
  });
}

export async function manualStockOut(
  storeId: string,
  productId: string,
  quantity: number,
  note?: string
) {
  if (quantity <= 0) throw new InventoryError("Quantidade deve ser positiva");

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: { id: productId, storeId },
    });
    if (!product) throw new InventoryError("Produto não encontrado");

    const inv = await getOrCreateInventory(tx, productId);
    const available = inv.quantity - inv.reservedQuantity;
    if (available < quantity) {
      throw new InventoryError("Estoque insuficiente");
    }

    const newQty = inv.quantity - quantity;
    await tx.inventory.update({
      where: { productId },
      data: { quantity: newQty },
    });

    await recordMovement(tx, {
      storeId,
      productId,
      type: MovementType.MANUAL_OUT,
      quantity: -quantity,
      balanceAfter: newQty,
      note,
    });

    return newQty;
  });
}

export async function adjustStock(
  storeId: string,
  productId: string,
  newQuantity: number,
  note?: string
) {
  if (newQuantity < 0) throw new InventoryError("Quantidade inválida");

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: { id: productId, storeId },
    });
    if (!product) throw new InventoryError("Produto não encontrado");

    const inv = await getOrCreateInventory(tx, productId);
    if (newQuantity < inv.reservedQuantity) {
      throw new InventoryError(
        "Quantidade não pode ser menor que o estoque reservado"
      );
    }

    const delta = newQuantity - inv.quantity;
    await tx.inventory.update({
      where: { productId },
      data: { quantity: newQuantity },
    });

    await recordMovement(tx, {
      storeId,
      productId,
      type: MovementType.ADJUSTMENT,
      quantity: delta,
      balanceAfter: newQuantity,
      note,
    });

    return newQuantity;
  });
}

export async function reserveStock(
  storeId: string,
  orderId: string,
  items: { productId: string; quantity: number }[]
) {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findFirst({
        where: { id: item.productId, storeId },
      });
      if (!product) throw new InventoryError(`Produto ${item.productId} inválido`);

      const inv = await getOrCreateInventory(tx, item.productId);
      const available = inv.quantity - inv.reservedQuantity;
      if (available < item.quantity) {
        throw new InventoryError(`Estoque insuficiente para ${product.name}`);
      }

      const newReserved = inv.reservedQuantity + item.quantity;
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { reservedQuantity: newReserved },
      });

      await recordMovement(tx, {
        storeId,
        productId: item.productId,
        type: MovementType.RESERVE,
        quantity: -item.quantity,
        balanceAfter: inv.quantity,
        orderId,
        note: `Reserva pedido ${orderId}`,
      });
    }
  });
}

export async function commitReservedStock(
  storeId: string,
  orderId: string,
  items: { productId: string; quantity: number }[]
) {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const inv = await getOrCreateInventory(tx, item.productId);
      if (inv.reservedQuantity < item.quantity) {
        throw new InventoryError("Reserva inconsistente");
      }

      const newQty = inv.quantity - item.quantity;
      const newReserved = inv.reservedQuantity - item.quantity;

      await tx.inventory.update({
        where: { productId: item.productId },
        data: { quantity: newQty, reservedQuantity: newReserved },
      });

      await recordMovement(tx, {
        storeId,
        productId: item.productId,
        type: MovementType.SALE,
        quantity: -item.quantity,
        balanceAfter: newQty,
        orderId,
        note: `Venda confirmada pedido ${orderId}`,
      });
    }
  });
}

export async function releaseReservedStock(
  storeId: string,
  orderId: string,
  items: { productId: string; quantity: number }[]
) {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const inv = await getOrCreateInventory(tx, item.productId);
      const releaseQty = Math.min(item.quantity, inv.reservedQuantity);
      if (releaseQty <= 0) continue;

      const newReserved = inv.reservedQuantity - releaseQty;
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { reservedQuantity: newReserved },
      });

      await recordMovement(tx, {
        storeId,
        productId: item.productId,
        type: MovementType.RELEASE,
        quantity: releaseQty,
        balanceAfter: inv.quantity,
        orderId,
        note: `Liberação reserva pedido ${orderId}`,
      });
    }
  });
}

export async function restoreSoldStock(
  storeId: string,
  orderId: string,
  items: { productId: string; quantity: number }[]
) {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const inv = await getOrCreateInventory(tx, item.productId);
      const newQty = inv.quantity + item.quantity;

      await tx.inventory.update({
        where: { productId: item.productId },
        data: { quantity: newQty },
      });

      await recordMovement(tx, {
        storeId,
        productId: item.productId,
        type: MovementType.CANCEL,
        quantity: item.quantity,
        balanceAfter: newQty,
        orderId,
        note: `Estorno cancelamento pedido ${orderId}`,
      });
    }
  });
}
