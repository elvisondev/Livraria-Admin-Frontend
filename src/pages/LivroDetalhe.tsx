import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { ErrorBox, Loading, PageHeader, btnCls } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { autorObj, fmtPreco } from '../lib'
import { livrosApi } from '../services/api'

export default function LivroDetalhe() {
  const { id = '' } = useParams()
  const { data: l, loading, error, reload } = useAsync(() => livrosApi.obter(id), [id])
  const autor = l ? autorObj(l.autor) : null

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title={l?.titulo ?? 'Detalhes do livro'}>
        <Link to="/livros" className={btnCls('ghost')}><ArrowLeft className="size-4" aria-hidden />Voltar ao catálogo</Link>
        {l && <Link to={`/livros/${l._id}/editar`} className={btnCls('primary')}><Pencil className="size-4" aria-hidden />Editar</Link>}
      </PageHeader>
      {loading && !l && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {l && (
        <dl className="grid gap-x-6 gap-y-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
          {[
            ['Título', l.titulo],
            ['Editora', l.editora],
            ['Preço', fmtPreco(l.preco)],
            ['Páginas', l.paginas ?? '—'],
            ['Autor', autor?.nome ?? 'Autor removido'],
            ['Nacionalidade do autor', autor?.nacionalidade ?? '—'],
          ].map(([t, v]) => (
            <div key={t}>
              <dt className="text-sm text-muted">{t}</dt>
              <dd className="mt-0.5 font-medium">{v}</dd>
            </div>
          ))}
          <div className="sm:col-span-2">
            <dt className="text-sm text-muted">ID</dt>
            <dd className="mt-0.5 font-mono text-sm">{l._id}</dd>
          </div>
        </dl>
      )}
    </div>
  )
}
