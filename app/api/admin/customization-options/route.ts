import { NextResponse } from "next/server";
import { CustomizationOptionType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  type: z.enum(["FRAGRANCE", "COLOR"]),
  label: z.string().min(1).max(80),
  hexColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .nullable(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.storeId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const options = await prisma.customizationOption.findMany({
    where: { storeId: session.user.storeId },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
  });

  return NextResponse.json(options);
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

  if (
    body.data.type === "COLOR" &&
    !body.data.hexColor
  ) {
    return NextResponse.json(
      { error: "Informe a cor em hexadecimal para opções de cor" },
      { status: 400 }
    );
  }

  const option = await prisma.customizationOption.create({
    data: {
      storeId: session.user.storeId,
      type: body.data.type as CustomizationOptionType,
      label: body.data.label.trim(),
      hexColor: body.data.type === "COLOR" ? body.data.hexColor ?? null : null,
      sortOrder: body.data.sortOrder ?? 0,
    },
  });

  return NextResponse.json(option, { status: 201 });
}
