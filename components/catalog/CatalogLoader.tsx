"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const CatalogView = dynamic(
  () =>
    import("@/components/catalog/CatalogView").then((m) => m.CatalogView),
  {
    ssr: false,
    loading: () => <CatalogSkeleton />,
  }
);

function CatalogSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 p-4">
      <div className="mb-4 h-8 w-48 animate-pulse rounded-lg bg-zinc-200" />
      <div className="mb-4 h-10 animate-pulse rounded-xl bg-zinc-200" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-2xl bg-zinc-200"
          />
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Carregando catálogo…
      </p>
    </div>
  );
}

export function CatalogLoader(props: ComponentProps<typeof CatalogView>) {
  return <CatalogView {...props} />;
}
