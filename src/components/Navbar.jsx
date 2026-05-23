import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, LayoutGrid, Trophy, CircleUser, LogOut, Globe, ScrollText, Menu, X } from 'lucide-react'
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
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 flex items-center gap-2">

          {/* Brand */}
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 font-bold text-gray-900 shrink-0"
          >
            <Globe size={18} strokeWidth={1.75} className="text-green-600" />
            <span className="text-sm">Bolão dos Esquisitos</span>
          </NavLink>

          {/* Desktop links */}
          <div className="hidden md:flex flex-1 items-center justify-evenly">
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

          {/* Desktop sair */}
          <button
            onClick={logout}
            className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-red-500 transition whitespace-nowrap shrink-0"
          >
            <LogOut size={15} strokeWidth={1.75} />
            <span>Sair</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden ml-auto p-1.5 text-gray-500 hover:text-gray-900 transition"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-14 right-0 bottom-0 z-40 w-64 bg-white shadow-xl transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full py-3">
          <div className="flex-1 px-3 space-y-0.5">
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.75} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
          <div className="px-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => { setOpen(false); logout() }}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
            >
              <LogOut size={18} strokeWidth={1.75} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
