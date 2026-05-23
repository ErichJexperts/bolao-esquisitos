import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const MAX = 24

export default function Cadastro() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!username.trim()) return setError('Escolha um nome de usuário.')
    if (password !== confirm) return setError('As senhas não coincidem.')
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.')

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    const userId = data.user?.id
    if (userId) {
      const { error: profileError } = await supabase.from('profiles').insert({ id: userId, username: username.trim() })
      if (profileError) {
        setError(profileError.message.includes('unique') ? 'Esse nome de usuário já está em uso.' : profileError.message)
        setLoading(false)
        return
      }
    }

    navigate('/')
    setLoading(false)
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bolão da Copa</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Crie sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome de usuário</label>
            <div className="relative">
              <input id="username" type="text" required value={username} onChange={e => setUsername(e.target.value.slice(0, MAX))} className={inputCls} placeholder="Como vai aparecer no ranking" />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${username.length >= MAX ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {username.length}/{MAX}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="seu@email.com" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
            <input id="password" type="password" required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="mínimo 6 caracteres" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar senha</label>
            <input id="confirm" type="password" required autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputCls} placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg py-2.5 text-sm transition">
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          Já tem conta?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
