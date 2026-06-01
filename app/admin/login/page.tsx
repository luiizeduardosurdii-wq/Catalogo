import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <form
        action={loginAction}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-lg"
      >
        <h1 className="text-2xl font-bold">Admin Catálogo</h1>
        <p className="text-sm text-zinc-500">admin@loja.com / admin123</p>
        <div>
          <label className="text-sm text-zinc-600">Email</label>
          <input
            name="email"
            type="email"
            required
            defaultValue="admin@loja.com"
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-600">Senha</label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
