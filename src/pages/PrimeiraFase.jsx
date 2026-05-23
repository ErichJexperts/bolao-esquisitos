import { useState, useEffect, useRef } from 'react'
import { Loader2, Check } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const ROUNDS = ['1ª Rodada', '2ª Rodada', '3ª Rodada']
const KNOCKOUT = ['32-avos', 'Oitavas de final', 'Quartas de final', 'Semifinais', 'Final']

const COUNTRY_CODES = {
  'México': 'mx', 'África do Sul': 'za', 'República da Coreia': 'kr', 'República Tcheca': 'cz',
  'Canadá': 'ca', 'Bósnia e Herzegovina': 'ba', 'Estados Unidos': 'us', 'Paraguai': 'py',
  'Catar': 'qa', 'Suíça': 'ch', 'Brasil': 'br', 'Marrocos': 'ma', 'Haiti': 'ht',
  'Escócia': 'gb-sct', 'Austrália': 'au', 'Turquia': 'tr', 'Alemanha': 'de', 'Curaçau': 'cw',
  'Holanda': 'nl', 'Japão': 'jp', 'Costa do Marfim': 'ci', 'Equador': 'ec', 'Suécia': 'se',
  'Tunísia': 'tn', 'Espanha': 'es', 'Cabo Verde': 'cv', 'Bélgica': 'be', 'Egito': 'eg',
  'Arábia Saudita': 'sa', 'Uruguai': 'uy', 'Irã': 'ir', 'Nova Zelândia': 'nz', 'França': 'fr',
  'Senegal': 'sn', 'Iraque': 'iq', 'Noruega': 'no', 'Argentina': 'ar', 'Argélia': 'dz',
  'Áustria': 'at', 'Jordânia': 'jo', 'Portugal': 'pt', 'Rep. Democrática do Congo': 'cd',
  'Inglaterra': 'gb-eng', 'Croácia': 'hr', 'Gana': 'gh', 'Panamá': 'pa', 'Uzbequistão': 'uz',
  'Colômbia': 'co',
}

const CDN = 'https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg'

function Flag({ team, size = 20 }) {
  const code = COUNTRY_CODES[team]
  if (!code) return <span style={{ width: size, height: size }} className="inline-block" />
  return (
    <img
      src={`${CDN}/${code}.svg`}
      alt={team}
      style={{ width: size, height: Math.round(size * 0.67) }}
      className="object-cover rounded-sm shrink-0"
    />
  )
}

function getResult(pred, match) {
  if (!match.is_finished || match.home_score === null || match.home_score === undefined || !pred) return null
  if (pred.predicted_home === match.home_score && pred.predicted_away === match.away_score) return 'exact'
  const predSign = Math.sign(pred.predicted_home - pred.predicted_away)
  const realSign = Math.sign(match.home_score - match.away_score)
  if (predSign === realSign) return 'correct'
  return 'wrong'
}

