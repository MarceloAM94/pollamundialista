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
    <nav className="sticky top-0 z-50 bg-green-900/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-white font-bold text-base tracking-tight"
        >
          🏆 Polla
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-green-700 text-white"
                    : "text-green-200 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <span className="text-green-400/50 mx-1">|</span>
          <button
            onClick={handleLogout}
            className="text-xs text-green-300 hover:text-white transition-colors whitespace-nowrap"
          >
            {user.nombre}
          </button>
        </div>
      </div>
    </nav>
  );
}
