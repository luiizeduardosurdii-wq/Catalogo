import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.storeId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId },
    select: { id: true, name: true, slug: true, whatsapp: true },
  });

  if (!store) {
    return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
  }

  return NextResponse.json(store);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const json = await req.json();
  const raw = typeof json.whatsapp === "string" ? json.whatsapp : "";
  const digits = raw.replace(/\D/g, "");

  if (digits && (digits.length < 10 || digits.length > 15)) {
    return NextResponse.json(
      {
        error:
          "Número inválido. Use DDI + DDD + número (ex: 5511999999999).",
      },
      { status: 400 }
    );
  }

  const store = await prisma.store.update({
    where: { id: session.user.storeId },
    data: { whatsapp: digits || null },
    select: { id: true, name: true, slug: true, whatsapp: true },
  });

  return NextResponse.json(store);
}
