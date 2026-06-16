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
    <div className="min-h-screen bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white p-4">
        <div className="mb-3 h-6 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="h-9 animate-pulse rounded-lg bg-zinc-200" />
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-16 animate-pulse rounded-full bg-zinc-200"
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5 p-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-zinc-200">
            <div className="mx-auto aspect-square max-h-40 animate-pulse rounded-2xl bg-zinc-200 sm:max-h-48" />
            <div className="space-y-2 p-2">
              <div className="h-3 w-full animate-pulse rounded bg-zinc-200" />
              <div className="h-6 animate-pulse rounded bg-zinc-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-6 right-4 h-12 w-12 animate-pulse rounded-full bg-zinc-200" />
      <p className="fixed bottom-24 left-0 right-0 text-center text-sm text-zinc-500">
        Carregando catálogo…
      </p>
    </div>
  );
}

export function CatalogLoader(props: ComponentProps<typeof CatalogView>) {
  return <CatalogView {...props} />;
}
