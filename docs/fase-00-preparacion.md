# Fase 0: Preparación del Entorno 🚀

## ¿Qué hicimos en esta fase?

Configuramos todo el entorno de desarrollo para empezar a construir la
Polla Mundialista. Instalamos las herramientas base y dejamos el proyecto
listo para empezar a programar.

---

## 1. Tecnologías que usamos

### Next.js 16
Es un framework de React que permite crear aplicaciones web completas
(frontend + backend) en un solo proyecto. Lo elegimos porque:

- Usa **TypeScript** (JavaScript con tipos, menos errores)
- Tiene **App Router** (sistema de rutas moderno basado en archivos)
- Se despliega muy fácil en **Vercel** (gratis)
- Tiene **API Routes** para el backend (no necesitamos servidor aparte)

### Tailwind CSS 4
Framework de CSS que te deja escribir estilos directamente en el HTML
con clases como `text-center`, `bg-green-500`, `p-4`, etc.

### Prisma 7
Es un ORM (Object-Relational Mapping) - una capa que conecta tu código
con la base de datos PostgreSQL. Te permite escribir consultas así:

```typescript
const usuarios = await prisma.usuario.findMany();
```

En lugar de escribir SQL crudo.

### PostgreSQL
Base de datos relacional. La vamos a hostear gratis en Supabase.

---

## 2. Estructura del proyecto

```
polla-mundialista/
├── prisma/
│   └── schema.prisma       # Modelos de la base de datos
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Layout principal (header, footer)
│   │   ├── page.tsx         # Página de inicio (Hola Mundo)
│   │   ├── globals.css      # Estilos globales
│   │   ├── login/
│   │   │   └── page.tsx     # Página de login
│   │   └── registro/
│   │       └── page.tsx     # Página de registro
│   ├── lib/
│   │   └── prisma.ts        # Conexión a la base de datos
│   └── generated/
│       └── prisma/          # Cliente generado por Prisma (no se toca)
├── docs/
│   └── fase-00-prepracion.md  # Este archivo
├── .env                     # Variables de entorno (DB URL)
├── .env.local               # Variables locales (no se sube a git)
├── package.json
└── next.config.ts
```

### ¿Por qué esta estructura?

- **`src/app/`** → Cada carpeta es una ruta de la web.
  - `src/app/page.tsx` → La raíz (`/`)
  - `src/app/login/page.tsx` → `/login`
  - `src/app/registro/page.tsx` → `/registro`

- **`src/lib/`** → Código compartido (utilerías, conexión a BD).
- **`prisma/`** → Schema de la base de datos.
- **`docs/`** → Estos archivos de aprendizaje.

### Convenciones de Next.js App Router

| Archivo | Qué crea |
|---------|----------|
| `page.tsx` | Una página pública |
| `layout.tsx` | Un layout que envuelve páginas hijas |
| `route.ts` | Un endpoint de API (backend) |
| `loading.tsx` | UI de carga |
| `error.tsx` | UI de error |

---

## 3. Base de datos: Modelos iniciales

Definimos 3 modelos principales en `prisma/schema.prisma`:

### Usuario
```prisma
model Usuario {
  id           Int         @id @default(autoincrement())
  username     String      @unique
  passwordHash String
  nombre       String
  isAdmin      Boolean     @default(false)
  activo       Boolean     @default(true)
  createdAt    DateTime    @default(now())
  pronosticos  Pronostico[]
}
```

### Partido
```prisma
model Partido {
  id              Int            @id @default(autoincrement())
  fase            Int
  ronda           String
  grupo           String?
  equipoLocal     String
  equipoVisita    String
  fechaHora       DateTime
  estado          EstadoPartido  @default(PROGRAMADO)
  golesLocalReal  Int?
  golesVisitaReal Int?
  pronosticos     Pronostico[]
}
```

### Pronóstico
```prisma
model Pronostico {
  id            Int      @id @default(autoincrement())
  usuarioId     Int
  partidoId     Int
  golesLocal    Int?
  golesVisita   Int?
  puntos        Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([usuarioId, partidoId])  // Un pronóstico por usuario por partido
}
```

Además creamos dos **enums** (tipos fijos):

- `EstadoPartido`: PROGRAMADO, BLOQUEADO, EN_VIVO, FINALIZADO, PROCESADO
- `EstadoSistema`: PRE_TORNEO, FASE_GRUPOS_ABIERTA, TRANSICION, FASE_MATAMATA_ABIERTA, TORNEO_FINALIZADO

---

## 4. Conceptos nuevos que aparecieron

### TypeScript
Es JavaScript pero con tipos. Ejemplo:

```typescript
function sumar(a: number, b: number): number {
  return a + b;
}
```

El `: number` le dice al editor "esto es un número". Si tratas de pasar
un texto, te marca error antes de ejecutar.

### Prisma Client
Después de definir los modelos, corremos:

```bash
npx prisma generate
```

Esto crea el cliente en `src/generated/prisma/` con todas las funciones
para hacer consultas: `create()`, `findMany()`, `update()`, `delete()`, etc.

El `src/lib/prisma.ts` crea una única instancia del cliente y la
reutiliza (patrón **singleton**). Esto evita múltiples conexiones a la BD.

### Tailwind CSS
En lugar de escribir CSS en archivos separados, usas clases直接在 HTML:

```tsx
<div className="bg-green-800 text-white p-4 rounded-lg">
  Hola Mundo
</div>
```

Esto se traduce a:
```css
background-color: #166534;
color: white;
padding: 1rem;
border-radius: 0.5rem;
```

### Layout anidado
`src/app/layout.tsx` es el layout raíz. Todo el contenido de la app se
renderiza dentro de él. Cambiamos el idioma a `es` y actualizamos el
título a "Polla Mundialista 2026".

---

## 5. ¿Qué sigue?

El proyecto está creado y compila. Pero para que funcione de verdad
necesitamos dos cosas que dependen de ti:

### a) Crear cuenta en Supabase (gratis)
1. Ve a [supabase.com](https://supabase.com) y regístrate (GitHub o email)
2. Crea un nuevo proyecto (nombre: `polla-mundialista`)
3. En el Dashboard ve a **Project Settings > Database**
4. Copia el **Connection string** (URI de PostgreSQL)
5. Pégalo en `.env.local` como valor de `DATABASE_URL`

### b) Crear cuenta en Vercel (gratis) y desplegar
1. Ve a [vercel.com](https://vercel.com) y regístrate con GitHub
2. Crea un repositorio en GitHub con este código
3. Importa el repo en Vercel
4. Vercel detecta Next.js automáticamente y lo despliega
5. Agrega la variable `DATABASE_URL` en Vercel > Project Settings > Environment Variables

### c) O localmente
Si prefieres probar local:

```bash
# Edita .env.local con tu connection string de Supabase
# Luego corre las migraciones:
npx prisma migrate dev --name init

# Inicia el servidor:
npm run dev
```

La app estará disponible en `http://localhost:3000`

---

## Glosario de la fase

| Término | Significado |
|---------|-------------|
| Framework | Conjunto de herramientas y reglas para construir apps |
| ORM | Capa que traduce código a consultas de base de datos |
| Schema | Definición de la estructura de la base de datos |
| Migración | Cambio controlado en la estructura de la BD |
| Singleton | Patrón que asegura una sola instancia de un objeto |
| Env vars | Variables de entorno (configuración sensible) |
