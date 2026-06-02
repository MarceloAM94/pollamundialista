# Fase 06: Eliminatorias (Fase Mata-Mata)

## Objetivo

Agregar soporte para la fase de eliminación directa (octavos, cuartos, semifinal,
tercer puesto, final) incluyendo predicción de penales, visualización tipo bracket, y
puntuación que considera penales.

## Cambios Realizados

### Schema (Prisma)

Se agregaron 4 columnas a la base de datos:

- **Partido**: `penalesLocal Int?`, `penalesVisita Int?` — resultado real de penales
- **Pronostico**: `penalesLocal Int?`, `penalesVisita Int?` — predicción del usuario

Migración: `prisma/migrations/20260602170000_add_penales/`

### Servicios

- **`src/lib/partido-service.ts`**: Se unificó `getPartidos` para soportar ambas fases
  (fase=1 para grupos, fase=2 para mata-mata). Incluye campos de penales en el retorno.

- **`src/lib/pronostico-service.ts`**: Se eliminó la restricción que solo permitía
  pronosticar fase=1. Para fase=2, se requieren penales (no nulos, no negativos,
  no empate).

- **`src/lib/admin-service.ts`**: `updatePartido` ahora acepta `penalesLocal` y
  `penalesVisita`. Al cambiar a PROGRAMADO se borran también los penales.

- **`src/lib/score-service.ts`**: `procesarPartido` ahora considera penales:
  - Si el partido tuvo penales en la realidad, se requieren penales exactos para
    obtener 3 puntos.
  - 1 punto se otorga por acertar el ganador global (considerando penales si
    existieron) o por diferencia correcta en reglamentario (si no hubo penales).

### API Routes

- **`GET /api/partidos`**: Ahora retorna solo fase=1 (grupos).
- **`GET /api/partidos/eliminatorias`**: Nueva ruta, retorna solo fase=2 (mata-mata)
  con predicciones del usuario y bloqueo por tiempo.
- **`POST /api/pronosticos`**: Acepta campos opcionales `penalesLocal`/`penalesVisita`.
- **`PUT /api/admin/partidos`**: Acepta `penalesLocal`/`penalesVisita`.

### Frontend

- **`/eliminatorias`**: Nueva página con `EliminatoriasClient.tsx`. Muestra partidos
  agrupados por ronda (octavos, cuartos, semifinal, tercer puesto, final). Cada
  partido tiene inputs para resultado y penales, con time-lock de 5 min.

- **Dashboard**: Se agregó enlace a `/eliminatorias` tanto en las tarjetas como en
  los botones principales. La tarjeta "Eliminatoria" ahora apunta a `/eliminatorias`
  (antes apuntaba a `/ranking`).

- **Panel Admin**: Los partidos de fase=2 muestran inputs adicionales para penales
  (local/visita). Se refactorizó el manejo de estado para usar strings en lugar de
  tipos mixtos.

### Scoring

- **3 puntos**: Resultado exacto en reglamentario + penales exactos (si aplica).
- **1 punto**: Ganador correcto (considerando penales si el partido los tuvo) o
  diferencia correcta en reglamentario (si no hubo penales).
- **0 puntos**: En cualquier otro caso.

## Archivos Modificados

- `prisma/schema.prisma`
- `prisma/migrations/20260602170000_add_penales/migration.sql`
- `prisma/migrations/migration_lock.toml`
- `src/lib/partido-service.ts`
- `src/lib/pronostico-service.ts`
- `src/lib/admin-service.ts`
- `src/lib/score-service.ts`
- `src/app/api/partidos/route.ts`
- `src/app/api/pronosticos/route.ts`
- `src/app/api/admin/partidos/route.ts`
- `src/app/admin/AdminClient.tsx`
- `src/app/dashboard/DashboardClient.tsx`

## Archivos Nuevos

- `src/app/api/partidos/eliminatorias/route.ts`
- `src/app/eliminatorias/page.tsx`
- `src/app/eliminatorias/EliminatoriasClient.tsx`
