import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-service";
import { getPartidosGrupos } from "@/lib/partido-service";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const partidos = await getPartidosGrupos(user.id);
    return NextResponse.json({ partidos });
  } catch {
    return NextResponse.json(
      { error: "Error al cargar partidos" },
      { status: 500 }
    );
  }
}
