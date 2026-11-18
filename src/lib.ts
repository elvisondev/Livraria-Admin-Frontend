import type { AutorRef, Livro } from './types'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const fmtPreco = (n?: number) => (typeof n === 'number' ? brl.format(n) : '—')
export const autorObj = (a: Livro['autor']): AutorRef | null => (a && typeof a === 'object' ? a : null)
export const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Erro inesperado.')
