import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getUserById } from "@/lib/auth-service";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let userName = "Usuario";
  let isAdmin = false;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      const user = await getUserById(payload.userId);
      if (user) {
        userName = user.nombre;
        isAdmin = user.isAdmin;
      }
    }
  }

  return <DashboardClient userName={userName} isAdmin={isAdmin} />;
}
