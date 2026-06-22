import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1, "Informe o nome do produto").optional(),
  description: z.string().nullable().optional(),
  priceCents: z
    .number({ error: "Informe um preço válido" })
    .int()
    .positive("O preço deve ser maior que zero")
    .optional(),
  categoryId: z.string().min(1, "Selecione uma categoria").optional(),
  imageUrl: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = updateSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const result = await prisma.product.updateMany({
    where: { id, storeId: session.user.storeId },
    data: body.data,
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { inventory: true, category: true },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, storeId: session.user.storeId },
    include: { _count: { select: { orderItems: true } } },
  });

  if (!product) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  if (product._count.orderItems > 0) {
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ ok: true, deactivated: true });
  }

  await prisma.$transaction(async (tx) => {
    await tx.inventoryMovement.deleteMany({ where: { productId: id } });
    await tx.inventory.deleteMany({ where: { productId: id } });
    await tx.product.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true, deleted: true });
}
