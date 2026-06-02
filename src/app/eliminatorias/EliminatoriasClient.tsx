"use client";

import { useEffect, useState, useCallback } from "react";

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
  { key: "octavos", label: "Octavos de Final" },
  { key: "cuartos", label: "Cuartos de Final" },
  { key: "semifinal", label: "Semifinales" },
  { key: "tercer_puesto", label: "Tercer Puesto" },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center">
        <p className="text-white text-xl">Cargando partidos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
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

        {RONDAS.map(({ key, label }) => {
          const ps = partidos.filter((p) => p.ronda === key);
          if (ps.length === 0) return null;

          return (
            <div key={key} className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">{label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ps.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-green-200 text-xs">
                        {formatFecha(p.fechaHora)}
                      </span>
                      {p.estadio && (
                        <span className="text-green-300 text-xs">
                          {p.estadio}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-medium flex-1 text-right">
                        {p.equipoLocal}
                      </span>

                      {p.bloqueado ? (
                        <span className="text-gray-400 text-sm px-2 whitespace-nowrap">
                          {p.miPronostico
                            ? `${p.miPronostico.golesLocal} - ${p.miPronostico.golesVisita}${p.miPronostico.penalesLocal !== null ? ` (${p.miPronostico.penalesLocal}-${p.miPronostico.penalesVisita} pen)` : ""}`
                            : "vs"}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={values[`${p.id}-local`] ?? ""}
                            onChange={(e) =>
                              setValues((prev) => ({
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
                            value={values[`${p.id}-visita`] ?? ""}
                            onChange={(e) =>
                              setValues((prev) => ({
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
                      <>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-yellow-300 text-xs font-medium">
                            Penales:
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="99"
                            placeholder="L"
                            value={values[`${p.id}-pen-local`] ?? ""}
                            onChange={(e) =>
                              setValues((prev) => ({
                                ...prev,
                                [`${p.id}-pen-local`]: e.target.value,
                              }))
                            }
                            className="w-10 h-8 text-center rounded-lg bg-white/20 text-yellow-200 font-bold text-sm border border-white/30 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <span className="text-yellow-300 font-bold">-</span>
                          <input
                            type="number"
                            min="0"
                            max="99"
                            placeholder="V"
                            value={values[`${p.id}-pen-visita`] ?? ""}
                            onChange={(e) =>
                              setValues((prev) => ({
                                ...prev,
                                [`${p.id}-pen-visita`]: e.target.value,
                              }))
                            }
                            className="w-10 h-8 text-center rounded-lg bg-white/20 text-yellow-200 font-bold text-sm border border-white/30 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>

                        <div className="flex justify-end">
                          {saved[p.id] ? (
                            <span className="text-green-300 text-sm font-medium">
                              Guardado
                            </span>
                          ) : (
                            <button
                              onClick={() => guardar(p.id)}
                              disabled={saving[p.id]}
                              className="text-xs bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                            >
                              {saving[p.id] ? "Guardando..." : "Guardar"}
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {p.bloqueado && !p.miPronostico && (
                      <p className="text-gray-500 text-xs text-center">
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
  );
}
