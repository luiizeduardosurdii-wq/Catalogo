import Link from "next/link";

type DashboardStatCardProps = {
  label: string;
  value: string;
  hint?: string;
  variant?: "default" | "emerald";
  href?: string;
};

export function DashboardStatCard({
  label,
  value,
  hint,
  variant = "default",
  href,
}: DashboardStatCardProps) {
  const content = (
    <>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold leading-tight line-clamp-2 ${
          variant === "emerald"
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>}
    </>
  );

  const className =
    "admin-card p-4 transition hover:shadow-md dark:hover:ring-zinc-700";

  if (href) {
    return (
      <Link href={href} className={`block ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
