import { NavLink } from 'react-router-dom'
import { Home, LayoutGrid, Trophy, CircleUser, LogOut, Globe, ScrollText } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

const NAV_ITEMS = [
  { to: '/',              label: 'Início',          Icon: Home        },
  { to: '/meus-palpites', label: 'Meus palpites',   Icon: LayoutGrid  },
  { to: '/ranking',       label: 'Ranking',         Icon: Trophy      },
  { to: '/regras',        label: 'Regras e Prêmio', Icon: ScrollText  },
  { to: '/perfil',        label: 'Meu perfil',      Icon: CircleUser  },
]

export default function Navbar() {
  const { logout } = useAuth()

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-8 h-14 flex items-center gap-2">

        {/* Brand */}
        <NavLink
          to="/"
          className="flex items-center gap-2 font-bold text-gray-900 shrink-0"
        >
          <Globe size={18} strokeWidth={1.75} className="text-green-600" />
          <span className="text-sm">Bolão dos Esquisitos</span>
        </NavLink>

        {/* Links */}
        <div className="flex flex-1 items-center justify-evenly">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={15} strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Sair */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-red-500 transition whitespace-nowrap shrink-0"
        >
          <LogOut size={15} strokeWidth={1.75} />
          <span>Sair</span>
        </button>

      </div>
    </nav>
  )
}
