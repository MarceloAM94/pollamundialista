"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import CountryFlag from "@/app/components/CountryFlag";
import Skeleton from "@/app/components/Skeleton";
import { getColorRonda } from "@/app/lib/colores";

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
  { key: "dieciseisavos", label: "Dieciseisavos", icon: "🔵" },
  { key: "octavos", label: "Octavos", icon: "🟡" },
  { key: "cuartos", label: "Cuartos", icon: "🔴" },
  { key: "semifinal", label: "Semifinal", icon: "⭐" },
  { key: "tercer_puesto", label: "3er Puesto", icon: "🥉" },
  { key: "final", label: "Final", icon: "🏆" },
];

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Lima",
  });
}

function getNivelFase(key: string): number {
  const map: Record<string, number> = {
    dieciseisavos: 0,
    octavos: 1,
    cuartos: 2,
    semifinal: 3,
    tercer_puesto: 4,
    final: 5,
  };
  return map[key] ?? 0;
}

// Decoración progresiva según el nivel de la fase
function faseShadow(nivel: number, color: string): string {
  if (nivel === 5) return `0 0 40px ${color}40, 0 0 80px ${color}20`;
  if (nivel >= 3) return `0 0 20px ${color}30, 0 0 40px ${color}10`;
  if (nivel >= 2) return `0 0 12px ${color}20`;
  return "none";
}

function faseBorderWidth(nivel: number): number {
  if (nivel >= 5) return 4;
  if (nivel >= 3) return 3;
  return 2;
}

function faseTitleClass(nivel: number): string {
  if (nivel === 5) return "text-3xl md:text-4xl";
  if (nivel >= 3) return "text-xl md:text-2xl";
  return "text-lg";
}

function gridCols(count: number, nivel: number): string {
  if (nivel === 5) return "flex justify-center";
  if (nivel === 4) return "flex justify-center";
  if (count <= 1) return "flex justify-center";
  if (count <= 2) return "grid-cols-1 md:grid-cols-2";
  if (count <= 4) return "grid-cols-2 md:grid-cols-4";
  return "grid-cols-2 md:grid-cols-4";
}

