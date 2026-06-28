import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { Maximize2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/ThemeContext'

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7',
]

function formatDay(dateStr) {
  const [, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const sorted = [...payload].sort((a, b) => b.value - a.value)
  return (
    <div style={{
      backgroundColor: '#111827', borderRadius: 10, padding: '8px 12px',
      fontSize: 12, minWidth: 160,
    }}>
      <p style={{ color: '#9ca3af', fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {sorted.map((entry, i) => (
        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ color: '#6b7280', minWidth: 16, textAlign: 'right', fontSize: 11 }}>{i + 1}.</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color, flexShrink: 0 }} />
          <span style={{ color: '#d1d5db', flex: 1 }}>{entry.name}</span>
          <span style={{ color: '#f9fafb', fontWeight: 700, marginLeft: 8 }}>{entry.value} pts</span>
        </div>
      ))}
    </div>
  )
}

export default function Estatisticas() {
  const { dark } = useTheme()
  const [chartData, setChartData] = useState([])
  const [users, setUsers] = useState([])
  const [rawDailyData, setRawDailyData] = useState([])
  const [statsData, setStatsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredUser, setHoveredUser] = useState(null)
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    async function load() {
      const [dailyRes, statsRes] = await Promise.all([
        supabase.rpc('get_daily_points'),
        supabase.rpc('get_user_stats'),
      ])
      if (dailyRes.error) console.error('[Estatisticas daily]', dailyRes.error)
      if (statsRes.error) console.error('[Estatisticas stats]', statsRes.error)

      const daily = dailyRes.data ?? []
      const stats = statsRes.data ?? []

      setRawDailyData(daily)
      setStatsData(stats)

      if (daily.length > 0) {
        const allDates = [...new Set(daily.map(d => d.match_day))].sort()

        const userMap = new Map()
        daily.forEach(d => {
          if (!userMap.has(d.user_id)) userMap.set(d.user_id, d.username)
        })
        const uniqueUsers = [...userMap.entries()].map(([id, username]) => ({ id, username }))
        setUsers(uniqueUsers)

        const byUserDate = {}
        daily.forEach(d => {
          if (!byUserDate[d.user_id]) byUserDate[d.user_id] = {}
          byUserDate[d.user_id][d.match_day] = Number(d.points_on_day)
        })

        const cumulative = {}
        uniqueUsers.forEach(u => { cumulative[u.id] = 0 })

        const built = allDates.map(date => {
          const point = { date: formatDay(date) }
          uniqueUsers.forEach(u => {
            cumulative[u.id] += byUserDate[u.id]?.[date] ?? 0
            point[u.username] = cumulative[u.id]
          })
          return point
        })

        setChartData(built)
      }

      setLoading(false)
    }
    load()
  }, [])

  // ── derived stats ────────────────────────────────────────────
  const bestDays = [...rawDailyData]
    .filter(d => Number(d.points_on_day) > 0)
    .sort((a, b) => Number(b.points_on_day) - Number(a.points_on_day))
    .slice(0, 5)
    .map(d => ({ day: formatDay(d.match_day), username: d.username, pts: Number(d.points_on_day) }))

  const hitRateRanking  = [...statsData].sort((a, b) => Number(b.hit_rate)    - Number(a.hit_rate))
  const exactRanking    = [...statsData].sort((a, b) => Number(b.exact_scores) - Number(a.exact_scores))
  const nearMissRanking = [...statsData].sort((a, b) => Number(b.near_misses)  - Number(a.near_misses))

  const currentLeader = (() => {
    if (chartData.length === 0 || users.length === 0) return null
    const last = chartData[chartData.length - 1]
    let best = null
    users.forEach(u => {
      const pts = last[u.username] ?? 0
      if (!best || pts > best.pts) best = { username: u.username, pts }
    })
    return best
  })()

  // Campeão consolidado: pontos apenas da fase de grupos (antes dos 32-avos em 28/06)
  const groupStageChampion = (() => {
    const groupData = rawDailyData.filter(d => d.match_day < '2026-06-28')
    if (groupData.length === 0) return null
    const totals = {}
    groupData.forEach(d => {
      const pts = Number(d.points_on_day)
      if (!totals[d.user_id]) totals[d.user_id] = { username: d.username, pts: 0 }
      totals[d.user_id].pts += pts
    })
    return Object.values(totals).reduce((best, cur) => cur.pts > best.pts ? cur : best)
  })()

  // Campeão do mata-mata: pontos apenas a partir dos 32-avos (28/06 em diante)
  const knockoutChampion = (() => {
    const knockoutData = rawDailyData.filter(d => d.match_day >= '2026-06-28')
    if (knockoutData.length === 0) return null
    const totals = {}
    knockoutData.forEach(d => {
      const pts = Number(d.points_on_day)
      if (!totals[d.user_id]) totals[d.user_id] = { username: d.username, pts: 0 }
      totals[d.user_id].pts += pts
    })
    return Object.values(totals).reduce((best, cur) => cur.pts > best.pts ? cur : best)
  })()

  // ── chart helpers ────────────────────────────────────────────
  const gridColor = dark ? '#374151' : '#e5e7eb'
  const axisColor = dark ? '#6b7280' : '#9ca3af'

  const maxVal = users.length > 0
    ? Math.max(...users.flatMap(u => chartData.map(d => d[u.username] ?? 0)), 0)
    : 0
  const yTicks = Array.from({ length: maxVal + 2 }, (_, i) => i)

  const userColor = (username) => {
    const idx = users.findIndex(u => u.username === username)
    return idx >= 0 ? COLORS[idx % COLORS.length] : '#9ca3af'
  }

  const renderLines = () =>
    users.map((u, i) => (
      <Line
        key={u.id}
        type="monotone"
        dataKey={u.username}
        stroke={COLORS[i % COLORS.length]}
        strokeWidth={hoveredUser === u.username ? 3 : 1.5}
        strokeOpacity={hoveredUser && hoveredUser !== u.username ? 0.2 : 1}
        dot={false}
        activeDot={{ r: 5, strokeWidth: 0 }}
      />
    ))

  const renderChart = (height) => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} width={28} ticks={yTicks} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor }} />
        {renderLines()}
      </LineChart>
    </ResponsiveContainer>
  )

  const renderLegend = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {users.map((u, i) => (
        <button
          key={u.id}
          onMouseEnter={() => setHoveredUser(u.username)}
          onMouseLeave={() => setHoveredUser(null)}
          style={{ opacity: hoveredUser && hoveredUser !== u.username ? 0.35 : 1 }}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-sm transition-opacity"
        >
          <span className="shrink-0 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length], width: 12, height: 3 }} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{u.username}</span>
        </button>
      ))}
    </div>
  )

  // ── loading ──────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
    </div>
  )

  const hasStats  = statsData.length > 0
  const hasChart  = chartData.length > 0

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Estatísticas</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Evolução e curiosidades do bolão.</p>

        <div className="flex flex-col gap-5">

          {/* RECORDES E CURIOSIDADES */}
          {hasStats && (() => {
            const worst = hitRateRanking.length > 0 ? [...hitRateRanking].reverse()[0] : null
            const records = [
              groupStageChampion && { icon: '👑', username: groupStageChampion.username, label: 'Campeão da 1ª fase', value: `${groupStageChampion.pts} pts` },
              { icon: '⚔️', username: knockoutChampion?.username ?? 'A definir', label: 'Campeão do mata-mata', value: knockoutChampion ? `${knockoutChampion.pts} pts` : 'Em disputa' },
              hitRateRanking[0] && { icon: '🎯', username: hitRateRanking[0].username, label: 'Mais preciso do bolão', value: `${hitRateRanking[0].hit_rate}% de acerto` },
              exactRanking[0] && { icon: '✨', username: exactRanking[0].username, label: 'Rei do placar exato', value: `${Number(exactRanking[0].exact_scores)} placares exatos` },
              nearMissRanking[0] && Number(nearMissRanking[0].near_misses) > 0 && { icon: '😬', username: nearMissRanking[0].username, label: 'Rei do quase-lá', value: `${Number(nearMissRanking[0].near_misses)}x errou por 1 gol` },
              bestDays[0] && { icon: '🔥', username: bestDays[0].username, label: 'Melhor dia individual', value: `+${bestDays[0].pts} pts em ${bestDays[0].day}` },
              worst && Number(worst.total_games) >= 3 && { icon: '💀', username: worst.username, label: 'Baixa taxa de acerto', value: `${worst.hit_rate}% de acerto` },
            ].filter(Boolean)

            return records.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Recordes e curiosidades</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {records.map((r, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">{r.icon}</span>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-snug">{r.label}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight" style={{ color: userColor(r.username) }}>{r.username}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{r.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          })()}

          {/* GRÁFICO — apenas desktop */}
          {hasChart && (
            <div className="hidden md:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pontuação acumulada por dia de jogo</p>
                <button
                  onClick={() => setMaximized(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
              {renderLegend()}
              {renderChart(400)}
            </div>
          )}

          {hasStats && (

            <>
              {/* TAXA DE ACERTO */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 md:p-6">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Taxa de acerto</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Percentual de acertos (resultado certo + placar exato) sobre jogos finalizados</p>
                <div className="space-y-4">
                  {hitRateRanking.map((s, i) => (
                    <div key={s.user_id} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-400 w-4 text-right shrink-0">{i + 1}</span>
                      <span
                        className="text-sm font-semibold w-24 md:w-36 shrink-0 truncate"
                        style={{ color: userColor(s.username) }}
                      >{s.username}</span>
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(Number(s.hit_rate), 100)}%`, backgroundColor: userColor(s.username) }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white w-12 text-right shrink-0">{s.hit_rate}%</span>
                      <span className="hidden md:inline text-xs text-gray-400 dark:text-gray-500 shrink-0 w-16 text-right">{Number(s.total_games)} jogos</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUASE LÁ + MELHORES DIAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Quase lá...</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Quantas vezes errou o placar por exatamente 1 gol</p>
                  <div className="space-y-3">
                    {nearMissRanking.map((s, i) => (
                      <div key={s.user_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs text-gray-400 w-4 text-right shrink-0">{i + 1}</span>
                          <span className="text-sm font-medium" style={{ color: userColor(s.username) }}>{s.username}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{Number(s.near_misses)}x</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Melhores dias</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Maiores pontuações individuais em um único dia</p>
                  {bestDays.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Nenhum dado ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {bestDays.map((d, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs text-gray-400 w-4 text-right shrink-0">{i + 1}</span>
                            <span className="text-sm text-gray-400 dark:text-gray-500 shrink-0">{d.day}</span>
                            <span className="text-sm font-medium" style={{ color: userColor(d.username) }}>{d.username}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">+{d.pts} pts</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* MINI RANKING POR PLACARES EXATOS */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Ranking por placares exatos</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Quem mais acertou o placar completo</p>
                <div className="space-y-2.5">
                  {exactRanking.map((s, i) => (
                    <div key={s.user_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-gray-400 w-4 text-right shrink-0">{i + 1}</span>
                        <span className="text-sm font-medium" style={{ color: userColor(s.username) }}>{s.username}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{Number(s.exact_scores)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal fullscreen */}
      {maximized && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-stretch justify-stretch p-3 md:p-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl flex flex-col w-full p-5 md:p-7">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pontuação acumulada por dia de jogo</p>
              <button
                onClick={() => setMaximized(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X size={18} />
              </button>
            </div>
            {renderLegend()}
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} width={28} ticks={yTicks} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor }} />
                  {renderLines()}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
