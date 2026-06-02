import { NextResponse } from "next/server";
import { getAdminUser, getAllPartidos, updatePartido } from "@/lib/admin-service";

export async function GET() {
  try {
    await getAdminUser();
    const partidos = await getAllPartidos();
    return NextResponse.json({ partidos });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    const status = message === "No autorizado" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await getAdminUser();
    const body = await request.json();
    const { id, golesLocalReal, golesVisitaReal, estado } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta id del partido" }, { status: 400 });
    }

    const partido = await updatePartido(id, {
      golesLocalReal: golesLocalReal !== undefined ? golesLocalReal : undefined,
      golesVisitaReal: golesVisitaReal !== undefined ? golesVisitaReal : undefined,
      estado,
    });

    return NextResponse.json({ partido });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    const status = message === "No autorizado" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
