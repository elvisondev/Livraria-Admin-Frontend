# Livraria · Painel administrativo (front-end)

Painel Dark Tech em React + TypeScript + Vite + Tailwind que consome a API
[Livraria-API-NodeJS](https://github.com/elvisondev/Livraria-API-NodeJS). Nenhum dado é simulado.

## Como rodar

1. **API:** na pasta da API, configure o `.env` (`PORT` e `MONGODB_URI`) e rode `npm run dev`.
2. **Front:**
   ```bash
   cp .env.example .env     # ajuste VITE_API_PROXY_TARGET para a PORT da API
   npm install
   npm run dev              # abre em http://localhost:5173
   ```

`npm run build` gera a versão de produção em `dist/`.

## Variáveis (`.env`, apenas públicas)

| Variável | Padrão | Uso |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | URL base que o navegador chama. `/api` usa o proxy do Vite. |
| `VITE_API_PROXY_TARGET` | `http://localhost:3000` | Destino do proxy (a API Express). |

## CORS

A API **não configura CORS**. Em desenvolvimento isso é resolvido pelo proxy do Vite (nada muda na API).
Para chamar a API direto de outra origem (ex.: `VITE_API_BASE_URL=https://minha-api.com`), adicione
no `src/app.js`, antes de `routes(app)`:

```js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173') // origem do front
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})
```

## Contrato real da API (lido do código, branch `main`)

- Paginação: `limite` (padrão 5), **`paginas`** (não `pagina`) e `ordenacao=campo:1|-1` (padrão `_id:-1`).
- Listagens retornam um **array**, sem total. A interface mostra "Próxima" enquanto a página vier cheia.
- Erros: formato oficial `{ message, status }`. O cliente HTTP usa `message` e mantém `mesagem` (grafia antiga, ainda emitida pelo `ErroBase` no `main` público) apenas como fallback.
- `POST /livros` e `POST /autores` respondem `{ message, livro|autor }`; `PUT` e `DELETE` respondem `{ message }`.
- `GET /livros/:id` traz o autor completo (com `nacionalidade`); nas listagens vem só `{ _id, nome }`.
- Conflitos (409): livro com mesmo título, autor com mesmo nome.

## Pontos de atenção na API (não alterados)

- **Filtro `?autores=`:** corrigido na API (busca pelo ObjectId do autor); o front só envia `GET /livros/busca?autores=nome`.
- **`PUT` não valida:** `findByIdAndUpdate` sem `runValidators`; só o front valida na edição.
- **Excluir autor** não verifica livros vinculados; eles ficam com `autor: null` (a interface mostra "Autor removido").
- `package.json` tem a dependência `mogoose` (typo de `mongoose`); pode ser removida.

## Estrutura

`src/services/api.ts` (cliente HTTP) · `src/types.ts` · `src/pages/` · `src/components/` · `src/hooks/`
