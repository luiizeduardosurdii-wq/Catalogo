import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { SettingsBar } from "@/components/admin/SettingsBar";

export default function LoginPage() {
  async function loginAction(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/admin",
      });
    } catch (e) {
      if (e instanceof AuthError) {
        redirect("/admin/login?error=1");
      }
      throw e;
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-100 p-4 dark:bg-zinc-950">
      <div className="absolute right-4 top-4">
        <SettingsBar />
      </div>
      <form
        action={loginAction}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900 dark:shadow-none dark:ring-1 dark:ring-zinc-800"
      >
        <h1 className="text-2xl font-bold dark:text-zinc-100">Admin Catálogo</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          admin@loja.com / admin123
        </p>
        <div>
          <label className="text-sm text-zinc-600 dark:text-zinc-400">Email</label>
          <input
            name="email"
            type="email"
            required
            defaultValue="admin@loja.com"
            className="admin-input mt-1 w-full py-2"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-600 dark:text-zinc-400">Senha</label>
          <input
            name="password"
            type="password"
            required
            className="admin-input mt-1 w-full py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
