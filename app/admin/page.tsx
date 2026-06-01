import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.storeId) redirect("/admin/login");

  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId },
  });

  const [productCount, lowStock, orderCount] = await Promise.all([
    prisma.product.count({
      where: { storeId: session.user.storeId, active: true },
    }),
    prisma.inventory.count({
      where: {
        product: { storeId: session.user.storeId, active: true },
        quantity: { lte: 5 },
      },
    }),
    prisma.order.count({ where: { storeId: session.user.storeId } }),
  ]);

  const catalogUrl = `${config.appUrl}/s/${store?.slug ?? ""}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{store?.name ?? "Minha loja"}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Produtos ativos" value={productCount} />
        <StatCard label="Estoque baixo" value={lowStock} />
        <StatCard label="Pedidos" value={orderCount} />
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Link do catálogo (WhatsApp)</h2>
        <p className="mt-2 break-all rounded-lg bg-zinc-50 p-3 text-sm text-emerald-700">
          {catalogUrl}
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Compartilhe este link no WhatsApp. Funciona em Android e iOS.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/produtos"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          Gerenciar produtos
        </Link>
        <Link
          href={`/s/${store?.slug}`}
          target="_blank"
          className="rounded-xl border px-4 py-2 text-sm"
        >
          Ver catálogo público
        </Link>
      </div>

      <p className="text-xs text-zinc-400">
        PIX: {config.paymentsEnabled ? "habilitado" : "desabilitado"} — defina
        PAYMENTS_ENABLED=true no .env
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
