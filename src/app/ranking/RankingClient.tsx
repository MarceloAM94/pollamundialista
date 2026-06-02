"use client";

import { useEffect, useState } from "react";
import Skeleton from "@/app/components/Skeleton";

type RankingEntry = {
  posicion: number;
  usuarioId: number;
  nombre: string;
  username: string;
  puntos: number;
  exactos: number;
  diferencias: number;
  pronosticos: number;
};

function LoadingSkeleton() {
  return (
    <div style={{ background: "#000" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-9 w-48 mb-8" />
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111217" }}>
          <Skeleton className="h-10 rounded-none" />
          <div className="divide-y divide-white/5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-3">
                <Skeleton className="h-5 w-5 shrink-0" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-8 shrink-0" />
                <Skeleton className="h-5 w-8 shrink-0" />
                <Skeleton className="h-5 w-8 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RankingClient() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [misPuntos, setMisPuntos] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/ranking")
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar ranking");
        return r.json();
      })
      .then((data) => {
        setRanking(data.ranking);
        setMisPuntos(data.misPuntos);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error de conexión");
      })
      .finally(() => setLoading(false));

    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUserId(data?.user?.id ?? null))
      .catch(() => {});
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div style={{ background: "#000" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "#D4AF37" }}>
          Ranking
        </h1>

        {error && (
          <div className="border px-4 py-3 rounded-lg mb-6 text-sm" style={{ borderColor: "#E61D25", color: "#E61D25", background: "rgba(230,29,37,0.1)" }}>
            {error}
          </div>
        )}

        <div className="rounded-2xl overflow-hidden shadow-lg animate-fade-in" style={{ background: "#111217", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#D4AF37", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)" }}>
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Nombre</div>
            <div className="col-span-2 text-center">Pts</div>
            <div className="col-span-2 text-center" title="Resultados exactos (3 pts)">3</div>
            <div className="col-span-2 text-center" title="Diferencias correctas (1 pt)">1</div>
          </div>

          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {ranking.map((entry) => {
              const esYo = entry.usuarioId === userId;
              return (
                <div
                  key={entry.usuarioId}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors ${
                    esYo ? "bg-[rgba(212,175,55,0.08)]" : "hover:bg-white/[0.02]"
                  }`}
                  style={esYo ? { borderLeft: "3px solid #D4AF37" } : {}}
                >
                  <div className="col-span-1 text-center">
                    {entry.posicion === 1 ? (
                      <span className="text-lg" style={{ filter: "drop-shadow(0 0 6px rgba(212,175,55,0.5))" }}>🥇</span>
                    ) : entry.posicion === 2 ? (
                      <span className="text-lg">🥈</span>
                    ) : entry.posicion === 3 ? (
                      <span className="text-lg">🥉</span>
                    ) : (
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{entry.posicion}</span>
                    )}
                  </div>
                  <div className="col-span-5">
                    <div className="font-medium text-sm truncate" style={{ color: "#fff" }}>
                      {entry.nombre}
                      {esYo && <span className="text-xs ml-1" style={{ color: "#D4AF37" }}>(tú)</span>}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>@{entry.username}</div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="font-bold text-lg" style={{ color: "#D4AF37" }}>{entry.puntos}</span>
                  </div>
                  <div className="col-span-2 text-center" style={{ color: "#3CAC3B" }}>
                    {entry.exactos}
                  </div>
                  <div className="col-span-2 text-center" style={{ color: "#FBE84E" }}>
                    {entry.diferencias}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {misPuntos !== null && (
          <div className="mt-6 rounded-2xl p-4 text-center animate-fade-in" style={{ background: "#111217", border: "1px solid rgba(212,175,55,0.2)" }}>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Tus puntos: <span className="font-bold text-lg" style={{ color: "#D4AF37" }}>{misPuntos}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
