import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_ROUTES = [
  "/login",
  "/registro",
  "/api/auth/login",
  "/api/auth/register",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files y assets no necesitan auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // API pública
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Si la ruta empieza con /api, verificar token (excepto las públicas)
  if (pathname.startsWith("/api/")) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Rutas protegidas del frontend
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin routes solo para admins
  if (pathname.startsWith("/admin") && !payload.isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
