import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as crypto from "node:crypto";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL no definida");

const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter });

// ─── CONFIG ───────────────────────────────────────────────────────
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const SYSTEM_STATE = "PRE_TORNEO";

// ─── GRUPOS Y EQUIPOS ────────────────────────────────────────────
const GRUPOS: Record<string, string[]> = {
  A: ["México", "Sudáfrica", "Corea del Sur", "República Checa"],
  B: ["Canadá", "Bosnia y Herzegovina", "Catar", "Suiza"],
  C: ["Brasil", "Marruecos", "Haití", "Escocia"],
  D: ["Estados Unidos", "Paraguay", "Australia", "Turquía"],
  E: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  F: ["Países Bajos", "Japón", "Suecia", "Túnez"],
  G: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],
  H: ["España", "Cabo Verde", "Arabia Saudita", "Uruguay"],
  I: ["Francia", "Senegal", "Irak", "Noruega"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "Congo DR", "Uzbekistán", "Colombia"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panamá"],
};

// ─── PARTIDOS ─────────────────────────────────────────────────────
// Formato: [grupo, local, visita, fechaISO, estadio]
const PARTIDOS_F1: Array<[string, string, string, string, string]> = [
  // JUEVES 11 JUN
  ["A", "México", "Sudáfrica", "2026-06-11T19:00:00Z", "Estadio Azteca, Cd. de México"],
  ["A", "Corea del Sur", "República Checa", "2026-06-12T02:00:00Z", "Estadio Akron, Guadalajara"],

  // VIERNES 12 JUN
  ["B", "Canadá", "Bosnia y Herzegovina", "2026-06-12T19:00:00Z", "BMO Field, Toronto"],
  ["D", "Estados Unidos", "Paraguay", "2026-06-13T01:00:00Z", "SoFi Stadium, Inglewood"],

  // SÁBADO 13 JUN
  ["B", "Catar", "Suiza", "2026-06-13T19:00:00Z", "Levi's Stadium, Santa Clara"],
  ["C", "Brasil", "Marruecos", "2026-06-13T22:00:00Z", "MetLife Stadium, East Rutherford"],
  ["C", "Haití", "Escocia", "2026-06-14T01:00:00Z", "Gillette Stadium, Foxborough"],
  ["D", "Australia", "Turquía", "2026-06-14T04:00:00Z", "BC Place, Vancouver"],

  // DOMINGO 14 JUN
  ["E", "Alemania", "Curazao", "2026-06-14T17:00:00Z", "NRG Stadium, Houston"],
  ["F", "Países Bajos", "Japón", "2026-06-14T20:00:00Z", "AT&T Stadium, Arlington"],
  ["E", "Costa de Marfil", "Ecuador", "2026-06-14T23:00:00Z", "Lincoln Financial Field, Philadelphia"],
  ["F", "Suecia", "Túnez", "2026-06-15T02:00:00Z", "Estadio BBVA, Monterrey"],

  // LUNES 15 JUN
  ["H", "España", "Cabo Verde", "2026-06-15T16:00:00Z", "Mercedes-Benz Stadium, Atlanta"],
  ["G", "Bélgica", "Egipto", "2026-06-15T19:00:00Z", "Lumen Field, Seattle"],
  ["H", "Arabia Saudita", "Uruguay", "2026-06-15T22:00:00Z", "Hard Rock Stadium, Miami Gardens"],
  ["G", "Irán", "Nueva Zelanda", "2026-06-16T01:00:00Z", "SoFi Stadium, Inglewood"],

  // MARTES 16 JUN
  ["I", "Francia", "Senegal", "2026-06-16T19:00:00Z", "Mercedes-Benz Stadium, Atlanta"],
  ["I", "Irak", "Noruega", "2026-06-16T22:00:00Z", "Lumen Field, Seattle"],
  ["J", "Argentina", "Argelia", "2026-06-17T01:00:00Z", "Hard Rock Stadium, Miami Gardens"],
  ["J", "Austria", "Jordania", "2026-06-17T04:00:00Z", "Estadio Akron, Guadalajara"],

  // MIÉRCOLES 17 JUN
  ["K", "Portugal", "Congo DR", "2026-06-17T17:00:00Z", "NRG Stadium, Houston"],
  ["L", "Inglaterra", "Croacia", "2026-06-17T20:00:00Z", "AT&T Stadium, Arlington"],
  ["L", "Ghana", "Panamá", "2026-06-17T23:00:00Z", "BMO Field, Toronto"],
  ["K", "Uzbekistán", "Colombia", "2026-06-18T02:00:00Z", "Estadio Azteca, Cd. de México"],

  // JUEVES 18 JUN — FECHA 2
  ["A", "República Checa", "Sudáfrica", "2026-06-18T16:00:00Z", "Mercedes-Benz Stadium, Atlanta"],
  ["B", "Suiza", "Bosnia y Herzegovina", "2026-06-18T19:00:00Z", "SoFi Stadium, Inglewood"],
  ["B", "Canadá", "Catar", "2026-06-18T22:00:00Z", "BC Place, Vancouver"],
  ["A", "México", "Corea del Sur", "2026-06-19T01:00:00Z", "Estadio Akron, Guadalajara"],

  // VIERNES 19 JUN
  ["D", "Estados Unidos", "Australia", "2026-06-19T19:00:00Z", "Lumen Field, Seattle"],
  ["C", "Escocia", "Marruecos", "2026-06-19T22:00:00Z", "Gillette Stadium, Foxborough"],
  ["C", "Brasil", "Haití", "2026-06-20T00:30:00Z", "Lincoln Financial Field, Philadelphia"],
  ["D", "Turquía", "Paraguay", "2026-06-20T03:00:00Z", "Levi's Stadium, Santa Clara"],

  // SÁBADO 20 JUN
  ["F", "Países Bajos", "Suecia", "2026-06-20T17:00:00Z", "NRG Stadium, Houston"],
  ["E", "Alemania", "Costa de Marfil", "2026-06-20T20:00:00Z", "BMO Field, Toronto"],
  ["E", "Ecuador", "Curazao", "2026-06-21T00:00:00Z", "Arrowhead Stadium, Kansas City"],
  ["F", "Túnez", "Japón", "2026-06-21T04:00:00Z", "Estadio BBVA, Monterrey"],

  // DOMINGO 21 JUN
  ["H", "España", "Arabia Saudita", "2026-06-21T16:00:00Z", "Mercedes-Benz Stadium, Atlanta"],
  ["H", "Uruguay", "Cabo Verde", "2026-06-21T19:00:00Z", "Hard Rock Stadium, Miami Gardens"],
  ["G", "Bélgica", "Irán", "2026-06-21T22:00:00Z", "Lumen Field, Seattle"],
  ["G", "Egipto", "Nueva Zelanda", "2026-06-22T01:00:00Z", "BC Place, Vancouver"],

  // LUNES 22 JUN
  ["J", "Argentina", "Austria", "2026-06-22T16:00:00Z", "Lincoln Financial Field, Philadelphia"],
  ["I", "Francia", "Irak", "2026-06-22T19:00:00Z", "AT&T Stadium, Arlington"],
  ["I", "Senegal", "Noruega", "2026-06-22T22:00:00Z", "Estadio BBVA, Monterrey"],
  ["J", "Argelia", "Jordania", "2026-06-23T01:00:00Z", "Gillette Stadium, Foxborough"],

  // MARTES 23 JUN
  ["L", "Inglaterra", "Ghana", "2026-06-23T17:00:00Z", "SoFi Stadium, Inglewood"],
  ["K", "Portugal", "Uzbekistán", "2026-06-23T20:00:00Z", "NRG Stadium, Houston"],
  ["L", "Croacia", "Panamá", "2026-06-23T23:00:00Z", "Estadio Azteca, Cd. de México"],
  ["K", "Congo DR", "Colombia", "2026-06-24T02:00:00Z", "Estadio Akron, Guadalajara"],

  // MIÉRCOLES 24 JUN — FECHA 3
  ["A", "México", "República Checa", "2026-06-24T16:00:00Z", "Estadio Azteca, Cd. de México"],
  ["A", "Sudáfrica", "Corea del Sur", "2026-06-24T16:00:00Z", "Estadio Akron, Guadalajara"],
  ["B", "Canadá", "Suiza", "2026-06-24T20:00:00Z", "BC Place, Vancouver"],
  ["B", "Bosnia y Herzegovina", "Catar", "2026-06-24T20:00:00Z", "BMO Field, Toronto"],

  // JUEVES 25 JUN
  ["C", "Brasil", "Escocia", "2026-06-25T16:00:00Z", "MetLife Stadium, East Rutherford"],
  ["C", "Marruecos", "Haití", "2026-06-25T16:00:00Z", "Gillette Stadium, Foxborough"],
  ["D", "Estados Unidos", "Turquía", "2026-06-25T20:00:00Z", "SoFi Stadium, Inglewood"],
  ["D", "Paraguay", "Australia", "2026-06-25T20:00:00Z", "Levi's Stadium, Santa Clara"],

  // VIERNES 26 JUN
  ["E", "Alemania", "Ecuador", "2026-06-26T16:00:00Z", "NRG Stadium, Houston"],
  ["E", "Curazao", "Costa de Marfil", "2026-06-26T16:00:00Z", "Arrowhead Stadium, Kansas City"],
  ["F", "Países Bajos", "Túnez", "2026-06-26T20:00:00Z", "AT&T Stadium, Arlington"],
  ["F", "Japón", "Suecia", "2026-06-26T20:00:00Z", "Estadio BBVA, Monterrey"],

  // SÁBADO 27 JUN
  ["G", "Bélgica", "Nueva Zelanda", "2026-06-27T16:00:00Z", "Lumen Field, Seattle"],
  ["G", "Egipto", "Irán", "2026-06-27T16:00:00Z", "BC Place, Vancouver"],
  ["H", "España", "Uruguay", "2026-06-27T20:00:00Z", "Mercedes-Benz Stadium, Atlanta"],
  ["H", "Cabo Verde", "Arabia Saudita", "2026-06-27T20:00:00Z", "Hard Rock Stadium, Miami Gardens"],

  // DOMINGO 28 JUN (últimos partidos de grupos)
  ["I", "Francia", "Noruega", "2026-06-28T16:00:00Z", "Lincoln Financial Field, Philadelphia"],
  ["I", "Senegal", "Irak", "2026-06-28T16:00:00Z", "Estadio BBVA, Monterrey"],
  ["J", "Argentina", "Jordania", "2026-06-28T20:00:00Z", "Hard Rock Stadium, Miami Gardens"],
  ["J", "Argelia", "Austria", "2026-06-28T20:00:00Z", "Gillette Stadium, Foxborough"],

  // LUNES 29 JUN
  ["K", "Portugal", "Colombia", "2026-06-29T16:00:00Z", "NRG Stadium, Houston"],
  ["K", "Congo DR", "Uzbekistán", "2026-06-29T16:00:00Z", "Estadio Azteca, Cd. de México"],
  ["L", "Inglaterra", "Panamá", "2026-06-29T20:00:00Z", "AT&T Stadium, Arlington"],
  ["L", "Croacia", "Ghana", "2026-06-29T20:00:00Z", "SoFi Stadium, Inglewood"],
];

