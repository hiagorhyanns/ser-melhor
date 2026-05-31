# Ser Melhor

Guia pessoal de estilo, cuidados e presença visual. Organize em um só lugar marcas favoritas, lojas, rotinas de barba e cabelo, produtos, roupas, postura e exercícios.

> Originalmente gerado no Google AI Studio, agora preparado para desenvolvimento local com **VS Code + Windows**.

---

## Stack

- **React 19** + TypeScript
- **Vite 6** (dev server + build)
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **React Router 7** (SPA, 9 rotas client-side)
- **Framer Motion** (animações)
- **Lucide React** (ícones)
- Persistência em **`localStorage`** (chave `vestir_melhor_data`)

> O `@google/genai` e `express` constam no `package.json` mas **ainda não são usados** — serão ativados nas próximas fases (ver [ROADMAP](docs/ROADMAP.md)).

---

## Setup local (Windows + VS Code)

**Pré-requisitos:** [Node.js 20+](https://nodejs.org/), Git e VS Code.

```powershell
# 1. Clonar / abrir a pasta
cd E:\Projetos\Ser-melhor

# 2. Instalar dependências
npm install

# 3. Criar arquivo de variáveis de ambiente local
Copy-Item .env.example .env.local
# Abra .env.local e preencha GEMINI_API_KEY quando for usar a IA (Fase 2).

# 4. Subir o app em modo dev
npm run dev
```

O Vite abre em **http://localhost:3000**.

Ao abrir a pasta no VS Code pela primeira vez, ele vai sugerir instalar as extensões recomendadas (ESLint, Prettier, Tailwind CSS IntelliSense, Pretty TS Errors, EditorConfig). Aceite — todas estão pré-configuradas para esse projeto.

---

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Sobe o Vite dev server em `:3000` com HMR |
| `npm run build` | Gera build de produção em `dist/` |
| `npm run preview` | Serve o `dist/` localmente para teste |
| `npm run typecheck` | Roda `tsc --noEmit` (só checagem de tipos) |
| `npm run lint` | Roda ESLint em todo o projeto |
| `npm run format` | Formata `src/` com Prettier (inclui ordenação Tailwind) |
| `npm run format:check` | Verifica formatação sem alterar arquivos |
| `npm run clean` | Apaga `dist/` (usa `rimraf`, cross-platform) |

---

## Estrutura

```
Ser-melhor/
├── src/
│   ├── components/     # Card, Layout, PageHeader (reutilizáveis)
│   ├── hooks/          # useAppData (state global + localStorage)
│   ├── lib/            # utils (helper cn())
│   ├── views/          # 9 telas: Dashboard + 8 categorias
│   ├── App.tsx         # roteador
│   ├── main.tsx        # entry point
│   ├── types.ts        # interfaces TypeScript
│   └── index.css       # Tailwind + custom scrollbar
├── docs/
│   └── ROADMAP.md      # fases futuras
├── .vscode/            # extensões e settings recomendados
├── index.html
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── .prettierrc.json
├── .editorconfig
└── package.json
```

### As 9 telas

`/` Dashboard · `/marcas` · `/lojas` · `/barba` · `/cabelo` · `/produtos` · `/roupas` · `/postura` · `/musculos`

Cada tela temática segue o mesmo padrão: header com busca + botão "ADICIONAR ITEM" → modal com formulário → grid de cards animados (`Card.tsx`) com edit/delete/toggle-complete.

---

## Estado e persistência

Todo o estado mora em `localStorage` sob a chave **`vestir_melhor_data`**.

- O hook `useAppData()` (em `src/hooks/useAppData.ts`) é a única porta de entrada para leitura/escrita
- API: `addItem(section, item)`, `updateItem(section, id, patch)`, `deleteItem(section, id)`, `toggleComplete(section, id)`
- Itens completos vão para o fim da lista; novos itens não-completos vão para o início
- **Sem backend, sem auth, sem multi-usuário** (a Fase 3 do roadmap aborda isso)

Para resetar o app, basta abrir DevTools → Application → Local Storage → apagar a chave.

---

## Dependências dormentes

Estas libs estão instaladas mas ainda não usadas:

- **`@google/genai`** — pré-carregada para a integração com Gemini (Fase 2: sugestões de looks por ocasião, recomendações de produtos por perfil, etc.)
- **`express`** + **`@types/express`** — sobra do template do AI Studio; será removida ou usada quando definirmos o backend (Fase 3)
- **`dotenv`** — útil quando houver scripts node fora do bundle do Vite

Não removidas ainda para preservar o `package-lock.json` original em caso de rollback.

---

## Roadmap

Próximas fases planejadas em [`docs/ROADMAP.md`](docs/ROADMAP.md):

- **Fase 2 — Polish UX/Features:** dark mode, filtros funcionais, upload de fotos, gráficos de progresso, PWA offline, busca avançada, drag-and-drop
- **Fase 3 — Empacotamento dual web + desktop:** Tauri 2 para gerar `.exe` Windows mantendo o mesmo código para deploy web (Vercel)

---

## Licença

Projeto pessoal — uso privado.
