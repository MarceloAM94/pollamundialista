import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getUserById } from "@/lib/auth-service";
import { getPuntosUsuario } from "@/lib/score-service";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let userName = "Usuario";
  let isAdmin = false;
  let userPuntos = 0;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      const user = await getUserById(payload.userId);
      if (user) {
        userName = user.nombre;
        isAdmin = user.isAdmin;
        userPuntos = await getPuntosUsuario(payload.userId);
      }
    }
  }

  return <DashboardClient userName={userName} isAdmin={isAdmin} userPuntos={userPuntos} />;
}
