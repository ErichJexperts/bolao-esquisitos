import { Link } from 'react-router-dom'
import { Trophy, LayoutGrid, ArrowRight } from 'lucide-react'

const CARDS = [
  {
    to:          '/meus-palpites',
    Icon:        LayoutGrid,
    iconClass:   'bg-green-100 text-green-600',
    title:       'Meus palpites',
    description: 'Insira seus palpites antes do início de cada jogo',
  },
  {
    to:          '/ranking',
    Icon:        Trophy,
    iconClass:   'bg-amber-100 text-amber-600',
    title:       'Ranking',
    description: 'Veja quem está na frente na pontuação',
  },
]

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8 md:py-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8 flex flex-col items-center">

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-green-200 text-green-700 bg-green-50 mb-8">
          ⚽ Copa dos Esquisitos 2026
        </span>

        {/* Título */}
        <h1 className="font-bold text-center mb-5 w-full">
          <span className="block text-xl sm:text-2xl font-medium text-gray-400 mb-1">Bem-vindo ao</span>
          <span className="block text-4xl sm:text-5xl text-gray-900">Bolão da Copa dos Esquisitos</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-gray-500 text-center text-base md:text-lg mb-10 md:mb-16 max-w-2xl">
          Aqui você coloca os seus palpites dos jogos e vamos ver quem entende mais
          de futebol nessa bagaça… ou quem tem mais sorte.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {CARDS.map(({ to, Icon, iconClass, title, description }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col bg-white border border-gray-200 rounded-2xl p-7 hover:border-gray-300 hover:shadow-sm transition"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${iconClass}`}>
                <Icon size={22} strokeWidth={1.75} />
              </div>
              <h2 className="font-semibold text-gray-900 text-lg mb-2">{title}</h2>
              <p className="text-sm text-gray-500 mb-6 flex-1">{description}</p>
              <ArrowRight
                size={17}
                strokeWidth={1.75}
                className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all"
              />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
