import { prisma } from "./prisma";

export type PartidoConPronostico = {
  id: number;
  fase: number;
  ronda: string;
  grupo: string | null;
  equipoLocal: string;
  equipoVisita: string;
  fechaHora: Date;
  estadio: string | null;
  estado: string;
  golesLocalReal: number | null;
  golesVisitaReal: number | null;
  bloqueado: boolean;
  miPronostico: {
    id: number;
    golesLocal: number | null;
    golesVisita: number | null;
  } | null;
};

export async function getPartidosGrupos(
  userId: number
): Promise<PartidoConPronostico[]> {
  const ahora = new Date();
  const partidos = await prisma.partido.findMany({
    where: { fase: 1 },
    orderBy: [{ grupo: "asc" }, { fechaHora: "asc" }],
    include: {
      pronosticos: {
        where: { usuarioId: userId },
        select: { id: true, golesLocal: true, golesVisita: true },
      },
    },
  });

  return partidos.map((p) => {
    const fechaLimite = new Date(p.fechaHora.getTime() - 5 * 60 * 1000);
    const bloqueado = p.estado !== "PROGRAMADO" || ahora >= fechaLimite;

    return {
      id: p.id,
      fase: p.fase,
      ronda: p.ronda,
      grupo: p.grupo,
      equipoLocal: p.equipoLocal,
      equipoVisita: p.equipoVisita,
      fechaHora: p.fechaHora,
      estadio: p.estadio,
      estado: p.estado,
      golesLocalReal: p.golesLocalReal,
      golesVisitaReal: p.golesVisitaReal,
      bloqueado,
      miPronostico: p.pronosticos[0] ?? null,
    };
  });
}