// ─── PARTIDOS FASE 2 (Eliminatoria) ──────────────────────────────
// equipos como "1A" = 1er lugar grupo A, "2B" = 2do grupo B, "3ABC" = 3er mejor entre A,B,C
const RONDAS_KO: Array<{
  ronda: string;
  local: string;
  visita: string;
  fecha: string;
  estadio: string;
}> = [
  // DIEZISEISAVOS (R32) — 28 JUN al 3 JUL
  { ronda: "dieciseisavos", local: "2A", visita: "2B", fecha: "2026-06-28T19:00:00Z", estadio: "SoFi Stadium, Inglewood" },
  { ronda: "dieciseisavos", local: "1E", visita: "3ABCDF", fecha: "2026-06-29T15:30:00Z", estadio: "Gillette Stadium, Foxborough" },
  { ronda: "dieciseisavos", local: "1C", visita: "2F", fecha: "2026-06-29T17:00:00Z", estadio: "NRG Stadium, Houston" },
  { ronda: "dieciseisavos", local: "1F", visita: "2C", fecha: "2026-06-30T01:00:00Z", estadio: "Estadio BBVA, Monterrey" },
  { ronda: "dieciseisavos", local: "1I", visita: "3CDFGH", fecha: "2026-06-30T21:00:00Z", estadio: "MetLife Stadium, East Rutherford" },
  { ronda: "dieciseisavos", local: "2E", visita: "2I", fecha: "2026-06-30T17:00:00Z", estadio: "Estadio Akron, Guadalajara" },
  { ronda: "dieciseisavos", local: "1D", visita: "3BEFIJ", fecha: "2026-07-02T00:00:00Z", estadio: "Levi's Stadium, Santa Clara" },
  { ronda: "dieciseisavos", local: "1G", visita: "3AEHIJ", fecha: "2026-07-01T20:00:00Z", estadio: "BC Place, Vancouver" },
  { ronda: "dieciseisavos", local: "1A", visita: "3CEFHI", fecha: "2026-07-01T01:00:00Z", estadio: "Estadio Azteca, Cd. de México" },
  { ronda: "dieciseisavos", local: "1L", visita: "3EHIJK", fecha: "2026-07-01T16:00:00Z", estadio: "BMO Field, Toronto" },
  { ronda: "dieciseisavos", local: "2K", visita: "2L", fecha: "2026-07-02T23:00:00Z", estadio: "Mercedes-Benz Stadium, Atlanta" },
  { ronda: "dieciseisavos", local: "1H", visita: "2J", fecha: "2026-07-02T19:00:00Z", estadio: "Lumen Field, Seattle" },
  { ronda: "dieciseisavos", local: "1J", visita: "2H", fecha: "2026-07-03T22:00:00Z", estadio: "Hard Rock Stadium, Miami Gardens" },
  { ronda: "dieciseisavos", local: "1B", visita: "3EFGIJ", fecha: "2026-07-03T03:00:00Z", estadio: "AT&T Stadium, Arlington" },
  { ronda: "dieciseisavos", local: "2D", visita: "2G", fecha: "2026-07-03T18:00:00Z", estadio: "Lincoln Financial Field, Philadelphia" },
  { ronda: "dieciseisavos", local: "1K", visita: "3DEIJL", fecha: "2026-07-04T01:30:00Z", estadio: "SoFi Stadium, Inglewood" },

  // OCTAVOS (R16) — 4 al 7 JUL
  { ronda: "octavos", local: "W73", visita: "W75", fecha: "2026-07-04T17:00:00Z", estadio: "NRG Stadium, Houston" },
  { ronda: "octavos", local: "W74", visita: "W77", fecha: "2026-07-04T21:00:00Z", estadio: "MetLife Stadium, East Rutherford" },
  { ronda: "octavos", local: "W76", visita: "W78", fecha: "2026-07-05T20:00:00Z", estadio: "Estadio Azteca, Cd. de México" },
  { ronda: "octavos", local: "W79", visita: "W80", fecha: "2026-07-06T00:00:00Z", estadio: "SoFi Stadium, Inglewood" },
  { ronda: "octavos", local: "W83", visita: "W84", fecha: "2026-07-06T19:00:00Z", estadio: "AT&T Stadium, Arlington" },
  { ronda: "octavos", local: "W81", visita: "W82", fecha: "2026-07-07T00:00:00Z", estadio: "BC Place, Vancouver" },
  { ronda: "octavos", local: "W86", visita: "W88", fecha: "2026-07-07T16:00:00Z", estadio: "Mercedes-Benz Stadium, Atlanta" },
  { ronda: "octavos", local: "W85", visita: "W87", fecha: "2026-07-07T20:00:00Z", estadio: "Gillette Stadium, Foxborough" },

  // CUARTOS — 9 al 12 JUL
  { ronda: "cuartos", local: "W89", visita: "W90", fecha: "2026-07-09T20:00:00Z", estadio: "MetLife Stadium, East Rutherford" },
  { ronda: "cuartos", local: "W93", visita: "W94", fecha: "2026-07-10T19:00:00Z", estadio: "SoFi Stadium, Inglewood" },
  { ronda: "cuartos", local: "W91", visita: "W92", fecha: "2026-07-11T21:00:00Z", estadio: "AT&T Stadium, Arlington" },
  { ronda: "cuartos", local: "W95", visita: "W96", fecha: "2026-07-12T01:00:00Z", estadio: "Mercedes-Benz Stadium, Atlanta" },

  // SEMIFINALES — 14 y 15 JUL
  { ronda: "semifinal", local: "W97", visita: "W98", fecha: "2026-07-14T19:00:00Z", estadio: "MetLife Stadium, East Rutherford" },
  { ronda: "semifinal", local: "W99", visita: "W100", fecha: "2026-07-15T19:00:00Z", estadio: "AT&T Stadium, Arlington" },

  // TERCER PUESTO — 18 JUL
  { ronda: "tercer_puesto", local: "RU101", visita: "RU102", fecha: "2026-07-18T21:00:00Z", estadio: "SoFi Stadium, Inglewood" },

  // FINAL — 19 JUL
  { ronda: "final", local: "W101", visita: "W102", fecha: "2026-07-19T19:00:00Z", estadio: "MetLife Stadium, East Rutherford" },
];

