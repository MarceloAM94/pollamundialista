import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL no definida");

const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter });

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const SYSTEM_STATE = "PRE_TORNEO";

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

// Horarios en hora Perú (UTC-5) convertidos a UTC
const PARTIDOS_F1: Array<[string, string, string, string, string]> = [
  // ── GRUPO A ──────────────────────────────────────────────────
  // F1 — Jue 11/06
  ["A", "México", "Sudáfrica", "2026-06-11T19:00:00Z", "Estadio Azteca, Cd. de México"],
  ["A", "Corea del Sur", "República Checa", "2026-06-12T02:00:00Z", "Estadio Akron, Guadalajara"],
  // F2 — Jue 18/06
  ["A", "República Checa", "Sudáfrica", "2026-06-18T16:00:00Z", "Mercedes-Benz Stadium, Atlanta"],
  ["A", "México", "Corea del Sur", "2026-06-19T01:00:00Z", "Estadio Akron, Guadalajara"],
  // F3 — Mié 24/06
  ["A", "República Checa", "México", "2026-06-25T01:00:00Z", "Estadio Azteca, Cd. de México"],
  ["A", "Sudáfrica", "Corea del Sur", "2026-06-25T01:00:00Z", "Estadio BBVA, Monterrey"],

  // ── GRUPO B ──────────────────────────────────────────────────
  // F1 — Vie 12/06 y Sáb 13/06
  ["B", "Canadá", "Bosnia y Herzegovina", "2026-06-12T19:00:00Z", "BMO Field, Toronto"],
  ["B", "Catar", "Suiza", "2026-06-13T19:00:00Z", "Levi's Stadium, Santa Clara"],
  // F2 — Jue 18/06
  ["B", "Suiza", "Bosnia y Herzegovina", "2026-06-18T19:00:00Z", "SoFi Stadium, Inglewood"],
  ["B", "Canadá", "Catar", "2026-06-18T22:00:00Z", "BC Place, Vancouver"],
  // F3 — Mié 24/06
  ["B", "Canadá", "Suiza", "2026-06-24T19:00:00Z", "BC Place, Vancouver"],
  ["B", "Bosnia y Herzegovina", "Catar", "2026-06-24T19:00:00Z", "Lumen Field, Seattle"],

  // ── GRUPO C ──────────────────────────────────────────────────
  // F1 — Sáb 13/06
  ["C", "Brasil", "Marruecos", "2026-06-13T22:00:00Z", "MetLife Stadium, East Rutherford"],
  ["C", "Haití", "Escocia", "2026-06-14T01:00:00Z", "Gillette Stadium, Foxborough"],
  // F2 — Vie 19/06
  ["C", "Escocia", "Marruecos", "2026-06-19T22:00:00Z", "Gillette Stadium, Foxborough"],
  ["C", "Brasil", "Haití", "2026-06-20T01:00:00Z", "Lincoln Financial Field, Philadelphia"],
  // F3 — Mié 24/06
  ["C", "Brasil", "Escocia", "2026-06-24T22:00:00Z", "Hard Rock Stadium, Miami Gardens"],
  ["C", "Marruecos", "Haití", "2026-06-24T22:00:00Z", "Mercedes-Benz Stadium, Atlanta"],

  // ── GRUPO D ──────────────────────────────────────────────────
  // F1 — Vie 12/06 y Sáb 13/06
  ["D", "Estados Unidos", "Paraguay", "2026-06-13T01:00:00Z", "SoFi Stadium, Inglewood"],
  ["D", "Australia", "Turquía", "2026-06-14T04:00:00Z", "BC Place, Vancouver"],
  // F2 — Sáb 19/06
  ["D", "Estados Unidos", "Australia", "2026-06-19T19:00:00Z", "Lumen Field, Seattle"],
  ["D", "Turquía", "Paraguay", "2026-06-20T04:00:00Z", "Levi's Stadium, Santa Clara"],
  // F3 — Jue 25/06
  ["D", "Estados Unidos", "Turquía", "2026-06-26T01:00:00Z", "SoFi Stadium, Inglewood"],
  ["D", "Paraguay", "Australia", "2026-06-26T01:00:00Z", "Levi's Stadium, Santa Clara"],

  // ── GRUPO E ──────────────────────────────────────────────────
  // F1 — Dom 14/06
  ["E", "Alemania", "Curazao", "2026-06-14T17:00:00Z", "NRG Stadium, Houston"],
  ["E", "Costa de Marfil", "Ecuador", "2026-06-14T23:00:00Z", "Lincoln Financial Field, Philadelphia"],
  // F2 — Sáb 20/06
  ["E", "Alemania", "Costa de Marfil", "2026-06-20T20:00:00Z", "BMO Field, Toronto"],
  ["E", "Ecuador", "Curazao", "2026-06-21T00:00:00Z", "Arrowhead Stadium, Kansas City"],
  // F3 — Jue 25/06
  ["E", "Ecuador", "Alemania", "2026-06-25T19:00:00Z", "MetLife Stadium, East Rutherford"],
  ["E", "Curazao", "Costa de Marfil", "2026-06-25T19:00:00Z", "Lincoln Financial Field, Philadelphia"],

  // ── GRUPO F ──────────────────────────────────────────────────
  // F1 — Dom 14/06
  ["F", "Países Bajos", "Japón", "2026-06-14T20:00:00Z", "AT&T Stadium, Arlington"],
  ["F", "Suecia", "Túnez", "2026-06-15T02:00:00Z", "Estadio BBVA, Monterrey"],
  // F2 — Sáb 20/06
  ["F", "Países Bajos", "Suecia", "2026-06-20T17:00:00Z", "NRG Stadium, Houston"],
  ["F", "Japón", "Túnez", "2026-06-21T04:00:00Z", "Estadio BBVA, Monterrey"],
  // F3 — Jue 25/06
  ["F", "Japón", "Suecia", "2026-06-25T22:00:00Z", "AT&T Stadium, Arlington"],
  ["F", "Túnez", "Países Bajos", "2026-06-25T22:00:00Z", "Arrowhead Stadium, Kansas City"],

  // ── GRUPO G ──────────────────────────────────────────────────
  // F1 — Lun 15/06
  ["G", "Bélgica", "Egipto", "2026-06-15T19:00:00Z", "Lumen Field, Seattle"],
  ["G", "Irán", "Nueva Zelanda", "2026-06-16T01:00:00Z", "SoFi Stadium, Inglewood"],
  // F2 — Dom 21/06
  ["G", "Bélgica", "Irán", "2026-06-21T19:00:00Z", "SoFi Stadium, Inglewood"],
  ["G", "Egipto", "Nueva Zelanda", "2026-06-22T01:00:00Z", "BC Place, Vancouver"],
  // F3 — Vie 26/06
  ["G", "Egipto", "Irán", "2026-06-27T03:00:00Z", "Lumen Field, Seattle"],
  ["G", "Nueva Zelanda", "Bélgica", "2026-06-27T03:00:00Z", "BC Place, Vancouver"],

  // ── GRUPO H ──────────────────────────────────────────────────
  // F1 — Lun 15/06
  ["H", "España", "Cabo Verde", "2026-06-15T16:00:00Z", "Mercedes-Benz Stadium, Atlanta"],
  ["H", "Uruguay", "Arabia Saudita", "2026-06-15T22:00:00Z", "Hard Rock Stadium, Miami Gardens"],
  // F2 — Dom 21/06
  ["H", "España", "Arabia Saudita", "2026-06-21T16:00:00Z", "Mercedes-Benz Stadium, Atlanta"],
  ["H", "Uruguay", "Cabo Verde", "2026-06-21T22:00:00Z", "Hard Rock Stadium, Miami Gardens"],
  // F3 — Vie 26/06
  ["H", "Cabo Verde", "Arabia Saudita", "2026-06-27T00:00:00Z", "NRG Stadium, Houston"],
  ["H", "Uruguay", "España", "2026-06-27T00:00:00Z", "Estadio Akron, Guadalajara"],

  // ── GRUPO I ──────────────────────────────────────────────────
  // F1 — Mar 16/06
  ["I", "Francia", "Senegal", "2026-06-16T19:00:00Z", "Mercedes-Benz Stadium, Atlanta"],
  ["I", "Irak", "Noruega", "2026-06-16T22:00:00Z", "Gillette Stadium, Foxborough"],
  // F2 — Lun 22/06
  ["I", "Francia", "Irak", "2026-06-22T21:00:00Z", "Lincoln Financial Field, Philadelphia"],
  ["I", "Noruega", "Senegal", "2026-06-23T00:00:00Z", "MetLife Stadium, East Rutherford"],
  // F3 — Vie 26/06
  ["I", "Noruega", "Francia", "2026-06-26T19:00:00Z", "Gillette Stadium, Foxborough"],
  ["I", "Senegal", "Irak", "2026-06-26T19:00:00Z", "BMO Field, Toronto"],

  // ── GRUPO J ──────────────────────────────────────────────────
  // F1 — Mar 16/06
  ["J", "Argentina", "Argelia", "2026-06-17T01:00:00Z", "Arrowhead Stadium, Kansas City"],
  ["J", "Austria", "Jordania", "2026-06-17T04:00:00Z", "Levi's Stadium, Santa Clara"],
  // F2 — Lun 22/06
  ["J", "Argentina", "Austria", "2026-06-22T17:00:00Z", "AT&T Stadium, Arlington"],
  ["J", "Jordania", "Argelia", "2026-06-23T03:00:00Z", "Levi's Stadium, Santa Clara"],
  // F3 — Sáb 27/06
  ["J", "Jordania", "Argentina", "2026-06-28T01:00:00Z", "AT&T Stadium, Arlington"],
  ["J", "Argelia", "Austria", "2026-06-28T01:00:00Z", "Arrowhead Stadium, Kansas City"],

  // ── GRUPO K ──────────────────────────────────────────────────
  // F1 — Mié 17/06
  ["K", "Portugal", "Congo DR", "2026-06-17T17:00:00Z", "NRG Stadium, Houston"],
  ["K", "Colombia", "Uzbekistán", "2026-06-18T02:00:00Z", "Estadio Azteca, Cd. de México"],
  // F2 — Mar 23/06
  ["K", "Portugal", "Uzbekistán", "2026-06-23T17:00:00Z", "NRG Stadium, Houston"],
  ["K", "Colombia", "Congo DR", "2026-06-24T02:00:00Z", "Estadio Akron, Guadalajara"],
  // F3 — Sáb 27/06
  ["K", "Colombia", "Portugal", "2026-06-27T22:00:00Z", "Hard Rock Stadium, Miami Gardens"],
  ["K", "Congo DR", "Uzbekistán", "2026-06-27T22:00:00Z", "Mercedes-Benz Stadium, Atlanta"],

  // ── GRUPO L ──────────────────────────────────────────────────
  // F1 — Mié 17/06
  ["L", "Inglaterra", "Croacia", "2026-06-17T20:00:00Z", "AT&T Stadium, Arlington"],
  ["L", "Ghana", "Panamá", "2026-06-17T23:00:00Z", "BMO Field, Toronto"],
  // F2 — Mar 23/06
  ["L", "Inglaterra", "Ghana", "2026-06-23T20:00:00Z", "Gillette Stadium, Foxborough"],
  ["L", "Panamá", "Croacia", "2026-06-23T23:00:00Z", "BMO Field, Toronto"],
  // F3 — Sáb 27/06
  ["L", "Inglaterra", "Panamá", "2026-06-27T19:00:00Z", "MetLife Stadium, East Rutherford"],
  ["L", "Croacia", "Ghana", "2026-06-27T19:00:00Z", "Lincoln Financial Field, Philadelphia"],
];

