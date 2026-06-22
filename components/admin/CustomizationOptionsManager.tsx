"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = {
  id: string;
  type: "FRAGRANCE" | "COLOR";
  label: string;
  hexColor: string | null;
  sortOrder: number;
  active: boolean;
};

function OptionSection({
  title,
  description,
  type,
  options,
}: {
  title: string;
  description: string;
  type: "FRAGRANCE" | "COLOR";
  options: Option[];
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [hexColor, setHexColor] = useState("#0E9F6E");
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!label.trim()) return;
    setLoading(true);
    await fetch("/api/admin/customization-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        label: label.trim(),
        ...(type === "COLOR" ? { hexColor } : {}),
      }),
    });
    setLabel("");
    setLoading(false);
    router.refresh();
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/admin/customization-options/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta opção?")) return;
    await fetch(`/api/admin/customization-options/${id}`, {
      method: "DELETE",
    });
    router.refresh();
  }

  const filtered = options.filter((o) => o.type === type);

  return (
    <section className="admin-card space-y-4 p-5">
      <div>
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={type === "FRAGRANCE" ? "Ex.: Lavanda" : "Ex.: Rosa claro"}
          className="admin-input min-w-[180px] flex-1 py-2"
        />
        {type === "COLOR" && (
          <input
            type="color"
            value={hexColor}
            onChange={(e) => setHexColor(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700"
            aria-label="Cor"
          />
        )}
        <button
          type="button"
          disabled={loading || !label.trim()}
          onClick={create}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-400">Nenhuma opção cadastrada.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((option) => (
            <li
              key={option.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex min-w-0 items-center gap-3">
                {option.type === "COLOR" && option.hexColor && (
                  <span
                    className="h-6 w-6 shrink-0 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-700"
                    style={{ backgroundColor: option.hexColor }}
                    aria-hidden
                  />
                )}
                <span
                  className={`font-medium ${option.active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 line-through"}`}
                >
                  {option.label}
                </span>
                {option.type === "COLOR" && option.hexColor && (
                  <span className="text-xs text-zinc-400">{option.hexColor}</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggle(option.id, option.active)}
                  className={`text-sm ${option.active ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}
                >
                  {option.active ? "Ativa" : "Inativa"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(option.id)}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CustomizationOptionsManager({ initial }: { initial: Option[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <OptionSection
        title="Fragrâncias"
        description="Opções exibidas no carrinho para sabonetes."
        type="FRAGRANCE"
        options={initial}
      />
      <OptionSection
        title="Cores"
        description="Cores disponíveis para personalização do sabonete."
        type="COLOR"
        options={initial}
      />
    </div>
  );
}
