import { prisma } from "./prisma";

export async function upsertPronostico(
  usuarioId: number,
  partidoId: number,
  golesLocal: number,
  golesVisita: number
) {
  // Verificar que el partido existe
  const partido = await prisma.partido.findUnique({
    where: { id: partidoId },
  });
  if (!partido) {
    throw new Error("Partido no encontrado");
  }
  if (partido.fase !== 1) {
    throw new Error("Solo se pueden pronosticar partidos de fase de grupos");
  }

  // Verificar time-lock (-5 min)
  const fechaLimite = new Date(partido.fechaHora.getTime() - 5 * 60 * 1000);
  if (new Date() >= fechaLimite || partido.estado !== "PROGRAMADO") {
    throw new Error("El partido ya no acepta pronósticos");
  }

  // Validar goles no negativos
  if (golesLocal < 0 || golesVisita < 0) {
    throw new Error("Los goles no pueden ser negativos");
  }

  // Upsert: crear o actualizar el pronóstico
  const pronostico = await prisma.pronostico.upsert({
    where: {
      usuarioId_partidoId: { usuarioId, partidoId },
    },
    update: { golesLocal, golesVisita },
    create: { usuarioId, partidoId, golesLocal, golesVisita },
  });

  return pronostico;
}
