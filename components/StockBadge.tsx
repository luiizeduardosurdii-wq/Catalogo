import type { StockStatus } from "@/lib/format";

const config: Record<
  StockStatus,
  { icon: string; className: string; qtySuffix?: boolean }
> = {
  in_stock: {
    icon: "✓",
    className:
      "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
    qtySuffix: true,
  },
  low_stock: {
    icon: "⚡",
    className: "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200",
    qtySuffix: true,
  },
  out_of_stock: {
    icon: "✕",
    className: "bg-red-50 text-red-800 ring-1 ring-inset ring-red-200",
  },
};

const labels: Record<StockStatus, string> = {
  in_stock: "Em estoque",
  low_stock: "Últimas unidades",
  out_of_stock: "Esgotado",
};

export function StockBadge({
  status,
  available,
  compact = false,
  overlay = false,
}: {
  status: StockStatus;
  available?: number;
  compact?: boolean;
  overlay?: boolean;
}) {
  const { icon, className, qtySuffix } = config[status];
  const label = labels[status];
  const qty =
    qtySuffix && available !== undefined && status !== "out_of_stock"
      ? ` · ${available} un.`
      : "";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 truncate font-semibold ${className} ${
        overlay
          ? "rounded-lg px-2 py-1 text-[10px] shadow-sm backdrop-blur-sm"
          : compact
            ? "rounded-full px-2 py-0.5 text-[10px]"
            : "rounded-full px-2.5 py-1 text-xs"
      }`}
    >
      <span aria-hidden className="shrink-0 text-[0.85em] leading-none">
        {icon}
      </span>
      <span className="truncate">
        {label}
        {qty}
      </span>
    </span>
  );
}
