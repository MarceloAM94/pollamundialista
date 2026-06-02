# Fase 5: Motor de Puntuación y Ranking 🏆

## ¿Qué hicimos?

Creamos el sistema que calcula automáticamente los puntos de cada
pronóstico cuando un partido finaliza, y una página de ranking para ver
la tabla de posiciones de todos los usuarios.

---

## 1. Sistema de puntuación

Cuando el admin hace click en "Procesar" en un partido FINALIZADO, el
sistema revisa todos los pronósticos de ese partido y asigna puntos:

| Regla | Puntos | Ejemplo (real 2-1) |
|-------|--------|-------------------|
| Resultado **exacto** | **3** | Pronosticó 2-1 |
| **Diferencia** correcta (quién ganó o empate) | **1** | Pronosticó 3-0 |
| No acertó | **0** | Pronosticó 0-2 |

### Lógica en código

```typescript
function calcularPuntos(gLocal, gVisita, realLocal, realVisita): number {
  // 3 puntos: resultado exacto
  if (gLocal === realLocal && gVisita === realVisita) return 3;

  // 1 punto: misma diferencia (ganó local, visitante o empate)
  const difLocal = gLocal - gVisita;
  const difReal = realLocal - realVisita;
  const mismaDiferencia =
    (difLocal > 0 && difReal > 0) ||     // ambos ganó local
    (difLocal < 0 && difReal < 0) ||     // ambos ganó visitante
    (difLocal === 0 && difReal === 0);   // ambos empate

  if (mismaDiferencia) return 1;

  return 0;
}
```

### Flujo de procesamiento

```
Admin ingresa resultado (ej: 2-1)
  → Partido queda FINALIZADO
  → Admin click "Procesar"
  → Servidor calcula puntos de TODOS los pronósticos
  → Cada Pronostico.puntos se actualiza (0, 1 o 3)
  → Partido cambia a estado PROCESADO
  → Ya no se puede volver a procesar
```

---

## 2. Archivos nuevos

### `src/lib/score-service.ts`

| Función | Qué hace |
|---------|----------|
| `procesarPartido(id)` | Calcula puntos de todos los pronósticos y marca PROCESADO |
| `getPuntosUsuario(userId)` | Suma total de puntos de un usuario |
| `getRanking()` | Lista de usuarios ordenados por puntos (con desempate por exactos) |
| `calcularPuntos(...)` | Lógica interna: 3, 1 o 0 puntos |

### `src/app/api/admin/procesar/route.ts`

```
POST /api/admin/procesar
Body: { partidoId: 15 }
→ { procesados: 8 }  // 8 pronósticos procesados
```

Validaciones:
- 403 si no es admin
- 400 si el partido no tiene resultado
- 400 si el partido no está FINALIZADO

### `src/app/api/ranking/route.ts`

```
GET /api/ranking → { ranking: [...], misPuntos: 12 }
```

Devuelve el ranking completo más los puntos del usuario autenticado.

### `src/app/ranking/RankingClient.tsx`

Tabla de posiciones con:
- Medalla 🥇🥈🥉 para top 3
- Columnas: Posición, Nombre, Puntos, Aciertos exactos (3), Diferencias (1)
- Resumen de tus puntos al final

### Dashboard actualizado

- El contador de "Tus puntos" ahora muestra los puntos reales del usuario
- Es un link a `/ranking`
- Las cards de "Fase de Grupos" y "Eliminatoria" también son links

---

## 3. Conceptos nuevos

### Prisma aggregate

Para sumar puntos de un usuario sin traer todos los registros:

```typescript
const result = await prisma.pronostico.aggregate({
  where: { usuarioId, puntos: { not: null } },
  _sum: { puntos: true },
});
```

`aggregate` ejecuta `SELECT SUM(puntos) FROM pronostico WHERE ...`
directamente en la base de datos, sin cargar datos en memoria.

### Desempate en ranking

El ranking ordena por:
1. **Puntos totales** (mayor primero)
2. **Aciertos exactos** (mayor primero, desempate)
3. **Nombre** (alfabético, último recurso)

```typescript
ranking.sort((a, b) => {
  if (b.puntos !== a.puntos) return b.puntos - a.puntos;
  if (b.exactos !== a.exactos) return b.exactos - a.exactos;
  return a.nombre.localeCompare(b.nombre);
});
```

### Promise.all en ranking API

```typescript
const [ranking, misPuntos] = await Promise.all([
  getRanking(),
  getPuntosUsuario(user.id),
]);
```

Cargamos el ranking y los puntos del usuario EN PARALELO (no secuencial),
reduciendo el tiempo de respuesta a la mitad.

---

## 4. ¿Cómo probar?

1. Inicia sesión como **admin**
2. Ve al Panel Admin
3. Busca un partido, pon resultado (ej: 2-1), cámbialo a `FINALIZADO`, Guardar
4. Aparece el botón azul **"Procesar"** → haz click
5. El partido cambia a `PROCESADO`
6. Ve al Dashboard → Tus puntos se actualizaron
7. Ve a `/ranking` → ves la tabla de posiciones

### Probar puntuación exacta vs diferencia

1. Crea dos usuarios, haz que pronostiquen el mismo partido:
   - Usuario A: pronostica 2-1 (exacto → 3 pts)
   - Usuario B: pronostica 3-0 (diferencia → 1 pt)
2. Admin pone resultado 2-1 y procesa
3. Ranking muestra Usuario A con 3 pts, Usuario B con 1 pt

---

## 5. ¿Qué sigue?

Fase 6: **Fase de Eliminatorias**. Cuando termine la fase de grupos, el
admin cambia el sistema a TRANSICION y luego FASE_MATAMATA_ABIERTA. Los
usuarios pronostican los partidos de eliminatoria (dieciseisavos,
octavos, cuartos, semis, tercer puesto, final).

Se necesita:
- Página `/eliminatorias` con el bracket visual
- Los códigos de equipos (W73, 1A, etc.) se reemplazan por los equipos
  reales cuando se conocen
- Pronósticos con time-lock (-5 min) igual que fase de grupos
- Soporte para penales (resultado que necesita local/visita + penales)

---

## Glosario de la fase

| Término | Significado |
|---------|-------------|
| Procesar | Calcular puntos de todos los pronósticos de un partido |
| Puntuación exacta | 3 puntos (adivinaste el resultado exacto) |
| Diferencia | 1 punto (adivinaste quién ganó, pero no el marcador) |
| Ranking | Tabla de posiciones ordenada por puntos |
| Aggregate | Función de base de datos que calcula sumas, promedios, etc. |
| Desempate | Criterio secundario para ordenar cuando hay empate en puntos |
