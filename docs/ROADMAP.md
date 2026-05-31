# Roadmap — Ser Melhor

Plano de evolução do projeto em fases incrementais. **Fase 1 está concluída** (setup VS Code + tooling). As demais ficam aqui como backlog para retomar quando você quiser.

---

## ✅ Fase 1 — Setup local para VS Code (concluída)

- [x] Scripts `npm` cross-platform (Windows + Linux + Mac)
- [x] ESLint 9 (flat config) com regras para React + TypeScript + acessibilidade
- [x] Prettier + plugin Tailwind (ordenação automática de classes)
- [x] `.vscode/` com extensões recomendadas e settings
- [x] `.editorconfig`
- [x] `.env.local` separado de `.env.example`
- [x] `tsconfig` com `strict: true`
- [x] `README.md` reescrito com instruções Windows/VS Code
- [x] Title + meta description no `index.html`

## ✅ Fase 2d — Gráficos de progresso (concluída)

- [x] `categories` no Dashboard ganhou campo `key: keyof AppData` para acessar dados tipados
- [x] `categoryStats` computado: `total`, `completed`, `pct` por categoria
- [x] Cards de categoria agora exibem `completed/total` e barra de progresso animada (Framer Motion, delay escalonado)
- [x] Percentual `pct%` exibido no canto superior direito de cada card
- [x] Cabeçalho das Áreas de Foco exibe contador global `X/Y concluídos`
- [x] "Próximas melhorias" agora é dinâmico: lista as 3 categorias com mais itens pendentes, ordenadas por quantidade; vazia quando tudo está 100%
- [x] Contador de pendentes no header de "Itens Pendentes" usa o total real (`totalItems - completedItems`)
- [x] Removidos imports desnecessários (`Plus` hardcoded)

> **Nota:** gráfico temporal (% por data) exigiria `completedAt` no model — fica como item futuro se necessário.

## ✅ Fase 2c — Busca avançada + filtros (concluída)

- [x] Hook `useDebouncedValue<T>(value, delay)` em `src/hooks/useDebouncedValue.ts`
- [x] `PageHeader` aceita props `filterPanel?: ReactNode` e `hasActiveFilters?: boolean`
- [x] Botão Filter agora abre/fecha painel inline (com indicador verde quando há filtros ativos)
- [x] Componente `FilterSelect` reutilizável em `src/components/FilterSelect.tsx` (usa `useId` para a11y)
- [x] Cada view define seus facets:
  - **Marcas**: Conclusão + Favoritas
  - **Lojas**: Conclusão + Status (ver depois / comprar / favorita)
  - **Barba / Cabelo / Postura / Musculos**: Conclusão
  - **Produtos**: Conclusão + Status (uso diário / testar / comprar)
  - **Roupas**: Conclusão + Status (tenho / comprar / substituir) + Categoria (8 opções)
- [x] Busca passa por debounce de 200ms e cobre todos os campos textuais relevantes
- [x] `useMemo` na lista filtrada para evitar refiltro a cada render

## ✅ Fase 2b — Dark mode (concluída)

- [x] `@custom-variant dark` configurado no `src/index.css` para Tailwind 4
- [x] Hook `useTheme` em `src/hooks/useTheme.ts` (localStorage com chave `vestir_melhor_theme` + fallback `prefers-color-scheme`)
- [x] Componente `ThemeToggle` com ícones sol/lua animados (Framer Motion)
- [x] Integrado no rodapé da sidebar desktop e no header mobile
- [x] Classes `dark:` aplicadas em todos os componentes principais (`Layout`, `Card`, `PageHeader`, `Modal`, `Dashboard`)
- [x] Inputs/labels/cards internos das 8 views migrados em batch via replace_all
- [x] Scrollbar customizado adaptado para dark mode

## ✅ Fase 2a — Limpeza de código (concluída)

- [x] Labels a11y: todo `<label>` ganhou `htmlFor` + `id` correspondente no input/select/textarea (8 views afetadas)
- [x] Aspas literais em JSX trocadas por `&ldquo;` / `&rdquo;` (Cabelo, Musculos)
- [x] Imports e variáveis não usadas removidos (`useState`, `cn` em PageHeader; `catch (e)` → `catch`; `, idx` no Dashboard)
- [x] `any` eliminados: `useAppData` agora usa `BaseItem[]` + casts tipados; `Dashboard` usa tipo `AnyItem` derivado de `AppData`
- [x] Função `cn` duplicada no Dashboard removida (passa a importar de `lib/utils`)
- [x] IDs gerados com `crypto.randomUUID()` em vez de `Math.random().toString(36)`

---

## 🎨 Fase 2 — Polish UX / Features

Foco: tornar o app realmente útil no dia-a-dia, sem mudar o modelo de dados (ainda local).

### UX/Visual
- [x] **Dark mode** — feito na Fase 2b. Toggle na sidebar/header mobile, `prefers-color-scheme` como default, persistência em localStorage chave `vestir_melhor_theme`
- [x] **Filtros funcionais** — feito na Fase 2c. PageHeader aceita `filterPanel` opcional; cada view define facets relevantes (Conclusão / Status / Categoria / Favoritas)
- [x] **Busca avançada** — feito na Fase 2c. Hook `useDebouncedValue` (200ms) + busca em todos os campos textuais relevantes por view
- [x] **Drag-and-drop** — `@dnd-kit/core` + `sortable`; `SortableGrid` + `SortableItem` components; `reorderItems` no context; handle flutuante aparece no hover (topo do card); desativado quando busca/filtros ativos; ordem persiste em localStorage
- [x] **Upload de fotos** — `ImageUpload` component (file upload via canvas compress + URL paste); `foto?: string` em `Marca`, `Roupa`, `CabeloItem`; preview com remoção; imagem exibida nos cards; compressão canvas 600px/75% JPEG (~30–60 KB)
- [x] **Gráficos de progresso** — feito na Fase 2d. Progress bars animadas por categoria nos cards do Dashboard; sugestões dinâmicas substituem o hardcoded. Chart temporal (ao longo do tempo) exigiria `completedAt` — postergado.
- [x] **PWA offline** — `vite-plugin-pwa` + Workbox `generateSW`; manifest + service worker gerados no build; ícone SVG `public/icon.svg`; 17 entradas pré-cacheadas; instalável no Chrome/Edge

