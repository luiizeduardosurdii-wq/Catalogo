import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true, store: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    totalCents: order.totalCents,
    items: order.items,
    payment: order.payment
      ? {
          status: order.payment.status,
          pixCopyPaste: order.payment.pixCopyPaste,
          paidAt: order.payment.paidAt,
        }
      : null,
    storeSlug: order.store.slug,
  });
}
