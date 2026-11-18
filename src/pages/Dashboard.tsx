import { Link } from 'react-router-dom'
import { BookOpen, Plus, Users } from 'lucide-react'
import { Empty, ErrorBox, Loading, PageHeader, btnCls } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { autorObj, fmtPreco } from '../lib'
import { autoresApi, contar, livrosApi } from '../services/api'

type Contagem = { total: number; exato: boolean }

function Metrica({ to, label, icon: Icon, c }: { to: string; label: string; icon: typeof BookOpen; c: Contagem }) {
  return (
    <Link to={to} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:bg-surface-2">
      <Icon className="size-8 text-primary" aria-hidden />
      <div>
        <p className="font-mono text-3xl font-medium">{c.exato ? c.total : `${c.total}+`}</p>
        <p className="text-sm text-muted">{label}{c.exato ? '' : ' (contagem parcial: limite de consulta atingido)'}</p>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(async () => {
    const [livros, autores, recentes] = await Promise.all([
      contar(livrosApi.listar),
      contar(autoresApi.listar),
      livrosApi.listar({ limite: 5, paginas: 1 }), // ordenação padrão da API: _id:-1 (mais recentes)
    ])
    return { livros, autores, recentes }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard">
        <Link to="/livros/novo" className={btnCls('primary')}><Plus className="size-4" aria-hidden />Novo livro</Link>
      </PageHeader>
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Metrica to="/livros" label="livros cadastrados" icon={BookOpen} c={data.livros} />
            <Metrica to="/autores" label="autores cadastrados" icon={Users} c={data.autores} />
          </div>
          <section aria-labelledby="recentes" className="space-y-3">
            <h2 id="recentes" className="text-lg font-semibold">Últimos livros cadastrados</h2>
            {data.recentes.length === 0 ? (
              <Empty title="Nenhum livro cadastrado ainda"><Link to="/livros/novo" className={btnCls('primary')}>Cadastrar o primeiro livro</Link></Empty>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
                {data.recentes.map((l) => (
                  <li key={l._id}>
                    <Link to={`/livros/${l._id}`} className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-surface-2">
                      <span className="font-medium">{l.titulo}</span>
                      <span className="text-sm text-muted">{autorObj(l.autor)?.nome ?? 'Autor removido'} · {l.editora} · {fmtPreco(l.preco)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
