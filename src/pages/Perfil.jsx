import { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

function Field({ label, description, children }) {
  return (
    <div className="py-5 border-b border-gray-100 last:border-0">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-8">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 mb-0.5">{label}</p>
          {description && <p className="text-xs text-gray-400">{description}</p>}
        </div>
        <div className="w-full md:w-80 md:shrink-0">{children}</div>
      </div>
    </div>
  )
}

function SaveButton({ loading, saved, onClick, label = 'Salvar' }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="mt-2 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 transition"
    >
      {loading && <Loader2 size={13} className="animate-spin" />}
      {!loading && saved && <Check size={13} />}
      {label}
    </button>
  )
}

function Feedback({ error, success }) {
  if (error) return <p className="mt-1.5 text-xs text-red-500">{error}</p>
  if (success) return <p className="mt-1.5 text-xs text-green-600">{success}</p>
  return null
}

export default function Perfil() {
  const { user } = useAuth()

  // Apelido
  const [username, setUsername] = useState('')
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameSaved, setUsernameSaved] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  // Senha
  const [senha, setSenha] = useState('')
  const [senhaConfirm, setSenhaConfirm] = useState('')
  const [senhaLoading, setSenhaLoading] = useState(false)
  const [senhaSaved, setSenhaSaved] = useState(false)
  const [senhaError, setSenhaError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      if (data?.username) setUsername(data.username)
    }
    loadProfile()
  }, [user.id])

  async function saveUsername() {
    setUsernameError('')
    setUsernameSaved(false)
    if (!username.trim()) return setUsernameError('Apelido não pode ser vazio.')
    setUsernameLoading(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username: username.trim() }, { onConflict: 'id' })
    setUsernameLoading(false)
    if (error) {
      setUsernameError(error.message.includes('unique') ? 'Esse apelido já está em uso.' : error.message)
    } else {
      setUsernameSaved(true)
      setTimeout(() => setUsernameSaved(false), 3000)
    }
  }

  async function saveSenha() {
    setSenhaError('')
    setSenhaSaved(false)
    if (senha.length < 6) return setSenhaError('A senha deve ter pelo menos 6 caracteres.')
    if (senha !== senhaConfirm) return setSenhaError('As senhas não coincidem.')
    setSenhaLoading(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setSenhaLoading(false)
    if (error) setSenhaError(error.message)
    else {
      setSenhaSaved(true)
      setSenha('')
      setSenhaConfirm('')
      setTimeout(() => setSenhaSaved(false), 3000)
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-400 transition'

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Meu perfil</h1>
        <p className="text-gray-500 text-sm mb-8">Gerencie suas informações.</p>

        <div className="bg-white border border-gray-200 rounded-2xl px-6">

          <Field label="E-mail" description="Endereço de e-mail usado para entrar na conta.">
            <p className="px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg">{user?.email}</p>
          </Field>

          <Field label="Nome de usuário" description="Seu nome no bolão — aparece no ranking e identifica você para os outros participantes.">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.slice(0, 24))}
                className={inputCls}
                placeholder="Seu nome de usuário"
                maxLength={24}
              />
              <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs ${username.length >= 24 ? 'text-red-400' : 'text-gray-400'}`}>
                {username.length}/24
              </span>
            </div>
            <Feedback error={usernameError} success={usernameSaved ? 'Nome salvo!' : ''} />
            <SaveButton loading={usernameLoading} saved={usernameSaved} onClick={saveUsername} />
          </Field>

          <Field label="Senha" description="Mínimo de 6 caracteres.">
            <div className="space-y-2">
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className={inputCls}
                placeholder="Nova senha"
              />
              <input
                type="password"
                value={senhaConfirm}
                onChange={e => setSenhaConfirm(e.target.value)}
                className={inputCls}
                placeholder="Confirmar nova senha"
              />
            </div>
            <Feedback error={senhaError} success={senhaSaved ? 'Senha alterada com sucesso!' : ''} />
            <SaveButton loading={senhaLoading} saved={senhaSaved} onClick={saveSenha} label="Alterar senha" />
          </Field>

        </div>
      </div>
    </div>
  )
}
