import { useAuth } from '../lib/AuthContext'

const ADMIN_EMAIL = 'erichbraganca@gmail.com'

export default function Admin() {
  const { user } = useAuth()

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Acesso restrito.</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin</h1>
        <p className="text-gray-500 text-sm">Painel de administração em breve...</p>
      </div>
    </div>
  )
}
