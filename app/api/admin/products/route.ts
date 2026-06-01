import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().positive(),
  categoryId: z.string(),
  imageUrl: z.string().optional(),
  initialQuantity: z.number().int().min(0).optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");

  const products = await prisma.product.findMany({
    where: {
      storeId: session.user.storeId,
      ...(categoryId ? { categoryId } : {}),
    },
    include: { inventory: true, category: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const category = await prisma.category.findFirst({
    where: { id: body.data.categoryId, storeId: session.user.storeId },
  });
  if (!category) {
    return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
  }

  const qty = body.data.initialQuantity ?? 0;

  const product = await prisma.$transaction(async (tx) => {
    const p = await tx.product.create({
      data: {
        storeId: session.user.storeId!,
        categoryId: body.data.categoryId,
        name: body.data.name,
        description: body.data.description,
        priceCents: body.data.priceCents,
        imageUrl: body.data.imageUrl,
      },
      include: { category: true },
    });

    if (qty > 0) {
      await tx.inventory.create({
        data: { productId: p.id, quantity: qty },
      });
      await tx.inventoryMovement.create({
        data: {
          storeId: session.user.storeId!,
          productId: p.id,
          type: "MANUAL_IN",
          quantity: qty,
          balanceAfter: qty,
          note: "Estoque inicial",
        },
      });
    } else {
      await tx.inventory.create({
        data: { productId: p.id, quantity: 0 },
      });
    }

    return tx.product.findUnique({
      where: { id: p.id },
      include: { inventory: true, category: true },
    });
  });

  return NextResponse.json(product, { status: 201 });
}
