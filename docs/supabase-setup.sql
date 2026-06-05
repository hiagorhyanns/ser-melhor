-- ============================================================
-- Ser Melhor — setup Supabase (rodar 1x no SQL Editor do projeto)
-- ============================================================
-- Modelo: 1 linha jsonb com todo o estado do app (espelha o localStorage).
-- Acesso ABERTO (qualquer pessoa lê/escreve) — conforme escolha do dono.
-- Para apertar depois: troque as policies por regras com auth.

-- 1) Tabela de estado --------------------------------------------------
create table if not exists public.app_state (
  id          int primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- Acesso público total (anon) à única linha de estado.
drop policy if exists "app_state public read"  on public.app_state;
drop policy if exists "app_state public write" on public.app_state;
create policy "app_state public read"  on public.app_state for select using (true);
create policy "app_state public write" on public.app_state
  for all using (true) with check (true);

-- 2) Realtime (sync entre dispositivos) --------------------------------
alter publication supabase_realtime add table public.app_state;

-- 3) Storage de imagens ------------------------------------------------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Leitura pública + upload anônimo no bucket 'images'.
drop policy if exists "images public read"   on storage.objects;
drop policy if exists "images public upload"  on storage.objects;
create policy "images public read" on storage.objects
  for select using (bucket_id = 'images');
create policy "images public upload" on storage.objects
  for insert with check (bucket_id = 'images');

-- Pronto. Pegue em Project Settings → API:
--   • Project URL      → VITE_SUPABASE_URL
--   • anon public key   → VITE_SUPABASE_ANON_KEY
-- Coloque em .env.local (local) e nas Environment Variables da Vercel.
