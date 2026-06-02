import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-service";
import { procesarPartido } from "@/lib/score-service";

export async function POST(request: Request) {
  try {
    await getAdminUser();
    const body = await request.json();
    const { partidoId } = body;

    if (!partidoId) {
      return NextResponse.json({ error: "Falta partidoId" }, { status: 400 });
    }

    const result = await procesarPartido(partidoId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    const status = message === "No autorizado" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
