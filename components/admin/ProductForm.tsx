"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

type Category = { id: string; name: string };

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
    categoryId: string;
    imageUrl: string | null;
    active: boolean;
    inventory?: { quantity: number } | null;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const price = parseFloat(fd.get("price") as string);
    const priceCents = Math.round(price * 100);

    let imageUrl = product?.imageUrl ?? null;
    const file = fd.get("image") as File | null;
    if (file && file.size > 0) {
      const uploadFd = new FormData();
      uploadFd.append("file", file);
      const up = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadFd,
      });
      if (up.ok) {
        const { url } = await up.json();
        imageUrl = url;
      }
    }

    const payload = {
      name: fd.get("name"),
      description: (fd.get("description") as string) || undefined,
      priceCents,
      categoryId: fd.get("categoryId"),
      imageUrl: imageUrl ?? undefined,
      active: fd.get("active") === "on",
      ...(product ? {} : { initialQuantity: parseInt(fd.get("quantity") as string) || 0 }),
    };

    const url = product
      ? `/api/admin/products/${product.id}`
      : "/api/admin/products";
    const method = product ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao salvar");
      return;
    }

    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-2xl bg-white p-4 shadow-sm">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="text-sm">Nome</label>
        <input name="name" required defaultValue={product?.name} className="mt-1 w-full rounded-xl border px-3 py-2" />
      </div>
      <div>
        <label className="text-sm">Descrição</label>
        <textarea name="description" defaultValue={product?.description ?? ""} className="mt-1 w-full rounded-xl border px-3 py-2" rows={2} />
      </div>
      <div>
        <label className="text-sm">Preço (R$)</label>
        <input name="price" type="number" step="0.01" min="0" required defaultValue={product ? (product.priceCents / 100).toFixed(2) : ""} className="mt-1 w-full rounded-xl border px-3 py-2" />
        {product && <p className="text-xs text-zinc-400 mt-1">Atual: {formatPrice(product.priceCents)}</p>}
      </div>
      <div>
        <label className="text-sm">Categoria</label>
        <select name="categoryId" required defaultValue={product?.categoryId} className="mt-1 w-full rounded-xl border px-3 py-2">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {!product && (
        <div>
          <label className="text-sm">Estoque inicial</label>
          <input name="quantity" type="number" min="0" defaultValue={0} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </div>
      )}
      <div>
        <label className="text-sm">Imagem</label>
        <input name="image" type="file" accept="image/*" className="mt-1 w-full text-sm" />
      </div>
      {product && (
        <label className="flex items-center gap-2 text-sm">
          <input name="active" type="checkbox" defaultChecked={product.active} />
          Produto ativo
        </label>
      )}
      <button type="submit" disabled={loading} className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-50">
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
