import { prisma } from "./prisma";

type Grupo = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

type TeamStats = {
  equipo: string;
  grupo: Grupo;
  pts: number;
  pj: number;
  gd: number;
  gf: number;
};

const GRUPOS: Grupo[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// Hardcode: qué grupo alimenta qué slot de 3er puesto en 16avos
const MAPA_TERCEROS: Record<string, string> = {
  B: "3B",
  D: "3D",
  E: "3E",
  F: "3F",
  I: "3I",
  J: "3J",
  K: "3K",
  L: "3L",
};

type PartidoRow = {
  id: number;
  equipoLocal: string;
  equipoVisita: string;
  golesLocalReal: number | null;
  golesVisitaReal: number | null;
  grupo: string | null;
};

async function getStandings(): Promise<Map<string, TeamStats[]>> {
  const partidos = await prisma.partido.findMany({
    where: { fase: 1, golesLocalReal: { not: null } },
    select: {
      grupo: true,
      equipoLocal: true,
      equipoVisita: true,
      golesLocalReal: true,
      golesVisitaReal: true,
    },
  });

  const statsMap = new Map<string, Map<string, TeamStats>>();

  for (const p of partidos) {
    if (!p.grupo) continue;
    const g = p.grupo as Grupo;
    if (!statsMap.has(g)) statsMap.set(g, new Map());

    const equipos = statsMap.get(g)!;
    if (!equipos.has(p.equipoLocal)) {
      equipos.set(p.equipoLocal, { equipo: p.equipoLocal, grupo: g, pts: 0, pj: 0, gd: 0, gf: 0 });
    }
    if (!equipos.has(p.equipoVisita)) {
      equipos.set(p.equipoVisita, { equipo: p.equipoVisita, grupo: g, pts: 0, pj: 0, gd: 0, gf: 0 });
    }

    const gl = p.golesLocalReal ?? 0;
    const gv = p.golesVisitaReal ?? 0;

    const l = equipos.get(p.equipoLocal)!;
    const v = equipos.get(p.equipoVisita)!;

    l.pj++; v.pj++;
    l.gf += gl; l.gd += (gl - gv);
    v.gf += gv; v.gd += (gv - gl);

    if (gl > gv) { l.pts += 3; }
    else if (gv > gl) { v.pts += 3; }
    else { l.pts += 1; v.pts += 1; }
  }

  const result = new Map<string, TeamStats[]>();
  for (const g of GRUPOS) {
    const equipos = statsMap.get(g);
    if (!equipos) continue;
    const arr = Array.from(equipos.values());
    arr.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.equipo.localeCompare(b.equipo);
    });
    result.set(g, arr);
  }

  return result;
}

function getRankingTerceros(standings: Map<string, TeamStats[]>): TeamStats[] {
  const terceros: TeamStats[] = [];
  for (const g of GRUPOS) {
    const arr = standings.get(g);
    if (arr && arr.length >= 3) {
      terceros.push(arr[2]);
    }
  }
  terceros.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.equipo.localeCompare(b.equipo);
  });
  return terceros.slice(0, 8);
}

export async function resolverDieciseisavos() {
  const standings = await getStandings();

  // Mapa placeholder → nombre real
  const mapa = new Map<string, string>();

  // 1ros y 2dos puestos
  for (const g of GRUPOS) {
    const arr = standings.get(g);
    if (!arr || arr.length < 2) continue;
    mapa.set(`1${g}`, arr[0].equipo);
    mapa.set(`2${g}`, arr[1].equipo);
  }

  // Terceros puestos
  const terceros = getRankingTerceros(standings);
  for (const t of terceros) {
    const slot = MAPA_TERCEROS[t.grupo];
    if (slot) {
      mapa.set(slot, t.equipo);
    }
  }

  // Actualizar partidos de dieciseisavos
  const dieciseisavos = await prisma.partido.findMany({
    where: { ronda: "dieciseisavos" },
    select: { id: true, equipoLocal: true, equipoVisita: true },
  });

  let actualizados = 0;
  for (const p of dieciseisavos) {
    const nuevoLocal = mapa.get(p.equipoLocal) ?? p.equipoLocal;
    const nuevoVisita = mapa.get(p.equipoVisita) ?? p.equipoVisita;
    if (nuevoLocal !== p.equipoLocal || nuevoVisita !== p.equipoVisita) {
      await prisma.partido.update({
        where: { id: p.id },
        data: { equipoLocal: nuevoLocal, equipoVisita: nuevoVisita },
      });
      actualizados++;
    }
  }

  return { actualizados, tercerosClasificados: terceros.map((t) => t.equipo) };
}

export async function resolverRondaSiguiente(partidoId: number) {
  const partido = await prisma.partido.findUnique({ where: { id: partidoId } });
  if (!partido || partido.fase !== 2) return;

  const gl = partido.golesLocalReal;
  const gv = partido.golesVisitaReal;
  if (gl === null || gv === null) return;

  const huboPenales = partido.penalesLocal !== null && partido.penalesVisita !== null;

  let ganador: string;
  let perdedor: string;
  if (huboPenales) {
    ganador = partido.penalesLocal! > partido.penalesVisita! ? partido.equipoLocal : partido.equipoVisita;
    perdedor = ganador === partido.equipoLocal ? partido.equipoVisita : partido.equipoLocal;
  } else if (gl > gv) {
    ganador = partido.equipoLocal;
    perdedor = partido.equipoVisita;
  } else if (gv > gl) {
    ganador = partido.equipoVisita;
    perdedor = partido.equipoLocal;
  } else {
    return;
  }

  const wRef = `W${partido.id}`;
  const ruRef = `RU${partido.id}`;

  const siguientes = await prisma.partido.findMany({
    where: {
      fase: 2,
      OR: [
        { equipoLocal: { in: [wRef, ruRef] } },
        { equipoVisita: { in: [wRef, ruRef] } },
      ],
    },
    select: { id: true, equipoLocal: true, equipoVisita: true },
  });

  for (const s of siguientes) {
    const data: Record<string, string> = {};
    if (s.equipoLocal === wRef) data.equipoLocal = ganador;
    if (s.equipoVisita === wRef) data.equipoVisita = ganador;
    if (s.equipoLocal === ruRef) data.equipoLocal = perdedor;
    if (s.equipoVisita === ruRef) data.equipoVisita = perdedor;
    if (Object.keys(data).length > 0) {
      await prisma.partido.update({ where: { id: s.id }, data });
    }
  }
}
