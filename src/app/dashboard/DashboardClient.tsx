"use client";

import { useRouter } from "next/navigation";

type Props = {
  userName: string;
  isAdmin: boolean;
};

export default function DashboardClient({ userName, isAdmin }: Props) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950">
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            🏆 Polla Mundialista
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-green-200 text-sm">
              {userName}
              {isAdmin && " (Admin)"}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-green-300 hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¡Bienvenido, {userName}!
          </h2>
          <p className="text-green-200 text-lg mb-8">
            Mundial 2026 · México, Estados Unidos, Canadá
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white/5 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold text-green-400">72</div>
              <div className="text-sm text-green-200 mt-1">
                Partidos F. Grupos
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold text-green-400">32</div>
              <div className="text-sm text-green-200 mt-1">
                Partidos Eliminatoria
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold text-green-400">0</div>
              <div className="text-sm text-green-200 mt-1">
                Tus puntos
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/fase-grupos"
              className="bg-white text-green-900 px-6 py-3 rounded-lg font-semibold hover:bg-green-100 transition-colors"
            >
              Fase de Grupos
            </a>
            {isAdmin && (
              <a
                href="/admin"
                className="bg-yellow-500 text-yellow-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Panel Admin
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
