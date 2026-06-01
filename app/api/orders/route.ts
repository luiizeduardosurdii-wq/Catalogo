import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { createOrderWithPix } from "@/lib/orders";
import { getStoreBySlug } from "@/lib/store";
import { z } from "zod";

const schema = z.object({
  storeSlug: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

export async function POST(req: Request) {
  if (!config.paymentsEnabled) {
    return NextResponse.json(
      { error: "Pagamentos não habilitados" },
      { status: 403 }
    );
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const store = await getStoreBySlug(body.data.storeSlug);
  if (!store) {
    return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
  }

  try {
    const { order, charge } = await createOrderWithPix({
      storeId: store.id,
      storeSlug: store.slug,
      items: body.data.items,
      customerName: body.data.customerName,
      customerPhone: body.data.customerPhone,
    });

    const payment = await import("@/lib/db").then(({ prisma }) =>
      prisma.payment.findUnique({ where: { orderId: order.id } })
    );

    return NextResponse.json({
      orderId: order.id,
      totalCents: order.totalCents,
      pixCopyPaste: payment?.pixCopyPaste ?? charge.pixCopyPaste,
      pixQrCode: payment?.pixQrCode ?? charge.pixQrCode,
      expiresAt: charge.expiresAt,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criar pedido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
