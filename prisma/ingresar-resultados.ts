import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL no definida");

const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter });

const EN_TO_ES: Record<string, string> = {
  Mexico: "México",
  "South Africa": "Sudáfrica",
  "South Korea": "Corea del Sur",
  "Czech Republic": "República Checa",
  Canada: "Canadá",
  "Bosnia and Herzegovina": "Bosnia y Herzegovina",
  Qatar: "Catar",
  Switzerland: "Suiza",
  Brazil: "Brasil",
  Morocco: "Marruecos",
  Haiti: "Haití",
  Scotland: "Escocia",
  "United States": "Estados Unidos",
  Paraguay: "Paraguay",
  Australia: "Australia",
  Turkey: "Turquía",
  Germany: "Alemania",
  "Curaçao": "Curazao",
  "Ivory Coast": "Costa de Marfil",
  Ecuador: "Ecuador",
  Netherlands: "Países Bajos",
  Japan: "Japón",
  Sweden: "Suecia",
  Tunisia: "Túnez",
  Belgium: "Bélgica",
  Egypt: "Egipto",
  Iran: "Irán",
  "New Zealand": "Nueva Zelanda",
  Spain: "España",
  "Cape Verde": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudita",
  Uruguay: "Uruguay",
  France: "Francia",
  Senegal: "Senegal",
  Iraq: "Irak",
  Norway: "Noruega",
  Argentina: "Argentina",
  Algeria: "Argelia",
  Austria: "Austria",
  Jordan: "Jordania",
  Portugal: "Portugal",
  "DR Congo": "Congo DR",
  Uzbekistan: "Uzbekistán",
  Colombia: "Colombia",
  England: "Inglaterra",
  Croatia: "Croacia",
  Ghana: "Ghana",
  Panama: "Panamá",
};

type Resultado = {
  grupo: string;
  local: string;
  visita: string;
  golesLocal: number;
  golesVisita: number;
};

