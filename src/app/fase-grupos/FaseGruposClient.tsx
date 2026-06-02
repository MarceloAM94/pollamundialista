"use client";

import { useEffect, useState, useCallback } from "react";

type PronosticoData = {
  id: number;
  golesLocal: number | null;
  golesVisita: number | null;
};

type PartidoData = {
  id: number;
  grupo: string;
  equipoLocal: string;
  equipoVisita: string;
  fechaHora: string;
  estadio: string | null;
  estado: string;
  bloqueado: boolean;
  golesLocalReal: number | null;
  golesVisitaReal: number | null;
  miPronostico: PronosticoData | null;
};

const GRUPOS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  });
}

export default function FaseGruposClient() {
  const [partidos, setPartidos] = useState<PartidoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [goles, setGoles] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const cargarPartidos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/partidos");
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setPartidos(data.partidos);

      const golesInicial: Record<string, string> = {};
      for (const p of data.partidos as PartidoData[]) {
        if (p.miPronostico) {
          golesInicial[`${p.id}-local`] = String(p.miPronostico.golesLocal ?? "");
          golesInicial[`${p.id}-visita`] = String(p.miPronostico.golesVisita ?? "");
        }
      }
      setGoles(golesInicial);
    } catch {
      setError("No se pudieron cargar los partidos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPartidos();
  }, [cargarPartidos]);

  const partidosEnGrupo = (grupo: string) =>
    partidos.filter((p) => p.grupo === grupo);

  const equiposDelGrupo = (grupo: string): string[] => {
    const equipos = new Set<string>();
    for (const p of partidos) {
      if (p.grupo === grupo) {
        equipos.add(p.equipoLocal);
        equipos.add(p.equipoVisita);
      }
    }
    return Array.from(equipos);
  };

  async function guardar(partidoId: number) {
    const golesLocal = parseInt(goles[`${partidoId}-local`] ?? "", 10);
    const golesVisita = parseInt(goles[`${partidoId}-visita`] ?? "", 10);

    if (isNaN(golesLocal) || isNaN(golesVisita)) {
      return;
    }

    setSaving((prev) => ({ ...prev, [partidoId]: true }));
    try {
      const res = await fetch("/api/pronosticos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partidoId, golesLocal, golesVisita }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      setSaved((prev) => ({ ...prev, [partidoId]: true }));
      setTimeout(() => {
        setSaved((prev) => ({ ...prev, [partidoId]: false }));
      }, 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar");
      setTimeout(() => setSaveError(""), 4000);
    } finally {
      setSaving((prev) => ({ ...prev, [partidoId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center">
        <p className="text-white text-xl">Cargando partidos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Fase de Grupos</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {saveError && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6">
            {saveError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GRUPOS.map((letra) => {
            const e = equiposDelGrupo(letra);
            const ps = partidosEnGrupo(letra);
            if (ps.length === 0) return null;

            return (
              <div
                key={letra}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden"
              >
                <div className="bg-green-700/50 px-4 py-3">
                  <h2 className="text-xl font-bold text-white">
                    Grupo {letra}
                  </h2>
                  <p className="text-green-200 text-sm">{e.join(" · ")}</p>
                </div>

                <div className="divide-y divide-white/10">
                  {ps.map((p) => (
                    <div key={p.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-green-200 text-xs">
                          {formatFecha(p.fechaHora)}
                        </span>
                        {p.estadio && (
                          <span className="text-green-300 text-xs">
                            {p.estadio}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium flex-1 text-right">
                          {p.equipoLocal}
                        </span>

                        {p.bloqueado ? (
                          <span className="text-gray-400 text-sm px-2">
                            {p.miPronostico
                              ? `${p.miPronostico.golesLocal} - ${p.miPronostico.golesVisita}`
                              : "vs"}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={goles[`${p.id}-local`] ?? ""}
                              onChange={(e) =>
                                setGoles((prev) => ({
                                  ...prev,
                                  [`${p.id}-local`]: e.target.value,
                                }))
                              }
                              className="w-12 h-10 text-center rounded-lg bg-white/20 text-white font-bold text-lg border border-white/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <span className="text-white font-bold">-</span>
                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={goles[`${p.id}-visita`] ?? ""}
                              onChange={(e) =>
                                setGoles((prev) => ({
                                  ...prev,
                                  [`${p.id}-visita`]: e.target.value,
                                }))
                              }
                              className="w-12 h-10 text-center rounded-lg bg-white/20 text-white font-bold text-lg border border-white/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                          </div>
                        )}

                        <span className="text-white font-medium flex-1">
                          {p.equipoVisita}
                        </span>
                      </div>

                      {!p.bloqueado && (
                        <div className="mt-2 flex justify-end">
                          {saved[p.id] ? (
                            <span className="text-green-300 text-sm font-medium">
                              Guardado
                            </span>
                          ) : (
                            <button
                              onClick={() => guardar(p.id)}
                              disabled={
                                saving[p.id] ||
                                (goles[`${p.id}-local`] === undefined &&
                                  goles[`${p.id}-visita`] === undefined)
                              }
                              className="text-xs bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                            >
                              {saving[p.id] ? "Guardando..." : "Guardar"}
                            </button>
                          )}
                        </div>
                      )}

                      {p.bloqueado && !p.miPronostico && (
                        <p className="text-gray-500 text-xs mt-1 text-right">
                          Bloqueado
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
