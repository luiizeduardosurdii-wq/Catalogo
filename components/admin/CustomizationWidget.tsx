import Link from "next/link";
import type { DashboardCustomizationCounts } from "@/lib/admin-dashboard";

type CustomizationWidgetProps = {
  counts: DashboardCustomizationCounts;
};

export function CustomizationWidget({ counts }: CustomizationWidgetProps) {
  const total = counts.fragrances + counts.colors;

  return (
    <Link href="/admin/opcoes" className="admin-card block p-4 transition hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-[#14532d] dark:text-zinc-100">
            Opções de personalização
          </h2>
          <p className="mt-1 text-sm text-[#6b7280] dark:text-zinc-400">
            Fragrâncias e cores disponíveis em todas as categorias do catálogo
          </p>
        </div>
        <span className="rounded-full bg-[#e4ebe0] px-2.5 py-1 text-xs font-semibold text-[#14532d] dark:bg-emerald-950/40 dark:text-emerald-400">
          {total} ativa{total === 1 ? "" : "s"}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-[#f7f2e9] px-3 py-2 dark:bg-zinc-800/60">
          <p className="text-xs text-[#6b7280] dark:text-zinc-400">Fragrâncias</p>
          <p className="mt-0.5 font-semibold text-[#14532d] dark:text-zinc-100">
            {counts.fragrances}
          </p>
        </div>
        <div className="rounded-xl bg-[#f7f2e9] px-3 py-2 dark:bg-zinc-800/60">
          <p className="text-xs text-[#6b7280] dark:text-zinc-400">Cores</p>
          <p className="mt-0.5 font-semibold text-[#14532d] dark:text-zinc-100">
            {counts.colors}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        Gerenciar opções →
      </p>
    </Link>
  );
}
