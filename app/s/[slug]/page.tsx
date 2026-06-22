import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogLoader } from "@/components/catalog/CatalogLoader";
import { getStoreBySlug, getStoreCatalog } from "@/lib/store";
import { config } from "@/lib/config";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return { title: "Loja não encontrada" };

  const url = `${config.appUrl}/s/${slug}`;
  return {
    title: `${store.name} | Catálogo`,
    description: `Confira o catálogo de ${store.name}. Sabonetes, sachês perfumados e sprays.`,
    openGraph: {
      title: store.name,
      description: `Catálogo online de ${store.name}`,
      url,
      type: "website",
      locale: "pt_BR",
      ...(store.logoUrl ? { images: [{ url: store.logoUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: store.name,
      description: `Catálogo online de ${store.name}`,
    },
    alternates: { canonical: url },
  };
}

export default async function StoreCatalogPage({ params }: Props) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const { categories, products, customizationOptions } = await getStoreCatalog(store.id);

  return (
    <CatalogLoader
      storeName={store.name}
      storeSlug={store.slug}
      whatsapp={store.whatsapp}
      categories={categories}
      products={products}
      customizationOptions={customizationOptions}
      paymentsEnabled={config.paymentsEnabled}
    />
  );
}
