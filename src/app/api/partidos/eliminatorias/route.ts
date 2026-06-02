import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-service";
import { getPartidos } from "@/lib/partido-service";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const partidos = await getPartidos(user.id, 2);
    return NextResponse.json({ partidos });
  } catch {
    return NextResponse.json(
      { error: "Error al cargar partidos" },
      { status: 500 }
    );
  }
}
