"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import CountryFlag from "@/app/components/CountryFlag";
import Skeleton from "@/app/components/Skeleton";
import { getColorGrupo, getColorRonda } from "@/app/lib/colores";

type PartidoAdmin = {
  id: number;
  fase: number;
  ronda: string;
  grupo: string | null;
  equipoLocal: string;
  equipoVisita: string;
  fechaHora: string;
  estadio: string | null;
  estado: string;
  golesLocalReal: number | null;
  golesVisitaReal: number | null;
  penalesLocal: number | null;
  penalesVisita: number | null;
  _count: { pronosticos: number };
};

const ESTADOS_PARTIDO = [
  "PROGRAMADO",
  "BLOQUEADO",
  "EN_VIVO",
  "FINALIZADO",
  "PROCESADO",
];

const ESTADOS_SISTEMA = [
  "PRE_TORNEO",
  "FASE_GRUPOS_ABIERTA",
  "TRANSICION",
  "FASE_MATAMATA_ABIERTA",
  "TORNEO_FINALIZADO",
];

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  });
}

function nn(v: number | null | undefined): string {
  return v != null ? String(v) : "";
}

function LoadingSkeleton() {
  return (
    <div style={{ background: "#000" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-9 w-48 mb-8" />
        <div className="grid grid-cols-2 gap-4 mb-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-24 rounded-2xl mb-8" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}

export default function AdminClient() {
  const router = useRouter();
  const [partidos, setPartidos] = useState<PartidoAdmin[]>([]);
  const [estadoSistema, setEstadoSistema] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filtroFase, setFiltroFase] = useState<number>(1);
  const [editando, setEditando] = useState<Record<number, Record<string, string>>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [partidosRes, configRes] = await Promise.all([
        fetch("/api/admin/partidos"),
        fetch("/api/admin/config"),
      ]);

      if (!partidosRes.ok || !configRes.ok) {
        if (partidosRes.status === 403 || configRes.status === 403) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Error al cargar datos");
      }

      const partidosData = await partidosRes.json();
      const configData = await configRes.json();

      setPartidos(partidosData.partidos);
      setEstadoSistema(configData.estadoSistema);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  function editStr(id: number, campo: string): string {
    const edit = editando[id]?.[campo];
    if (edit !== undefined) return edit;
    const p = partidos.find((x) => x.id === id);
    if (!p) return "";
    return nn((p as unknown as Record<string, number | null>)[campo]);
  }

  function editVal(id: number, campo: string): number | null {
    const s = editando[id]?.[campo];
    if (s === undefined || s === "") return null;
    const n = parseInt(s, 10);
    return isNaN(n) ? null : n;
  }

  async function guardarPartido(id: number) {
    setSaving((prev) => ({ ...prev, [id]: true }));
    setError("");
    setSuccess("");

    try {
      const body: Record<string, unknown> = {
        id,
        golesLocalReal: editVal(id, "golesLocalReal"),
        golesVisitaReal: editVal(id, "golesVisitaReal"),
        penalesLocal: editVal(id, "penalesLocal"),
        penalesVisita: editVal(id, "penalesVisita"),
        estado: editStr(id, "estado"),
      };

      const res = await fetch("/api/admin/partidos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      setSuccess(`Partido #${id} actualizado`);
      setEditando((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function procesar(id: number) {
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/procesar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partidoId: id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al procesar");
      }

      setSuccess(`Partido #${id} procesado`);
      cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  async function cambiarEstadoSistema(estado: string) {
    if (!confirm(`¿Cambiar estado del sistema a "${estado.replace(/_/g, " ")}"?`)) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al cambiar estado");
      }

      setEstadoSistema(estado);
      setSuccess(`Estado del sistema: ${estado}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  const partidosFiltrados = partidos.filter((p) => p.fase === filtroFase);
  const totalPartidos = partidos.length;
  const conResultado = partidos.filter((p) => p.golesLocalReal !== null).length;

  function setEdit(id: number, campo: string, val: string) {
    setEditando((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: val },
    }));
  }

  function getColorPartido(p: PartidoAdmin): string {
    if (p.grupo) return getColorGrupo(p.grupo);
    return getColorRonda(p.ronda);
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div style={{ background: "#000" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "#D4AF37" }}>
          Panel Admin
        </h1>

        {error && (
          <div className="border px-4 py-3 rounded-lg mb-6 text-sm" style={{ borderColor: "#E61D25", color: "#E61D25", background: "rgba(230,29,37,0.1)" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="border px-4 py-3 rounded-lg mb-6 text-sm" style={{ borderColor: "#3CAC3B", color: "#3CAC3B", background: "rgba(60,172,59,0.1)" }}>
            {success}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl p-4" style={{ background: "#111217", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="text-2xl font-bold" style={{ color: "#D4AF37" }}>{totalPartidos}</div>
            <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Partidos totales</div>
          </div>
          <div className="rounded-xl p-4" style={{ background: "#111217", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="text-2xl font-bold" style={{ color: "#3CAC3B" }}>{conResultado}</div>
            <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Con resultado</div>
          </div>
        </div>

        <div className="rounded-2xl p-6 mb-8 shadow-lg" style={{ background: "#111217", border: "1px solid rgba(212,175,55,0.15)" }}>
          <h2 className="text-lg font-bold mb-3" style={{ color: "#D4AF37" }}>Estado del Sistema</h2>
          <div className="flex flex-wrap gap-2">
            {ESTADOS_SISTEMA.map((estado) => (
              <button
                key={estado}
                onClick={() => cambiarEstadoSistema(estado)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  estadoSistema === estado
                    ? "text-black font-semibold"
                    : "hover:bg-white/10"
                }`}
                style={estadoSistema === estado ? { background: "#D4AF37", color: "#000" } : { color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)" }}
              >
                {estado.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg animate-fade-in" style={{ background: "#111217", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)" }}>
            <button
              onClick={() => setFiltroFase(1)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={filtroFase === 1 ? { background: "#D4AF37", color: "#000" } : { color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)" }}
            >
              Fase de Grupos
            </button>
            <button
              onClick={() => setFiltroFase(2)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={filtroFase === 2 ? { background: "#D4AF37", color: "#000" } : { color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)" }}
            >
              Eliminatoria
            </button>
          </div>

          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {partidosFiltrados.map((p) => {
              const color = getColorPartido(p);
              return (
                <div key={p.id} className="px-4 py-3 transition-colors hover:bg-white/[0.02]" style={{ borderLeft: `3px solid ${color}` }}>
                  <div className="flex items-center gap-2 text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <span>#{p.id}</span>
                    {p.grupo && <span>Grupo {p.grupo}</span>}
                    <span>{p.ronda}</span>
                    <span>{formatFecha(p.fechaHora)}</span>
                    {p.estadio && <span className="truncate">{p.estadio}</span>}
                    <span className="ml-auto">{p._count.pronosticos} pronósticos</span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium w-28 text-right truncate flex items-center justify-end gap-1 text-sm" style={{ color: "#fff" }}>
                      <CountryFlag nombre={p.equipoLocal} />
                      {p.equipoLocal}
                    </span>

                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        placeholder="-"
                        value={editStr(p.id, "golesLocalReal")}
                        onChange={(e) => setEdit(p.id, "golesLocalReal", e.target.value)}
                        className="w-12 h-9 text-center font-bold outline-none transition-all duration-200 rounded-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        style={{
                          background: "#000",
                          color: "#fff",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                        onFocus={(e) => e.target.style.borderColor = color}
                        onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                      />
                      <span className="font-bold" style={{ color }}>-</span>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        placeholder="-"
                        value={editStr(p.id, "golesVisitaReal")}
                        onChange={(e) => setEdit(p.id, "golesVisitaReal", e.target.value)}
                        className="w-12 h-9 text-center font-bold outline-none transition-all duration-200 rounded-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        style={{
                          background: "#000",
                          color: "#fff",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                        onFocus={(e) => e.target.style.borderColor = color}
                        onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                      />
                    </div>

                    <CountryFlag nombre={p.equipoVisita} />
                    <span className="font-medium w-28 truncate text-sm" style={{ color: "#fff" }}>
                      {p.equipoVisita}
                    </span>

                    {p.fase === 2 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs" style={{ color }}>Pen:</span>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          placeholder="-"
                          value={editStr(p.id, "penalesLocal")}
                          onChange={(e) => setEdit(p.id, "penalesLocal", e.target.value)}
                          className="w-10 h-8 text-center font-bold text-xs outline-none transition-all duration-200 rounded-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                          placeholder="-"
                          value={editStr(p.id, "penalesVisita")}
                          onChange={(e) => setEdit(p.id, "penalesVisita", e.target.value)}
                          className="w-10 h-8 text-center font-bold text-xs outline-none transition-all duration-200 rounded-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          style={{
                            background: "#000",
                            color,
                            border: "1px solid rgba(255,255,255,0.15)",
                          }}
                        />
                      </div>
                    )}

                    <select
                      value={editStr(p.id, "estado")}
                      onChange={(e) => setEdit(p.id, "estado", e.target.value)}
                      className="text-xs rounded-lg px-2 py-1.5 outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {ESTADOS_PARTIDO.map((est) => (
                        <option key={est} value={est} style={{ background: "#111217" }}>
                          {est}
                        </option>
                      ))}
                    </select>

                    {p.estado === "FINALIZADO" && (
                      <button
                        onClick={() => procesar(p.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200" style={{ background: "#00A3E0", color: "#000" }}
                      >
                        Procesar
                      </button>
                    )}
                    <button
                      onClick={() => guardarPartido(p.id)}
                      disabled={saving[p.id]}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-30"
                      style={{ background: "#D4AF37", color: "#000" }}
                    >
                      {saving[p.id] ? "..." : "Guardar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