const RONDAS_KO: Array<{
  ronda: string;
  local: string;
  visita: string;
  fecha: string;
  estadio: string;
}> = [
  // DIEZISEISAVOS (R32) — bracket real del Mundial 2026
  { ronda: "dieciseisavos", local: "2A", visita: "2B", fecha: "2026-06-28T19:00:00Z", estadio: "SoFi Stadium, Inglewood" },
  { ronda: "dieciseisavos", local: "1C", visita: "2F", fecha: "2026-06-29T17:00:00Z", estadio: "NRG Stadium, Houston" },
  { ronda: "dieciseisavos", local: "1E", visita: "3D", fecha: "2026-06-29T20:30:00Z", estadio: "Gillette Stadium, Foxborough" },
  { ronda: "dieciseisavos", local: "1F", visita: "2C", fecha: "2026-06-30T01:00:00Z", estadio: "Estadio BBVA, Monterrey" },
  { ronda: "dieciseisavos", local: "2E", visita: "2I", fecha: "2026-06-30T17:00:00Z", estadio: "AT&T Stadium, Arlington" },
  { ronda: "dieciseisavos", local: "1I", visita: "3F", fecha: "2026-06-30T21:00:00Z", estadio: "MetLife Stadium, East Rutherford" },
  { ronda: "dieciseisavos", local: "1A", visita: "3E", fecha: "2026-07-01T01:00:00Z", estadio: "Estadio Azteca, Cd. de México" },
  { ronda: "dieciseisavos", local: "1L", visita: "3K", fecha: "2026-07-01T16:00:00Z", estadio: "Mercedes-Benz Stadium, Atlanta" },
  { ronda: "dieciseisavos", local: "1G", visita: "3I", fecha: "2026-07-01T20:00:00Z", estadio: "Lumen Field, Seattle" },
  { ronda: "dieciseisavos", local: "1D", visita: "3B", fecha: "2026-07-02T00:00:00Z", estadio: "Levi's Stadium, Santa Clara" },
  { ronda: "dieciseisavos", local: "1H", visita: "2J", fecha: "2026-07-02T19:00:00Z", estadio: "SoFi Stadium, Inglewood" },
  { ronda: "dieciseisavos", local: "2K", visita: "2L", fecha: "2026-07-02T23:00:00Z", estadio: "BMO Field, Toronto" },
  { ronda: "dieciseisavos", local: "1B", visita: "3J", fecha: "2026-07-03T03:00:00Z", estadio: "BC Place, Vancouver" },
  { ronda: "dieciseisavos", local: "2D", visita: "2G", fecha: "2026-07-03T18:00:00Z", estadio: "AT&T Stadium, Arlington" },
  { ronda: "dieciseisavos", local: "1J", visita: "2H", fecha: "2026-07-03T22:00:00Z", estadio: "Hard Rock Stadium, Miami Gardens" },
  { ronda: "dieciseisavos", local: "1K", visita: "3L", fecha: "2026-07-04T01:30:00Z", estadio: "Arrowhead Stadium, Kansas City" },

  // OCTAVOS (R16)
  { ronda: "octavos", local: "W73", visita: "W75", fecha: "2026-07-04T17:00:00Z", estadio: "NRG Stadium, Houston" },
  { ronda: "octavos", local: "W74", visita: "W77", fecha: "2026-07-04T21:00:00Z", estadio: "Lincoln Financial Field, Philadelphia" },
  { ronda: "octavos", local: "W76", visita: "W78", fecha: "2026-07-05T20:00:00Z", estadio: "MetLife Stadium, East Rutherford" },
  { ronda: "octavos", local: "W79", visita: "W80", fecha: "2026-07-06T00:00:00Z", estadio: "Estadio Azteca, Cd. de México" },
  { ronda: "octavos", local: "W83", visita: "W84", fecha: "2026-07-06T19:00:00Z", estadio: "AT&T Stadium, Arlington" },
  { ronda: "octavos", local: "W81", visita: "W82", fecha: "2026-07-07T00:00:00Z", estadio: "Lumen Field, Seattle" },
  { ronda: "octavos", local: "W86", visita: "W88", fecha: "2026-07-07T16:00:00Z", estadio: "Mercedes-Benz Stadium, Atlanta" },
  { ronda: "octavos", local: "W85", visita: "W87", fecha: "2026-07-07T20:00:00Z", estadio: "BC Place, Vancouver" },

  // CUARTOS
  { ronda: "cuartos", local: "W89", visita: "W90", fecha: "2026-07-09T20:00:00Z", estadio: "Gillette Stadium, Foxborough" },
  { ronda: "cuartos", local: "W93", visita: "W94", fecha: "2026-07-10T19:00:00Z", estadio: "SoFi Stadium, Inglewood" },
  { ronda: "cuartos", local: "W91", visita: "W92", fecha: "2026-07-11T21:00:00Z", estadio: "Hard Rock Stadium, Miami Gardens" },
  { ronda: "cuartos", local: "W95", visita: "W96", fecha: "2026-07-12T01:00:00Z", estadio: "Arrowhead Stadium, Kansas City" },

  // SEMIFINALES
  { ronda: "semifinal", local: "W97", visita: "W98", fecha: "2026-07-14T19:00:00Z", estadio: "AT&T Stadium, Arlington" },
  { ronda: "semifinal", local: "W99", visita: "W100", fecha: "2026-07-15T19:00:00Z", estadio: "Mercedes-Benz Stadium, Atlanta" },

  // TERCER PUESTO
  { ronda: "tercer_puesto", local: "RU101", visita: "RU102", fecha: "2026-07-18T21:00:00Z", estadio: "Hard Rock Stadium, Miami Gardens" },

  // FINAL
  { ronda: "final", local: "W101", visita: "W102", fecha: "2026-07-19T19:00:00Z", estadio: "MetLife Stadium, East Rutherford" },
];

