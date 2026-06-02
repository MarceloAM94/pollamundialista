import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getUserById } from "@/lib/auth-service";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Error de autenticación" }, { status: 500 });
  }
}
