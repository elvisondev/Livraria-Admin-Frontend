import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { BookMarked, BookOpen, LayoutDashboard, Menu, Plus, Users, X } from 'lucide-react'
import { btnCls } from './ui'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/livros', label: 'Livros', icon: BookOpen, end: false },
  { to: '/autores', label: 'Autores', icon: Users, end: false },
]

export default function Layout() {
  const [aberto, setAberto] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setAberto(false), [pathname])

  return (
    <div className="min-h-dvh md:flex">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <span className="flex items-center gap-2 font-semibold"><BookMarked className="size-5 text-primary" aria-hidden />Livraria</span>
        <button type="button" className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-surface-2" aria-label={aberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={aberto} aria-controls="menu" onClick={() => setAberto((a) => !a)}>
          {aberto ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>
      <aside id="menu" className={`${aberto ? 'flex' : 'hidden'} shrink-0 flex-col gap-6 border-b border-border bg-surface p-4 md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:border-b-0 md:border-r`}>
        <div className="hidden items-center gap-2 text-lg font-semibold md:flex"><BookMarked className="size-6 text-primary" aria-hidden />Livraria</div>
        <nav aria-label="Principal" className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${isActive ? 'bg-surface-2 text-primary' : 'text-muted hover:bg-surface-2 hover:text-text'}`}>
              <Icon className="size-5" aria-hidden />{label}
            </NavLink>
          ))}
        </nav>
        <Link to="/livros/novo" className={`${btnCls('primary')} md:mt-auto`}><Plus className="size-4" aria-hidden />Novo livro</Link>
      </aside>
      <main className="min-w-0 max-w-6xl flex-1 p-4 md:p-8"><Outlet /></main>
    </div>
  )
}
