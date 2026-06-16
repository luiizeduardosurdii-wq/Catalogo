import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { InventoryPanel } from "@/components/admin/InventoryPanel";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.storeId) redirect("/admin/login");

  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findFirst({
      where: { id, storeId: session.user.storeId },
      include: { inventory: true },
    }),
    prisma.category.findMany({
      where: { storeId: session.user.storeId, active: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/produtos"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Voltar para produtos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Editar produto
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{product.name}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ProductForm categories={categories} product={product} />
        <aside className="admin-card h-fit p-5">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Estoque</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Ajuste entradas, saídas e saldo
          </p>
          <div className="mt-4">
            <InventoryPanel
              productId={product.id}
              currentQty={product.inventory?.quantity ?? 0}
              reserved={product.inventory?.reservedQuantity ?? 0}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
