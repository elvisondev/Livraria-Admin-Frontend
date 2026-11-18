import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, ConfirmDialog, Empty, ErrorBox, Field, Loading, Modal, PageHeader, Pager, iconBtn, inputCls, useToast } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { errMsg } from '../lib'
import { autoresApi } from '../services/api'
import type { Autor } from '../types'

type Modo = { tipo: 'ver' | 'editar'; id: string } | { tipo: 'novo' }

function AutorDialog({ modo, onMudar, onClose, onSaved }: { modo: Modo; onMudar: (m: Modo) => void; onClose: () => void; onSaved: (msg: string) => void }) {
  const id = modo.tipo === 'novo' ? '' : modo.id
  const somenteLeitura = modo.tipo === 'ver'
  const detalhe = useAsync(async () => (id ? autoresApi.obter(id) : null), [id])
  const [nome, setNome] = useState('')
  const [nacionalidade, setNacionalidade] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (detalhe.data) { setNome(detalhe.data.nome); setNacionalidade(detalhe.data.nacionalidade ?? '') }
  }, [detalhe.data])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) return setErro('Informe o nome do autor.')
    setErro('')
    setSalvando(true)
    const dto = { nome: nome.trim(), ...(nacionalidade.trim() ? { nacionalidade: nacionalidade.trim() } : {}) }
    try {
      if (id) { await autoresApi.atualizar(id, dto); onSaved('Autor atualizado.') }
      else { await autoresApi.criar(dto); onSaved('Autor cadastrado.') }
    } catch (err) {
      setErro(errMsg(err))
      setSalvando(false)
    }
  }

  const titulo = modo.tipo === 'novo' ? 'Novo autor' : modo.tipo === 'editar' ? 'Editar autor' : 'Detalhes do autor'
  return (
    <Modal title={titulo} onClose={onClose}>
      {id && detalhe.loading && !detalhe.data ? <Loading /> : detalhe.error ? <ErrorBox message={detalhe.error} onRetry={detalhe.reload} /> : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field label="Nome" htmlFor="a-nome"><input id="a-nome" className={inputCls} value={nome} readOnly={somenteLeitura} onChange={(e) => setNome(e.target.value)} /></Field>
          <Field label="Nacionalidade" htmlFor="a-nac"><input id="a-nac" className={inputCls} value={nacionalidade} readOnly={somenteLeitura} placeholder={somenteLeitura ? '—' : ''} onChange={(e) => setNacionalidade(e.target.value)} /></Field>
          {erro && <ErrorBox message={erro} />}
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>{somenteLeitura ? 'Fechar' : 'Cancelar'}</Button>
            {somenteLeitura ? <Button variant="primary" onClick={() => onMudar({ tipo: 'editar', id })}>Editar</Button> : <Button type="submit" variant="primary" loading={salvando}>{id ? 'Salvar alterações' : 'Cadastrar autor'}</Button>}
          </div>
        </form>
      )}
    </Modal>
  )
}

export default function Autores() {
  const [sp, setSp] = useSearchParams()
  const toast = useToast()
  const limite = 10
  const paginas = Math.max(1, Number(sp.get('paginas')) || 1)
  const { data, loading, error, reload } = useAsync(() => autoresApi.listar({ limite, paginas, ordenacao: 'nome:1' }), [paginas])
  const [modo, setModo] = useState<Modo | null>(null)
  const [apagar, setApagar] = useState<Autor | null>(null)
  const [apagando, setApagando] = useState(false)

  const irParaPagina = (p: number) => setSp(p > 1 ? { paginas: String(p) } : {})
  const handleSaved = (msg: string) => { toast('ok', msg); setModo(null); reload() }
  const handleExcluir = async () => {
    if (!apagar) return
    setApagando(true)
    try {
      await autoresApi.excluir(apagar._id)
      toast('ok', 'Autor excluído.')
      if (data?.length === 1 && paginas > 1) irParaPagina(paginas - 1)
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
      <PageHeader title="Autores">
        <Button variant="primary" onClick={() => setModo({ tipo: 'novo' })}><Plus className="size-4" />Novo autor</Button>
      </PageHeader>
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.length === 0 && (
        <Empty title={paginas > 1 ? 'Esta página está vazia' : 'Nenhum autor cadastrado ainda'}>
          {paginas > 1 ? <Button onClick={() => irParaPagina(paginas - 1)}>Voltar uma página</Button> : <Button variant="primary" onClick={() => setModo({ tipo: 'novo' })}>Cadastrar autor</Button>}
        </Empty>
      )}
      {data && data.length > 0 && (
        <>
          <div className={`overflow-x-auto rounded-xl border border-border bg-surface ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-border text-muted">
                <tr><th scope="col" className="p-3 font-medium">Nome</th><th scope="col" className="p-3 font-medium">Nacionalidade</th><th scope="col" className="p-3 text-right font-medium">Ações</th></tr>
              </thead>
              <tbody>
                {data.map((a) => (
                  <tr key={a._id} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium">{a.nome}</td>
                    <td className="p-3">{a.nacionalidade ?? '—'}</td>
                    <td className="p-1 text-right whitespace-nowrap">
                      <button type="button" className={iconBtn} aria-label={`Ver ${a.nome}`} onClick={() => setModo({ tipo: 'ver', id: a._id })}><Eye className="size-5" /></button>
                      <button type="button" className={iconBtn} aria-label={`Editar ${a.nome}`} onClick={() => setModo({ tipo: 'editar', id: a._id })}><Pencil className="size-5" /></button>
                      <button type="button" className={iconBtn} aria-label={`Excluir ${a.nome}`} onClick={() => setApagar(a)}><Trash2 className="size-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager pagina={paginas} limite={limite} qtd={data.length} onChange={irParaPagina} />
        </>
      )}
      {modo && <AutorDialog modo={modo} onMudar={setModo} onClose={() => setModo(null)} onSaved={handleSaved} />}
      {apagar && (
        <ConfirmDialog title="Excluir autor" confirmLabel="Excluir autor" busy={apagando} onCancel={() => setApagar(null)} onConfirm={handleExcluir}
          message={<>Excluir <strong className="text-text">{apagar.nome}</strong>? A API não impede a exclusão de autores com livros vinculados: esses livros ficarão sem autor.</>} />
      )}
    </div>
  )
}
