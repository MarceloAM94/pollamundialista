export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-gradient-to-br from-green-800 to-green-950">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <h1 className="text-3xl font-bold text-green-900 text-center mb-6">Iniciar Sesión</h1>
        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
              placeholder="Tu nombre de usuario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
              placeholder="Tu contraseña"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-800 transition-colors mt-2"
          >
            Entrar
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          ¿No tienes cuenta?{" "}
          <a href="/registro" className="text-green-700 hover:underline font-medium">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}
