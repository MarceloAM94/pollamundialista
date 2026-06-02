import { prisma } from "./prisma";

export async function upsertPronostico(
  usuarioId: number,
  partidoId: number,
  golesLocal: number,
  golesVisita: number,
  penalesLocal?: number | null,
  penalesVisita?: number | null
) {
  const partido = await prisma.partido.findUnique({
    where: { id: partidoId },
  });
  if (!partido) {
    throw new Error("Partido no encontrado");
  }

  const fechaLimite = new Date(partido.fechaHora.getTime() - 5 * 60 * 1000);
  if (new Date() >= fechaLimite || partido.estado !== "PROGRAMADO") {
    throw new Error("El partido ya no acepta pronósticos");
  }

  if (golesLocal < 0 || golesVisita < 0) {
    throw new Error("Los goles no pueden ser negativos");
  }

  if (partido.fase === 2) {
    const penalesNull = penalesLocal == null || penalesVisita == null;
    if (penalesNull) {
      throw new Error(
        "Debes pronosticar los penales para partidos de eliminación"
      );
    }
    if (penalesLocal! < 0 || penalesVisita! < 0) {
      throw new Error("Los penales no pueden ser negativos");
    }
    if (penalesLocal === penalesVisita) {
      throw new Error("Los penales no pueden terminar en empate");
    }
  }

  const pronostico = await prisma.pronostico.upsert({
    where: {
      usuarioId_partidoId: { usuarioId, partidoId },
    },
    update: {
      golesLocal,
      golesVisita,
      ...(partido.fase === 2 ? { penalesLocal, penalesVisita } : {}),
    },
    create: {
      usuarioId,
      partidoId,
      golesLocal,
      golesVisita,
      penalesLocal: partido.fase === 2 ? penalesLocal : null,
      penalesVisita: partido.fase === 2 ? penalesVisita : null,
    },
  });

  return pronostico;
}
