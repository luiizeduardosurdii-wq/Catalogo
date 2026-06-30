"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatApiError } from "@/lib/apiError";

type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
  _count: { products: number };
};

export function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  async function create() {
    if (!name.trim()) return;
    setLoading(true);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    setLoading(false);
    router.refresh();
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  async function remove(id: string, categoryName: string) {
    if (!window.confirm(`Excluir a categoria "${categoryName}"?`)) return;

    setDeletingId(id);
    setErrorById((prev) => ({ ...prev, [id]: "" }));

    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setDeletingId(null);

    if (!res.ok) {
      setErrorById((prev) => ({
        ...prev,
        [id]: formatApiError(data.error, "Erro ao excluir"),
      }));
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm sm:flex-row dark:bg-zinc-900 dark:shadow-none dark:ring-1 dark:ring-zinc-800">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nova categoria"
          className="admin-input min-h-[2.75rem] flex-1 py-2 sm:min-h-0"
        />
        <button
          type="button"
          disabled={loading}
          onClick={create}
          className="min-h-[2.75rem] shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-white sm:min-h-0"
        >
          Adicionar
        </button>
      </div>

      <ul className="space-y-2">
        {initial.map((c) => (
          <li
            key={c.id}
            className="rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-zinc-900 dark:shadow-none dark:ring-1 dark:ring-zinc-800"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <span className="font-medium dark:text-zinc-100">{c.name}</span>
                <span className="ml-2 text-sm text-zinc-400">
                  ({c._count.products} produtos)
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggle(c.id, c.active)}
                  className={`min-h-[2.5rem] px-2 text-sm sm:min-h-0 ${c.active ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
                >
                  {c.active ? "Ativa" : "Inativa"}
                </button>
                <button
                  type="button"
                  disabled={deletingId === c.id || c._count.products > 0}
                  title={
                    c._count.products > 0
                      ? "Remova ou mova os produtos antes de excluir"
                      : `Excluir ${c.name}`
                  }
                  onClick={() => remove(c.id, c.name)}
                  className="min-h-[2.5rem] rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50 sm:min-h-0"
                >
                  {deletingId === c.id ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
            {errorById[c.id] && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                {errorById[c.id]}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
