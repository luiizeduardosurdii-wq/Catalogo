import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getStockStatus } from "@/lib/format";
import {
  AdminProductCard,
  type AdminProductItem,
} from "@/components/admin/AdminProductCard";

function ProductStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="admin-card px-4 py-3">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={`text-2xl font-bold ${accent ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-900 dark:text-zinc-100"}`}
      >
        {value}
      </p>
    </div>
  );
}

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user?.storeId) redirect("/admin/login");

  const products = await prisma.product.findMany({
    where: { storeId: session.user.storeId },
    include: { inventory: true, category: true },
    orderBy: { name: "asc" },
  });

  const activeCount = products.filter((p) => p.active).length;
  const lowStockCount = products.filter((p) => {
    const qty = p.inventory?.quantity ?? 0;
    const reserved = p.inventory?.reservedQuantity ?? 0;
    const threshold = p.inventory?.lowStockThreshold ?? 5;
    const status = getStockStatus(qty, reserved, threshold);
    return status === "low_stock";
  }).length;
  const outOfStockCount = products.filter((p) => {
    const qty = p.inventory?.quantity ?? 0;
    const reserved = p.inventory?.reservedQuantity ?? 0;
    const threshold = p.inventory?.lowStockThreshold ?? 5;
    return getStockStatus(qty, reserved, threshold) === "out_of_stock";
  }).length;

  const productItems: AdminProductItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    priceCents: p.priceCents,
    imageUrl: p.imageUrl,
    active: p.active,
    category: { name: p.category.name },
    inventory: p.inventory,
  }));

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Produtos</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gerencie o catálogo, fotos e estoque da sua loja
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          <span className="text-lg leading-none">+</span>
          Novo produto
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ProductStat label="Total" value={products.length} />
        <ProductStat label="Ativos" value={activeCount} accent />
        <ProductStat label="Estoque baixo" value={lowStockCount} />
        <ProductStat label="Sem estoque" value={outOfStockCount} />
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <span className="text-5xl">📦</span>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Nenhum produto cadastrado
          </h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Adicione seu primeiro produto com foto, preço e estoque para
            aparecer no catálogo dos clientes.
          </p>
          <Link
            href="/admin/produtos/novo"
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Criar primeiro produto
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {productItems.map((product) => (
            <AdminProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
