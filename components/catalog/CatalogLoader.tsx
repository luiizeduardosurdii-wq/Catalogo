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
      <div className="mx-2 mt-2 sm:mx-4 sm:mt-3">
        <div className="catalog-hero-premium animate-pulse p-6 sm:p-8">
          <div className="mx-auto h-24 w-48 rounded-2xl bg-white/50" />
          <div className="mx-auto mt-6 h-4 w-40 rounded-full bg-white/40" />
          <div className="mx-auto mt-3 h-8 max-w-sm rounded-xl bg-white/40" />
          <div className="mx-auto mt-4 h-12 max-w-md rounded-xl bg-white/30" />
        </div>
      </div>
      <div className="catalog-filters-wrapper px-2 pt-2 sm:px-4">
        <div className="catalog-filters-premium animate-pulse p-4">
          <div className="mb-3 h-3 w-32 rounded-full bg-white/50" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-20 rounded-full bg-white/45"
              />
            ))}
          </div>
        </div>
      </div>
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
