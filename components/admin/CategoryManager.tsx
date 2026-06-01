"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-2xl bg-white p-4 shadow-sm">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nova categoria"
          className="flex-1 rounded-xl border px-3 py-2"
        />
        <button
          type="button"
          disabled={loading}
          onClick={create}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-white"
        >
          Adicionar
        </button>
      </div>

      <ul className="space-y-2">
        {initial.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <span className="font-medium">{c.name}</span>
              <span className="ml-2 text-sm text-zinc-400">
                ({c._count.products} produtos)
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggle(c.id, c.active)}
              className={`text-sm ${c.active ? "text-emerald-600" : "text-red-500"}`}
            >
              {c.active ? "Ativa" : "Inativa"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
