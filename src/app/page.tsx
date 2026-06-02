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
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen" style={{ background: "#000" }}>
      <main className="flex flex-col items-center gap-8 text-center px-4">
        <span className="text-6xl sm:text-8xl">🏆</span>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight" style={{ color: "#D4AF37" }}>
          Polla Mundialista
        </h1>
        <p className="text-xl sm:text-2xl font-light" style={{ color: "rgba(255,255,255,0.5)" }}>
          Mundial 2026 · México, Estados Unidos, Canadá
        </p>
        <p className="text-base" style={{ color: "rgba(255,255,255,0.3)" }}>
          La app de pronósticos para tu grupo de amigos
        </p>
        <div className="flex gap-4 mt-4">
          <a
            href="/login"
            className="rounded-full px-8 py-3 font-semibold text-lg transition-all duration-200 hover:scale-105"
            style={{ background: "#D4AF37", color: "#000" }}
          >
            Iniciar Sesión
          </a>
          <a
            href="/registro"
            className="rounded-full px-8 py-3 font-semibold text-lg transition-all duration-200 hover:scale-105"
            style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
          >
            Registrarse
          </a>
        </div>
      </main>
      <footer className="mt-auto py-6 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
        Solo para fines recreativos entre amigos
      </footer>
    </div>
  );
}
