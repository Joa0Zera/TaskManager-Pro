# TaskManager Pro

Sistema moderno de gerenciamento de tarefas e produtividade, inspirado em Trello, Notion, Linear e Jira. Aplicação Full Stack com visual SaaS profissional, ideal para portfólio.

![TaskManager Pro](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS%20%7C%20Node%20%7C%20MySQL-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Descrição

O **TaskManager Pro** permite que usuários organizem tarefas com prioridades, categorias e status, acompanhem métricas de produtividade em um dashboard intuitivo e gerenciem seu fluxo de trabalho com autenticação segura.

## Funcionalidades

- Autenticação (cadastro, login, logout) com JWT e bcrypt
- Dashboard com estatísticas em tempo real
- CRUD completo de tarefas
- Filtros por prioridade, categoria e status
- Busca por título/descrição
- Prioridades: baixa, média, alta
- Categorias: trabalho, estudos, pessoal
- Status: pendente, em andamento, concluída
- Landing page profissional
- Design responsivo (desktop, tablet, mobile)
- Modal para criar/editar tarefas

## Tecnologias

| Camada | Tecnologias |
|--------|-------------|
| Front-end | HTML5, CSS3, JavaScript Vanilla |
| Back-end | Node.js, Express.js |
| Banco de dados | MySQL |
| Autenticação | JWT, bcryptjs |
| Deploy | Vercel (front), Render (back) |

## Estrutura do Projeto

```
TaskManager-Pro/
├── frontend/          # Interface (Vercel)
│   ├── index.html     # Landing page
│   ├── login.html
│   ├── cadastro.html
│   ├── dashboard.html
│   ├── css/
│   ├── js/
│   └── assets/
├── backend/           # API REST (Render)
│   ├── server.js
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middlewares/
│   └── database/
└── README.md
```

## Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [MySQL](https://www.mysql.com/) 8+
- Live Server ou extensão similar (opcional, para o front)

### 1. Banco de dados

```bash
mysql -u root -p < backend/database/schema.sql
```

### 2. Back-end

```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais MySQL e JWT_SECRET
npm install
npm run dev
```

A API estará em `http://localhost:3000`.

### 3. Front-end

Abra a pasta `frontend` com Live Server (porta 5500) ou:

```bash
npx serve frontend -p 5500
```

Acesse `http://localhost:5500`.

> Configure `FRONTEND_URL` no `.env` do backend para CORS.

## Execução

| Serviço | Comando | URL |
|---------|---------|-----|
| API | `npm run dev` (em `backend/`) | http://localhost:3000 |
| Front | Live Server / `npx serve frontend` | http://localhost:5500 |

### Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Usuário autenticado |
| GET | `/api/tasks` | Listar tarefas (+ filtros) |
| POST | `/api/tasks` | Criar tarefa |
| PUT | `/api/tasks/:id` | Atualizar tarefa |
| DELETE | `/api/tasks/:id` | Excluir tarefa |

Query params para filtros: `?prioridade=alta&categoria=trabalho&status=pendente&search=texto`

## Deploy

### Front-end (Vercel)

1. Conecte o repositório na [Vercel](https://vercel.com)
2. **Root Directory:** `frontend`
3. Framework Preset: **Other**
4. Deploy

Atualize `API.BASE_URL` em `frontend/js/api.js` com a URL da API em produção.

### Back-end (Render)

1. Crie um **Web Service** em [Render](https://render.com)
2. Root: `backend`
3. Build: `npm install`
4. Start: `npm start`
5. Variáveis de ambiente:

```
PORT=3000
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=taskmanager_pro
JWT_SECRET=chave_segura_longa
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://seu-app.vercel.app
```

Use um MySQL hospedado (PlanetScale, Railway, Render PostgreSQL não — use MySQL compatível).

## Screenshots

> Adicione capturas da landing page, login e dashboard após rodar o projeto.

| Landing | Dashboard |
|---------|-----------|
| _screenshot_ | _screenshot_ |

## Design System

- **Tema:** Dark Modern SaaS
- **Fonte:** Poppins (Google Fonts)
- **Cores:** `#0F172A`, `#1E293B`, `#3B82F6`, `#22C55E`, `#EF4444`, `#F8FAFC`

## Autor

Desenvolvido como projeto de portfólio Full Stack — **TaskManager Pro**.

---

MIT License © 2026
