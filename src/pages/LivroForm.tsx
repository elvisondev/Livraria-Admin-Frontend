import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, ErrorBox, Field, Loading, PageHeader, btnCls, inputCls, useToast } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { autorObj, errMsg } from '../lib'
import { autoresApi, editorasExistentes, livrosApi } from '../services/api'
import type { Autor, LivroInput } from '../types'

type Estado = { titulo: string; editora: string; preco: string; paginas: string; autor: string }
type Erros = Partial<Record<keyof Estado, string>>
const vazio: Estado = { titulo: '', editora: '', preco: '', paginas: '', autor: '' }
const TAM_AUTORES = 50

// Validação só para UX; o back-end continua sendo a fonte de verdade.
function validar(f: Estado): Erros {
  const e: Erros = {}
  if (!f.titulo.trim()) e.titulo = 'Informe o título.'
  if (!f.editora.trim()) e.editora = 'Informe a editora.'
  if (!f.autor) e.autor = 'Escolha um autor.'
  if (f.preco.trim() !== '') {
    const n = Number(f.preco)
    if (!Number.isFinite(n) || n <= 0) e.preco = 'O preço deve ser um número maior que zero.'
  }
  if (f.paginas.trim() !== '') {
    const n = Number(f.paginas)
    if (!Number.isInteger(n) || n < 10 || n > 1000) e.paginas = 'O número de páginas deve ser um inteiro entre 10 e 1000.'
  }
  return e
}

export default function LivroForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const [f, setF] = useState<Estado>(vazio)
  const [erros, setErros] = useState<Erros>({})
  const [erroApi, setErroApi] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [autores, setAutores] = useState<Autor[]>([])
  const [pagAutores, setPagAutores] = useState(0)
  const [temMais, setTemMais] = useState(true)
  const [carregandoAut, setCarregandoAut] = useState(false)
  const [erroAut, setErroAut] = useState('')

  const livro = useAsync(async () => (id ? livrosApi.obter(id) : null), [id])
  // Sugestões opcionais: se a busca falhar, o campo segue como texto livre.
  const [sugestoes, setSugestoes] = useState<string[]>([])
  useEffect(() => { editorasExistentes().then(setSugestoes).catch(() => undefined) }, [])

  const carregarAutores = async () => {
    const proxima = pagAutores + 1
    setCarregandoAut(true)
    setErroAut('')
    try {
      const r = await autoresApi.listar({ limite: TAM_AUTORES, paginas: proxima, ordenacao: 'nome:1' })
      setAutores((s) => [...s, ...r.filter((a) => !s.some((x) => x._id === a._id))])
      setPagAutores(proxima)
      setTemMais(r.length === TAM_AUTORES)
    } catch (e) {
      setErroAut(errMsg(e))
    } finally {
      setCarregandoAut(false)
    }
  }
  useEffect(() => { void carregarAutores() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const atual = livro.data ? autorObj(livro.data.autor) : null
  useEffect(() => {
    const l = livro.data
    if (!l) return
    setF({ titulo: l.titulo, editora: l.editora, preco: l.preco?.toString() ?? '', paginas: l.paginas?.toString() ?? '', autor: autorObj(l.autor)?._id ?? '' })
  }, [livro.data])

  // O autor atual pode não estar na página já carregada do select.
  const opcoes = atual && !autores.some((a) => a._id === atual._id) ? [atual, ...autores] : autores

  const handleCampo = (k: keyof Estado) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }))

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    setErroApi('')
    const v = validar(f)
    setErros(v)
    if (Object.keys(v).length) return
    const dto: LivroInput = { titulo: f.titulo.trim(), editora: f.editora.trim(), autor: f.autor } // autor = ObjectId
    if (f.preco.trim() !== '') dto.preco = Number(f.preco)
    if (f.paginas.trim() !== '') dto.paginas = Number(f.paginas)
    setSalvando(true)
    try {
      if (id) {
        await livrosApi.atualizar(id, dto)
        toast('ok', 'Livro atualizado.')
        nav(`/livros/${id}`)
      } else {
        const r = await livrosApi.criar(dto)
        toast('ok', 'Livro cadastrado.')
        nav(`/livros/${r.livro._id}`)
      }
    } catch (e) {
      setErroApi(errMsg(e))
    } finally {
      setSalvando(false)
    }
  }

  if (id && livro.loading && !livro.data) return <Loading />
  if (id && livro.error) return <ErrorBox message={livro.error} onRetry={livro.reload} />

  return (
    <div className="max-w-xl space-y-5">
      <PageHeader title={id ? 'Editar livro' : 'Novo livro'} />
      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <Field label="Título" htmlFor="titulo" error={erros.titulo}>
          <input id="titulo" placeholder="Ex.: Entendendo Algoritmos" className={inputCls} value={f.titulo} onChange={handleCampo('titulo')} aria-invalid={Boolean(erros.titulo)} />
        </Field>
        <Field label="Editora" htmlFor="editora" error={erros.editora}>
          <input id="editora" list="editoras-sugeridas" autoComplete="off" placeholder="Ex.: Novatec" className={inputCls} value={f.editora} onChange={handleCampo('editora')} aria-invalid={Boolean(erros.editora)} />
          <datalist id="editoras-sugeridas">{sugestoes.map((e) => <option key={e} value={e} />)}</datalist>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preço (R$)" htmlFor="preco" error={erros.preco}>
            <input id="preco" placeholder="Ex.: 59,90" type="number" min="0.01" step="0.01" className={inputCls} value={f.preco} onChange={handleCampo('preco')} aria-invalid={Boolean(erros.preco)} />
          </Field>
          <Field label="Páginas" htmlFor="paginas" error={erros.paginas} hint="Entre 10 e 1000.">
            <input id="paginas" placeholder="Ex.: 256" type="number" min="10" max="1000" step="1" className={inputCls} value={f.paginas} onChange={handleCampo('paginas')} aria-invalid={Boolean(erros.paginas)} />
          </Field>
        </div>
        <Field label="Autor" htmlFor="autor" error={erros.autor}>
          <select id="autor" className={inputCls} value={f.autor} onChange={handleCampo('autor')} aria-invalid={Boolean(erros.autor)}>
            <option value="">Selecione…</option>
            {opcoes.map((a) => <option key={a._id} value={a._id}>{a.nome}</option>)}
          </select>
        </Field>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          {temMais && pagAutores > 0 && <Button onClick={() => void carregarAutores()} loading={carregandoAut}>Carregar mais autores</Button>}
          {!carregandoAut && autores.length === 0 && !erroAut && <span>Nenhum autor cadastrado. <Link to="/autores" className="text-primary underline">Cadastre um autor</Link> primeiro.</span>}
          {erroAut && <span role="alert" className="text-danger">{erroAut}</span>}
        </div>
        {erroApi && <ErrorBox message={erroApi} />}
        <div className="flex flex-wrap justify-end gap-2">
          <Link to={id ? `/livros/${id}` : '/livros'} className={btnCls('ghost')}>Cancelar</Link>
          <Button type="submit" variant="primary" loading={salvando}>{id ? 'Salvar alterações' : 'Cadastrar livro'}</Button>
        </div>
      </form>
    </div>
  )
}
