"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { formatApiError } from "@/lib/apiError";

type SettingsBarProps = {
  initialWhatsapp?: string | null;
};

export function SettingsBar({ initialWhatsapp }: SettingsBarProps) {
  const { theme, setTheme, mounted } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [whatsapp, setWhatsapp] = useState(initialWhatsapp ?? "");
  const [saving, setSaving] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState("");
  const [whatsappError, setWhatsappError] = useState("");

  const showStoreSettings = initialWhatsapp !== undefined;

  useEffect(() => {
    setWhatsapp(initialWhatsapp ?? "");
  }, [initialWhatsapp]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function saveWhatsapp() {
    setSaving(true);
    setWhatsappMsg("");
    setWhatsappError("");

    const res = await fetch("/api/admin/store", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsapp }),
    });

    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setWhatsappError(formatApiError(data.error, "Erro ao salvar"));
      return;
    }

    setWhatsapp(data.whatsapp ?? "");
    setWhatsappMsg("Número salvo!");
    router.refresh();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Configurações"
        aria-expanded={open}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg sm:w-72 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Configurações
          </p>

          {showStoreSettings && (
            <div className="mt-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                WhatsApp
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Número que recebe pedidos do catálogo
              </p>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  setWhatsappMsg("");
                  setWhatsappError("");
                }}
                placeholder="5511999999999"
                className="admin-input mt-2 w-full py-2 text-sm"
              />
              <p className="mt-1 text-[10px] text-zinc-400">
                DDI + DDD + número, só dígitos
              </p>
              {whatsappError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {whatsappError}
                </p>
              )}
              {whatsappMsg && (
                <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  {whatsappMsg}
                </p>
              )}
              <button
                type="button"
                disabled={saving}
                onClick={saveWhatsapp}
                className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar número"}
              </button>
            </div>
          )}

          <div className={showStoreSettings ? "mt-4" : "mt-4"}>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Aparência
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <ThemeOption
                label="Claro"
                icon="☀️"
                active={mounted && theme === "light"}
                onClick={() => setTheme("light")}
              />
              <ThemeOption
                label="Escuro"
                icon="🌙"
                active={mounted && theme === "dark"}
                onClick={() => setTheme("dark")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeOption({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-sm transition ${
        active
          ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300"
          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
