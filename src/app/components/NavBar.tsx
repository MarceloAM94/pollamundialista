"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type User = {
  id: number;
  username: string;
  nombre: string;
  isAdmin: boolean;
};

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  async function handleLogout() {
    if (!confirm("¿Cerrar sesión?")) return;
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (loading || !user) return null;

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/fase-grupos", label: "Grupos" },
    { href: "/eliminatorias", label: "Eliminatorias" },
    { href: "/ranking", label: "Ranking" },
  ];

  if (user.isAdmin) {
    links.push({ href: "/admin", label: "Admin" });
  }

  return (
    <nav
      className="sticky top-0 z-50 shadow-lg"
      style={{
        background: "linear-gradient(135deg, #000000 0%, #111217 100%)",
        borderBottom: "1px solid rgba(212,175,55,0.15)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="font-bold tracking-tight flex items-center gap-2 transition-all duration-200 hover:scale-[1.02]"
          style={{ color: "#D4AF37" }}
        >
          <span className="text-lg">🏆</span>
          <span>Polla Mundialista</span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200"
                style={
                  active
                    ? { background: "rgba(212,175,55,0.15)", color: "#D4AF37" }
                    : { color: "rgba(255,255,255,0.5)", background: "transparent" }
                }
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="flex items-center gap-2 ml-1 pl-2" style={{ borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: "linear-gradient(135deg, #D4AF37, #F3CD5F)",
                color: "#000",
              }}
            >
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs transition-colors whitespace-nowrap hover:brightness-150"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {user.nombre}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
