import { useState, useEffect, useRef } from 'react'
import { Eye, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

function getResult(ph, pa, rh, ra) {
  if (ph === rh && pa === ra) return 'exact'
  return Math.sign(ph - pa) === Math.sign(rh - ra) ? 'correct' : 'wrong'
}

function getPointValues(round) {
  if (round === 'Final')                                                    return { exact: 6, correct: 4 }
  if (round === 'Semifinais')                                               return { exact: 5, correct: 3 }
  if (['32-avos', 'Oitavas de final', 'Quartas de final'].includes(round)) return { exact: 4, correct: 2 }
  return { exact: 3, correct: 1 }
}

const RESULT_STYLE = {
  exact:   { badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  correct: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  wrong:   { badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
}

function PreviewTooltip({ data, loading, pos }) {
  const style = { position: 'fixed', left: pos.x + 10, top: pos.y - 8, zIndex: 9999 }

  if (loading) return (
    <div style={style} className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 flex items-center justify-center">
      <Loader2 size={16} className="animate-spin text-gray-400" />
    </div>
  )

  if (!data || data.length === 0) return (
    <div style={style} className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3">
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Nenhum jogo computado ainda.</p>
    </div>
  )

  return (
    <div style={style} className="w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Últimos resultados</p>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {data.map((r, i) => {
          const result = getResult(r.predicted_home, r.predicted_away, r.home_score, r.away_score)
          const { exact, correct } = getPointValues(r.round)
          const pts = result === 'exact' ? exact : result === 'correct' ? correct : 0
          return (
            <div key={i} className="px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {r.home_team} × {r.away_team}
                </span>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${RESULT_STYLE[result].badge}`}>
                  {result === 'wrong' ? '0 pts' : `+${pts} pts`}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-400 dark:text-gray-500">
                  Palpite: <span className="font-semibold text-gray-700 dark:text-gray-300">{r.predicted_home}×{r.predicted_away}</span>
                </span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-gray-400 dark:text-gray-500">
                  Real: <span className="font-semibold text-gray-700 dark:text-gray-300">{r.home_score}×{r.away_score}</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Ranking() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState({ userId: null, data: null, loading: false, pos: { x: 0, y: 0 } })
  const cache = useRef({})
  const hideTimer = useRef(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('ranking').select('*')
      if (data) setRows(data)
      if (error) console.error('[Ranking]', error)
      setLoading(false)
    }
    load()
  }, [])

  async function showPreview(userId, e) {
    clearTimeout(hideTimer.current)
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = { x: rect.right, y: rect.top }
    if (cache.current[userId]) {
      setPreview({ userId, data: cache.current[userId], loading: false, pos })
      return
    }
    setPreview({ userId, data: null, loading: true, pos })
    const { data } = await supabase
      .from('user_recent_results')
      .select('*')
      .eq('user_id', userId)
      .order('match_date', { ascending: false })
      .limit(4)
    cache.current[userId] = data ?? []
    setPreview(prev => prev.userId === userId
      ? { userId, data: cache.current[userId], loading: false, pos }
      : prev
    )
  }

  function hidePreview() {
    hideTimer.current = setTimeout(() => {
      setPreview({ userId: null, data: null, loading: false })
    }, 150)
  }

  if (loading) return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
    </div>
  )

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
              const isHovered = preview.userId === row.user_id

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
                    <div className="hidden md:block shrink-0"
                      onMouseEnter={e => showPreview(row.user_id, e)}
                      onMouseLeave={hidePreview}
                    >
                      <button className="flex items-center justify-center w-5 h-5 rounded-full text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition">
                        <Eye size={13} />
                      </button>
                      {isHovered && <PreviewTooltip data={preview.data} loading={preview.loading} pos={preview.pos} />}
                    </div>
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
