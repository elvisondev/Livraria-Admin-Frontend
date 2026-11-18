
# 📚 Livraria Admin — Front-end

Painel administrativo **Dark Tech** desenvolvido com **React, TypeScript, Vite e Tailwind CSS** para consumir a [Livraria API em Node.js](https://github.com/elvisondev/Livraria-API-NodeJS).

O projeto oferece uma interface visual para gerenciar livros e autores armazenados no **MongoDB Atlas**, por meio da API Express. **Não utiliza dados simulados**: as consultas e alterações dependem da API em execução.

> **Escopo:** este repositório contém somente o front-end. As regras de negócio, a persistência e os endpoints estão no repositório da API.

## 🚀 Tecnologias

- React 18 e TypeScript
- Vite 6
- Tailwind CSS 4
- React Router DOM
- Lucide React (ícones)
- Fetch API para requisições HTTP

## ✨ Funcionalidades

### Dashboard
- Visão geral com contagem de livros e autores.
- Exibição de livros recentes.
- Atalhos para cadastro e navegação.
- Indicadores calculados a partir de consultas à API, sem dados fictícios.

### Gerenciamento de livros
- Listagem, visualização de detalhes, cadastro, edição e exclusão.
- Filtros combináveis por **título, editora, nome do autor e faixa de preço**.
- Ordenação por data de cadastro (via `_id`), título, preço, páginas e editora.
- Paginação configurável: 5, 10, 20 ou 50 registros por página.
- Campo de editora com **digitação livre** e sugestões obtidas dos livros existentes.
- Seleção de autores cadastrados, com carregamento adicional quando necessário.
- Validações no formulário: título, editora e autor obrigatórios; preço positivo quando informado; páginas inteiras entre 10 e 1000 quando informadas.

### Gerenciamento de autores
- Listagem, visualização, cadastro, edição e exclusão.
- Cadastro com nome e nacionalidade.
- Paginação de autores e ordenação por nome.
- Confirmação antes de excluir registros.

### Interface
- Tema Dark Tech com navegação lateral.
- Layout responsivo: tabelas em telas maiores e **cards para livros e autores em dispositivos móveis**.
- Estados de carregamento, ausência de resultados, mensagens de erro e notificações.
- Formulários com exemplos de preenchimento (placeholders).

## 🧭 Páginas e rotas

| Rota | Finalidade |
| --- | --- |
| `/` | Dashboard |
| `/livros` | Listagem, filtros e ações sobre livros |
| `/livros/novo` | Cadastro de livro |
| `/livros/:id` | Detalhes de um livro |
| `/livros/:id/editar` | Edição de livro |
| `/autores` | Listagem e gerenciamento de autores, com formulários em modal |

## 🔗 Integração com a API

O front consome os endpoints REST da [Livraria-API-NodeJS](https://github.com/elvisondev/Livraria-API-NodeJS).

| Recurso | Métodos utilizados |
| --- | --- |
| `/livros` | `GET`, `POST` |
| `/livros/busca` | `GET` com filtros |
| `/livros/:id` | `GET`, `PUT`, `DELETE` |
| `/autores` | `GET`, `POST` |
| `/autores/:id` | `GET`, `PUT`, `DELETE` |

As listagens aceitam os parâmetros `limite`, **`paginas`** e `ordenacao`. A busca de livros aceita `titulo`, `editora`, `autores`, `precoMin` e `precoMax`.

O cliente HTTP está centralizado em `src/services/api.ts` e prioriza a propriedade `message` nas respostas de erro, com compatibilidade para grafias legadas como `mesagem` e `mensagem`.

> A API retorna arrays nas listagens, sem informar a quantidade total de registros. Por isso, o botão **Próxima** depende da quantidade recebida na página atual. As contagens do dashboard percorrem páginas da API até um limite definido no cliente.

## ⚙️ Como executar localmente

**Pré-requisitos:** Node.js e npm, acesso a uma instância MongoDB Atlas e a API configurada.

### 1. Inicie a API

Em outro terminal, clone e configure o back-end:

```bash
git clone https://github.com/elvisondev/Livraria-API-NodeJS.git
cd Livraria-API-NodeJS
npm install
```

Crie o `.env` do back-end com `PORT` e `MONGODB_URI`, conforme as instruções do [repositório da API](https://github.com/elvisondev/Livraria-API-NodeJS). Depois execute:

```bash
npm run dev
```

Por padrão, os exemplos consideram a API em `http://localhost:3000`.

### 2. Inicie o front-end

Em outro terminal:

```bash
git clone https://github.com/elvisondev/Livraria-Admin-Frontend.git
cd Livraria-Admin-Frontend
npm install
```

Copie `.env.example` para `.env` e confira as variáveis:

```dotenv
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:3000
```

Inicie o Vite:

```bash
npm run dev
```

Acesse **http://localhost:5173** (ou a porta indicada pelo Vite).

### Scripts disponíveis

| Comando | Função |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite |
| `npm run build` | Verifica tipos com `tsc --noEmit` e gera `dist/` |
| `npm run preview` | Pré-visualiza o build localmente |

## 🌐 Proxy e CORS

Em desenvolvimento, o Vite encaminha as chamadas iniciadas por `/api` para o endereço definido em `VITE_API_PROXY_TARGET`, removendo o prefixo `/api`.

Exemplo: a chamada do navegador a `/api/livros` chega ao Express como `/livros`.

Isso permite desenvolver localmente **sem configurar CORS no back-end**. Para hospedar front e API em origens diferentes, será necessário configurar a política de CORS na API ou utilizar um proxy reverso apropriado. O proxy de desenvolvimento do Vite não é uma solução de produção.

> Variáveis com prefixo `VITE_` ficam acessíveis ao código do cliente: **nunca armazene senhas ou credenciais do MongoDB nelas**.

## 📁 Estrutura principal

```text
src/
├── components/        # Layout, navegação, modais e elementos de interface
├── hooks/             # Hooks reutilizáveis para consultas assíncronas
├── pages/             # Dashboard, Livros, LivroForm, LivroDetalhe e Autores
├── services/
│   └── api.ts         # Cliente HTTP e integração com a API
├── App.tsx            # Rotas da aplicação
└── types.ts           # Tipos TypeScript de livros, autores e filtros
```

## ⚠️ Limitações e observações

- **Sem autenticação ou controle de permissões:** o painel não implementa login nem perfis de acesso. Não deve ser exposto publicamente com operações administrativas liberadas sem proteção adicional na API.
- **Dependência do back-end:** sem a API e o banco acessíveis, o painel não consegue consultar ou persistir dados.
- **Contagem e sugestões por paginação:** o dashboard e a lista de editoras percorrem um número limitado de páginas; em bases muito grandes, podem não abranger todos os registros.
- **Exclusão de autores:** a API não bloqueia a exclusão de autores vinculados a livros. A interface avisa sobre o risco, mas a integridade referencial deve ser tratada no back-end.
- **Validações do cliente:** melhoram a experiência de uso, mas não substituem as validações do servidor.
- **Sem testes automatizados de front-end documentados:** o script `build` verifica tipos e compilação; não equivale a testes de interface ou integração.

## 🎯 Objetivo

Disponibilizar uma interface administrativa para **demonstrar, consumir e testar visualmente** as funcionalidades da Livraria API, mantendo o desenvolvimento back-end como projeto principal.

O painel foi desenvolvido **com auxílio de inteligência artificial**, enquanto o projeto da API foi construído e evoluído durante os estudos de desenvolvimento back-end.

---

**Projeto de estudos — [Elvison](https://github.com/elvisondev)**

**Back-end:** [Livraria-API-NodeJS](https://github.com/elvisondev/Livraria-API-NodeJS)
**Front-end:** [Livraria-Admin-Frontend](https://github.com/elvisondev/Livraria-Admin-Frontend)
