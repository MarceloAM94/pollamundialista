# Fase 07: Mejoras de Frontend

## Objetivo

Implementar mejoras de UX/UI en el frontend basadas en un análisis de calidad:
navegación global, eliminación de `alert()`, mejor feedback visual, y consistencia
en los patrones de navegación.

## Cambios Realizados

### 1. NavBar Global (`src/app/components/NavBar.tsx`)

Nueva barra de navegación sticky que se muestra en todas las páginas cuando el
usuario está autenticado:

- Enlaces a Dashboard, Grupos, Eliminatorias, Ranking, y Admin (si es admin)
- Resalta la página actual con fondo verde
- Muestra el nombre del usuario y botón de cerrar sesión con confirmación
- Se oculta automáticamente si el usuario no está autenticado
- Se vuelve a evaluar en cada cambio de ruta (pathname)

### 2. Eliminación de `alert()`

**FaseGruposClient** y **EliminatoriasClient**: El `alert()` en errores de guardado
fue reemplazado por un banner de error inline (mismo estilo que los errores de carga)
que desaparece automáticamente tras 4 segundos.

### 3. Ranking

- **Manejo de errores**: El `catch` vacío ahora muestra un banner de error.
- **Fila destacada**: La fila del usuario autenticado se resalta con fondo
  `bg-green-600/20` y muestra "(tú)" junto al nombre.
- **Siempre visible**: "Tus puntos" se muestra siempre (incluso si es 0), usando
  `misPuntos !== null` en lugar de `misPuntos > 0`.
- **Tooltips**: Las columnas "3" y "1" tienen `title` descriptivo.
- **ID de usuario**: Se obtiene vía `/api/auth/me` para resaltar la fila correcta.

### 4. Login

- **Banner de registro exitoso**: Cuando se redirige con `?registrado=1`, se
  muestra un banner verde "Cuenta creada exitosamente. Ahora inicia sesión."
- Se usa `window.location.search` en un `useEffect` para evitar el error de
  `useSearchParams` sin Suspense boundary.

### 5. Dashboard

- **Números dinámicos**: Los números 72 y 32 ahora están en constantes
  (`totalGrupos`, `totalEliminatorias`) listos para ser reemplazados por props
  de API.
- **`<a>` → `<Link>`**: Todos los CTAs y enlaces ahora usan `next/link` para
  navegación client-side.
- **Confirmación de logout**: Ahora pregunta "¿Cerrar sesión?" antes de ejecutar.

### 6. Admin

- **Confirmación de estado**: Cambiar el estado del sistema ahora pide
  confirmación con el nombre del estado.
- **Header removido**: "Volver al Dashboard" eliminado (NavBar lo reemplaza).

### 7. Landing Page (`/`)

- **Redirect si autenticado**: Si el usuario ya tiene sesión, redirige a
  `/dashboard` automáticamente desde el server component.

### 8. Consistencia de Navegación

- **Login/Registro**: Usan `<Link>` en lugar de `<a>` para los enlaces entre
  páginas de autenticación.
- **Enlaces "Volver al Dashboard"**: Eliminados de FaseGrupos, Eliminatorias,
  Ranking y Admin, ya que el NavBar global provee navegación.

## Archivos Modificados

- `src/app/layout.tsx` — Agregado `<NavBar />`
- `src/app/page.tsx` — Redirect si autenticado
- `src/app/login/page.tsx` — Banner registrado, `<Link>`
- `src/app/registro/page.tsx` — `<Link>`
- `src/app/dashboard/DashboardClient.tsx` — Números dinámicos, `<Link>`, confirm logout
- `src/app/dashboard/page.tsx` — Sin cambios (solo props)
- `src/app/fase-grupos/FaseGruposClient.tsx` — Eliminado `alert()`, header
- `src/app/eliminatorias/EliminatoriasClient.tsx` — Eliminado `alert()`, header
- `src/app/ranking/RankingClient.tsx` — Error handling, self-highlight, siempre puntos
- `src/app/admin/AdminClient.tsx` — Confirm estado, header removido

## Archivos Nuevos

- `src/app/components/NavBar.tsx` — Barra de navegación global
