import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      redirect("/dashboard");
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
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
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.03,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

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

        <div
          className="animate-float"
          style={{
            position: "absolute",
            top: "20%",
            left: "8%",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "rgba(212,175,55,0.3)",
            animationDelay: "-4s",
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "absolute",
            bottom: "30%",
            right: "12%",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "rgba(0,163,224,0.2)",
            animationDelay: "-9s",
          }}
        />
        <div
          className="animate-float-slow"
          style={{
            position: "absolute",
            top: "60%",
            right: "5%",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "rgba(212,175,55,0.25)",
            animationDelay: "-3s",
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "absolute",
            bottom: "15%",
            left: "15%",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "rgba(251,232,78,0.15)",
            animationDelay: "-7s",
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "absolute",
            top: "35%",
            left: "3%",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "rgba(60,172,59,0.2)",
            animationDelay: "-12s",
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "absolute",
            bottom: "40%",
            right: "3%",
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "rgba(162,35,142,0.2)",
            animationDelay: "-6s",
          }}
        />
      </div>

      {/* ── Contenido ── */}
      <main
        className="animate-fade-in-up"
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <span className="animate-glow-pulse" style={{ fontSize: "clamp(64px, 15vw, 120px)", lineHeight: 1 }}>
          🏆
        </span>
        <h1
          className="animate-fade-in-up"
          style={{
            fontSize: "clamp(36px, 8vw, 72px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#D4AF37",
            lineHeight: 1.1,
          }}
        >
          Polla Mundialista
        </h1>
        <p
          className="animate-fade-in-up"
          style={{
            fontSize: "clamp(18px, 3vw, 28px)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          Mundial 2026 · México, Estados Unidos, Canadá
        </p>
        <p
          className="animate-fade-in-up"
          style={{
            fontSize: "clamp(14px, 1.5vw, 16px)",
            color: "rgba(255,255,255,0.25)",
            maxWidth: 360,
          }}
        >
          La app de pronósticos para tu grupo de amigos
        </p>
        <div
          className="animate-fade-in-up"
          style={{
            display: "flex",
            gap: 16,
            marginTop: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <a
            href="/login"
            style={{
              display: "inline-block",
              padding: "14px 40px",
              borderRadius: 9999,
              fontWeight: 600,
              fontSize: 17,
              textDecoration: "none",
              background: "linear-gradient(135deg, #D4AF37, #F3CD5F)",
              color: "#000",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            Iniciar Sesión
          </a>
          <a
            href="/registro"
            style={{
              display: "inline-block",
              padding: "14px 40px",
              borderRadius: 9999,
              fontWeight: 500,
              fontSize: 17,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.7)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Registrarse
          </a>
        </div>
      </main>

      <footer
        className="animate-fade-in"
        style={{
          position: "fixed",
          bottom: 24,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 12,
          color: "rgba(255,255,255,0.15)",
          animationDelay: "0.8s",
        }}
      >
        Solo para fines recreativos entre amigos
      </footer>
    </div>
  );
}
