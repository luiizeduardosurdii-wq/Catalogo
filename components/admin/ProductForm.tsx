"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { ProductImageUpload } from "@/components/admin/ProductImageUpload";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

type Category = { id: string; name: string };

type ImageChange = { file: File | null; remove: boolean };

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputClass =
  "admin-input w-full px-3 py-2.5 text-sm";

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
  const [imageChange, setImageChange] = useState<ImageChange>({
    file: null,
    remove: false,
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const price = parseFloat(fd.get("price") as string);
    const priceCents = Math.round(price * 100);

    let imageUrl: string | null | undefined = product?.imageUrl ?? null;

    if (imageChange.remove) {
      imageUrl = null;
    } else if (imageChange.file) {
      const uploadFd = new FormData();
      uploadFd.append("file", imageChange.file);
      const up = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadFd,
      });
      if (!up.ok) {
        const data = await up.json().catch(() => ({}));
        setLoading(false);
        setError(data.error ?? "Erro ao enviar a foto");
        return;
      }
      const { url } = await up.json();
      imageUrl = url;
    }

    const payload = {
      name: fd.get("name"),
      description: (fd.get("description") as string) || undefined,
      priceCents,
      categoryId: fd.get("categoryId"),
      imageUrl: imageUrl === null ? null : imageUrl ?? undefined,
      active: fd.get("active") === "on",
      ...(product
        ? {}
        : { initialQuantity: parseInt(fd.get("quantity") as string) || 0 }),
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
    <form
      onSubmit={handleSubmit}
      className="admin-card max-w-2xl space-y-6 p-6"
    >
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Informações
        </h2>
        <Field label="Nome">
          <input
            name="name"
            required
            defaultValue={product?.name}
            className={inputClass}
            placeholder="Ex: Sabonete artesanal"
          />
        </Field>
        <Field label="Descrição">
          <textarea
            name="description"
            defaultValue={product?.description ?? ""}
            className={inputClass}
            rows={3}
            placeholder="Descrição opcional para o catálogo"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preço (R$)">
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={
                product ? (product.priceCents / 100).toFixed(2) : ""
              }
              className={inputClass}
              placeholder="0,00"
            />
            {product && (
              <p className="mt-1 text-xs text-zinc-400">
                Atual: {formatPrice(product.priceCents)}
              </p>
            )}
          </Field>
          <Field label="Categoria">
            <select
              name="categoryId"
              required
              defaultValue={product?.categoryId}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {!product && (
          <Field label="Estoque inicial">
            <input
              name="quantity"
              type="number"
              min="0"
              defaultValue={0}
              className={inputClass}
            />
          </Field>
        )}
      </section>

      <section className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Foto
        </h2>
        <ProductImageUpload
          currentImageUrl={product?.imageUrl ?? null}
          onChange={setImageChange}
        />
      </section>

      {product && (
        <section className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950">
            <input
              name="active"
              type="checkbox"
              defaultChecked={product.active}
              className="h-4 w-4 rounded border-zinc-300 text-emerald-600"
            />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Produto ativo</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Produtos inativos não aparecem no catálogo
              </p>
            </div>
          </label>
        </section>
      )}

      {product && (
        <section className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-red-500">
            Zona de perigo
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Excluir remove o produto da lista. Se já houver pedidos, ele será
            apenas desativado.
          </p>
          <DeleteProductButton
            productId={product.id}
            productName={product.name}
            className="mt-3"
          />
        </section>
      )}

      <div className="flex flex-wrap gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar produto"}
        </button>
        <Link
          href="/admin/produtos"
          className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
