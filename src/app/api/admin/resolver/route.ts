import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-service";
import { resolverDieciseisavos } from "@/lib/resolver-eliminatorias";

export async function POST() {
  try {
    await getAdminUser();
    const result = await resolverDieciseisavos();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    const status = message === "No autorizado" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
