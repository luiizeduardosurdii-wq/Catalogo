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
    <div className="admin-shell">
      <header className="admin-nav">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
          <AdminNav />
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <SettingsBar initialWhatsapp={store?.whatsapp} />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button type="submit" className="admin-btn-ghost max-md:px-2 max-md:text-xs">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
