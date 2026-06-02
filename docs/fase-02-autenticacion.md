# Fase 2: Sistema de Autenticación 🔐

## ¿Qué hicimos?

Creamos un sistema completo de registro, inicio de sesión y protección de
rutas. Los usuarios pueden registrarse con username y contraseña, iniciar
sesión, y acceder a un dashboard personal.

---

## 1. ¿Cómo funciona la autenticación?

```
Usuario → Login → Servidor verifica contraseña → Genera JWT → Lo guarda en cookie
                                                                        ↓
Usuario → Dashboard → Servidor lee cookie → Verifica JWT → Muestra datos
```

### JWT (JSON Web Token)

Es un string cifrado que contiene información del usuario. Se ve así (pero
más largo):

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.abc123...
```

Tiene 3 partes separadas por puntos:
1. **Header**: Algoritmo de cifrado (HS256)
2. **Payload**: Los datos (userId, username, expiración)
3. **Firma**: Verifica que el token no fue modificado

El servidor crea el JWT cuando inicias sesión, y lo verifica en cada
request protegido. Como está firmado con una clave secreta, nadie puede
falsificar un token.

### HttpOnly Cookie

La cookie donde guardamos el JWT tiene la bandera `httpOnly`. Esto
significa:
- JavaScript en el navegador **no puede leerla** (ni `document.cookie`)
- Solo se envía automáticamente en requests HTTP
- Esto protege contra **XSS** (Cross-Site Scripting)

### Bcrypt

Las contraseñas se guardan **hasheadas** con bcrypt (no SHA-256 como en
el seed). Bcrypt:
- Es **lento a propósito** (dificulta ataques de fuerza bruta)
- Cada hash incluye un **salt** único (previene rainbow tables)
- Usamos 10 rondas de sal (salt rounds)

En Fase 1 usamos SHA-256 por simplicidad, pero en producción siempre se
usa bcrypt (o argon2).

---

## 2. Archivos creados

### `src/lib/auth.ts` — Utilidades JWT

```typescript
import { SignJWT, jwtVerify } from "jose";

// Crear token (al iniciar sesión)
const token = await createToken({ userId: 1, username: "marcelo" });
// → "eyJhbGciOiJIUzI1NiJ9..."

// Verificar token (en cada request protegido)
const payload = await verifyToken(token);
// → { userId: 1, username: "marcelo", exp: 1712345678 }
```

Usamos la librería `jose` (no `jsonwebtoken`) porque funciona en
Edge/Node.js sin polyfills. El token expira en **7 días**.

### `src/lib/auth-service.ts` — Lógica de negocio

Funciones para interactuar con la base de datos:

| Función | Qué hace |
|---------|----------|
| `registerUser(username, password, nombre)` | Crea usuario con bcrypt |
| `loginUser(username, password)` | Verifica credenciales, devuelve JWT |
| `getUserById(id)` | Obtiene datos del usuario (sin contraseña) |

### `src/app/api/auth/register/route.ts` — API: Registro

```
POST /api/auth/register
Body: { username: "marcelo", password: "123456", nombre: "Marcelo" }
→ 201 { user: { id, username, nombre } }
```

Validaciones:
- Campos requeridos (400 si faltan)
- Username único (409 si ya existe)
- Contraseña mínima 6 caracteres

### `src/app/api/auth/login/route.ts` — API: Login

```
POST /api/auth/login
Body: { username: "marcelo", password: "123456" }
→ 200, Set-Cookie: token=...; HttpOnly; Path=/; Max-Age=604800
```

Si las credenciales son correctas, crea un JWT y lo guarda en una cookie
httpOnly que expira en 7 días.

### `src/app/api/auth/me/route.ts` — API: Quién soy

```
GET /api/auth/me
Cookie: token=...
→ 200 { user: { id, username, nombre, isAdmin } }
```

Lee la cookie, verifica el JWT, y devuelve los datos del usuario.

### `src/app/api/auth/logout/route.ts` — API: Cerrar sesión

```
POST /api/auth/logout
→ 200, Set-Cookie: token=; Max-Age=0 (elimina la cookie)
```

### `src/proxy.ts` — Protección de rutas

Antes llamado `middleware.ts`. Next.js 16 lo renombró a `proxy`.

Este archivo se ejecuta **antes de cada request** y decide si dejarlo
pasar o redirigir:

```
¿La ruta es pública? → Sí → NextResponse.next() (deja pasar)
     ↓ No
¿Tiene cookie con JWT válido? → Sí → NextResponse.next()
     ↓ No
