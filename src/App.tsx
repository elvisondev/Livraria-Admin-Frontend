import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { Empty, btnCls } from './components/ui'
import Autores from './pages/Autores'
import Dashboard from './pages/Dashboard'
import LivroDetalhe from './pages/LivroDetalhe'
import LivroForm from './pages/LivroForm'
import Livros from './pages/Livros'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="livros" element={<Livros />} />
        <Route path="livros/novo" element={<LivroForm />} />
        <Route path="livros/:id" element={<LivroDetalhe />} />
        <Route path="livros/:id/editar" element={<LivroForm />} />
        <Route path="autores" element={<Autores />} />
        <Route path="*" element={<Empty title="Página não encontrada"><Link to="/" className={btnCls('primary')}>Voltar ao dashboard</Link></Empty>} />
      </Route>
    </Routes>
  )
}
