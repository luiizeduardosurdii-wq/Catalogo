import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLogin = false;

  if (!session?.user && !isLogin) {
    return <>{children}</>;
  }

  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <nav className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex gap-4 text-sm font-medium">
            <Link href="/admin" className="text-emerald-700">
              Dashboard
            </Link>
            <Link href="/admin/produtos">Produtos</Link>
            <Link href="/admin/categorias">Categorias</Link>
            <Link href="/admin/pedidos">Pedidos</Link>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button type="submit" className="text-sm text-zinc-500">
              Sair
            </button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
