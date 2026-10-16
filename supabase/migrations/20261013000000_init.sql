-- Lens initial schema: scans queue, findings, AI suggestions (+ human decisions), sites, WCAG retrieval corpus.

create extension if not exists vector with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- Profiles -------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  -- Explicit opt-in before any of this user's accept/edit/reject decisions are used to train models.
  training_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Scans ----------------------------------------------------------------------

create type public.scan_kind as enum ('url', 'html', 'image');
create type public.scan_status as enum ('queued', 'running', 'done', 'failed');

create table public.scans (
  id uuid primary key default gen_random_uuid(),
  -- Unguessable public handle; holding it is what grants read access to an anonymous report.
  share_id text not null unique default encode(extensions.gen_random_bytes(16), 'hex'),
  user_id uuid references auth.users (id) on delete set null,
  kind public.scan_kind not null,
  url text,
  html text,
  status public.scan_status not null default 'queued',
  error text,
  result jsonb,
  ip_hash text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  expires_at timestamptz not null default now() + interval '30 days',
  pinned boolean not null default false,
  constraint scans_input check (
    (kind = 'url' and url is not null)
    or (kind = 'html' and html is not null)
    or kind = 'image'
  )
);

create index scans_queue_idx on public.scans (created_at) where status = 'queued';
create index scans_user_idx on public.scans (user_id, created_at desc);
create index scans_ip_idx on public.scans (ip_hash, created_at desc);

-- Findings -------------------------------------------------------------------

create table public.findings (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans (id) on delete cascade,
  rule_id text not null,
  engine text not null check (engine in ('axe', 'lens')),
  impact text not null check (impact in ('critical', 'serious', 'moderate', 'minor')),
  wcag text[] not null default '{}',
  groups text[] not null default '{}',
  help text not null,
  help_url text,
  nodes jsonb not null default '[]'
);

create index findings_scan_idx on public.findings (scan_id);

-- Suggestions ----------------------------------------------------------------

create type public.suggestion_kind as enum ('alt_text', 'label', 'patch', 'explanation');
create type public.suggestion_status as enum ('pending', 'accepted', 'edited', 'rejected');

create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references public.findings (id) on delete cascade,
  node_index int not null default 0,
  kind public.suggestion_kind not null,
  provider text not null,
  model text not null,
  content text not null,
  status public.suggestion_status not null default 'pending',
  final_content text,
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create index suggestions_finding_idx on public.suggestions (finding_id);

-- Sites (verified ownership, for scheduled monitoring later) -----------------

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  origin text not null,
  verification_token text not null default encode(extensions.gen_random_bytes(16), 'hex'),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, origin)
);

-- WCAG / ACT retrieval corpus ------------------------------------------------

create table public.wcag_chunks (
  id bigint generated always as identity primary key,
  source text not null,
  criterion text,
  heading text not null,
  url text not null,
  content text not null,
  embedding extensions.vector(384) not null
);

create index wcag_chunks_embedding_idx
  on public.wcag_chunks using hnsw (embedding extensions.vector_cosine_ops);

-- Functions ------------------------------------------------------------------

-- Atomically hands the oldest queued scan to one worker.
create function public.claim_next_scan()
returns setof public.scans
language sql
security definer
set search_path = ''
as $$
  update public.scans
  set status = 'running', started_at = now()
  where id = (
    select id from public.scans
    where status = 'queued'
    order by created_at
    limit 1
    for update skip locked
  )
  returning *;
$$;

revoke execute on function public.claim_next_scan() from public, anon, authenticated;

create function public.match_wcag_chunks(query_embedding extensions.vector(384), match_count int default 4)
returns table (id bigint, source text, criterion text, heading text, url text, content text, similarity float)
language sql
stable
set search_path = ''
as $$
  select c.id, c.source, c.criterion, c.heading, c.url, c.content,
         1 - (c.embedding operator(extensions.<=>) query_embedding) as similarity
  from public.wcag_chunks c
  order by c.embedding operator(extensions.<=>) query_embedding
  limit match_count;
$$;

-- Row level security ---------------------------------------------------------
-- Anonymous report access goes through server routes with the service key after checking share_id.

alter table public.profiles enable row level security;
alter table public.scans enable row level security;
alter table public.findings enable row level security;
alter table public.suggestions enable row level security;
alter table public.sites enable row level security;
alter table public.wcag_chunks enable row level security;

create policy "own profile" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "own scans" on public.scans
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "own findings" on public.findings
  for select to authenticated
  using (exists (
    select 1 from public.scans s where s.id = scan_id and s.user_id = (select auth.uid())
  ));

create policy "own suggestions" on public.suggestions
  for select to authenticated
  using (exists (
    select 1 from public.findings f
    join public.scans s on s.id = f.scan_id
    where f.id = finding_id and s.user_id = (select auth.uid())
  ));

create policy "own sites" on public.sites
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "public corpus" on public.wcag_chunks
  for select to anon, authenticated
  using (true);

-- Storage --------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', false)
on conflict (id) do nothing;
