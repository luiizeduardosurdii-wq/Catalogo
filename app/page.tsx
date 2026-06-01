import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-6">
      <h1 className="text-3xl font-bold text-zinc-900">Catálogo WhatsApp</h1>
      <p className="mt-2 max-w-md text-center text-zinc-600">
        Catálogo PWA com estoque e pagamento PIX. Compartilhe o link no WhatsApp.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/s/minha-loja"
          className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg"
        >
          Ver loja demo
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
