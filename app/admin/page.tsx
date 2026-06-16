import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { getDashboardStats } from "@/lib/admin-dashboard";
import { DashboardStatCard } from "@/components/admin/DashboardStatCard";
import { RecentOrdersPanel } from "@/components/admin/RecentOrdersPanel";

function currentMonthLabel(): string {
  return new Date().toLocaleDateString("pt-BR", { month: "long" });
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.storeId) redirect("/admin/login");

  const storeId = session.user.storeId;

  const [store, stats] = await Promise.all([
    prisma.store.findUnique({ where: { id: storeId } }),
    getDashboardStats(storeId),
  ]);

  const catalogUrl = `${config.appUrl}/s/${store?.slug ?? ""}`;
  const monthLabel = currentMonthLabel();

  const topProductValue = stats.topProduct
    ? stats.topProduct.name
    : "Nenhuma venda ainda";
  const topProductHint = stats.topProduct
    ? `${stats.topProduct.quantity} un. vendidas`
    : undefined;

  const ticketValue =
    stats.averageTicketCents !== null
      ? formatPrice(stats.averageTicketCents)
      : "—";

  const pendingPixHint = config.paymentsEnabled
    ? "PIX habilitado"
    : "PIX desabilitado";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {store?.name ?? "Minha loja"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Visão geral</p>
      </header>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Vendas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            label="Vendas totais"
            value={formatPrice(stats.totalSalesCents)}
            hint={`${formatPrice(stats.monthSalesCents)} em ${monthLabel}`}
            variant="emerald"
          />
          <DashboardStatCard
            label="Pedidos pagos"
            value={String(stats.paidOrderCount)}
            href="/admin/pedidos"
          />
          <DashboardStatCard label="Ticket médio" value={ticketValue} />
          <DashboardStatCard
            label="Produto mais vendido"
            value={topProductValue}
            hint={topProductHint}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Operação
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            label="Produtos ativos"
            value={String(stats.activeProductCount)}
            href="/admin/produtos"
          />
          <DashboardStatCard
            label="Estoque baixo"
            value={String(stats.lowStockCount)}
            href="/admin/produtos"
          />
          <DashboardStatCard
            label="Aguardando PIX"
            value={String(stats.pendingPixCount)}
            hint={pendingPixHint}
            href="/admin/pedidos"
          />
          <DashboardStatCard
            label="Sem estoque"
            value={String(stats.outOfStockCount)}
            href="/admin/produtos"
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentOrdersPanel orders={stats.recentOrders} />

        <section className="flex flex-col gap-4">
          <div className="admin-card p-4">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Link do catálogo (WhatsApp)
            </h2>
            <p className="mt-2 break-all rounded-lg bg-zinc-50 p-3 text-sm text-emerald-700 dark:bg-zinc-800 dark:text-emerald-400">
              {catalogUrl}
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Compartilhe este link no WhatsApp. Funciona em Android e iOS.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/produtos"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Gerenciar produtos
            </Link>
            <Link
              href="/admin/categorias"
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Categorias
            </Link>
            <Link
              href={`/s/${store?.slug}`}
              target="_blank"
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Ver catálogo público
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
