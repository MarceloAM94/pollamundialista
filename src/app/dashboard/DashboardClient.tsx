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
    <div style={{ background: "#000" }}>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl p-8 text-center border shadow-lg animate-fade-in" style={{ background: "#111217", borderColor: "rgba(212,175,55,0.2)" }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#D4AF37" }}>
            ¡Bienvenido, {userName}!
          </h2>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
            Mundial 2026 · México, Estados Unidos, Canadá
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Link href="/fase-grupos" className="rounded-xl p-6 block transition-all duration-200 hover:scale-[1.02]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-3xl font-bold" style={{ color: "#D4AF37" }}>{totalGrupos}</div>
              <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Fase de Grupos</div>
            </Link>
            <Link href="/eliminatorias" className="rounded-xl p-6 block transition-all duration-200 hover:scale-[1.02]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-3xl font-bold" style={{ color: "#D4AF37" }}>{totalEliminatorias}</div>
              <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Eliminatorias</div>
            </Link>
            <Link href="/ranking" className="rounded-xl p-6 block transition-all duration-200 hover:scale-[1.02]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-3xl font-bold" style={{ color: "#D4AF37" }}>{userPuntos}</div>
              <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Tus puntos</div>
            </Link>
          </div>

          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link
              href="/fase-grupos"
              className="font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ background: "#D4AF37", color: "#000" }}
            >
              ⚽ Fase de Grupos
            </Link>
            <Link
              href="/eliminatorias"
              className="font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ background: "#D4AF37", color: "#000" }}
            >
              🏆 Eliminatorias
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
                style={{ background: "#E61D25", color: "#fff" }}
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
