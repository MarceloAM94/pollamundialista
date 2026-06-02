# Fase 3: Pronósticos de Fase de Grupos ⚽

## ¿Qué hicimos?

Creamos la página de pronósticos de la fase de grupos. Los usuarios pueden
ver los 72 partidos organizados por grupo, ingresar sus predicciones de
goles, y guardarlas. Los partidos se bloquean automáticamente 5 minutos
antes de su inicio.

---

## 1. ¿Cómo funciona?

```
Usuario entra a /fase-grupos
        ↓
Proxy verifica autenticación (redirige a /login si no)
        ↓
Página carga (estático)
        ↓
Cliente fetchea GET /api/partidos → lista de partidos con pronósticos
        ↓
Usuario ingresa goles en cada partido
        ↓
Click "Guardar" → POST /api/pronosticos
        ↓
Servidor verifica time-lock y guarda
```

### Time-lock

Cada partido tiene una fecha/hora. El sistema calcula:

```
fechaLimite = fechaHora - 5 minutos
```

Si la hora actual es igual o mayor a `fechaLimite`, el partido se bloquea.
También se bloquea si el estado del partido ya no es "PROGRAMADO" (por
ejemplo, si un admin lo cambió a EN_VIVO o FINALIZADO).

Cuando un partido está bloqueado:
- Los inputs de goles se ocultan
- Se muestra el resultado guardado (si existe) o "Bloqueado"

### Upsert (Insert or Update)

Cuando guardas un pronóstico:
- Si **no tenías** pronóstico previo → se **crea** uno nuevo
- Si **ya tenías** pronóstico previo → se **actualiza**

Esto usa la función `upsert` de Prisma, que combina `create` y `update`
en una sola operación, usando la clave única `[usuarioId, partidoId]`.

---

## 2. Archivos nuevos/modificados

### `src/lib/partido-service.ts`

Función que consulta los partidos de fase de grupos desde la base de
datos, incluye el pronóstico del usuario actual, y calcula si está
bloqueado:

```typescript
export async function getPartidosGrupos(userId: number) {
  const partidos = await prisma.partido.findMany({
    where: { fase: 1 },  // solo fase de grupos
    include: {
      pronosticos: {
        where: { usuarioId: userId },  // solo mis pronósticos
      },
    },
  });

  return partidos.map(p => ({
    ...p,
    bloqueado: calcularSiBloqueado(p.fechaHora, p.estado),
    miPronostico: p.pronosticos[0] ?? null,
  }));
}
```

### `src/lib/pronostico-service.ts`

Función que guarda un pronóstico con todas las validaciones:

```typescript
export async function upsertPronostico(
  usuarioId, partidoId, golesLocal, golesVisita
) {
  // 1. Verificar que el partido existe
  // 2. Verificar time-lock (-5 min)
  // 3. Validar goles no negativos
  // 4. Upsert en la base de datos
}
```

### `src/app/api/partidos/route.ts`

```
GET /api/partidos → { partidos: [...] }
```

Devuelve todos los partidos de fase de grupos con:
- Datos del partido (equipos, fecha, estadio)
- `bloqueado`: boolean (time-lock + estado)
- `miPronostico`: el pronóstico del usuario autenticado (o null)

### `src/app/api/pronosticos/route.ts`

```
POST /api/pronosticos
Body: { partidoId: 1, golesLocal: 2, golesVisita: 1 }
→ { pronostico: { id, golesLocal, golesVisita } }
```

Validaciones:
- 400 si faltan campos
- 400 si goles no son números
- 400 si el partido no existe o está bloqueado
- 401 si no hay sesión

### `src/app/fase-grupos/FaseGruposClient.tsx`

Componente cliente que maneja toda la UI:

| Parte | Descripción |
|-------|-------------|
| `useEffect` | Al montar, fetchea `GET /api/partidos` |
| `GRUPOS` | Array con las letras A-L |
| `equiposDelGrupo()` | Extrae equipos únicos del grupo |
| `guardar()` | Llama `POST /api/pronosticos` |
| `formatFecha()` | Formatea fecha ISO a formato legible |

