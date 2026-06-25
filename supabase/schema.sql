-- ============================================================
-- SCHEMA: Bolão da Copa do Mundo 2026
-- Execute no SQL Editor do Supabase em ordem.
-- Se já executou uma versão anterior, rode DROP TABLE/VIEW antes.
-- ============================================================

create extension if not exists "uuid-ossp";


-- ============================================================
-- TABELA: profiles
-- Armazena o apelido de cada usuário autenticado.
-- ============================================================
create table public.profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  username   text        not null unique,
  created_at timestamptz not null default now()
);


-- ============================================================
-- TABELA: matches
-- ============================================================
create table public.matches (
  id          uuid        primary key default uuid_generate_v4(),
  home_team   text        not null,
  away_team   text        not null,
  match_date  timestamptz not null,
  round       text        not null,  -- '1ª Rodada' | '2ª Rodada' | '3ª Rodada'
  group_name  text,                  -- 'A' .. 'L'
  home_score  integer     check (home_score >= 0),
  away_score  integer     check (away_score >= 0),
  is_finished boolean     not null default false,
  created_at  timestamptz not null default now(),

  constraint scores_both_or_none check (
    (home_score is null) = (away_score is null)
  )
);


-- ============================================================
-- TABELA: predictions
-- ============================================================
create table public.predictions (
  id             uuid        primary key default uuid_generate_v4(),
  user_id        uuid        not null references auth.users(id)    on delete cascade,
  match_id       uuid        not null references public.matches(id) on delete cascade,
  predicted_home integer     not null check (predicted_home >= 0),
  predicted_away integer     not null check (predicted_away >= 0),
  created_at     timestamptz not null default now(),

  constraint predictions_user_match_unique unique (user_id, match_id)
);

create index idx_predictions_user_id  on public.predictions (user_id);
create index idx_predictions_match_id on public.predictions (match_id);
create index idx_matches_date         on public.matches (match_date);
create index idx_matches_round        on public.matches (round);
create index idx_matches_group        on public.matches (group_name);


-- ============================================================
-- VIEW: ranking
-- Mostra pontuação de cada usuário (apelido via join em profiles).
-- Regras: pontuação por fase (3→6 exato, 1→4 certo), 0 errou
-- Só conta partidas com is_finished = true.
-- ============================================================
create or replace view public.ranking as
select
  p.user_id,
  coalesce(pr.username, 'Anônimo')    as username,
  count(*) filter (
    where m.is_finished
  )                                   as jogos_computados,

  sum(
    case
      when not m.is_finished then 0
      when p.predicted_home = m.home_score and p.predicted_away = m.away_score then
        case
          when m.round = 'Final'                                                             then 6
          when m.round = 'Semifinais'                                                        then 5
          when m.round in ('32-avos', 'Oitavas de final', 'Quartas de final')               then 4
          else 3
        end
      when (p.predicted_home > p.predicted_away and m.home_score > m.away_score)
        or (p.predicted_home < p.predicted_away and m.home_score < m.away_score)
        or (p.predicted_home = p.predicted_away and m.home_score = m.away_score) then
        case
          when m.round = 'Final'                                                             then 4
          when m.round = 'Semifinais'                                                        then 3
          when m.round in ('32-avos', 'Oitavas de final', 'Quartas de final')               then 2
          else 1
        end
      else 0
    end
  )                                   as pontos,

  sum(
    case
      when m.is_finished
       and p.predicted_home = m.home_score
       and p.predicted_away = m.away_score                          then 1
      else 0
    end
  )                                   as placares_exatos,

  sum(
    case
      when m.is_finished
       and not (p.predicted_home = m.home_score and p.predicted_away = m.away_score)
       and (
         (p.predicted_home > p.predicted_away and m.home_score > m.away_score) or
         (p.predicted_home < p.predicted_away and m.home_score < m.away_score) or
         (p.predicted_home = p.predicted_away and m.home_score = m.away_score)
       )                                                             then 1
      else 0
    end
  )                                   as resultados_corretos

