"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  useEffect(() => {
    setRegistrado(window.location.search.includes("registrado=1"));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al iniciar sesión");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen" style={{ background: "#000" }}>
      <div className="rounded-2xl p-8 w-full max-w-md mx-4 animate-fade-in" style={{ background: "#111217", border: "1px solid rgba(212,175,55,0.15)" }}>
        <div className="text-center mb-6">
          <span className="text-4xl">🏆</span>
          <h1 className="text-2xl font-bold mt-2" style={{ color: "#D4AF37" }}>
            Iniciar Sesión
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Polla Mundialista 2026</p>
        </div>

        {registrado && (
          <div className="border px-4 py-3 rounded-lg mb-4 text-sm" style={{ borderColor: "#3CAC3B", color: "#3CAC3B", background: "rgba(60,172,59,0.1)" }}>
            Cuenta creada exitosamente. Ahora inicia sesión.
          </div>
        )}
        {error && (
          <div className="border px-4 py-3 rounded-lg mb-4 text-sm" style={{ borderColor: "#E61D25", color: "#E61D25", background: "rgba(230,29,37,0.1)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-200"
              style={{
                background: "#000",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => e.target.style.borderColor = "#D4AF37"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              placeholder="Tu nombre de usuario"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-200"
              style={{
                background: "#000",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => e.target.style.borderColor = "#D4AF37"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-lg mt-2 transition-all duration-200 disabled:opacity-30 hover:scale-[1.02]"
            style={{ background: "#D4AF37", color: "#000" }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm mt-4" style={{ color: "rgba(255,255,255,0.4)" }}>
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-medium hover:brightness-150 transition-all" style={{ color: "#D4AF37" }}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
