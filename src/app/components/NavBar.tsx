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
      className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 shadow-lg shadow-green-900/30"
      style={{ background: "var(--color-green-900)" }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-white font-bold text-base tracking-tight flex items-center gap-1"
        >
          🏆 Polla Mundialista
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? "bg-green-700 text-white shadow-lg shadow-green-700/30"
                    : "text-green-200 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-white/10">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg shadow-green-700/30">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-green-300 hover:text-white transition-colors whitespace-nowrap"
            >
              {user.nombre}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