function isLocked(match) {
  return new Date() >= new Date(match.match_date) || match.is_finished
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

const ROW_STYLE = {
  exact:   'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400',
  correct: 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400',
  wrong:   'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400',
}

const BADGE = {
  exact:   { label: '+3 pts', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  correct: { label: '+1 pt',  cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'   },
  wrong:   { label: '0 pts',  cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'       },
}

export default function PrimeiraFase() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [predictions, setPredictions] = useState({})
  const [inputs, setInputs] = useState({})
  const [saving, setSaving] = useState(new Set())
  const [saved, setSaved] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeRound, setActiveRound] = useState(ROUNDS[0])
  const saveTimers = useRef({})
  const savedTimers = useRef({})

  useEffect(() => {
    async function load() {
      try {
        const [matchRes, predRes] = await Promise.all([
          supabase.from('matches').select('*').in('round', ROUNDS).order('match_date'),
          supabase.from('predictions').select('*').eq('user_id', user.id),
        ])
        if (matchRes.error) throw matchRes.error
        if (predRes.error) throw predRes.error
        if (matchRes.data) setMatches(matchRes.data)
        if (predRes.data) {
          const predMap = {}, inputMap = {}
          predRes.data.forEach(p => {
            predMap[p.match_id] = p
            inputMap[p.match_id] = { home: String(p.predicted_home), away: String(p.predicted_away) }
          })
          setPredictions(predMap)
          setInputs(inputMap)
        }
      } catch (err) {
        setError(err.message ?? 'Erro ao carregar jogos.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  function handleInput(matchId, side, value) {
    const cleaned = value.replace(/\D/g, '').slice(0, 2)
    const updated = { ...(inputs[matchId] || { home: '', away: '' }), [side]: cleaned }
    setInputs(prev => ({ ...prev, [matchId]: updated }))
    if (updated.home !== '' && updated.away !== '') {
      clearTimeout(saveTimers.current[matchId])
      saveTimers.current[matchId] = setTimeout(() => savePrediction(matchId, updated), 600)
    }
  }

  async function savePrediction(matchId, inp) {
    const match = matches.find(m => m.id === matchId)
    if (!match || isLocked(match)) return
    const data = inp ?? inputs[matchId]
    if (!data || data.home === '' || data.away === '') return
    const home = parseInt(data.home), away = parseInt(data.away)
    if (isNaN(home) || isNaN(away)) return
    setSaving(prev => new Set([...prev, matchId]))
    const { error } = await supabase.from('predictions').upsert(
      { user_id: user.id, match_id: matchId, predicted_home: home, predicted_away: away },
      { onConflict: 'user_id,match_id' }
    )
    if (!error) {
      setPredictions(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), predicted_home: home, predicted_away: away } }))
      setSaved(prev => new Set([...prev, matchId]))
      clearTimeout(savedTimers.current[matchId])
      savedTimers.current[matchId] = setTimeout(() => {
        setSaved(prev => { const s = new Set(prev); s.delete(matchId); return s })
      }, 2000)
    }
    setSaving(prev => { const s = new Set(prev); s.delete(matchId); return s })
  }

  function changeTab(tab) {
    setActiveRound(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const byRound = ROUNDS.map(round => ({ round, matches: matches.filter(m => m.round === round) }))

  if (loading) return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <p className="text-sm text-red-500">{error}</p>
    </div>
  )

  function MatchRow({ match }) {
    const pred = predictions[match.id]
    const result = getResult(pred, match)
    const locked = isLocked(match)
    const isSaving = saving.has(match.id)
    const isSaved = saved.has(match.id)
    const inp = inputs[match.id] || { home: '', away: '' }
    const noPrediction = match.is_finished && !pred

    const inputCls = `w-8 h-7 md:w-9 md:h-8 text-center text-sm font-semibold border rounded-lg transition ${
      locked
        ? 'border-transparent bg-transparent text-gray-700 dark:text-gray-300 cursor-default'
        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-gray-400 focus:bg-white dark:focus:bg-gray-600'
    }`

    const dateInfo = (
      <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
        {formatDate(match.match_date)} · Grupo {match.group_name}
      </span>
    )

    if (noPrediction) {
      return (
        <div className="opacity-60">
          <div className="flex items-center gap-2 md:gap-4 px-3 md:px-5 pt-2.5 pb-1 md:py-2.5">
            <div className="shrink-0 w-12 md:w-20">
              <span className="text-xs text-gray-400 dark:text-gray-500 italic">Sem palpite</span>
            </div>
            <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
              <span className="text-sm text-gray-400 dark:text-gray-500 truncate text-right">{match.home_team}</span>
              <Flag team={match.home_team} size={20} />
            </div>
            <div className="shrink-0 flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 w-16 md:w-20 justify-center">
              {match.home_score} × {match.away_score}
            </div>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Flag team={match.away_team} size={20} />
              <span className="text-sm text-gray-400 dark:text-gray-500 truncate">{match.away_team}</span>
            </div>
            <div className="hidden md:block w-40 shrink-0 text-right">
              <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{formatDate(match.match_date)}</span>
              <br /><span className="text-xs text-gray-400 dark:text-gray-500">Grupo {match.group_name}</span>
            </div>
          </div>
          <div className="md:hidden text-center pb-2">{dateInfo}</div>
        </div>
      )
    }

    return (
      <div className={`transition ${result ? ROW_STYLE[result] : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
        <div className="flex items-center gap-2 md:gap-4 px-3 md:px-5 pt-2.5 pb-1 md:py-3">

          {/* Badge */}
          <div className="shrink-0 flex flex-col gap-0.5 md:w-20">
            {result && (
              <span className={`text-xs font-semibold px-1.5 md:px-2 py-0.5 rounded-full self-start ${BADGE[result].cls}`}>
                {BADGE[result].label}
              </span>
            )}
            {match.is_finished && match.home_score !== null && (
              <span className="hidden md:inline text-xs text-gray-500 dark:text-gray-400">
                Placar {match.home_score} × {match.away_score}
              </span>
            )}
          </div>

          {/* Home */}
          <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate text-right">{match.home_team}</span>
            <Flag team={match.home_team} size={20} />
          </div>

          {/* Inputs */}
          <div className="shrink-0 flex items-center gap-1 relative group/score">
            <input type="text" inputMode="numeric" value={inp.home}
              onChange={e => !locked && handleInput(match.id, 'home', e.target.value)}
              readOnly={locked} className={inputCls} placeholder="" />
            <span className="text-gray-400 text-sm">×</span>
            <input type="text" inputMode="numeric" value={inp.away}
              onChange={e => !locked && handleInput(match.id, 'away', e.target.value)}
              readOnly={locked} className={inputCls} placeholder="" />
            {match.is_finished && match.home_score !== null && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-600 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/score:opacity-100 transition-opacity pointer-events-none">
                Resultado: {match.home_score} × {match.away_score}
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Flag team={match.away_team} size={20} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{match.away_team}</span>
            <span className="w-4 shrink-0">
              {isSaving && <Loader2 size={13} className="text-gray-400 animate-spin" />}
              {!isSaving && isSaved && <Check size={13} className="text-green-500" />}
            </span>
          </div>

          {/* Data — só desktop */}
          <div className="hidden md:block w-40 shrink-0 text-right">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{formatDate(match.match_date)}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">Grupo {match.group_name}</span>
            </div>
          </div>
        </div>

        {/* Data — só mobile */}
        <div className="md:hidden text-center pb-2">{dateInfo}</div>
      </div>
    )
  }

  const currentMatches = byRound.find(r => r.round === activeRound)?.matches ?? []
  const finishedMatches = currentMatches.filter(m => m.is_finished)
  const acertados = finishedMatches.filter(m => { const r = getResult(predictions[m.id], m); return r === 'exact' || r === 'correct' }).length
  const placaresExatos = finishedMatches.filter(m => getResult(predictions[m.id], m) === 'exact').length
  const pontos = finishedMatches.reduce((acc, m) => { const r = getResult(predictions[m.id], m); return acc + (r === 'exact' ? 3 : r === 'correct' ? 1 : 0) }, 0)
  const jogosRestantes = currentMatches.filter(m => !m.is_finished).length
  const totalPontos = matches.reduce((acc, m) => { const r = getResult(predictions[m.id], m); return acc + (r === 'exact' ? 3 : r === 'correct' ? 1 : 0) }, 0)

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Meus palpites</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Insira seus palpites antes do início de cada jogo.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 md:px-6 md:py-4 text-right shrink-0">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Minha pontuação total</p>
            <p className="text-lg md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
              {totalPontos} <span className="text-xs md:text-sm font-normal text-gray-400 dark:text-gray-500">pts</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="scroll-x-hidden flex mb-6 gap-1.5 pb-1">
          {[...ROUNDS, ...KNOCKOUT].map(tab => (
            <button
              key={tab}
              onClick={() => changeTab(tab)}
              className={`shrink-0 md:flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition text-center whitespace-nowrap ${
                activeRound === tab
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Resumo — só desktop */}
        <div className="hidden md:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 mb-4">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Resumo dos resultados da {activeRound}</p>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Resultados acertados</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{acertados}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Placares exatos acertados</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{placaresExatos}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Jogos restantes</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {jogosRestantes}<span className="text-sm font-normal text-gray-400 dark:text-gray-500">/{currentMatches.length}</span>
              </p>
            </div>
            <div className="border-l-2 border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Pontuação</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pontos} <span className="text-sm font-normal text-gray-400 dark:text-gray-500">pts</span></p>
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="min-h-96">
          {ROUNDS.includes(activeRound) ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
              {currentMatches.map(match => <MatchRow key={match.id} match={match} />)}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">{activeRound} — em breve</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