### Qualidade técnica
- [x] **UUIDs reais** — feito na Fase 2a (`crypto.randomUUID()`)
- [x] **Context API explícita** — `AppDataProvider` + `AppDataContext` em `src/contexts/`; `useAppData.ts` virou re-export de 1 linha; `main.tsx` envolve tudo no Provider; zero mudanças nas views
- [x] **Lazy-loading de rotas** — `React.lazy` + `Suspense` em `App.tsx`; 8 views viram chunks separados; bundle principal −53KB (469→416KB)
- [x] **Vitest** — 17 testes em 3 arquivos: `AppDataContext` (9 testes: add/update/delete/toggle/persist/restore/isolamento), `useDebouncedValue` (4 testes com fake timers), `cn()` (4 testes tailwind-merge)
- [x] **Limpar deps dormentes** — removidos `express`, `@types/express`, `dotenv` (66 pacotes a menos); `@google/genai` mantido para Fase 2 IA

### IA (Gemini)
- [x] Implementar primeira chamada `@google/genai`: `gemini-2.0-flash` gera 3 sugestões no Dashboard com base nos dados reais; cache 24h em localStorage; fallback data-based quando sem chave
- [x] Cache local de respostas para economizar tokens (hash por contagens + TTL 24h; botão "Atualizar" força nova chamada)
- [x] "Gerar combinação" em Roupas — botão acima do grid; filtra `status=tenho`; 3 outfits em JSON; exibe cards com nome/peças/ocasião; fallback para texto plano
- [x] "Rotina recomendada" em Barba/Cabelo — botão por card; passos numerados em texto; hook `useAIGenerate` compartilhado (sem cache — chamada direta)
- [x] Streaming de respostas com `generateContentStream` — `generateTextStream(prompt, onChunk)` em `gemini.ts`; `useAIGenerate` acumula chunks em `setState(prev => ...)` — texto aparece progressivamente no modal

---

## 🖥️ Fase 3 — Empacotamento dual (web + desktop)

Foco: distribuir o mesmo código como app web no Vercel **e** `.exe` Windows portátil (estilo Cofre de Senhas).

### Tauri 2 (recomendado, mais leve que Electron)
- [ ] **Instalar Rust toolchain** — `rustup-init.exe` de https://rustup.rs (ver instruções abaixo)
- [x] `@tauri-apps/cli@^2` + `@tauri-apps/api@^2` instalados; `src-tauri/` scaffoldado com `npx tauri init`
- [x] `tauri.conf.json` configurado: identifier `com.sermelhor.app`, janela maximizada (1280×800), targets `msi` + `nsis`
- [x] `Cargo.toml` com nome `ser-melhor`, edição 2021
- [x] Scripts `npm run tauri:dev` e `npm run tauri:build` em `package.json`
- [x] `src-tauri/target/` adicionado ao `.gitignore`
- [x] Storage: `localStorage` via WebView2 (já instalado 148.0) — sem mudança de código
- [ ] **Gerar ícones** — `npx tauri icon public/icon.svg` (após Rust instalado) para PNG 32/128/256 + ICO
- [ ] **Testar desktop**: `npm run tauri:dev` (requer Rust + MSVC Build Tools)
- [ ] **Build final**: `npm run tauri:build` → `src-tauri/target/release/bundle/msi/*.msi`

> **⚠️ Pré-requisitos para compilar (instalar manualmente, precisam admin):**
> 1. **MSVC Build Tools**: baixar `vs_BuildTools.exe` de https://aka.ms/vs/17/release/vs_BuildTools.exe → selecionar workload "Desenvolvimento para desktop com C++"
> 2. **Rust**: baixar `rustup-init.exe` de https://rustup.rs → escolher default (MSVC toolchain)
> 3. Após instalação: `rustup update stable` para garantir versão recente
> 4. WebView2 já instalado (148.0.3967.96 detectado)

### Backend opcional (se quiser multi-device)
- [ ] Avaliar **Supabase** (você já usa no Reclamações) para sync entre dispositivos
- [ ] Auth via magic link ou Google
- [ ] Migration do schema localStorage → Postgres
- [ ] Modo offline-first com fila de sync

### Deploy
- [ ] Web: GitHub → Vercel auto-deploy
- [ ] Desktop: GitHub Actions matrix build (Windows/Mac/Linux) → release com artefatos

---

## Decisões em aberto

| Tema | Opções | Status |
|---|---|---|
| Storage no desktop | `localStorage` (simples) vs SQLite via Tauri (escalável) | A decidir na Fase 3 |
| Backend | Sem backend (puro local) vs Supabase (sync) vs próprio (Express) | A decidir na Fase 3 |
| Pagamento/multi-user | Pessoal só, SaaS gratuito, freemium | A decidir |
| `express` no `package.json` | Removido junto com `dotenv` e `@types/express` | ✅ Resolvido |

---

## Notas

- Sempre rodar `npm run typecheck && npm run lint && npm run format:check` antes de commitar
- Fase 2 e 3 podem ser quebradas em PRs menores; cada item desta lista vira uma issue/branch
- Reavaliar prioridades sempre que terminar uma fase
