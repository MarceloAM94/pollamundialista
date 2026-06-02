"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Skeleton from "@/app/components/Skeleton";

type Props = {
  userName: string;
  isAdmin: boolean;
  userPuntos: number;
};

export default function DashboardClient({ userName, isAdmin, userPuntos }: Props) {
  const router = useRouter();

  async function handleLogout() {
    if (!confirm("¿Cerrar sesión?")) return;
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const totalGrupos = 72;
  const totalEliminatorias = 32;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-green-950)" }}>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10 shadow-lg shadow-green-900/30">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¡Bienvenido, {userName}!
          </h2>
          <p className="text-green-200 text-lg mb-8">
            Mundial 2026 · México, Estados Unidos, Canadá
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Link href="/fase-grupos" className="bg-white/5 rounded-xl p-6 text-white block hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-green-600/20 border border-white/5">
              <div className="text-3xl font-bold text-green-400">{totalGrupos}</div>
              <div className="text-sm text-green-200 mt-1">Fase de Grupos</div>
            </Link>
            <Link href="/eliminatorias" className="bg-white/5 rounded-xl p-6 text-white block hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-green-600/20 border border-white/5">
              <div className="text-3xl font-bold text-green-400">{totalEliminatorias}</div>
              <div className="text-sm text-green-200 mt-1">Eliminatorias</div>
            </Link>
            <Link href="/ranking" className="bg-white/5 rounded-xl p-6 text-white block hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-green-600/20 border border-white/5">
              <div className="text-3xl font-bold text-green-400">{userPuntos}</div>
              <div className="text-sm text-green-200 mt-1">Tus puntos</div>
            </Link>
          </div>

          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link
              href="/fase-grupos"
              className="bg-white text-green-900 px-6 py-3 rounded-lg font-semibold hover:bg-green-100 transition-all hover:shadow-lg"
            >
              ⚽ Fase de Grupos
            </Link>
            <Link
              href="/eliminatorias"
              className="bg-white text-green-900 px-6 py-3 rounded-lg font-semibold hover:bg-green-100 transition-all hover:shadow-lg"
            >
              🏆 Eliminatorias
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-yellow-500 text-yellow-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-all hover:shadow-lg"
              >
                ⚙️ Panel Admin
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
