import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { Button, ConfirmDialog, Empty, ErrorBox, Field, Loading, PageHeader, Pager, btnCls, iconBtn, inputCls, useToast } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { autorObj, errMsg, fmtPreco } from '../lib'
import { livrosApi } from '../services/api'
import type { Livro } from '../types'

const ORDENS = [
  ['_id:-1', 'Mais recentes'], ['titulo:1', 'Título (A–Z)'], ['titulo:-1', 'Título (Z–A)'],
  ['preco:1', 'Menor preço'], ['preco:-1', 'Maior preço'], ['paginas:1', 'Menos páginas'],
  ['paginas:-1', 'Mais páginas'], ['editora:1', 'Editora (A–Z)'],
] as const
const LIMITES = [5, 10, 20, 50]
const FILTROS = ['titulo', 'editora', 'autores', 'precoMin', 'precoMax'] as const
type Filtros = Record<(typeof FILTROS)[number], string>

export default function Livros() {
  const [sp, setSp] = useSearchParams()
  const toast = useToast()
  const limite = Number(sp.get('limite')) || 10
  const paginas = Math.max(1, Number(sp.get('paginas')) || 1)
  const ordenacao = sp.get('ordenacao') || '_id:-1'
  const filtros = Object.fromEntries(FILTROS.map((k) => [k, sp.get(k) ?? ''])) as Filtros
  const ativo = FILTROS.some((k) => filtros[k])

  const [form, setForm] = useState<Filtros>(filtros)
  const [formErro, setFormErro] = useState('')
  const [apagar, setApagar] = useState<Livro | null>(null)
  const [apagando, setApagando] = useState(false)

  const { data, loading, error, reload } = useAsync(
    () => (ativo ? livrosApi.buscar({ ...filtros, limite, paginas, ordenacao }) : livrosApi.listar({ limite, paginas, ordenacao })),
    [sp.toString()],
  )

  const atualizar = (mudancas: Record<string, string | undefined>) => {
    const n = new URLSearchParams(sp)
    for (const [k, v] of Object.entries(mudancas)) (v ? n.set(k, v) : n.delete(k))
    setSp(n)
  }
  const handleCampo = (k: keyof Filtros) => (e: ChangeEvent<HTMLInputElement>) => setForm((s) => ({ ...s, [k]: e.target.value }))

  const handleAplicar = (e: FormEvent) => {
    e.preventDefault()
    const { precoMin, precoMax } = form
    if (precoMin !== '' && !(Number(precoMin) > 0)) return setFormErro('O preço mínimo deve ser maior que zero.')
    if (precoMax !== '' && !(Number(precoMax) > 0)) return setFormErro('O preço máximo deve ser maior que zero.')
    if (precoMin !== '' && precoMax !== '' && Number(precoMin) > Number(precoMax)) return setFormErro('O preço mínimo não pode ser maior que o máximo.')
    setFormErro('')
    atualizar({ ...Object.fromEntries(FILTROS.map((k) => [k, form[k].trim()])), paginas: undefined })
  }
  const handleLimpar = () => {
    setForm(Object.fromEntries(FILTROS.map((k) => [k, ''])) as Filtros)
    setFormErro('')
    atualizar({ ...Object.fromEntries(FILTROS.map((k) => [k, undefined])), paginas: undefined })
  }
  const handleExcluir = async () => {
    if (!apagar) return
    setApagando(true)
    try {
      await livrosApi.excluir(apagar._id)
      toast('ok', 'Livro excluído.')
      if (data?.length === 1 && paginas > 1) atualizar({ paginas: String(paginas - 1) })
      else reload()
    } catch (e) {
      toast('erro', errMsg(e))
    } finally {
      setApagando(false)
      setApagar(null)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Livros">
        <Link to="/livros/novo" className={btnCls('primary')}><Plus className="size-4" aria-hidden />Novo livro</Link>
      </PageHeader>

      <form onSubmit={handleAplicar} noValidate className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Título" htmlFor="f-titulo"><input id="f-titulo" placeholder="Ex.: Algoritmos" className={inputCls} value={form.titulo} onChange={handleCampo('titulo')} /></Field>
        <Field label="Editora" htmlFor="f-editora"><input id="f-editora" placeholder="Ex.: Novatec" className={inputCls} value={form.editora} onChange={handleCampo('editora')} /></Field>
        <Field label="Autor" htmlFor="f-autores"><input id="f-autores" placeholder="Ex.: Robert C. Martin" className={inputCls} value={form.autores} onChange={handleCampo('autores')} /></Field>
        <Field label="Preço mínimo" htmlFor="f-min"><input id="f-min" placeholder="Ex.: 20,00" type="number" min="0" step="0.01" className={inputCls} value={form.precoMin} onChange={handleCampo('precoMin')} /></Field>
        <Field label="Preço máximo" htmlFor="f-max"><input id="f-max" placeholder="Ex.: 150,00" type="number" min="0" step="0.01" className={inputCls} value={form.precoMax} onChange={handleCampo('precoMax')} /></Field>
        <div className="flex flex-wrap items-end gap-3 sm:col-span-2 lg:col-span-5">
          <div className="flex w-full flex-col gap-2 sm:contents">
            <Button type="submit" variant="primary"><Search className="size-4" />Aplicar filtros</Button>
            <Button onClick={handleLimpar} disabled={!ativo && !Object.values(form).some(Boolean)}><X className="size-4" />Limpar filtros</Button>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 sm:contents">
            <div className="min-w-0 sm:w-44"><Field label="Ordenar por" htmlFor="o-ord">
              <select id="o-ord" className={inputCls} value={ordenacao} onChange={(e) => atualizar({ ordenacao: e.target.value, paginas: undefined })}>
                {ORDENS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select></Field></div>
            <div className="min-w-0 sm:w-32"><Field label="Por página" htmlFor="o-lim">
              <select id="o-lim" className={inputCls} value={limite} onChange={(e) => atualizar({ limite: e.target.value, paginas: undefined })}>
                {LIMITES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select></Field></div>
          </div>
        </div>
        {formErro && <p role="alert" className="text-sm text-danger sm:col-span-2 lg:col-span-5">{formErro}</p>}
        <p className="text-xs text-muted sm:col-span-2 lg:col-span-5">
          Título e editora ignoram maiúsculas, mas não acentos (“fenix” ≠ “Fênix”). O filtro de autor usa o primeiro autor cujo nome contém o texto.
        </p>
      </form>

      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.length === 0 && (
        <Empty title={paginas > 1 ? 'Esta página está vazia' : ativo ? 'Nenhum livro encontrado com esses filtros' : 'Nenhum livro cadastrado ainda'}>
          {paginas > 1 ? <Button onClick={() => atualizar({ paginas: String(paginas - 1) })}>Voltar uma página</Button> : ativo ? <Button onClick={handleLimpar}>Limpar filtros</Button> : <Link to="/livros/novo" className={btnCls('primary')}>Cadastrar livro</Link>}
        </Empty>
      )}
      {data && data.length > 0 && (
        <>
          <div className={`hidden overflow-x-auto rounded-xl border border-border bg-surface md:block ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-b border-border text-muted">
                <tr>{['Título', 'Editora', 'Preço', 'Páginas', 'Autor'].map((h) => <th key={h} scope="col" className="p-3 font-medium">{h}</th>)}<th scope="col" className="p-3 text-right font-medium">Ações</th></tr>
              </thead>
              <tbody>
                {data.map((l) => (
                  <tr key={l._id} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium"><Link to={`/livros/${l._id}`} className="hover:text-primary">{l.titulo}</Link></td>
                    <td className="p-3">{l.editora}</td>
                    <td className="p-3 font-mono">{fmtPreco(l.preco)}</td>
                    <td className="p-3 font-mono">{l.paginas ?? '—'}</td>
                    <td className="p-3">{autorObj(l.autor)?.nome ?? <span className="text-muted">Autor removido</span>}</td>
                    <td className="p-1 text-right whitespace-nowrap">
                      <Link to={`/livros/${l._id}`} className={iconBtn} aria-label={`Ver ${l.titulo}`}><Eye className="size-5" /></Link>
                      <Link to={`/livros/${l._id}/editar`} className={iconBtn} aria-label={`Editar ${l.titulo}`}><Pencil className="size-5" /></Link>
                      <button type="button" className={iconBtn} aria-label={`Excluir ${l.titulo}`} onClick={() => setApagar(l)}><Trash2 className="size-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className={`space-y-3 md:hidden ${loading ? 'opacity-60' : ''}`}>
            {data.map((l) => (
              <li key={l._id} className="rounded-xl border border-border bg-surface p-4">
                <Link to={`/livros/${l._id}`} className="block break-words font-medium hover:text-primary">{l.titulo}</Link>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div className="min-w-0"><dt className="text-muted">Editora</dt><dd className="break-words">{l.editora}</dd></div>
                  <div className="min-w-0"><dt className="text-muted">Autor</dt><dd className="break-words">{autorObj(l.autor)?.nome ?? <span className="text-muted">Autor removido</span>}</dd></div>
                  <div><dt className="text-muted">Preço</dt><dd className="font-mono">{fmtPreco(l.preco)}</dd></div>
                  <div><dt className="text-muted">Páginas</dt><dd className="font-mono">{l.paginas ?? '—'}</dd></div>
                </dl>
                <div className="mt-3 flex justify-end gap-1 border-t border-border pt-2">
                  <Link to={`/livros/${l._id}`} className={iconBtn} aria-label={`Ver ${l.titulo}`}><Eye className="size-5" /></Link>
                  <Link to={`/livros/${l._id}/editar`} className={iconBtn} aria-label={`Editar ${l.titulo}`}><Pencil className="size-5" /></Link>
                  <button type="button" className={iconBtn} aria-label={`Excluir ${l.titulo}`} onClick={() => setApagar(l)}><Trash2 className="size-5" /></button>
                </div>
              </li>
            ))}
          </ul>
          <Pager pagina={paginas} limite={limite} qtd={data.length} onChange={(p) => atualizar({ paginas: String(p) })} />
        </>
      )}
      {apagar && (
        <ConfirmDialog title="Excluir livro" confirmLabel="Excluir livro" busy={apagando} onCancel={() => setApagar(null)} onConfirm={handleExcluir}
          message={<>Excluir <strong className="text-text">{apagar.titulo}</strong>? Essa ação não pode ser desfeita.</>} />
      )}
    </div>
  )
}
