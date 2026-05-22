import { useAuth } from '../lib/AuthContext'

export default function Jogos() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Jogos</h1>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-600 transition"
          >
            Sair
          </button>
        </div>
        <p className="text-gray-500 text-sm">Logado como: {user?.email}</p>
        <p className="text-gray-400 text-sm mt-4">Lista de partidas em breve...</p>
      </div>
    </div>
  )
}
