-- ═══════════════════════════════════════════════════════════════════════
-- ITBMC · Seguridad y copias del servidor
-- Ejecuta este script en Supabase → SQL Editor.
-- Puedes ejecutarlo por bloques o entero. Es idempotente (se puede repetir).
-- ═══════════════════════════════════════════════════════════════════════

-- Necesario para hashear/verificar contraseñas
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────────────
-- #1 · CONTRASEÑA DE ADMIN VERIFICADA EN EL SERVIDOR
--     La contraseña ya NO vive en el JavaScript público: se guarda
--     hasheada en una tabla que nadie puede leer con la anon key.
-- ─────────────────────────────────────────────────────────────────────

create table if not exists app_secrets (
  id text primary key,
  value text not null
);

-- RLS: bloquea CUALQUIER acceso directo con la anon key.
alter table app_secrets enable row level security;
-- (no creamos ninguna policy → nadie puede leer/escribir directamente;
--  solo las funciones SECURITY DEFINER de abajo pueden tocarla)

-- >>> CAMBIA 'PON_AQUI_TU_CONTRASEÑA' por la contraseña de admin que quieras <<<
insert into app_secrets (id, value)
values ('admin_pw', crypt('PON_AQUI_TU_CONTRASEÑA', gen_salt('bf')))
on conflict (id) do update set value = excluded.value;

-- Función que comprueba la contraseña (devuelve true/false).
create or replace function verify_admin(pw text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from app_secrets
    where id = 'admin_pw' and value = crypt(pw, value)
  );
$$;

grant execute on function verify_admin(text) to anon;

-- Para CAMBIAR la contraseña en el futuro, ejecuta solo esto:
--   update app_secrets set value = crypt('NUEVA_CONTRASEÑA', gen_salt('bf')) where id='admin_pw';


-- ─────────────────────────────────────────────────────────────────────
-- #3 · VER Y RESTAURAR COPIAS DEL SERVIDOR DESDE LA APP
--     La tabla game_data_history da 401 al rol anónimo; estas funciones
--     SECURITY DEFINER permiten listar/restaurar SOLO con la contraseña.
-- ─────────────────────────────────────────────────────────────────────

-- Lista de copias (id, fecha, nº de jugadores). Requiere contraseña.
create or replace function list_backups(pw text)
returns table(id bigint, snapshot_at timestamptz, player_count int)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not verify_admin(pw) then
    raise exception 'unauthorized';
  end if;
  return query
    select h.id,
           h.snapshot_at,
           coalesce(jsonb_array_length(h.data->'players'), 0) as player_count
    from game_data_history h
    order by h.snapshot_at desc
    limit 50;
end;
$$;

grant execute on function list_backups(text) to anon;

-- Restaura una copia concreta sobre game_data. Requiere contraseña.
create or replace function restore_backup(pw text, bid bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  snap jsonb;
begin
  if not verify_admin(pw) then
    raise exception 'unauthorized';
  end if;
  select data into snap from game_data_history where id = bid;
  if snap is null then
    raise exception 'backup not found';
  end if;
  update game_data set data = snap where id = 'main';
end;
$$;

grant execute on function restore_backup(text, bigint) to anon;


-- ─────────────────────────────────────────────────────────────────────
-- #2 · RLS EN TODAS LAS TABLAS (revisión)
--     Activa RLS y crea políticas acordes al uso actual de la app
--     (leer/insertar/actualizar con la anon key; borrar solo donde hace falta).
--     game_data ya lo tenías protegido (no se puede borrar el registro main).
-- ─────────────────────────────────────────────────────────────────────

-- Helper: activa RLS y aplica select/insert/update para anon en una tabla.
-- (ejecuta los bloques de las tablas que tengas; ignora las que no existan)

-- MISIONES (la app inserta, actualiza y BORRA misiones)
alter table misiones enable row level security;
drop policy if exists mis_sel on misiones;  create policy mis_sel on misiones for select using (true);
drop policy if exists mis_ins on misiones;  create policy mis_ins on misiones for insert with check (true);
drop policy if exists mis_upd on misiones;  create policy mis_upd on misiones for update using (true) with check (true);
drop policy if exists mis_del on misiones;  create policy mis_del on misiones for delete using (true);

-- PLAYERS (fuente de recuperación; la app solo lee)
alter table players enable row level security;
drop policy if exists pl_sel on players;  create policy pl_sel on players for select using (true);
drop policy if exists pl_ins on players;  create policy pl_ins on players for insert with check (true);
drop policy if exists pl_upd on players;  create policy pl_upd on players for update using (true) with check (true);
-- (sin policy de delete → no se pueden borrar filas de players con la anon key)

-- CARTAS (catálogo; lectura + edición admin)
alter table cartas enable row level security;
drop policy if exists ca_sel on cartas;  create policy ca_sel on cartas for select using (true);
drop policy if exists ca_ins on cartas;  create policy ca_ins on cartas for insert with check (true);
drop policy if exists ca_upd on cartas;  create policy ca_upd on cartas for update using (true) with check (true);
drop policy if exists ca_del on cartas;  create policy ca_del on cartas for delete using (true);

-- EQUIPAMIENTO (catálogo; lectura + edición admin)
alter table equipamiento enable row level security;
drop policy if exists eq_sel on equipamiento;  create policy eq_sel on equipamiento for select using (true);
drop policy if exists eq_ins on equipamiento;  create policy eq_ins on equipamiento for insert with check (true);
drop policy if exists eq_upd on equipamiento;  create policy eq_upd on equipamiento for update using (true) with check (true);
drop policy if exists eq_del on equipamiento;  create policy eq_del on equipamiento for delete using (true);

-- CLASES (catálogo; lectura + edición admin)
alter table clases enable row level security;
drop policy if exists cl_sel on clases;  create policy cl_sel on clases for select using (true);
drop policy if exists cl_ins on clases;  create policy cl_ins on clases for insert with check (true);
drop policy if exists cl_upd on clases;  create policy cl_upd on clases for update using (true) with check (true);
drop policy if exists cl_del on clases;  create policy cl_del on clases for delete using (true);

-- NOTA sobre #2: con la anon key pública, estas políticas permiten operar
-- a cualquiera que tenga la clave (es el modelo actual de la app, sin login
-- por usuario en Supabase). El endurecimiento real (que cada quien solo
-- toque lo suyo) requeriría autenticación de Supabase por usuario, que es un
-- cambio mayor. Lo que SÍ ganamos ya:
--   · La contraseña de admin deja de estar en el código (#1).
--   · game_data no se puede borrar (protegido antes).
--   · players no se puede borrar.
--   · Copias restaurables solo con contraseña (#3).
