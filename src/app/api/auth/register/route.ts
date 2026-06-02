import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth-service";

export async function POST(request: NextRequest) {
  try {
    const { username, password, nombre } = await request.json();

    if (!username || !password || !nombre) {
      return NextResponse.json(
        { error: "Faltan campos: username, password, nombre" },
        { status: 400 }
      );
    }
    if (username.length < 3) {
      return NextResponse.json(
        { error: "El usuario debe tener al menos 3 caracteres" },
        { status: 400 }
      );
    }
    if (password.length < 4) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 4 caracteres" },
        { status: 400 }
      );
    }

    const user = await registerUser(username, password, nombre);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al registrar";
    const status = message.includes("ya existe") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
