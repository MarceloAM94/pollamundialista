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
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Fondo animado ── */}
      <div
        className="pointer-events-none"
        style={{ position: "fixed", inset: 0, overflow: "hidden" }}
      >
        {/* Grid sutíl */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.03,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Orb dorado - esquina superior derecha */}
        <div
          className="animate-float"
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "60vmax",
            height: "60vmax",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 60%)",
          }}
        />

        {/* Orb azul - esquina inferior izquierda */}
        <div
          className="animate-float-slow"
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "-10%",
            width: "70vmax",
            height: "70vmax",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,163,224,0.08) 0%, transparent 60%)",
          }}
        />

        {/* Orb rojo - medio */}
        <div
          className="animate-glow-pulse"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "40vmax",
            height: "40vmax",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(230,29,37,0.04) 0%, transparent 60%)",
          }}
        />

        {/* Círculos decorativos flotantes */}
        <div
          className="animate-float"
          style={{
            position: "absolute",
            top: "15%",
            left: "10%",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "rgba(212,175,55,0.3)",
            animationDelay: "-5s",
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "absolute",
            bottom: "25%",
            right: "15%",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "rgba(0,163,224,0.2)",
            animationDelay: "-10s",
          }}
        />
        <div
          className="animate-float-slow"
          style={{
            position: "absolute",
            top: "40%",
            right: "8%",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "rgba(212,175,55,0.25)",
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "absolute",
            bottom: "35%",
            left: "5%",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "rgba(230,29,37,0.15)",
            animationDelay: "-7s",
          }}
        />
      </div>

      {/* ── Tarjeta ── */}
      <div
        className="animate-fade-in-up"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          margin: "0 16px",
          background: "#111217",
          borderRadius: 16,
          padding: 32,
          border: "1px solid rgba(212,175,55,0.12)",
          boxShadow: "0 0 60px rgba(212,175,55,0.06), 0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {/* Icono */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span
            className="animate-glow-pulse"
            style={{ fontSize: 48, display: "block" }}
          >
            🏆
          </span>
          <h1
            className="animate-fade-in-up"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#D4AF37",
              marginTop: 8,
            }}
          >
            Iniciar Sesión
          </h1>
          <p
            className="animate-fade-in-up"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.35)",
              marginTop: 4,
            }}
          >
            Polla Mundialista 2026
          </p>
        </div>

        {/* Alertas */}
        {registrado && (
          <div
            className="animate-fade-in"
            style={{
              border: "1px solid rgba(60,172,59,0.3)",
              background: "rgba(60,172,59,0.08)",
              color: "#3CAC3B",
              padding: "10px 16px",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            Cuenta creada exitosamente. Ahora inicia sesión.
          </div>
        )}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              border: "1px solid rgba(230,29,37,0.3)",
              background: "rgba(230,29,37,0.08)",
              color: "#E61D25",
              padding: "10px 16px",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 6,
              }}
            >
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.1)")
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "#000",
                color: "#fff",
                fontSize: 15,
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              placeholder="Tu nombre de usuario"
              required
              autoFocus
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 6,
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.1)")
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "#000",
                color: "#fff",
                fontSize: 15,
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 0",
              borderRadius: 10,
              border: "none",
              background: loading
                ? "rgba(212,175,55,0.5)"
                : "linear-gradient(135deg, #D4AF37, #F3CD5F)",
              color: "#000",
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              marginTop: 4,
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading)
                e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p
          className="animate-fade-in"
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "rgba(255,255,255,0.35)",
            marginTop: 20,
          }}
        >
          ¿No tienes cuenta?{" "}
          <Link
            href="/registro"
            style={{
              color: "#D4AF37",
              fontWeight: 500,
              textDecoration: "none",
              transition: "filter 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.filter = "brightness(1.5)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.filter = "brightness(1)")
            }
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