async function main() {
  // ── Usuarios admin (UPSERT: crea solo si no existen) ──
  const adminExiste = await prisma.usuario.findUnique({ where: { username: ADMIN_USERNAME } });
  if (!adminExiste) {
    const ph = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.usuario.create({
      data: { username: ADMIN_USERNAME, passwordHash: ph, nombre: "Administrador", isAdmin: true },
    });
    console.log(`Admin creado: ${ADMIN_USERNAME}`);
  } else {
    console.log(`Admin ${ADMIN_USERNAME} ya existe`);
  }

  const gabrieliExiste = await prisma.usuario.findUnique({ where: { username: "GabrieliSCmo" } });
  if (!gabrieliExiste) {
    const ph = await bcrypt.hash("123456", 10);
    await prisma.usuario.create({
      data: { username: "GabrieliSCmo", passwordHash: ph, nombre: "Gabrieli", isAdmin: true },
    });
    console.log("Admin creado: GabrieliSCmo");
  } else {
    console.log("Admin GabrieliSCmo ya existe");
  }

  // ── Configuración (UPSERT) ──
  await prisma.configuracion.upsert({
    where: { clave: "estado_sistema" },
    update: { valor: SYSTEM_STATE },
    create: { clave: "estado_sistema", valor: SYSTEM_STATE },
  });
  console.log(`Estado del sistema: ${SYSTEM_STATE}`);

  // ── Partidos de fase de grupos (solo si no existen) ──
  const gruposExistentes = await prisma.partido.count({ where: { fase: 1 } });
  if (gruposExistentes === 0) {
    let contador = 0;
    for (const [grupo, local, visita, fecha, estadio] of PARTIDOS_F1) {
      await prisma.partido.create({
        data: {
          fase: 1, ronda: "grupos", grupo,
          equipoLocal: local, equipoVisita: visita,
          fechaHora: new Date(fecha), estadio,
          estado: "PROGRAMADO",
        },
      });
      contador++;
    }
    console.log(`${contador} partidos de fase de grupos creados`);
  } else {
    console.log(`${gruposExistentes} partidos de fase de grupos ya existen, saltando creación`);
  }

  // ── Partidos de eliminatorias (solo si no existen) ──
  const koExistentes = await prisma.partido.count({ where: { fase: 2 } });
  if (koExistentes === 0) {
    let contadorKo = 0;
    for (const ko of RONDAS_KO) {
      await prisma.partido.create({
        data: {
          fase: 2, ronda: ko.ronda, grupo: null,
          equipoLocal: ko.local, equipoVisita: ko.visita,
          fechaHora: new Date(ko.fecha), estadio: ko.estadio,
          estado: "PROGRAMADO",
        },
      });
      contadorKo++;
    }
    console.log(`${contadorKo} partidos de fase eliminatoria creados`);
    console.log(`Total: ${contadorKo + gruposExistentes} partidos`);
  } else {
    console.log(`${koExistentes} partidos de fase eliminatoria ya existen, saltando creación`);
  }
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