from public.predictions p
join  public.matches  m  on m.id  = p.match_id
left join public.profiles pr on pr.id = p.user_id
group by p.user_id, pr.username
order by pontos desc, placares_exatos desc, resultados_corretos desc;

grant select on public.ranking to authenticated;
grant select on public.ranking to anon;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Qualquer um pode ler perfis (necessário para exibir apelidos no ranking)
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

-- Usuário só pode criar/editar o próprio perfil
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ── matches ───────────────────────────────────────────────────
-- Leitura pública; escrita apenas via service_role (admin no dashboard).
alter table public.matches enable row level security;

create policy "matches_select_all"
  on public.matches for select
  using (true);


-- ── predictions ───────────────────────────────────────────────
alter table public.predictions enable row level security;

create policy "predictions_select_own"
  on public.predictions for select
  using (auth.uid() = user_id);

-- INSERT: só o próprio usuário, somente antes da partida começar
create policy "predictions_insert_own"
  on public.predictions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.match_date > now()
        and not m.is_finished
    )
  );

-- UPDATE: só o próprio usuário, somente antes da partida começar
create policy "predictions_update_own"
  on public.predictions for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.match_date > now()
        and not m.is_finished
    )
  );

create policy "predictions_delete_own"
  on public.predictions for delete
  using (auth.uid() = user_id);


