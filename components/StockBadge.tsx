import type { StockStatus } from "@/lib/format";
import { stockLabel } from "@/lib/format";

const styles: Record<StockStatus, string> = {
  in_stock: "bg-emerald-100 text-emerald-800",
  low_stock: "bg-amber-100 text-amber-800",
  out_of_stock: "bg-red-100 text-red-800",
};

export function StockBadge({
  status,
  available,
  compact = false,
}: {
  status: StockStatus;
  available?: number;
  compact?: boolean;
}) {
  const label = stockLabel(status);
  const qty =
    available !== undefined && status !== "out_of_stock"
      ? ` (${available})`
      : "";

  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-full font-medium ${styles[status]} ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
    >
      <span className="truncate">
        {label}
        {qty}
      </span>
    </span>
  );
}
