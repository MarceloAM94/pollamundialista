import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-service";
import { upsertPronostico } from "@/lib/pronostico-service";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { partidoId, golesLocal, golesVisita } = body;

    if (!partidoId || golesLocal === undefined || golesVisita === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (partidoId, golesLocal, golesVisita)" },
        { status: 400 }
      );
    }

    if (typeof golesLocal !== "number" || typeof golesVisita !== "number") {
      return NextResponse.json(
        { error: "golesLocal y golesVisita deben ser números" },
        { status: 400 }
      );
    }

    const pronostico = await upsertPronostico(
      user.id,
      partidoId,
      golesLocal,
      golesVisita
    );

    return NextResponse.json({ pronostico }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al guardar pronóstico";
    const status = message.includes("ya no acepta") || message.includes("no encontrado") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
