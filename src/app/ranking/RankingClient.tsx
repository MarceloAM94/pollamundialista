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
    <div className="min-h-screen" style={{ background: "var(--color-green-950)" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-9 w-48 mb-8" />
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
          <Skeleton className="h-10 rounded-none" />
          <div className="divide-y divide-white/10">
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
    <div className="min-h-screen" style={{ background: "var(--color-green-950)" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Ranking</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-green-900/30">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/10 text-xs text-green-300 font-semibold uppercase tracking-wider bg-gradient-to-r from-green-800/50 to-green-900/50">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Nombre</div>
            <div className="col-span-2 text-center">Pts</div>
            <div className="col-span-2 text-center" title="Resultados exactos (3 pts)">3</div>
            <div className="col-span-2 text-center" title="Diferencias correctas (1 pt)">1</div>
          </div>

          <div className="divide-y divide-white/10">
            {ranking.map((entry) => {
              const esYo = entry.usuarioId === userId;
              return (
                <div
                  key={entry.usuarioId}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors ${
                    esYo
                      ? "bg-green-600/20 hover:bg-green-600/25"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="col-span-1 text-center">
                    {entry.posicion <= 3 ? (
                      <span className="text-lg">
                        {entry.posicion === 1 ? "🥇" : entry.posicion === 2 ? "🥈" : "🥉"}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">{entry.posicion}</span>
                    )}
                  </div>
                  <div className="col-span-5">
                    <div className="text-white font-medium text-sm truncate">
                      {entry.nombre}
                      {esYo && <span className="text-green-300 text-xs ml-1">(tú)</span>}
                    </div>
                    <div className="text-green-300 text-xs">@{entry.username}</div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-white font-bold text-lg">{entry.puntos}</span>
                  </div>
                  <div className="col-span-2 text-center text-green-400">
                    {entry.exactos}
                  </div>
                  <div className="col-span-2 text-center text-yellow-400">
                    {entry.diferencias}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {misPuntos !== null && (
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
            <p className="text-green-200 text-sm">
              Tus puntos: <span className="text-white font-bold text-lg">{misPuntos}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
