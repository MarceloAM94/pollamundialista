import { prisma } from "./prisma";
import { getAuthenticatedUser, type UserData } from "./auth-service";

export async function getAdminUser(): Promise<UserData> {
  const user = await getAuthenticatedUser();
  if (!user || !user.isAdmin) {
    throw new Error("No autorizado");
  }
  return user;
}

export async function getAllPartidos() {
  return prisma.partido.findMany({
    orderBy: [{ fase: "asc" }, { grupo: "asc" }, { fechaHora: "asc" }],
    include: {
      _count: { select: { pronosticos: true } },
    },
  });
}

export async function updatePartido(
  id: number,
  data: {
    golesLocalReal?: number | null;
    golesVisitaReal?: number | null;
    penalesLocal?: number | null;
    penalesVisita?: number | null;
    estado?: string;
  }
) {
  const updateData: Record<string, unknown> = {};
  if (data.golesLocalReal !== undefined) updateData.golesLocalReal = data.golesLocalReal;
  if (data.golesVisitaReal !== undefined) updateData.golesVisitaReal = data.golesVisitaReal;
  if (data.penalesLocal !== undefined) updateData.penalesLocal = data.penalesLocal;
  if (data.penalesVisita !== undefined) updateData.penalesVisita = data.penalesVisita;
  if (data.estado) updateData.estado = data.estado;

  return prisma.partido.update({
    where: { id },
    data: updateData,
  });
}

export async function getEstadoSistema(): Promise<string> {
  const config = await prisma.configuracion.findUnique({
    where: { clave: "estado_sistema" },
  });
  return config?.valor ?? "PRE_TORNEO";
}

export async function setEstadoSistema(estado: string) {
  return prisma.configuracion.upsert({
    where: { clave: "estado_sistema" },
    update: { valor: estado },
    create: { clave: "estado_sistema", valor: estado },
  });
}

export async function getEstadisticas() {
  const [totalUsuarios, totalPronosticos, totalPartidos, partidosConResultado] =
    await Promise.all([
      prisma.usuario.count({ where: { activo: true } }),
      prisma.pronostico.count(),
      prisma.partido.count(),
      prisma.partido.count({ where: { golesLocalReal: { not: null } } }),
    ]);
  return { totalUsuarios, totalPronosticos, totalPartidos, partidosConResultado };
}