function LoadingSkeleton() {
  return (
    <div style={{ background: "#000" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-9 w-64 mb-8" />
        <div className="flex flex-col gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#111217" }}>
              <Skeleton className="h-12 rounded-none" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
                {Array.from({ length: i < 1 ? 8 : 4 }).map((_, j) => (
                  <div key={j} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <Skeleton className="h-3 w-20 mb-2" />
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-8 w-12" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                    <Skeleton className="h-3 w-24 mt-2" />
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

  const rondasConPartidos = useMemo(() => {
    return RONDAS.map((r) => ({
      ...r,
      partidos: partidos.filter((p) => p.ronda === r.key),
    })).filter((r) => r.partidos.length > 0);
  }, [partidos]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div style={{ background: "#000" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "#D4AF37" }}>
          Eliminatorias
        </h1>

        {error && (
          <div className="border px-4 py-3 rounded-lg mb-6 text-sm" style={{ borderColor: "#E61D25", color: "#E61D25", background: "rgba(230,29,37,0.1)" }}>
            {error}
          </div>
        )}
        {saveError && (
          <div className="border px-4 py-3 rounded-lg mb-6 text-sm" style={{ borderColor: "#E61D25", color: "#E61D25", background: "rgba(230,29,37,0.1)" }}>
            {saveError}
          </div>
        )}

        {/* Timeline + rondas */}
        <div className="relative flex flex-col gap-6 md:gap-8">
          {/* Línea vertical decorativa */}
          <div
            className="absolute left-[23px] top-0 bottom-0 w-[2px] rounded-full"
            style={{
              background: "linear-gradient(to bottom, #FBE84E, #00A3E0, #E61D25, #D4AF37, #A2238E, #D4AF37)",
              opacity: 0.4,
            }}
          />

          {rondasConPartidos.map(({ key, label, icon, partidos: ps }, idx) => {
            const color = getColorRonda(key);
            const nivel = getNivelFase(key);
            const esFinal = nivel === 5;
            const esTercer = nivel === 4;
            const esCentrado = esFinal || esTercer;

            return (
              <div key={key} className="relative animate-fade-in" style={{ animationDelay: `${idx * 0.12}s` }}>
                {/* Punto en la timeline */}
                <div
                  className="absolute left-[14px] top-1.5 w-[20px] h-[20px] rounded-full border-2 z-10"
                  style={{
                    background: "#000",
                    borderColor: color,
                    boxShadow: nivel >= 3 ? `0 0 10px ${color}60` : "none",
                  }}
                />

                {/* Contenido de la fase (con margen para la timeline) */}
                <div style={{ paddingLeft: "50px" }}>
                  {/* Encabezado con decoración progresiva */}
                  <div className={`flex items-center gap-3 mb-${esFinal ? "6" : "4"}`}>
                    <span className="text-2xl" style={{ filter: nivel >= 3 ? "drop-shadow(0 0 6px rgba(212,175,55,0.4))" : "none" }}>
                      {icon}
                    </span>
                    <h2
                      className={`font-bold ${faseTitleClass(nivel)}`}
                      style={{
                        color,
                        textShadow: nivel >= 4 ? `0 0 20px ${color}40` : "none",
                      }}
                    >
                      {label}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
                      {ps.length} partido{ps.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Grid de tarjetas individuales */}
                  <div
                    className={`grid gap-3 md:gap-4 ${esCentrado ? "" : gridCols(ps.length, nivel)}`}
                    style={esCentrado ? { display: "flex", justifyContent: "center" } : {}}
                  >
                    {ps.map((p, matchIdx) => {
                      const teamHasRealResult = p.golesLocalReal !== null && p.golesVisitaReal !== null;

                      return (
                        <div
                          key={p.id}
                          className={`rounded-2xl transition-all duration-300 hover:scale-[1.02] ${esFinal ? "animate-fade-in-up" : ""}`}
                          style={{
                            animationDelay: `${matchIdx * 0.05}s`,
                            background: esFinal
                              ? "linear-gradient(135deg, #1a1a20 0%, #111217 100%)"
                              : "#111217",
                            borderLeft: `${faseBorderWidth(nivel)}px solid ${color}`,
                            boxShadow: faseShadow(nivel, color),
                            maxWidth: esCentrado ? "420px" : "none",
                            width: esCentrado ? "100%" : "auto",
                          }}
                        >
                          {/* Decoración especial para la final */}
                          {esFinal && (
                            <div className="text-center pt-4 pb-2">
                              <span className="text-4xl block mb-1">🏆</span>
                              <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "rgba(212,175,55,0.5)" }}>Gran Final</div>
                            </div>
                          )}

                          <div className="p-3 md:p-4">
                            {/* Fecha */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                                📅 {formatFecha(p.fechaHora)}
                              </span>
                              {p.estadio && (
                                <span className="text-xs truncate max-w-[160px] text-right" style={{ color: "rgba(255,255,255,0.3)" }}>
                                  🏟️ {p.estadio}
                                </span>
                              )}
                            </div>

                            {/* Equipos + marcador */}
                            <div className="flex items-center gap-1">
                              <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
                                <span className="font-medium text-xs sm:text-sm text-right truncate" style={{ color: "#fff" }}>
                                  {p.equipoLocal}
                                </span>
                                <CountryFlag nombre={p.equipoLocal} />
                              </div>

                              {p.bloqueado ? (
                                <span className="text-sm px-2 whitespace-nowrap font-bold" style={{ color: teamHasRealResult ? color : "rgba(255,255,255,0.4)" }}>
                                  {p.miPronostico
                                    ? `${p.miPronostico.golesLocal}-${p.miPronostico.golesVisita}${p.miPronostico.penalesLocal !== null ? ` (${p.miPronostico.penalesLocal}-${p.miPronostico.penalesVisita})` : ""}`
                                    : teamHasRealResult
                                      ? `${p.golesLocalReal}-${p.golesVisitaReal}`
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
                                    className="w-9 sm:w-11 h-8 sm:h-9 text-center font-bold text-sm outline-none transition-all duration-200 rounded-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    style={{
                                      background: "#000",
                                      color: "#fff",
                                      border: "1px solid rgba(255,255,255,0.15)",
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = color}
                                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                                  />
                                  <span className="font-bold text-sm" style={{ color }}>-</span>
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
                                    className="w-9 sm:w-11 h-8 sm:h-9 text-center font-bold text-sm outline-none transition-all duration-200 rounded-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    style={{
                                      background: "#000",
                                      color: "#fff",
                                      border: "1px solid rgba(255,255,255,0.15)",
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = color}
                                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                                  />
                                </div>
                              )}

                              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                <CountryFlag nombre={p.equipoVisita} />
                                <span className="font-medium text-xs sm:text-sm truncate" style={{ color: "#fff" }}>
                                  {p.equipoVisita}
                                </span>
                              </div>
                            </div>

                            {/* Resultado real */}
                            {teamHasRealResult && (
                              <div className="text-center mt-1">
                                <span className="text-[11px] font-semibold" style={{ color }}>
                                  {p.golesLocalReal}-{p.golesVisitaReal}
                                  {p.penalesLocal !== null && p.penalesVisita !== null
                                    ? ` (${p.penalesLocal}-${p.penalesVisita} pen.)`
                                    : ""}
                                </span>
                              </div>
                            )}

                            {/* Penales input */}
                            {!p.bloqueado && (
                              <>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                  <span className="text-xs" style={{ color: color }}>Pen:</span>
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
                                    className="w-8 h-6 text-center font-bold text-xs outline-none transition-all duration-200 rounded-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    style={{
                                      background: "#000",
                                      color,
                                      border: "1px solid rgba(255,255,255,0.15)",
                                    }}
                                  />
                                  <span className="font-bold text-xs" style={{ color }}>-</span>
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
                                    className="w-8 h-6 text-center font-bold text-xs outline-none transition-all duration-200 rounded-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    style={{
                                      background: "#000",
                                      color,
                                      border: "1px solid rgba(255,255,255,0.15)",
                                    }}
                                  />
                                </div>

                                <div className="flex justify-end mt-2">
                                  {saved[p.id] ? (
                                    <span className="text-xs font-medium" style={{ color: "#3CAC3B" }}>Guardado ✓</span>
                                  ) : (
                                    <button
                                      onClick={() => guardar(p.id)}
                                      disabled={saving[p.id]}
                                      className="text-xs font-semibold px-3 py-1 rounded-lg transition-all duration-200 disabled:opacity-30"
                                      style={{
                                        background: esFinal ? "#D4AF37" : "#D4AF37",
                                        color: "#000",
                                      }}
                                    >
                                      {saving[p.id] ? "Guardando..." : "Guardar"}
                                    </button>
                                  )}
                                </div>
                              </>
                            )}

                            {p.bloqueado && !p.miPronostico && (
                              <p className="text-xs text-center mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Bloqueado</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
