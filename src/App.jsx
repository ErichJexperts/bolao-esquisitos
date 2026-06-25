import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { ThemeProvider } from './lib/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Home from './pages/Home'
import MeusPalpites from './pages/PrimeiraFase'
import Ranking from './pages/Ranking'
import Estatisticas from './pages/Estatisticas'
import Regras from './pages/Regras'
import Perfil from './pages/Perfil'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login"    element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Rotas protegidas — todas com Navbar via Layout */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/"              element={<Home />} />
              <Route path="/meus-palpites" element={<MeusPalpites />} />
              <Route path="/ranking"       element={<Ranking />} />
              <Route path="/estatisticas"  element={<Estatisticas />} />
              <Route path="/regras"        element={<Regras />} />
              <Route path="/perfil"        element={<Perfil />} />
              <Route path="/admin"         element={<Admin />} />
            </Route>
          </Route>

          {/* Rotas desconhecidas → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
