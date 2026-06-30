import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ensureStoreCustomizationOptions } from "@/lib/customization-defaults";
import { CustomizationOptionsManager } from "@/components/admin/CustomizationOptionsManager";

export default async function CustomizationOptionsPage() {
  const session = await auth();
  if (!session?.user?.storeId) redirect("/admin/login");

  await ensureStoreCustomizationOptions(session.user.storeId);

  const options = await prisma.customizationOption.findMany({
    where: { storeId: session.user.storeId },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Opções de personalização
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Fragrâncias e cores que os clientes podem escolher para qualquer
          produto do catálogo, em todas as categorias.
        </p>
      </header>

      <CustomizationOptionsManager initial={options} />
    </div>
  );
}