-- ============================================================
-- TABELA: ranking_snapshot
-- Armazena o snapshot das posições do ranking para exibir
-- setas de subida/descida. Linha única (id=1), atualizada
-- manualmente pelo admin (botão "Atualizar ranking").
-- ============================================================
create table public.ranking_snapshot (
  id         integer  primary key default 1,
  positions  jsonb    not null default '{}',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.ranking_snapshot (id, positions) values (1, '{}');

alter table public.ranking_snapshot enable row level security;

create policy "snapshot_select_all"
  on public.ranking_snapshot for select
  using (true);

create policy "snapshot_update_auth"
  on public.ranking_snapshot for update
  using (auth.role() = 'authenticated');

grant select on public.ranking_snapshot to authenticated, anon;
grant update on public.ranking_snapshot to authenticated;


-- ============================================================
-- TRIGGER: salva snapshot do ranking automaticamente
-- Dispara BEFORE UPDATE em matches sempre que placar ou
-- is_finished mudam — captura o ranking ANTES da alteração
-- para que as setas mostrem a mudança corretamente.
-- ============================================================
create or replace function public.auto_save_ranking_snapshot()
returns trigger
language plpgsql
security definer
as $$
begin
  if (old.is_finished is distinct from new.is_finished)
     or (old.home_score is distinct from new.home_score)
     or (old.away_score is distinct from new.away_score)
  then
    update public.ranking_snapshot
    set positions = (
      select jsonb_object_agg(user_id::text, rn)
      from (
        select user_id,
               row_number() over (
                 order by pontos desc, placares_exatos desc, resultados_corretos desc
               ) as rn
        from public.ranking
      ) x
    ),
    updated_at = now()
    where id = 1;
  end if;
  return new;
end;
$$;

create trigger trg_ranking_snapshot
before update on public.matches
for each row execute function public.auto_save_ranking_snapshot();


-- ============================================================
-- FUNCTION: get_daily_points
-- Retorna pontos por usuário por dia de jogo (para o gráfico
-- de estatísticas). SECURITY DEFINER para bypassar o RLS de
-- predictions e agregar dados de todos os usuários.
-- Rodar no dashboard Supabase:
-- ============================================================
create or replace function public.get_daily_points()
returns table (
  user_id      uuid,
  username     text,
  match_day    date,
  points_on_day bigint
)
language sql
security definer
as $$
  select
    p.user_id,
    coalesce(pr.username, 'Anônimo') as username,
    date(m.match_date at time zone 'America/Sao_Paulo') as match_day,
    sum(
      case
        when not m.is_finished then 0
        when p.predicted_home = m.home_score and p.predicted_away = m.away_score then
          case
            when m.round = 'Final'                                                             then 6
            when m.round = 'Semifinais'                                                        then 5
            when m.round in ('32-avos', 'Oitavas de final', 'Quartas de final')               then 4
            else 3
          end
        when (p.predicted_home > p.predicted_away and m.home_score > m.away_score)
          or (p.predicted_home < p.predicted_away and m.home_score < m.away_score)
          or (p.predicted_home = p.predicted_away and m.home_score = m.away_score) then
          case
            when m.round = 'Final'                                                             then 4
            when m.round = 'Semifinais'                                                        then 3
            when m.round in ('32-avos', 'Oitavas de final', 'Quartas de final')               then 2
            else 1
          end
        else 0
      end
    )::bigint as points_on_day
  from public.predictions p
  join public.matches m on m.id = p.match_id
  left join public.profiles pr on pr.id = p.user_id
  where m.is_finished = true
  group by p.user_id, pr.username, date(m.match_date at time zone 'America/Sao_Paulo')
  order by match_day;
$$;

grant execute on function public.get_daily_points() to authenticated;
grant execute on function public.get_daily_points() to anon;


-- ============================================================
-- FUNCTION: get_user_stats
-- Retorna estatísticas agregadas por usuário para a página de
-- Estatísticas: total de jogos, placares exatos, resultados
-- corretos, near-misses (errou por 1 gol) e taxa de acerto %.
-- SECURITY DEFINER para bypassar o RLS de predictions.
-- ============================================================
create or replace function public.get_user_stats()
returns table (
  user_id         uuid,
  username        text,
  total_games     bigint,
  exact_scores    bigint,
  correct_results bigint,
  wrong_results   bigint,
  near_misses     bigint,
  hit_rate        numeric
)
language sql
security definer
as $$
  select
    p.user_id,
    coalesce(pr.username, 'Anônimo') as username,
    count(*) filter (where m.is_finished) as total_games,
    count(*) filter (where m.is_finished
      and p.predicted_home = m.home_score
      and p.predicted_away = m.away_score) as exact_scores,
    count(*) filter (where m.is_finished
      and not (p.predicted_home = m.home_score and p.predicted_away = m.away_score)
      and ((p.predicted_home > p.predicted_away and m.home_score > m.away_score)
        or (p.predicted_home < p.predicted_away and m.home_score < m.away_score)
        or (p.predicted_home = p.predicted_away and m.home_score = m.away_score))
    ) as correct_results,
    count(*) filter (where m.is_finished
      and not (p.predicted_home = m.home_score and p.predicted_away = m.away_score)
      and not ((p.predicted_home > p.predicted_away and m.home_score > m.away_score)
        or (p.predicted_home < p.predicted_away and m.home_score < m.away_score)
        or (p.predicted_home = p.predicted_away and m.home_score = m.away_score))
    ) as wrong_results,
    count(*) filter (where m.is_finished
      and not (p.predicted_home = m.home_score and p.predicted_away = m.away_score)
      and abs(p.predicted_home - m.home_score) + abs(p.predicted_away - m.away_score) = 1
    ) as near_misses,
    case
      when count(*) filter (where m.is_finished) = 0 then 0
      else round(
        count(*) filter (where m.is_finished and (
          (p.predicted_home = m.home_score and p.predicted_away = m.away_score)
          or (p.predicted_home > p.predicted_away and m.home_score > m.away_score)
          or (p.predicted_home < p.predicted_away and m.home_score < m.away_score)
          or (p.predicted_home = p.predicted_away and m.home_score = m.away_score)
        ))::numeric * 100.0 /
        count(*) filter (where m.is_finished)::numeric, 1)
    end as hit_rate
  from public.predictions p
  join public.matches m on m.id = p.match_id
  left join public.profiles pr on pr.id = p.user_id
  group by p.user_id, pr.username;
$$;

grant execute on function public.get_user_stats() to authenticated;
grant execute on function public.get_user_stats() to anon;
