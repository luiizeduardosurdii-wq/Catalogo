import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  sortOrder: z.number().optional(),
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

  const category = await prisma.category.updateMany({
    where: { id, storeId: session.user.storeId },
    data: body.data,
  });

  if (category.count === 0) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const updated = await prisma.category.findUnique({ where: { id } });
  return NextResponse.json(updated);
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
  const products = await prisma.product.count({
    where: { categoryId: id, storeId: session.user.storeId },
  });

  if (products > 0) {
    return NextResponse.json(
      { error: "Categoria possui produtos vinculados" },
      { status: 400 }
    );
  }

  await prisma.category.deleteMany({
    where: { id, storeId: session.user.storeId },
  });

  return NextResponse.json({ ok: true });
}
