import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { SettingsBar } from "@/components/admin/SettingsBar";
import { prisma } from "@/lib/db";

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

  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId },
    select: { whatsapp: true },
  });

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <nav className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <AdminNav />
          <div className="flex items-center gap-2">
            <SettingsBar initialWhatsapp={store?.whatsapp} />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
