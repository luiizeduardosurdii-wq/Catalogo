import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  label: z.string().min(1).max(80).optional(),
  hexColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .nullable(),
  sortOrder: z.number().int().optional(),
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
  const body = patchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.customizationOption.findFirst({
    where: { id, storeId: session.user.storeId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Opção não encontrada" }, { status: 404 });
  }

  const option = await prisma.customizationOption.update({
    where: { id },
    data: {
      ...(body.data.label !== undefined ? { label: body.data.label.trim() } : {}),
      ...(body.data.hexColor !== undefined ? { hexColor: body.data.hexColor } : {}),
      ...(body.data.sortOrder !== undefined
        ? { sortOrder: body.data.sortOrder }
        : {}),
      ...(body.data.active !== undefined ? { active: body.data.active } : {}),
    },
  });

  return NextResponse.json(option);
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
  const existing = await prisma.customizationOption.findFirst({
    where: { id, storeId: session.user.storeId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Opção não encontrada" }, { status: 404 });
  }

  await prisma.customizationOption.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
