import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-6">
      <div className="logo-container w-full">
        <BrandLogo size="hero" centered />
      </div>
      <div className="mt-2 w-full max-w-md self-start pl-1 text-left">
        <p className="text-sm font-medium tracking-wide text-zinc-800">
          Sabonetes Artesanais
        </p>
        <p className="mt-0.5 text-xs font-medium text-emerald-700">
          Sabonetes • Sachês • Sprays
        </p>
      </div>
      <p className="mt-4 max-w-md self-start pl-1 text-left text-zinc-600">
        Peça pelo WhatsApp.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/s/saboart"
          className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg"
        >
          Ver SaboArt
        </Link>
        <Link
          href="/admin/login"
          className="rounded-2xl border border-emerald-600 px-6 py-3 font-semibold text-emerald-700"
        >
          Painel admin
        </Link>
      </div>
    </div>
  );
}
