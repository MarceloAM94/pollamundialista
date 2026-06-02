import { NextResponse } from "next/server";
import { getAdminUser, getEstadoSistema, setEstadoSistema } from "@/lib/admin-service";

const ESTADOS_VALIDOS = [
  "PRE_TORNEO",
  "FASE_GRUPOS_ABIERTA",
  "TRANSICION",
  "FASE_MATAMATA_ABIERTA",
  "TORNEO_FINALIZADO",
];

export async function GET() {
  try {
    await getAdminUser();
    const estadoSistema = await getEstadoSistema();
    return NextResponse.json({ estadoSistema, estadosValidos: ESTADOS_VALIDOS });
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
    const { estado } = body;

    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return NextResponse.json(
        { error: `Estado inválido. Válidos: ${ESTADOS_VALIDOS.join(", ")}` },
        { status: 400 }
      );
    }

    await setEstadoSistema(estado);
    return NextResponse.json({ estadoSistema: estado });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    const status = message === "No autorizado" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
