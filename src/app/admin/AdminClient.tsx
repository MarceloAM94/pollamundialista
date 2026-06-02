"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

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
  _count: { pronosticos: number };
};

type Estadisticas = {
  totalUsuarios: number;
  totalPronosticos: number;
  totalPartidos: number;
  partidosConResultado: number;
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

export default function AdminClient() {
  const router = useRouter();
  const [partidos, setPartidos] = useState<PartidoAdmin[]>([]);
  const [estadoSistema, setEstadoSistema] = useState("");
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filtroFase, setFiltroFase] = useState<number>(1);
  const [editando, setEditando] = useState<Record<number, Partial<PartidoAdmin>>>({});
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

      const total = partidosData.partidos.length as number;
      const conResultado = partidosData.partidos.filter(
        (p: PartidoAdmin) => p.golesLocalReal !== null
      ).length;
      setEstadisticas({
        totalUsuarios: 0,
        totalPronosticos: 0,
        totalPartidos: total,
        partidosConResultado: conResultado,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  async function guardarPartido(id: number) {
    const cambios = editando[id];
    if (!cambios) return;

    setSaving((prev) => ({ ...prev, [id]: true }));
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/partidos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...cambios }),
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

  async function cambiarEstadoSistema(estado: string) {
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

  function setEditValue(id: number, field: string, value: unknown) {
    setEditando((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center">
        <p className="text-white text-xl">Cargando panel admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Panel Admin</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-400 text-green-200 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Stats */}
        {estadisticas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{estadisticas.totalPartidos}</div>
              <div className="text-sm text-gray-300">Partidos totales</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">{estadisticas.partidosConResultado}</div>
              <div className="text-sm text-gray-300">Con resultado</div>
            </div>
          </div>
        )}

        {/* System State */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-3">Estado del Sistema</h2>
          <div className="flex flex-wrap gap-2">
            {ESTADOS_SISTEMA.map((estado) => (
              <button
                key={estado}
                onClick={() => cambiarEstadoSistema(estado)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  estadoSistema === estado
                    ? "bg-green-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {estado.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Match List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <button
              onClick={() => setFiltroFase(1)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                filtroFase === 1
                  ? "bg-green-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              Fase de Grupos
            </button>
            <button
              onClick={() => setFiltroFase(2)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                filtroFase === 2
                  ? "bg-green-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              Eliminatoria
            </button>
          </div>

          <div className="divide-y divide-white/10">
            {partidosFiltrados.map((p) => (
              <div key={p.id} className="px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <span>#{p.id}</span>
                  {p.grupo && <span>Grupo {p.grupo}</span>}
                  <span>{p.ronda}</span>
                  <span>{formatFecha(p.fechaHora)}</span>
                  {p.estadio && <span className="truncate">{p.estadio}</span>}
                  <span className="ml-auto">{p._count.pronosticos} pronósticos</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-white font-medium w-32 text-right truncate">
                    {p.equipoLocal}
                  </span>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder={p.golesLocalReal !== null ? String(p.golesLocalReal) : "-"}
                      value={editando[p.id]?.golesLocalReal ?? ""}
                      onChange={(e) =>
                        setEditValue(
                          p.id,
                          "golesLocalReal",
                          e.target.value === "" ? null : parseInt(e.target.value, 10)
                        )
                      }
                      className="w-12 h-9 text-center rounded-lg bg-white/20 text-white font-bold border border-white/30 focus:border-green-400 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="text-white font-bold">-</span>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder={p.golesVisitaReal !== null ? String(p.golesVisitaReal) : "-"}
                      value={editando[p.id]?.golesVisitaReal ?? ""}
                      onChange={(e) =>
                        setEditValue(
                          p.id,
                          "golesVisitaReal",
                          e.target.value === "" ? null : parseInt(e.target.value, 10)
                        )
                      }
                      className="w-12 h-9 text-center rounded-lg bg-white/20 text-white font-bold border border-white/30 focus:border-green-400 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>

                  <span className="text-white font-medium w-32 truncate">
                    {p.equipoVisita}
                  </span>

                  <select
                    value={editando[p.id]?.estado ?? p.estado}
                    onChange={(e) => setEditValue(p.id, "estado", e.target.value)}
                    className="bg-white/20 text-white text-xs rounded-lg px-2 py-1.5 border border-white/30 focus:border-green-400 outline-none"
                  >
                    {ESTADOS_PARTIDO.map((est) => (
                      <option key={est} value={est} className="bg-gray-800">
                        {est}
                      </option>
                    ))}
                  </select>

                  {(editando[p.id]?.golesLocalReal !== undefined ||
                    editando[p.id]?.golesVisitaReal !== undefined ||
                    editando[p.id]?.estado) && (
                    <button
                      onClick={() => guardarPartido(p.id)}
                      disabled={saving[p.id]}
                      className="text-xs bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      {saving[p.id] ? "..." : "Guardar"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
