"use client";

import { useEffect, useState, useCallback } from "react";
import CountryFlag from "@/app/components/CountryFlag";
import Skeleton from "@/app/components/Skeleton";

type PronosticoData = {
  id: number;
  golesLocal: number | null;
  golesVisita: number | null;
  penalesLocal: number | null;
  penalesVisita: number | null;
};

type PartidoData = {
  id: number;
  ronda: string;
  equipoLocal: string;
  equipoVisita: string;
  fechaHora: string;
  estadio: string | null;
  estado: string;
  bloqueado: boolean;
  golesLocalReal: number | null;
  golesVisitaReal: number | null;
  penalesLocal: number | null;
  penalesVisita: number | null;
  miPronostico: PronosticoData | null;
};

const RONDAS = [
  { key: "octavos", label: "Octavos" },
  { key: "cuartos", label: "Cuartos" },
  { key: "semifinal", label: "Semifinal" },
  { key: "tercer_puesto", label: "3er Puesto" },
  { key: "final", label: "Final" },
];

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

function LoadingSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-green-950)" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-9 w-64 mb-8" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden min-w-[280px]">
              <Skeleton className="h-12 rounded-none" />
              <div className="divide-y divide-white/10">
                {Array.from({ length: i < 2 ? 4 : 2 }).map((_, j) => (
                  <div key={j} className="p-4">
                    <Skeleton className="h-3 w-28 mb-2" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 flex-1" />
                      <Skeleton className="h-10 w-28" />
                      <Skeleton className="h-5 flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EliminatoriasClient() {
  const [partidos, setPartidos] = useState<PartidoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const cargarPartidos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/partidos/eliminatorias");
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setPartidos(data.partidos);

      const v: Record<string, string> = {};
      for (const p of data.partidos as PartidoData[]) {
        if (p.miPronostico) {
          v[`${p.id}-local`] = String(p.miPronostico.golesLocal ?? "");
          v[`${p.id}-visita`] = String(p.miPronostico.golesVisita ?? "");
          v[`${p.id}-pen-local`] = String(p.miPronostico.penalesLocal ?? "");
          v[`${p.id}-pen-visita`] = String(p.miPronostico.penalesVisita ?? "");
        }
      }
      setValues(v);
    } catch {
      setError("No se pudieron cargar los partidos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPartidos();
  }, [cargarPartidos]);

  async function guardar(partidoId: number) {
    const golesLocal = parseInt(values[`${partidoId}-local`] ?? "", 10);
    const golesVisita = parseInt(values[`${partidoId}-visita`] ?? "", 10);
    const penalesLocal = values[`${partidoId}-pen-local`]
      ? parseInt(values[`${partidoId}-pen-local`] ?? "", 10)
      : undefined;
    const penalesVisita = values[`${partidoId}-pen-visita`]
      ? parseInt(values[`${partidoId}-pen-visita`] ?? "", 10)
      : undefined;

    if (isNaN(golesLocal) || isNaN(golesVisita)) return;

    setSaving((prev) => ({ ...prev, [partidoId]: true }));
    try {
      const res = await fetch("/api/pronosticos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partidoId,
          golesLocal,
          golesVisita,
          penalesLocal,
          penalesVisita,
        }),
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

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-green-950)" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Eliminatorias</h1>

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

        <div className="flex flex-col md:flex-row gap-4 md:gap-3 overflow-x-auto pb-4">
          {RONDAS.map(({ key, label }, idx) => {
            const ps = partidos.filter((p) => p.ronda === key);
            if (ps.length === 0) return null;

            return (
              <div
                key={key}
                className="flex-1 min-w-[280px] md:min-w-0"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-green-900/30">
                  <div className="bg-gradient-to-r from-green-700/80 to-green-800/80 px-4 py-3">
                    <h2 className="text-lg font-bold text-white text-center">{label}</h2>
                  </div>

                  <div className="divide-y divide-white/10">
                    {ps.map((p, matchIdx) => (
                      <div
                        key={p.id}
                        className="px-3 py-3 transition-colors hover:bg-white/5"
                      >
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-green-300 text-xs flex items-center gap-1">
                            <span>📅</span> {formatFecha(p.fechaHora)}
                          </span>
                          {p.estadio && (
                            <span className="text-green-400 text-xs flex items-center gap-1">
                              <span>🏟️</span>
                              <span className="truncate max-w-[100px]">{p.estadio}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-medium flex-1 text-right text-sm flex items-center justify-end gap-1">
                            {p.equipoLocal}
                            <CountryFlag nombre={p.equipoLocal} />
                          </span>

                          {p.bloqueado ? (
                            <span className="text-gray-400 text-xs px-1 whitespace-nowrap font-bold">
                              {p.miPronostico
                                ? `${p.miPronostico.golesLocal}-${p.miPronostico.golesVisita}${p.miPronostico.penalesLocal !== null ? ` (${p.miPronostico.penalesLocal}-${p.miPronostico.penalesVisita})` : ""}`
                                : "vs"}
                            </span>
                          ) : (
                            <div className="flex items-center gap-0.5">
                              <input
                                type="number"
                                min="0"
                                max="99"
                                aria-label={`Goles ${p.equipoLocal}`}
                                value={values[`${p.id}-local`] ?? ""}
                                onChange={(e) =>
                                  setValues((prev) => ({
                                    ...prev,
                                    [`${p.id}-local`]: e.target.value,
                                  }))
                                }
                                className="w-10 h-9 text-center rounded-lg bg-white/20 text-white font-bold text-base border border-white/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                              <span className="text-white font-bold text-sm">-</span>
                              <input
                                type="number"
                                min="0"
                                max="99"
                                aria-label={`Goles ${p.equipoVisita}`}
                                value={values[`${p.id}-visita`] ?? ""}
                                onChange={(e) =>
                                  setValues((prev) => ({
                                    ...prev,
                                    [`${p.id}-visita`]: e.target.value,
                                  }))
                                }
                                className="w-10 h-9 text-center rounded-lg bg-white/20 text-white font-bold text-base border border-white/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                            </div>
                          )}

                          <span className="text-white font-medium flex-1 text-sm flex items-center gap-1">
                            <CountryFlag nombre={p.equipoVisita} />
                            {p.equipoVisita}
                          </span>
                        </div>

                        {!p.bloqueado && (
                          <>
                            <div className="flex items-center justify-center gap-2 mt-2">
                              <span className="text-yellow-300 text-xs">Penales:</span>
                              <input
                                type="number"
                                min="0"
                                max="99"
                                placeholder="L"
                                aria-label="Penales local"
                                value={values[`${p.id}-pen-local`] ?? ""}
                                onChange={(e) =>
                                  setValues((prev) => ({
                                    ...prev,
                                    [`${p.id}-pen-local`]: e.target.value,
                                  }))
                                }
                                className="w-9 h-7 text-center rounded-lg bg-white/20 text-yellow-200 font-bold text-xs border border-white/30 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                              <span className="text-yellow-300 font-bold text-xs">-</span>
                              <input
                                type="number"
                                min="0"
                                max="99"
                                placeholder="V"
                                aria-label="Penales visita"
                                value={values[`${p.id}-pen-visita`] ?? ""}
                                onChange={(e) =>
                                  setValues((prev) => ({
                                    ...prev,
                                    [`${p.id}-pen-visita`]: e.target.value,
                                  }))
                                }
                                className="w-9 h-7 text-center rounded-lg bg-white/20 text-yellow-200 font-bold text-xs border border-white/30 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                            </div>

                            <div className="flex justify-end mt-2">
                              {saved[p.id] ? (
                                <span className="text-green-300 text-xs font-medium">Guardado ✓</span>
                              ) : (
                                <button
                                  onClick={() => guardar(p.id)}
                                  disabled={saving[p.id]}
                                  className="text-xs bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white px-3 py-1 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-green-600/30"
                                >
                                  {saving[p.id] ? "Guardando..." : "Guardar"}
                                </button>
                              )}
                            </div>
                          </>
                        )}

                        {p.bloqueado && !p.miPronostico && (
                          <p className="text-gray-500 text-xs text-center mt-1">Bloqueado</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {idx < RONDAS.length - 1 && (
                  <div className="hidden md:flex justify-center py-2 text-green-500/30">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
