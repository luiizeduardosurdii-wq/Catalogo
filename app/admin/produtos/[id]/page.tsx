import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

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
    <div>
      <h1 className="mb-4 text-2xl font-bold">Editar produto</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
