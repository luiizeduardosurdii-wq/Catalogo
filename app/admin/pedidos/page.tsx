import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { cancelExpiredOrders } from "@/lib/orders";

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  AWAITING_PIX: "Aguardando PIX",
  PAID: "Pago",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.storeId) redirect("/admin/login");

  await cancelExpiredOrders();

  const orders = await prisma.order.findMany({
    where: { storeId: session.user.storeId },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-zinc-500">Nenhum pedido ainda.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex justify-between">
                <span className="font-mono text-sm">#{o.id.slice(-8)}</span>
                <span className="text-sm font-medium">
                  {statusLabels[o.status] ?? o.status}
                </span>
              </div>
              <p className="mt-1 font-bold text-emerald-700">
                {formatPrice(o.totalCents)}
              </p>
              <ul className="mt-2 text-sm text-zinc-600">
                {o.items.map((i) => (
                  <li key={i.id}>
                    {i.quantity}x {i.productName}
                  </li>
                ))}
              </ul>
              {o.payment && (
                <p className="mt-2 text-xs text-zinc-400">
                  Pagamento: {o.payment.status} | {o.payment.provider}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
