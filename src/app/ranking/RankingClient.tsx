"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function RankingClient() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [misPuntos, setMisPuntos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ranking")
      .then((r) => r.json())
      .then((data) => {
        setRanking(data.ranking);
        setMisPuntos(data.misPuntos);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center">
        <p className="text-white text-xl">Cargando ranking...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Ranking</h1>
          <Link
            href="/dashboard"
            className="text-green-300 hover:text-white transition-colors"
          >
            Volver al Dashboard
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/10 text-xs text-green-300 font-semibold uppercase">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Nombre</div>
            <div className="col-span-2 text-center">Pts</div>
            <div className="col-span-2 text-center">3</div>
            <div className="col-span-2 text-center">1</div>
          </div>

          <div className="divide-y divide-white/10">
            {ranking.map((entry) => (
              <div
                key={entry.usuarioId}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center"
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
            ))}
          </div>
        </div>

        {misPuntos > 0 && (
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
            <p className="text-green-200 text-sm">
              Tus puntos: <span className="text-white font-bold text-lg">{misPuntos}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
