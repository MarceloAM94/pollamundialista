# Fase 4: Panel de Administración 🔧

## ¿Qué hicimos?

Creamos el panel de administración para gestionar el estado del sistema y
los resultados de los partidos. Solo el usuario admin (username: `admin`)
tiene acceso.

---

## 1. ¿Qué puede hacer el admin?

### Estado del Sistema

Controla en qué fase está la aplicación:

| Estado | Significado |
|--------|-------------|
| `PRE_TORNEO` | Antes del Mundial (no hay pronósticos) |
| `FASE_GRUPOS_ABIERTA` | Fase de grupos abierta para pronosticar |
| `TRANSICION` | Entre fase de grupos y eliminatorias |
| `FASE_MATAMATA_ABIERTA` | Eliminatorias abiertas |
| `TORNEO_FINALIZADO` | Mundial terminado |

Cada estado muestra/qué botones están disponibles. El admin puede
cambiarlo cuando corresponda.

### Resultados de Partidos

El admin puede:
- Ver todos los partidos organizados por fase (grupos o eliminatoria)
- Ingresar goles reales de cada partido (local y visita)
- Cambiar el estado de cada partido:
  - `PROGRAMADO` → programado, se puede pronosticar
  - `BLOQUEADO` → bloqueado manualmente
  - `EN_VIVO` → se está jugando
  - `FINALIZADO` → terminado (resultado ingresado)
  - `PROCESADO` → puntajes calculados

### Visualización

- Todos los partidos se muestran con su info (fecha, estadio, grupo)
- Se ve cuántos pronósticos tiene cada partido
- Los resultados existentes aparecen como placeholder en los inputs
- Se puede filtrar entre fase de grupos y eliminatoria

---

## 2. Archivos nuevos

### `src/lib/admin-service.ts`

Funciones para el panel admin:

| Función | Qué hace |
|---------|----------|
| `getAdminUser()` | Verifica que el usuario autenticado sea admin |
| `getAllPartidos()` | Todos los partidos con conteo de pronósticos |
| `updatePartido(id, data)` | Actualiza resultado y/o estado de un partido |
| `getEstadoSistema()` | Lee el estado actual del sistema |
| `setEstadoSistema(estado)` | Cambia el estado del sistema |
| `getEstadisticas()` | Cuenta usuarios, pronósticos, partidos |

### `src/app/api/admin/partidos/route.ts`

```
GET /api/admin/partidos → { partidos: [...] }
PUT /api/admin/partidos → body: { id, golesLocalReal?, golesVisitaReal?, estado? }
```

### `src/app/api/admin/config/route.ts`

```
GET /api/admin/config → { estadoSistema, estadosValidos }
PUT /api/admin/config → body: { estado }
```

### `src/app/admin/AdminClient.tsx`

Componente cliente con:
- Selector de estado del sistema (botones interactivos)
- Filtro fase grupos / eliminatoria
- Lista de partidos editables con inputs de goles y selector de estado

### `src/proxy.ts` — actualizado

Se agregó verificación de `isAdmin` para rutas `/admin`:

```typescript
if (pathname.startsWith("/admin") && !payload.isAdmin) {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

Esto asegura que si un usuario no-admin intenta acceder a `/admin`,
es redirigido al dashboard antes de que el servidor renderice la página.

---

## 3. Conceptos nuevos

### Doble capa de seguridad

El panel admin tiene protección en dos niveles:

1. **Proxy** — Redirige a no-admins antes de que cargue la página
2. **API routes** — `getAdminUser()` verifica `isAdmin` en cada endpoint

Esto es "defense in depth": si una capa falla, la otra protege.

### PUT vs POST

Usamos `PUT` (no `POST`) para actualizar partidos y config:

```
POST → Crear un recurso nuevo
PUT  → Actualizar un recurso existente
```

Es una convención REST. En la práctica la diferencia es semántica (el
servidor funciona igual), pero es buena práctica usar el verbo correcto.

### Promise.all

Para cargar partidos y configuración en paralelo:

```typescript
const [partidos, config] = await Promise.all([
  fetch("/api/admin/partidos"),
  fetch("/api/admin/config"),
]);
```

`Promise.all` ejecuta ambas promesas al mismo tiempo. Sin esto, una
esperaría a que la otra termine (secuencial), duplicando el tiempo de
carga.

---

## 4. ¿Cómo probar?

1. Inicia sesión con admin (`admin` / `admin123`)
2. En el Dashboard, haz click en "Panel Admin"
3. Verás las estadísticas y la lista de partidos
4. Cambia el estado del sistema (ej: `FASE_GRUPOS_ABIERTA`)
5. Busca el primer partido (México vs Sudáfrica) e ingresa un resultado
   (ej: 2-1) y cámbialo a `FINALIZADO`
6. Click "Guardar" → el resultado se actualiza
7. Los inputs muestran el nuevo resultado como placeholder

### Probar seguridad

1. Cierra sesión
2. Ve a `http://localhost:3000/admin` → te redirige al login
3. Inicia sesión con un usuario normal (no admin)
4. Ve a `http://localhost:3000/admin` → te redirige al dashboard
5. Las APIs `/api/admin/*` devuelven 403 para no-admins

---

## 5. ¿Qué sigue?

Fase 5: Motor de puntuación. Cuando un partido está `FINALIZADO` y el
admin pide procesar, el sistema calcula puntos para cada pronóstico:

- **3 puntos**: resultado exacto (goles local y visita coinciden)
- **1 punto**: diferencia correcta (quién ganó o empate)
- **0 puntos**: no acertó

También se necesita:
- Una página de ranking (tabla de posiciones)
- Procesamiento automático o por botón "Procesar"

---

## Glosario de la fase

| Término | Significado |
|---------|-------------|
| Defense in depth | Varias capas de seguridad independientes |
| REST | Convención para diseñar APIs (GET, POST, PUT, DELETE) |
| Promise.all | Ejecuta múltiples promesas en paralelo |
| Estado del sistema | Variable global que controla la fase del torneo |
| Procesar | Calcular puntajes de pronósticos para un partido |
