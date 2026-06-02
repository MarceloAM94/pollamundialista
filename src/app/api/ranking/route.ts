import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-service";
import { getRanking, getPuntosUsuario } from "@/lib/score-service";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const [ranking, misPuntos] = await Promise.all([
      getRanking(),
      getPuntosUsuario(user.id),
    ]);

    return NextResponse.json({ ranking, misPuntos });
  } catch {
    return NextResponse.json({ error: "Error al cargar ranking" }, { status: 500 });
  }
}