const RESULTADOS: Resultado[] = [
  // GRUPO A
  { grupo: "A", local: "Mexico", visita: "South Africa", golesLocal: 2, golesVisita: 0 },
  { grupo: "A", local: "South Korea", visita: "Czech Republic", golesLocal: 2, golesVisita: 1 },
  { grupo: "A", local: "Czech Republic", visita: "South Africa", golesLocal: 1, golesVisita: 1 },
  { grupo: "A", local: "Mexico", visita: "South Korea", golesLocal: 1, golesVisita: 0 },
  { grupo: "A", local: "Czech Republic", visita: "Mexico", golesLocal: 0, golesVisita: 3 },
  { grupo: "A", local: "South Africa", visita: "South Korea", golesLocal: 1, golesVisita: 0 },

  // GRUPO B
  { grupo: "B", local: "Canada", visita: "Bosnia and Herzegovina", golesLocal: 1, golesVisita: 1 },
  { grupo: "B", local: "Qatar", visita: "Switzerland", golesLocal: 1, golesVisita: 1 },
  { grupo: "B", local: "Switzerland", visita: "Bosnia and Herzegovina", golesLocal: 4, golesVisita: 1 },
  { grupo: "B", local: "Canada", visita: "Qatar", golesLocal: 6, golesVisita: 0 },
  { grupo: "B", local: "Switzerland", visita: "Canada", golesLocal: 2, golesVisita: 1 },
  { grupo: "B", local: "Bosnia and Herzegovina", visita: "Qatar", golesLocal: 3, golesVisita: 1 },

  // GRUPO C
  { grupo: "C", local: "Brazil", visita: "Morocco", golesLocal: 1, golesVisita: 1 },
  { grupo: "C", local: "Haiti", visita: "Scotland", golesLocal: 0, golesVisita: 1 },
  { grupo: "C", local: "Scotland", visita: "Morocco", golesLocal: 0, golesVisita: 1 },
  { grupo: "C", local: "Brazil", visita: "Haiti", golesLocal: 3, golesVisita: 0 },
  { grupo: "C", local: "Scotland", visita: "Brazil", golesLocal: 0, golesVisita: 3 },
  { grupo: "C", local: "Morocco", visita: "Haiti", golesLocal: 4, golesVisita: 2 },

  // GRUPO D
  { grupo: "D", local: "United States", visita: "Paraguay", golesLocal: 4, golesVisita: 1 },
  { grupo: "D", local: "Australia", visita: "Turkey", golesLocal: 2, golesVisita: 0 },
  { grupo: "D", local: "United States", visita: "Australia", golesLocal: 2, golesVisita: 0 },
  { grupo: "D", local: "Turkey", visita: "Paraguay", golesLocal: 0, golesVisita: 1 },
  { grupo: "D", local: "Turkey", visita: "United States", golesLocal: 3, golesVisita: 2 },
  { grupo: "D", local: "Paraguay", visita: "Australia", golesLocal: 0, golesVisita: 0 },

  // GRUPO E
  { grupo: "E", local: "Germany", visita: "Curaçao", golesLocal: 7, golesVisita: 1 },
  { grupo: "E", local: "Ivory Coast", visita: "Ecuador", golesLocal: 1, golesVisita: 0 },
  { grupo: "E", local: "Germany", visita: "Ivory Coast", golesLocal: 2, golesVisita: 1 },
  { grupo: "E", local: "Ecuador", visita: "Curaçao", golesLocal: 0, golesVisita: 0 },
  { grupo: "E", local: "Curaçao", visita: "Ivory Coast", golesLocal: 0, golesVisita: 2 },
  { grupo: "E", local: "Ecuador", visita: "Germany", golesLocal: 2, golesVisita: 1 },

  // GRUPO F
  { grupo: "F", local: "Netherlands", visita: "Japan", golesLocal: 2, golesVisita: 2 },
  { grupo: "F", local: "Sweden", visita: "Tunisia", golesLocal: 5, golesVisita: 1 },
  { grupo: "F", local: "Netherlands", visita: "Sweden", golesLocal: 5, golesVisita: 1 },
  { grupo: "F", local: "Tunisia", visita: "Japan", golesLocal: 0, golesVisita: 4 },
  { grupo: "F", local: "Japan", visita: "Sweden", golesLocal: 1, golesVisita: 1 },
  { grupo: "F", local: "Tunisia", visita: "Netherlands", golesLocal: 1, golesVisita: 3 },

  // GRUPO G
  { grupo: "G", local: "Belgium", visita: "Egypt", golesLocal: 1, golesVisita: 1 },
  { grupo: "G", local: "Iran", visita: "New Zealand", golesLocal: 2, golesVisita: 2 },
  { grupo: "G", local: "Belgium", visita: "Iran", golesLocal: 0, golesVisita: 0 },
  { grupo: "G", local: "New Zealand", visita: "Egypt", golesLocal: 1, golesVisita: 3 },
  { grupo: "G", local: "Egypt", visita: "Iran", golesLocal: 1, golesVisita: 1 },
  { grupo: "G", local: "New Zealand", visita: "Belgium", golesLocal: 1, golesVisita: 5 },

  // GRUPO H
  { grupo: "H", local: "Spain", visita: "Cape Verde", golesLocal: 0, golesVisita: 0 },
  { grupo: "H", local: "Saudi Arabia", visita: "Uruguay", golesLocal: 1, golesVisita: 1 },
  { grupo: "H", local: "Spain", visita: "Saudi Arabia", golesLocal: 4, golesVisita: 0 },
  { grupo: "H", local: "Uruguay", visita: "Cape Verde", golesLocal: 2, golesVisita: 2 },
  { grupo: "H", local: "Cape Verde", visita: "Saudi Arabia", golesLocal: 0, golesVisita: 0 },
  { grupo: "H", local: "Uruguay", visita: "Spain", golesLocal: 0, golesVisita: 1 },

  // GRUPO I
  { grupo: "I", local: "France", visita: "Senegal", golesLocal: 3, golesVisita: 1 },
  { grupo: "I", local: "Iraq", visita: "Norway", golesLocal: 1, golesVisita: 4 },
  { grupo: "I", local: "France", visita: "Iraq", golesLocal: 3, golesVisita: 0 },
  { grupo: "I", local: "Norway", visita: "Senegal", golesLocal: 3, golesVisita: 2 },
  { grupo: "I", local: "Norway", visita: "France", golesLocal: 1, golesVisita: 4 },
  { grupo: "I", local: "Senegal", visita: "Iraq", golesLocal: 5, golesVisita: 0 },

  // GRUPO J
  { grupo: "J", local: "Argentina", visita: "Algeria", golesLocal: 3, golesVisita: 0 },
  { grupo: "J", local: "Austria", visita: "Jordan", golesLocal: 3, golesVisita: 1 },
  { grupo: "J", local: "Argentina", visita: "Austria", golesLocal: 2, golesVisita: 0 },
  { grupo: "J", local: "Jordan", visita: "Algeria", golesLocal: 1, golesVisita: 2 },
  { grupo: "J", local: "Algeria", visita: "Austria", golesLocal: 3, golesVisita: 3 },
  { grupo: "J", local: "Jordan", visita: "Argentina", golesLocal: 1, golesVisita: 3 },

  // GRUPO K
  { grupo: "K", local: "Portugal", visita: "DR Congo", golesLocal: 1, golesVisita: 1 },
  { grupo: "K", local: "Uzbekistan", visita: "Colombia", golesLocal: 1, golesVisita: 3 },
  { grupo: "K", local: "Portugal", visita: "Uzbekistan", golesLocal: 5, golesVisita: 0 },
  { grupo: "K", local: "Colombia", visita: "DR Congo", golesLocal: 1, golesVisita: 0 },
  { grupo: "K", local: "Colombia", visita: "Portugal", golesLocal: 0, golesVisita: 0 },
  { grupo: "K", local: "DR Congo", visita: "Uzbekistan", golesLocal: 3, golesVisita: 1 },

  // GRUPO L
  { grupo: "L", local: "England", visita: "Croatia", golesLocal: 4, golesVisita: 2 },
  { grupo: "L", local: "Ghana", visita: "Panama", golesLocal: 1, golesVisita: 0 },
  { grupo: "L", local: "England", visita: "Ghana", golesLocal: 0, golesVisita: 0 },
  { grupo: "L", local: "Panama", visita: "Croatia", golesLocal: 0, golesVisita: 1 },
  { grupo: "L", local: "Panama", visita: "England", golesLocal: 0, golesVisita: 2 },
  { grupo: "L", local: "Croatia", visita: "Ghana", golesLocal: 2, golesVisita: 1 },
];

