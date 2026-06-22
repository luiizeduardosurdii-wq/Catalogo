import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { cancelExpiredOrders } from "@/lib/orders";
import { parseOrderOptions } from "@/lib/customization";

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
      <h1 className="mb-4 text-2xl font-bold dark:text-zinc-100">Pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">Nenhum pedido ainda.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="admin-card p-4">
              <div className="flex justify-between">
                <span className="font-mono text-sm dark:text-zinc-300">#{o.id.slice(-8)}</span>
                <span className="text-sm font-medium dark:text-zinc-200">
                  {statusLabels[o.status] ?? o.status}
                </span>
              </div>
              <p className="mt-1 font-bold text-emerald-700 dark:text-emerald-400">
                {formatPrice(o.totalCents)}
              </p>
              <ul className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {o.items.map((i) => {
                  const options = parseOrderOptions(i.optionsJson);
                  return (
                    <li key={i.id}>
                      {i.quantity}x {i.productName}
                      {options && (
                        <span className="block text-xs text-zinc-400">
                          {[
                            options.fragranceLabel &&
                              `Fragrância: ${options.fragranceLabel}`,
                            options.colorLabel && `Cor: ${options.colorLabel}`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </li>
                  );
                })}
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
