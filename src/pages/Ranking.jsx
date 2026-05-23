import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function Ranking() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('ranking').select('*')
      if (data) setRows(data)
      if (error) console.error('[Ranking]', error)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Ranking</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Classificação geral — todas as etapas combinadas.</p>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum palpite registrado ainda.</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2.5rem_1fr_6rem] md:grid-cols-[3rem_1fr_10rem_10rem_10rem] px-4 md:px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">#</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Apelido</span>
              <span className="hidden md:block text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Resultados certos</span>
              <span className="hidden md:block text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Placares exatos</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Pontuação</span>
            </div>

            {rows.map((row, i) => {
              const isMe = row.user_id === user.id
              const pos = i + 1
              const resultadosCertos = (row.placares_exatos ?? 0) + (row.resultados_corretos ?? 0)

              return (
                <div
                  key={row.user_id}
                  className={`grid grid-cols-[2.5rem_1fr_6rem] md:grid-cols-[3rem_1fr_10rem_10rem_10rem] px-4 md:px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 last:border-0 transition ${
                    isMe ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`text-sm font-bold ${
                      pos === 1 ? 'text-amber-500' : pos === 2 ? 'text-gray-400' : pos === 3 ? 'text-orange-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : pos}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{row.username ?? 'Anônimo'}</span>
                    {isMe && <span className="text-xs text-green-600 dark:text-green-400 font-medium shrink-0">você</span>}
                  </div>

                  <div className="hidden md:flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{resultadosCertos}</span>
                  </div>

                  <div className="hidden md:flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{row.placares_exatos ?? 0}</span>
                  </div>

                  <div className="flex items-center justify-end">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{row.pontos ?? 0}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">pts</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
