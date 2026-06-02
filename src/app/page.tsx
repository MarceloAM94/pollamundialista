import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-gradient-to-br from-green-800 to-green-950">
      <main className="flex flex-col items-center gap-8 text-center px-4">
        <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight">
          🏆 Polla Mundialista
        </h1>
        <p className="text-xl sm:text-2xl text-green-200 font-light">
          Mundial 2026 · México, Estados Unidos, Canadá
        </p>
        <p className="text-base text-green-300/70">
          La app de pronósticos para tu grupo de amigos
        </p>
        <div className="flex gap-4 mt-4">
          <a
            href="/login"
            className="rounded-full bg-white text-green-900 px-8 py-3 font-semibold text-lg hover:bg-green-100 transition-colors"
          >
            Iniciar Sesión
          </a>
          <a
            href="/registro"
            className="rounded-full border-2 border-white/30 text-white px-8 py-3 font-semibold text-lg hover:bg-white/10 transition-colors"
          >
            Registrarse
          </a>
        </div>
      </main>
      <footer className="mt-auto py-6 text-green-400/50 text-sm">
        Solo para fines recreativos entre amigos
      </footer>
    </div>
  );
}
