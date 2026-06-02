import { prisma } from "./prisma";

export async function procesarPartido(partidoId: number) {
  const partido = await prisma.partido.findUnique({
    where: { id: partidoId },
    include: { pronosticos: true },
  });

  if (!partido) throw new Error("Partido no encontrado");
  if (partido.golesLocalReal === null || partido.golesVisitaReal === null) {
    throw new Error("El partido no tiene resultado");
  }
  if (partido.estado !== "FINALIZADO" && partido.estado !== "PROCESADO") {
    throw new Error("El partido debe estar FINALIZADO para procesar");
  }

  const { golesLocalReal, golesVisitaReal } = partido;

  for (const p of partido.pronosticos) {
    if (p.golesLocal === null || p.golesVisita === null) continue;

    const puntos = calcularPuntos(
      p.golesLocal,
      p.golesVisita,
      golesLocalReal,
      golesVisitaReal
    );

    await prisma.pronostico.update({
      where: { id: p.id },
      data: { puntos },
    });
  }

  await prisma.partido.update({
    where: { id: partidoId },
    data: { estado: "PROCESADO" },
  });

  return { procesados: partido.pronosticos.length };
}

function calcularPuntos(
  gLocal: number,
  gVisita: number,
  realLocal: number,
  realVisita: number
): number {
  const exacto = gLocal === realLocal && gVisita === realVisita;
  if (exacto) return 3;

  const difLocal = gLocal - gVisita;
  const difReal = realLocal - realVisita;
  const mismaDiferencia =
    (difLocal > 0 && difReal > 0) ||
    (difLocal < 0 && difReal < 0) ||
    (difLocal === 0 && difReal === 0);

  if (mismaDiferencia) return 1;

  return 0;
}

export async function getPuntosUsuario(userId: number) {
  const result = await prisma.pronostico.aggregate({
    where: { usuarioId: userId, puntos: { not: null } },
    _sum: { puntos: true },
  });
  return result._sum.puntos ?? 0;
}

export type RankingEntry = {
  posicion: number;
  usuarioId: number;
  nombre: string;
  username: string;
  puntos: number;
  exactos: number;
  diferencias: number;
  pronosticos: number;
};

export async function getRanking(): Promise<RankingEntry[]> {
  const usuarios = await prisma.usuario.findMany({
    where: { activo: true },
    include: {
      pronosticos: {
        where: { puntos: { not: null } },
        select: { puntos: true },
      },
    },
  });

  const ranking: Omit<RankingEntry, "posicion">[] = usuarios.map((u) => {
    const pronosticos = u.pronosticos.filter((p) => p.puntos !== null);
    const total = pronosticos.reduce((sum, p) => sum + (p.puntos ?? 0), 0);
    const exactos = pronosticos.filter((p) => p.puntos === 3).length;
    const diferencias = pronosticos.filter((p) => p.puntos === 1).length;

    return {
      usuarioId: u.id,
      nombre: u.nombre,
      username: u.username,
      puntos: total,
      exactos,
      diferencias,
      pronosticos: pronosticos.length,
    };
  });

  ranking.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.exactos !== a.exactos) return b.exactos - a.exactos;
    return a.nombre.localeCompare(b.nombre);
  });

  return ranking.map((entry, i) => ({
    ...entry,
    posicion: i + 1,
  }));
}