async function main() {
  console.log("🌱 Limpiando base de datos...");
  await prisma.pronostico.deleteMany();
  await prisma.partido.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.configuracion.deleteMany();

  // ── Admin ──────────────────────────────────────────────────────
  const { createHash } = await import("node:crypto");
  const passwordHash = createHash("sha256").update(ADMIN_PASSWORD).digest("hex");

  const admin = await prisma.usuario.create({
    data: {
      username: ADMIN_USERNAME,
      passwordHash,
      nombre: "Administrador",
      isAdmin: true,
    },
  });
  console.log(`✅ Admin creado: ${admin.username}`);

  // ── Estado del sistema ────────────────────────────────────────
  await prisma.configuracion.create({
    data: { clave: "estado_sistema", valor: SYSTEM_STATE },
  });
  console.log(`✅ Estado del sistema: ${SYSTEM_STATE}`);

  // ── Partidos F1 ────────────────────────────────────────────────
  let contador = 0;
  for (const [grupo, local, visita, fecha, estadio] of PARTIDOS_F1) {
    await prisma.partido.create({
      data: {
        fase: 1,
        ronda: "grupos",
        grupo,
        equipoLocal: local,
        equipoVisita: visita,
        fechaHora: new Date(fecha),
        estadio,
        estado: "PROGRAMADO",
      },
    });
    contador++;
  }
  console.log(`✅ ${contador} partidos de fase de grupos creados`);

  // ── Partidos F2 ────────────────────────────────────────────────
  let contadorKo = 0;
  for (const ko of RONDAS_KO) {
    await prisma.partido.create({
      data: {
        fase: 2,
        ronda: ko.ronda,
        grupo: null,
        equipoLocal: ko.local,
        equipoVisita: ko.visita,
        fechaHora: new Date(ko.fecha),
        estadio: ko.estadio,
        estado: "PROGRAMADO",
      },
    });
    contadorKo++;
  }
  console.log(`✅ ${contadorKo} partidos de fase eliminatoria creados`);
  console.log(`📊 Total: ${contador + contadorKo} partidos`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
