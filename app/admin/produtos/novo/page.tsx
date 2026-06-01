import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.storeId) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    where: { storeId: session.user.storeId, active: true },
    orderBy: { sortOrder: "asc" },
  });

  if (categories.length === 0) {
    return (
      <p className="text-zinc-600">
        Crie pelo menos uma categoria antes de adicionar produtos.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Novo produto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
