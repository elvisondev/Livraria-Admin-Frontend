import type { Autor, AutorInput, FiltrosLivro, Livro, LivroInput, PageParams } from '../types'

const BASE = String(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// Formato oficial de erro: { message, status }. `mesagem` (grafia antiga) e as demais ficam só como fallback.
function extrairMensagem(d: unknown): string | undefined {
  if (typeof d === 'string') return d.trim() && !d.trimStart().startsWith('<') ? d : undefined // ignora páginas HTML
  if (d && typeof d === 'object') {
    const o = d as Record<string, unknown>
    for (const k of ['message', 'mesagem', 'mensagem', 'erro', 'error']) {
      const v = o[k]
      if (typeof v === 'string' && v.trim()) return v
    }
  }
  return undefined
}

// Só usado quando a API não envia mensagem alguma.
function mensagemPadrao(status: number): string {
  if (status === 400) return 'Requisição inválida. Revise os dados enviados.'
  if (status === 404) return 'Recurso não encontrado.'
  if (status === 409) return 'Conflito: o recurso já existe.'
  if (status >= 500) return 'Erro interno do servidor. Tente novamente em instantes.'
  return `Erro ${status} ao falar com a API.`
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(BASE + path, {
      ...init,
      headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
    })
  } catch {
    throw new ApiError('Não foi possível conectar à API. Confirme que o servidor está rodando e revise VITE_API_BASE_URL.', 0)
  }
  const texto = await res.text()
  let corpo: unknown = null
  try {
    corpo = texto ? JSON.parse(texto) : null
  } catch {
    corpo = texto
  }
  if (!res.ok) throw new ApiError(extrairMensagem(corpo) ?? mensagemPadrao(res.status), res.status)
  return corpo as T
}

// URLSearchParams codifica os valores; parâmetros vazios são descartados.
export function qs(params: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') p.set(k, String(v))
  const s = p.toString()
  return s ? `?${s}` : ''
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) })

export const livrosApi = {
  listar: (p: PageParams) => request<Livro[]>(`/livros${qs(p)}`),
  buscar: (p: FiltrosLivro & PageParams) => request<Livro[]>(`/livros/busca${qs(p)}`),
  obter: (id: string) => request<Livro>(`/livros/${encodeURIComponent(id)}`),
  criar: (d: LivroInput) => request<{ message: string; livro: Livro }>('/livros', json('POST', d)),
  atualizar: (id: string, d: LivroInput) => request<{ message: string }>(`/livros/${encodeURIComponent(id)}`, json('PUT', d)),
  excluir: (id: string) => request<{ message: string }>(`/livros/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

export const autoresApi = {
  listar: (p: PageParams) => request<Autor[]>(`/autores${qs(p)}`),
  obter: (id: string) => request<Autor>(`/autores/${encodeURIComponent(id)}`),
  criar: (d: AutorInput) => request<{ message: string; autor: Autor }>('/autores', json('POST', d)),
  atualizar: (id: string, d: AutorInput) => request<{ message: string }>(`/autores/${encodeURIComponent(id)}`, json('PUT', d)),
  excluir: (id: string) => request<{ message: string }>(`/autores/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

// A API não devolve total. Contamos percorrendo as páginas do servidor até vir uma página incompleta.
// Se bater no teto de páginas, o total é só um mínimo (exato = false).
export async function contar(buscarPagina: (p: PageParams) => Promise<unknown[]>, tamanho = 100, maxPaginas = 20) {
  let total = 0
  for (let paginas = 1; paginas <= maxPaginas; paginas++) {
    const r = await buscarPagina({ limite: tamanho, paginas })
    total += r.length
    if (r.length < tamanho) return { total, exato: true }
  }
  return { total, exato: false }
}
