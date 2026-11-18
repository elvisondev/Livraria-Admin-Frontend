export type AutorRef = { _id: string; nome: string; nacionalidade?: string }
export type Autor = AutorRef

// `autor` varia: objeto { _id, nome } nas listagens, com nacionalidade no GET /livros/:id,
// e null se o autor foi excluído (a API não impede essa exclusão).
export type Livro = {
  _id: string
  titulo: string
  editora: string
  preco?: number
  paginas?: number
  autor: AutorRef | string | null
}

// No envio, `autor` é sempre o ObjectId (string).
export type LivroInput = { titulo: string; editora: string; autor: string; preco?: number; paginas?: number }
export type AutorInput = { nome: string; nacionalidade?: string }

// A API usa `paginas` (número da página), não `pagina`. Ver middlewares/paginar.js.
export type PageParams = { limite: number; paginas: number; ordenacao?: string }
export type FiltrosLivro = { titulo?: string; editora?: string; autores?: string; precoMin?: string; precoMax?: string }