async function main() {
  const partidos = await prisma.partido.findMany({
    where: { fase: 1 },
    select: { id: true, grupo: true, equipoLocal: true, equipoVisita: true },
    orderBy: [{ grupo: "asc" }, { fechaHora: "asc" }],
  });

  let actualizados = 0;
  let noEncontrados = 0;

  for (const r of RESULTADOS) {
    const localEs = EN_TO_ES[r.local];
    const visitaEs = EN_TO_ES[r.visita];

    // Buscar por orden directo
    let match = partidos.find(
      (p) =>
        p.grupo === r.grupo &&
        p.equipoLocal === localEs &&
        p.equipoVisita === visitaEs
    );

    // Si no, buscar con equipos invertidos (swap local/visitor)
    if (!match) {
      match = partidos.find(
        (p) =>
          p.grupo === r.grupo &&
          p.equipoLocal === visitaEs &&
          p.equipoVisita === localEs
      );
      if (match) {
        // Invertir goles porque los equipos están al revés
        await prisma.partido.update({
          where: { id: match.id },
          data: {
            golesLocalReal: r.golesVisita,
            golesVisitaReal: r.golesLocal,
            estado: "FINALIZADO",
          },
        });
        actualizados++;
        continue;
      }
    }

    if (!match) {
      console.log(`NO ENCONTRADO: ${r.grupo} ${r.local} vs ${r.visita} (${localEs} vs ${visitaEs})`);
      noEncontrados++;
      continue;
    }

    await prisma.partido.update({
      where: { id: match.id },
      data: {
        golesLocalReal: r.golesLocal,
        golesVisitaReal: r.golesVisita,
        estado: "FINALIZADO",
      },
    });
    actualizados++;
  }

  console.log(`Actualizados: ${actualizados}, No encontrados: ${noEncontrados}`);

  // Resultado del primer dieciseisavo (2A vs 2B): Sudáfrica 0-1 Canadá
  const match2A2B = await prisma.partido.findFirst({
    where: { fase: 2, equipoLocal: "2A", equipoVisita: "2B" },
  });
  if (match2A2B) {
    // 2A = 2° Grupo A = Sudáfrica, 2B = 2° Grupo B = Canadá
    await prisma.partido.update({
      where: { id: match2A2B.id },
      data: { golesLocalReal: 0, golesVisitaReal: 1, estado: "FINALIZADO" },
    });
    console.log(`Match #${match2A2B.id} (2A vs 2B) actualizado: Sudáfrica 0-1 Canadá`);
  }

  // Marcar sistema como FASE_MATAMATA_ABIERTA
  await prisma.configuracion.upsert({
    where: { clave: "estado_sistema" },
    update: { valor: "FASE_MATAMATA_ABIERTA" },
    create: { clave: "estado_sistema", valor: "FASE_MATAMATA_ABIERTA" },
  });
  console.log("Estado del sistema: FASE_MATAMATA_ABIERTA");

  // Resolver placeholders de dieciseisavos (1A, 2B, 3D, etc. → nombres reales)
  const { resolverDieciseisavos, resolverRondaSiguiente } = await import("../src/lib/resolver-eliminatorias");
  const res = await resolverDieciseisavos();
  console.log(`Resolver: ${res.actualizados} partidos actualizados, 3ros clasificados: ${res.tercerosClasificados.join(", ")}`);

  // Mapear referencias W{pos} y RU{pos} a W{id_real} y RU{id_real}
  const koMatches = await prisma.partido.findMany({
    where: { fase: 2 },
    orderBy: [{ fechaHora: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const posToId: Record<number, number> = {};
  koMatches.forEach((m, i) => {
    posToId[73 + i] = m.id;
  });

  const allKo = await prisma.partido.findMany({
    where: { fase: 2 },
    select: { id: true, equipoLocal: true, equipoVisita: true },
  });

  for (const p of allKo) {
    let changed = false;
    let nl = p.equipoLocal;
    let nv = p.equipoVisita;

    // Reemplazar W{pos} con W{id_real}
    nl = nl.replace(/W(\d+)/g, (_, pos) => {
      const id = posToId[parseInt(pos)];
      return id ? `W${id}` : `W${pos}`;
    });
    nv = nv.replace(/W(\d+)/g, (_, pos) => {
      const id = posToId[parseInt(pos)];
      return id ? `W${id}` : `W${pos}`;
    });

    // Reemplazar RU{pos} con RU{id_real}
    nl = nl.replace(/RU(\d+)/g, (_, pos) => {
      const id = posToId[parseInt(pos)];
      return id ? `RU${id}` : `RU${pos}`;
    });
    nv = nv.replace(/RU(\d+)/g, (_, pos) => {
      const id = posToId[parseInt(pos)];
      return id ? `RU${id}` : `RU${pos}`;
    });

    if (nl !== p.equipoLocal || nv !== p.equipoVisita) {
      await prisma.partido.update({ where: { id: p.id }, data: { equipoLocal: nl, equipoVisita: nv } });
      changed = true;
    }
  }

  // Propagar resultado del match 489 (Sudáfrica 0-1 Canadá) a octavos
  await resolverRondaSiguiente(489);
  console.log("Resultado propagado a octavos");
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
