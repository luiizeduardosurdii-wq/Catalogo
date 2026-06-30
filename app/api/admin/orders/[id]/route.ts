import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { adminCancelOrder, adminDeliverOrder } from "@/lib/order-admin";

const actionSchema = z.object({
  action: z.enum(["deliver", "cancel"]),
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
  const body = actionSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id, storeId: session.user.storeId },
    select: { id: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  try {
    const updated =
      body.data.action === "deliver"
        ? await adminDeliverOrder(session.user.storeId, id)
        : await adminCancelOrder(session.user.storeId, id);

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar pedido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
