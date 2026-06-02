# Fase 1: Seed de Base de Datos 🌱

## ¿Qué hicimos?

Cargamos los 104 partidos del Mundial 2026 en la base de datos, creamos
el usuario administrador, y configuramos el estado inicial del sistema.

---

## 1. Los 12 Grupos del Mundial 2026

| Grupo | Equipos |
|-------|---------|
| **A** | México, Sudáfrica, Corea del Sur, República Checa |
| **B** | Canadá, Bosnia y Herzegovina, Catar, Suiza |
| **C** | Brasil, Marruecos, Haití, Escocia |
| **D** | Estados Unidos, Paraguay, Australia, Turquía |
| **E** | Alemania, Curazao, Costa de Marfil, Ecuador |
| **F** | Países Bajos, Japón, Suecia, Túnez |
| **G** | Bélgica, Egipto, Irán, Nueva Zelanda |
| **H** | España, Cabo Verde, Arabia Saudita, Uruguay |
| **I** | Francia, Senegal, Irak, Noruega |
| **J** | Argentina, Argelia, Austria, Jordania |
| **K** | Portugal, Congo DR, Uzbekistán, Colombia |
| **L** | Inglaterra, Croacia, Ghana, Panamá |

Cada grupo tiene 4 equipos → 6 partidos por grupo × 12 = **72 partidos**
en fase de grupos.

---

## 2. Estructura del seed (`prisma/seed.ts`)

El archivo `prisma/seed.ts` se ejecuta con `tsx` (TypeScript ejecutable)
y hace lo siguiente:

### 2.1 Limpieza inicial
```typescript
await prisma.pronostico.deleteMany();  // primero pronósticos (FK)
await prisma.partido.deleteMany();     // luego partidos
await prisma.usuario.deleteMany();     // luego usuarios
await prisma.configuracion.deleteMany(); // por último config
```
El orden importa por las **foreign keys** (claves foráneas). No puedes
borrar un usuario si todavía tiene pronósticos asociados.

### 2.2 Creación del admin
```typescript
const passwordHash = createHash("sha256").update("admin123").digest("hex");
```
- Usuario: `admin`
- Contraseña: `admin123`
- La contraseña se guarda **hasheada** con SHA-256 (luego mejoraremos
  esto con bcrypt)

### 2.3 Estado del sistema
Guardamos una configuración clave-valor:
```
clave: "estado_sistema" → valor: "PRE_TORNEO"
```
Esto controla qué fase está activa en la app.

### 2.4 Partidos de fase de grupos (72)
Cada partido se define como un array:
```typescript
["A", "México", "Sudáfrica", "2026-06-11T19:00:00Z", "Estadio Azteca"]
// grupo, local, visita, fecha (UTC), estadio
```

### 2.5 Partidos de eliminatorias (32)
Los equipos aún no se conocen, así que usamos códigos:
- `1A` = 1er lugar del Grupo A
- `2B` = 2do lugar del Grupo B
- `3ABC` = Mejor 3ro entre grupos A, B, C
- `W73` = Ganador del partido #73
- `RU101` = Perdedor del partido #101

Estos se completarán cuando termine la fase de grupos.

---

## 3. Conceptos nuevos

### Seed
Un **seed** es un script que llena la base de datos con datos iniciales.
Se ejecuta con:
```bash
npm run db:seed
```

### Prisma Config (Prisma 7)
En Prisma 7, la configuración ya no va en `package.json`. Ahora se
define en `prisma.config.ts`:
```typescript
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",   // ← aquí se define el seed
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### TSX
`tsx` es un ejecutable que corre TypeScript directamente sin necesidad
de compilar a JavaScript primero.

### Conexión SSL
Las URLs de conexión terminan con `?sslmode=require&uselibpqcompat=true`.
Esto es necesario porque:
1. Supabase/Pooler exige SSL
2. La nueva versión de `pg` cambió el comportamiento de SSL
3. `uselibpqcompat=true` mantiene la compatibilidad

### Foreign Keys (FK)
Las FK son relaciones entre tablas:
```prisma
model Pronostico {
  usuarioId Int
  partidoId Int
  usuario Usuario @relation(fields: [usuarioId], references: [id])
  partido Partido @relation(fields: [partidoId], references: [id])
}
```
Esto asegura que:
- Todo pronóstico tiene un usuario válido
- Todo pronóstico tiene un partido válido
- No puedes borrar un usuario si tiene pronósticos

---

## 4. ¿Cómo verificar los datos?

Puedes usar Prisma Studio para ver los datos en el navegador:
```bash
npm run db:studio
```
Esto abre una interfaz gráfica donde puedes ver todas las tablas.

O desde la terminal conectándote directamente a Supabase:
```bash
# Si tienes psql instalado
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM Partido;"
# → debe devolver 104
```

---

## 5. Variables de entorno

Ahora tenemos 3 archivos de configuración separados:

| Archivo | Quién lo usa | Puerto | Modo pooler |
|---------|-------------|--------|-------------|
| `.env` | Prisma CLI (migrate, seed) | 5432 | Session |
| `.env.local` | Next.js (app runtime) | 6543 | Transaction |
| `.env.example` | Plantilla para nuevos devs | 5432 | Session |

**Importante**: Ambos archivos `.env` y `.env.local` deben tener la misma
contraseña, solo cambia el puerto.
