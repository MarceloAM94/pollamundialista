# 🏆 Polla Mundialista 2026

**La app de pronósticos para el Mundial 2026** — México, Estados Unidos y Canadá.

Creada para jugar entre amigos: registrate, pronosticá los resultados de los **104 partidos** del Mundial y ganale a tus amigos.

---

## 📋 Cómo participar

### 1. Crear una cuenta

Entrá a [polla-mundialista-bay.vercel.app](https://polla-mundialista-bay.vercel.app) y hacé clic en **Registrarse**. Completá:

| Campo | Descripción |
|-------|-------------|
| **Nombre** | Tu nombre real (se muestra en el ranking) |
| **Usuario** | Nombre de usuario único para iniciar sesión |
| **Contraseña** | Mínimo 4 caracteres |

### 2. Iniciar sesión

Usá tu usuario y contraseña para entrar al **Dashboard**, donde ves un resumen de tu actividad.

### 3. Hacer pronósticos

#### Fase de Grupos (72 partidos)
Andá a **Grupos** en el menú. Cada grupo (A–L) muestra sus 4 equipos y 6 partidos. Ingresá el resultado que creés en los casilleros (**goles local - goles visitante**) y presioná **Guardar**. Podés cambiar tu pronóstico en cualquier momento antes de que el partido se **bloquee** (5 minutos antes del inicio).

#### Eliminatorias (32 partidos)
Andá a **Eliminatorias**. Las rondas se muestran como columnas (dieciseisavos, octavos, cuartos, semifinal, tercer puesto, final). Además del resultado, podés pronosticar **penales** (opcional). Si acertás también los penales, sumás puntos extra.

### 4. Seguir el ranking

Andá a **Ranking** para ver la tabla de posiciones con todos los participantes ordenados por puntos. Tu fila se destaca con un borde dorado y la etiqueta "(tú)".

---

## 🏅 Sistema de puntuación

### Fase de Grupos

| Acierto | Puntos |
|---------|--------|
| **Resultado exacto** (ej: 2-1 y pronosticaste 2-1) | **3 puntos** |
| **Diferencia correcta** (ej: 2-1 y pronosticaste 3-2) | **1 punto** |
| **Ninguno** | **0 puntos** |

### Eliminatorias (con penales)

| Acierto | Puntos |
|---------|--------|
| **Marcador exacto + penales exactos** (todo correcto) | **3 puntos** |
| **Ganador correcto** (quien avanza, considerando penales si los hay) | **1 punto** |
| **Ninguno** | **0 puntos** |

> 💡 En eliminatorias solo se puede obtener 1 o 3 puntos (no hay "diferencia").

### Desempate en el ranking
Si dos jugadores tienen los mismos puntos, se desempata por **cantidad de resultados exactos**.

---

## ⚽ Partidos del Mundial 2026

El torneo tiene **104 partidos** en total:

| Fase | Cantidad |
|------|----------|
| **Fase de Grupos** (12 grupos × 6 partidos c/u) | 72 |
| **Dieciseisavos** | 16 |
| **Octavos** | 8 |
| **Cuartos** | 4 |
| **Semifinales** | 2 |
| **Tercer puesto** | 1 |
| **Final** | 1 |
| **Total** | **104** |

---

## 🎨 Diseño

El diseño está inspirado en la identidad visual del Mundial 2026:

- **Paleta oscura** con fondo negro y tarjetas grises
- **Dorado (#D4AF37)** como color principal (el trofeo)
- **Colores vibrantes** de la campaña "WE ARE 26": rojo, azul, cyan, verde, amarillo y púrpura
- Cada grupo tiene un **borde colorido** que lo identifica
- Animaciones sutiles (orbs flotantes, fade-in, glow)

---

## 🛠️ Para desarrolladores

### Stack técnico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16.2.7 | Framework full-stack |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | v4 | Estilos utilitarios |
| **Prisma** | 7.8.0 | ORM y migraciones |
| **Supabase PostgreSQL** | — | Base de datos |
| **bcryptjs** | — | Hash de contraseñas |
| **jose** | — | JWT (JSON Web Tokens) |

### Estructura del proyecto

```
src/
├── app/
│   ├── admin/          # Panel de administración
│   ├── components/     # Componentes compartidos
│   │   ├── CountryFlag.tsx   # Banderas de países
│   │   ├── NavBar.tsx        # Navegación global
│   │   └── Skeleton.tsx      # Esqueleto de carga
│   ├── dashboard/      # Página principal del usuario
│   ├── eliminatorias/  # Pronósticos de eliminatorias
│   ├── fase-grupos/    # Pronósticos de fase de grupos
│   ├── lib/            # Utilidades del frontend
│   │   ├── colores.ts  # Paleta FIFA 2026
│   │   └── paises.ts   # Mapa de países → banderas
│   ├── login/          # Inicio de sesión
│   ├── ranking/        # Tabla de posiciones
│   ├── registro/       # Registro de usuarios
│   ├── globals.css     # Estilos globales y animaciones
│   └── page.tsx        # Landing page
├── lib/
│   ├── admin-service.ts    # Lógica de administración
│   ├── auth-service.ts     # Registro y login
│   ├── auth.ts             # JWT create/verify
│   ├── partido-service.ts  # Consulta de partidos
│   ├── pronostico-service.ts # Guardado de pronósticos
│   └── score-service.ts    # Motor de puntuación
└── proxy.ts            # Protección de rutas (middleware)
```

### Comandos

```bash
npm run dev        # Servidor de desarrollo (Turbopack)
npm run build      # Build de producción
npm start          # Servidor de producción
npx prisma studio  # Ver base de datos (interfaz gráfica)
npx prisma db push # Sincronizar schema con la DB
npx tsx prisma/seed.ts  # Poblar base de datos
```

### Variables de entorno

```env
# .env (para comandos CLI como prisma)
DATABASE_URL="postgres://postgres.rbukehvqcqxsmpzkbhep:[password]@aws-0-us-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true&uselibpqcompat=true"

# .env.local (para el servidor Next.js — puerto 6543)
DATABASE_URL="postgres://postgres.rbukehvqcqxsmpzkbhep:[password]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&uselibpqcompat=true"
JWT_SECRET="[tu-secreto]"
```

> ⚠️ Usar Supavisor (pooler de Supabase): puerto **5432** para CLI, puerto **6543** para runtime.

### Despliegue en Vercel

El proyecto está deployado en Vercel con despliegue automático desde `main` en GitHub.

```
URL: https://polla-mundialista-bay.vercel.app
```

**Variables en Vercel:**
- `DATABASE_URL` → transaction pooler (port 6543)
- `JWT_SECRET` → string aleatorio

---

## 👤 Administración

El admin puede:

- **Gestionar partidos**: cargar resultados, cambiar estados (PROGRAMADO → BLOQUEADO → EN_VIVO → FINALIZADO → PROCESADO)
- **Procesar puntuación**: después de cargar un resultado, hace clic en "Procesar" para calcular puntos de todos los jugadores
- **Controlar estado del sistema**: PRE_TORNEO → FASE_GRUPOS_ABIERTA → TRANSICION → FASE_MATAMATA_ABIERTA → TORNEO_FINALIZADO

> Los cambios de estado requieren confirmación para evitar accidentes.

---

## ✅ Checklist del MVP

- [x] Registro e inicio de sesión con JWT
- [x] Pronósticos para fase de grupos (72 partidos)
- [x] Pronósticos para eliminatorias (32 partidos con penales)
- [x] Sistema de puntuación (3/1/0)
- [x] Ranking en vivo
- [x] Panel de administración
- [x] Dashboard personal
- [x] Bloqueo automático 5 min antes de cada partido
- [x] Banderas de todos los países
- [x] Diseño responsivo (mobile y desktop)
- [x] Animaciones y experiencia visual
- [x] Despliegue en producción (Vercel)

---

*Hecho con ⚽ para el Mundial 2026*