¿Es ruta /api/ → Sí → 401 No autenticado
     ↓ No
→ Redirigir a /login
```

Rutas públicas: `/`, `/login`, `/registro`, y las APIs de login/register.

### `src/app/login/page.tsx` + `LoginClient.tsx`

Página de inicio de sesión. El `page.tsx` es un **Server Component** que
verifica si ya hay sesión (si tiene cookie válida, redirige al dashboard).
El formulario es un **Client Component** (LoginClient.tsx) porque necesita
interactividad (useState, onClick).

### `src/app/registro/page.tsx` + `RegistroClient.tsx`

Igual que login pero para registro. También separa Server Component
(verificación de sesión) de Client Component (formulario interactivo).

### `src/app/dashboard/page.tsx` + `DashboardClient.tsx`

Página protegida que muestra "Bienvenido, [nombre]" y tiene botón de
cerrar sesión.

---

## 3. Conceptos nuevos

### Server Component vs Client Component

En Next.js App Router, los componentes pueden ser:

| Tipo | Se ejecuta en | Puede usar | Ejemplo |
|------|---------------|------------|---------|
| **Server Component** (default) | Servidor | async/await, BD, APIs | `page.tsx` |
| **Client Component** | Navegador | useState, onClick, useEffect | `LoginClient.tsx` |

Los Server Components son más rápidos (no envían JavaScript al cliente).
Solo usamos Client Components cuando necesitamos interactividad.

Un componente es Client Component si tiene `"use client"` al inicio.

### Next.js 16: `proxy.ts` en lugar de `middleware.ts`

En Next.js 16, el archivo `middleware.ts` fue renombrado a `proxy.ts`:
- La función se llama `proxy` (no `middleware`)
- Sigue usando `NextRequest` y `NextResponse`
- Ahora usa **Node.js runtime** por defecto (ya no Edge)
- El `config.matcher` sigue funcionando igual

### httpOnly Cookie

Cookie que el navegador envía automáticamente pero que JavaScript no
puede leer:

```typescript
response.cookies.set("token", jwt, {
  httpOnly: true,     // No accesible desde JS
  secure: true,       // Solo HTTPS (en producción)
  sameSite: "lax",    // Protege contra CSRF
  maxAge: 60 * 60 * 24 * 7,  // 7 días
  path: "/",
});
```

### JSON Web Token (JWT)

Token firmado que contiene información del usuario. No necesita base de
datos para validarse (la firma criptográfica basta). Por eso es rápido
para microservicios, aunque no podemos revocarlo individualmente.

### CORS vs CSRF

No necesitamos CORS porque frontend y backend están en el mismo dominio
(Next.js unifica todo). La cookie con `sameSite: "lax"` protege contra
CSRF (Cross-Site Request Forgery).

---

## 4. ¿Cómo probar?

1. Inicia el servidor: `npm run dev`
2. Ve a `http://localhost:3000/registro`
3. Crea un usuario: nombre "Marcelo", username "marcelo", password "123456"
4. Serás redirigido al login
5. Inicia sesión con tus credenciales
6. Llegas al dashboard con "Bienvenido, Marcelo"
7. Cierra sesión con el botón
8. Intenta ir a `http://localhost:3000/dashboard` → te redirige al login

Para el admin (creado en Fase 1):
- Username: `admin`, password: `admin123`
- El admin tiene `isAdmin: true` en la base de datos

---

## 5. ¿Qué sigue?

Fase 3: Fase de Grupos. Los usuarios podrán hacer pronósticos para los 72
partidos de la fase de grupos. Cada partido se podrá pronosticar hasta 5
minutos antes de que empiece (time-lock).

Se necesitará:
- Página `/fase-grupos` con la tabla de grupos
- Formulario para ingresar resultados (goles local y visita)
- Lógica de time-lock (comparar fecha actual vs fecha del partido)
- Base de datos para guardar pronósticos

---

## Glosario de la fase

| Término | Significado |
|---------|-------------|
| JWT | Token firmado que identifica al usuario |
| Bcrypt | Algoritmo lento de hash para contraseñas |
| HttpOnly | Cookie no accesible desde JavaScript |
| Server Component | Componente que se renderiza en el servidor |
| Client Component | Componente interactivo que se ejecuta en el navegador |
| Proxy | Archivo que intercepta requests antes de llegar a las rutas |
| Salt | Valor aleatorio único agregado a cada hash |
| XSS | Ataque que inyecta código JavaScript malicioso |
| CSRF | Ataque que hace que el usuario ejecute acciones sin querer |
