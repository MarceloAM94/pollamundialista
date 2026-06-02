import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md mx-4">
        <h1 className="text-2xl font-bold text-white mb-4">Panel Admin</h1>
        <p className="text-green-200 mb-6">
          Gestión de resultados y estados del sistema (Fase 4).
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-white text-green-900 px-6 py-3 rounded-lg font-semibold hover:bg-green-100 transition-colors"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
