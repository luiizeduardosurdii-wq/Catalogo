import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { InventoryPanel } from "@/components/admin/InventoryPanel";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user?.storeId) redirect("/admin/login");

  const products = await prisma.product.findMany({
    where: { storeId: session.user.storeId },
    include: { inventory: true, category: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          + Novo produto
        </Link>
      </div>

      <ul className="space-y-4">
        {products.map((p) => (
          <li key={p.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">
                  {p.name}
                  {!p.active && (
                    <span className="ml-2 text-xs text-red-500">(inativo)</span>
                  )}
                </h2>
                <p className="text-sm text-zinc-500">{p.category.name}</p>
                <p className="font-medium text-emerald-700">
                  {formatPrice(p.priceCents)}
                </p>
              </div>
              <Link
                href={`/admin/produtos/${p.id}`}
                className="text-sm text-emerald-600"
              >
                Editar
              </Link>
            </div>
            <div className="mt-3">
              <InventoryPanel
                productId={p.id}
                currentQty={p.inventory?.quantity ?? 0}
                reserved={p.inventory?.reservedQuantity ?? 0}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
