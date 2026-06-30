import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { cancelExpiredOrders } from "@/lib/orders";
import { OrderCard } from "@/components/admin/OrderCard";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.storeId) redirect("/admin/login");

  await cancelExpiredOrders();

  const [orders, store] = await Promise.all([
    prisma.order.findMany({
      where: { storeId: session.user.storeId },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.store.findUnique({
      where: { id: session.user.storeId },
      select: { whatsapp: true },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-[#14532d] dark:text-zinc-100">
        Pedidos
      </h1>
      {orders.length === 0 ? (
        <p className="text-[#6b7280] dark:text-zinc-400">Nenhum pedido ainda.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              storeWhatsapp={store?.whatsapp ?? null}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
