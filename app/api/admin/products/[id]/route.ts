import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  priceCents: z.number().int().positive().optional(),
  categoryId: z.string().optional(),
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
  await prisma.product.updateMany({
    where: { id, storeId: session.user.storeId },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
