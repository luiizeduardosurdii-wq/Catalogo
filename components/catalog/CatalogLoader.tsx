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
    <div className="catalog-page min-h-screen">
      <div className="catalog-header border-b p-4">
        <div className="mx-auto mb-3 h-16 w-48 animate-pulse rounded-2xl bg-[#E8E3D9]/60" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 animate-pulse rounded-full bg-[#E8E3D9]/60"
            />
          ))}
        </div>
      </div>
      <div className="mx-2 mt-3 h-48 animate-pulse rounded-3xl bg-[#E8E3D9]/50 sm:mx-4 sm:h-64" />
      <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-3xl bg-white/80 ring-1 ring-[#E8E3D9]"
          />
        ))}
      </div>
      <p className="py-8 text-center text-sm text-[#6B7280]">
        Carregando catálogo…
      </p>
    </div>
  );
}

export function CatalogLoader(props: ComponentProps<typeof CatalogView>) {
  return <CatalogView {...props} />;
}