### `src/lib/auth-service.ts` — nuevo helper

Agregamos `getAuthenticatedUser()` que unifica la lógica de leer la
cookie, verificar el JWT, y devolver el usuario:

```typescript
const user = await getAuthenticatedUser();
if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
```

Este helper se usa en los nuevos API routes.

---

## 3. Conceptos nuevos

### Client-side data fetching

En Fase 2, la página de dashboard recibía datos del servidor (Server
Component). En Fase 3, la página es un componente cliente que fetchea
datos desde el navegador:

```
Server Component (Fase 2):
  Servidor → consulta BD → renderiza HTML → envía al cliente
  El HTML ya viene con los datos

Client Component (Fase 3):
  Servidor → envía HTML vacío + JS → navegador ejecuta JS → fetchea API
  La página se llena después de cargar
```

Ambos enfoques son válidos. El cliente es mejor cuando los datos cambian
frecuentemente (como los pronósticos que el usuario edita).

### Upsert (UPSERT = UPDATE + INSERT)

Es una operación de base de datos que dice:
- "Intenta actualizar este registro"
- "Si no existe, créalo"

En Prisma:
```typescript
await prisma.pronostico.upsert({
  where: { usuarioId_partidoId: { usuarioId, partidoId } },
  update: { golesLocal, golesVisita },  // si existe → actualiza
  create: { usuarioId, partidoId, golesLocal, golesVisita },  // si no → crea
});
```

Esto evita tener que hacer un "select" antes para saber si existe.

### CSS: Input type number sin flechas

En el navegador, los inputs type number muestran flechitas para subir o
bajar el valor. Las ocultamos con:

```css
[appearance:textfield]
[&::-webkit-inner-spin-button]:appearance-none
[&::-webkit-outer-spin-button]:appearance-none
```

En Tailwind se usa la notación `[&_selector]:clase` para selectores
arbitrarios.

### useCallback

Es un hook de React que evita que las funciones se vuelvan a crear en
cada render:

```typescript
const cargarPartidos = useCallback(async () => {
  // ...
}, []);
```

Sin `useCallback`, la función se recrearía en cada render, causando que
el `useEffect` que la llama se ejecute infinitamente.

---

## 4. ¿Cómo probar?

1. Inicia sesión con cualquier usuario
2. Ve al Dashboard → click "Fase de Grupos"
3. Verás los 12 grupos con sus partidos
4. Ingresa goles en algún partido (ej: México 2-1 Sudáfrica)
5. Click "Guardar" → verás "Guardado" en verde
6. Recarga la página → los datos persisten
7. Los partidos que ya empezaron (hora -5 min) aparecen bloqueados

### Probar con admin
El admin ve lo mismo que cualquier usuario, más el "Panel Admin" en el
dashboard (aún no funcional, es placeholder).

---

## 5. ¿Qué sigue?

Fase 4: Panel de administración. El admin podrá:
- Cambiar el estado del sistema (PRE_TORNEO → FASE_GRUPOS_ABIERTA → etc.)
- Ingresar resultados reales de los partidos
- Marcar partidos como EN_VIVO, FINALIZADO

Fase 5: Motor de puntuación. Cuando un partido finaliza y el admin
ingresa los resultados, el sistema calcula puntos:
- 3 puntos por resultado exacto
- 1 punto por diferencia de goles correcta
- 0 puntos si no acertó nada

---

## Glosario de la fase

| Término | Significado |
|---------|-------------|
| Upsert | Operación que actualiza o crea un registro |
| Time-lock | Bloqueo automático basado en tiempo |
| Client component | Componente React que se ejecuta en el navegador |
| Fase de grupos | Primera etapa del Mundial (72 partidos, 12 grupos) |
| Input type number | Input HTML que solo acepta números |
| useCallback | Hook de React para memorizar funciones |
