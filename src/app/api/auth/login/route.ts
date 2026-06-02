import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth-service";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Faltan campos: username, password" },
        { status: 400 }
      );
    }

    const { user, token } = await loginUser(username, password);

    const response = NextResponse.json({ user });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al iniciar sesión";
    const status = message.includes("incorrectos") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
