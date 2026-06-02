"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, nombre }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrarse");
      }

      router.push("/login?registrado=1");
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
            Registrarse
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Crea tu cuenta para la Polla Mundialista 2026</p>
        </div>

        {error && (
          <div className="border px-4 py-3 rounded-lg mb-4 text-sm" style={{ borderColor: "#E61D25", color: "#E61D25", background: "rgba(230,29,37,0.1)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-200"
              style={{
                background: "#000",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => e.target.style.borderColor = "#D4AF37"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              placeholder="Tu nombre real"
              required
              autoFocus
            />
          </div>

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
              placeholder="Elige un nombre de usuario"
              required
              minLength={3}
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
              placeholder="Elige una contraseña"
              required
              minLength={4}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-lg mt-2 transition-all duration-200 disabled:opacity-30 hover:scale-[1.02]"
            style={{ background: "#D4AF37", color: "#000" }}
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="text-center text-sm mt-4" style={{ color: "rgba(255,255,255,0.4)" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium hover:brightness-150 transition-all" style={{ color: "#D4AF37" }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
