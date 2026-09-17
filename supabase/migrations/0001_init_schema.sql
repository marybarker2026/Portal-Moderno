-- ============================================================================
-- Portal Moderno — esquema inicial de base de datos (Supabase / Postgres)
-- Grupo Albar · canal Moderno (Barker, Natural Home, Yogy)
-- ============================================================================
-- Cómo aplicarlo:
--   supabase db push          (si usas Supabase CLI + este repo)
--   o pegar este archivo en el SQL Editor del proyecto de Supabase.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Roles y usuarios
-- ----------------------------------------------------------------------------

create type rol_usuario as enum (
  'jefa_comercial',      -- Mary Zamora — vista completa
  'analista_comercial',  -- Jimena Cano — sell in, metas, sugeridos de compra
  'trade_marketing',     -- Luisa Vargas — cobertura de mercaderistas
  'mercaderista'         -- ruta propia, asistencia, fotos, cubicaje
);

-- Perfil de cada usuario autenticado (1:1 con auth.users)
create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  email text not null unique,
  rol rol_usuario not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. Clientes, tiendas y SKUs
-- ----------------------------------------------------------------------------

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,              -- Superpet, Cencosud, Tottus, Rappi, Dollarcity, Supesa, Holi
  codigo text not null unique                -- código corto interno: SUPERPET, CENCOSUD, TOTTUS, RAPPI, DOLLARCITY, SUPESA, HOLI
);

create table tiendas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  nombre text not null,
  codigo_cliente text,                       -- código del local en el sistema del cliente (si aplica)
  region text,                               -- p.ej. "Lima" / "Nacional" — clave para el caso Superpet:
                                              -- Mary ve sell in solo de Superpet Lima, pero sell out/stock de todo Superpet
  activa boolean not null default true,
  unique (cliente_id, codigo_cliente)
);

create table skus (
  id uuid primary key default gen_random_uuid(),
  codigo_pavso text unique,                  -- null mientras el SKU siga "pendiente de clasificar"
  descripcion text not null,
  marca text,                                -- Barker / Natural Home / Yogy
  categoria text,
  segmento text,
  grupo text,
  subgrupo text,
  detalle text,
  creado_en timestamptz not null default now()
);

-- Todo lo que es específico de la relación SKU↔cliente: el cruce de código,
-- el estado (los 3 valores que definió Mary) y el pricing de ese cliente.
create type sku_estado as enum (
  'activo',                -- se vende hoy
  'no_aplica',              -- ese cliente nunca lo tuvo
  'descontinuado'           -- se vendió antes, ya no
);

create table sku_cliente (
  id uuid primary key default gen_random_uuid(),
  sku_id uuid not null references skus(id) on delete cascade,
  cliente_id uuid not null references clientes(id) on delete cascade,
  codigo_cliente text,                       -- código con el que ese cliente identifica el SKU (puede no existir)
  estado sku_estado not null default 'no_aplica',
  costo numeric(12,2),
  pvp numeric(12,2),
  margen numeric(6,4),                       -- % expresado como fracción (0.35 = 35%)
  ultima_venta date,                         -- último sell out/sell in visto — soporte para justificar "descontinuado"
  actualizado_en timestamptz not null default now(),
  unique (sku_id, cliente_id)
);

create index sku_cliente_cliente_idx on sku_cliente (cliente_id);
create index sku_cliente_estado_idx on sku_cliente (estado);

-- ----------------------------------------------------------------------------
-- 3. Metas y Sell In (fuente: Pavso)
-- ----------------------------------------------------------------------------

create table metas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  tienda_id uuid references tiendas(id) on delete cascade,   -- null = meta a nivel cliente completo
  periodo date not null,                     -- primer día del mes, p.ej. 2026-09-01
  monto_meta numeric(14,2) not null,
  creado_por uuid references usuarios(id),
  creado_en timestamptz not null default now(),
  unique (cliente_id, tienda_id, periodo)
);

create table sell_in (
  id uuid primary key default gen_random_uuid(),
  tienda_id uuid not null references tiendas(id) on delete cascade,
  sku_id uuid not null references skus(id) on delete cascade,
  fecha date not null,
  cantidad numeric(14,2) not null default 0,
  monto numeric(14,2) not null default 0,
  motivo text not null,                      -- filtro de negocio: VENTA NACIONAL, DEVOLUCION X SERVICIOS VARIOS,
                                              -- DIFERENCIA DE PRECIOS, FE07 - DEVOLUCION DE PARCIAL, FE07 - DEVOLUCION TOTAL DE VENTA
  vendedor text,                              -- se registra pero NO se filtra por vendedor (incluye a todo el equipo)
  origen text not null default 'pavso',
  cargado_en timestamptz not null default now()
);

create index sell_in_tienda_fecha_idx on sell_in (tienda_id, fecha);
create index sell_in_sku_fecha_idx on sell_in (sku_id, fecha);

-- ----------------------------------------------------------------------------
-- 4. Sell Out y Stock (fuente: portales de cada cliente)
-- ----------------------------------------------------------------------------

create table sell_out (
  id uuid primary key default gen_random_uuid(),
  tienda_id uuid not null references tiendas(id) on delete cascade,
  sku_id uuid not null references skus(id) on delete cascade,
  fecha date not null,
  cantidad numeric(14,2) not null default 0,
  monto numeric(14,2),
  origen text not null,                      -- nombre del archivo/base de origen
  cargado_en timestamptz not null default now(),
  unique (tienda_id, sku_id, fecha, origen)
);

create index sell_out_tienda_fecha_idx on sell_out (tienda_id, fecha);
create index sell_out_sku_fecha_idx on sell_out (sku_id, fecha);

create table stock_cliente (
  id uuid primary key default gen_random_uuid(),
  tienda_id uuid not null references tiendas(id) on delete cascade,
  sku_id uuid not null references skus(id) on delete cascade,
  fecha date not null,
  cantidad numeric(14,2) not null default 0,
  origen text not null,
  cargado_en timestamptz not null default now(),
  unique (tienda_id, sku_id, fecha, origen)
);

create index stock_cliente_tienda_fecha_idx on stock_cliente (tienda_id, fecha);

-- ----------------------------------------------------------------------------
-- 5. Mercaderismo: rutas, visitas, asistencia, fotos, cubicaje
--    (módulo en stand by de producto, pero el modelo queda listo)
-- ----------------------------------------------------------------------------

create table rutas (
  id uuid primary key default gen_random_uuid(),
  mercaderista_id uuid not null references usuarios(id) on delete cascade,
  fecha date not null,
  creado_en timestamptz not null default now(),
  unique (mercaderista_id, fecha)
);

create table visitas (
  id uuid primary key default gen_random_uuid(),
  ruta_id uuid not null references rutas(id) on delete cascade,
  tienda_id uuid not null references tiendas(id) on delete cascade,
  orden integer not null,
  hora_estimada time,
  hora_llegada timestamptz,
  hora_salida timestamptz,
  estado text not null default 'pendiente'   -- pendiente | en_curso | completada | omitida
);

create index visitas_ruta_idx on visitas (ruta_id);

create type tipo_marca_asistencia as enum (
  'ingreso', 'inicio_refrigerio', 'fin_refrigerio', 'salida'
);

create table asistencias (
  id uuid primary key default gen_random_uuid(),
  mercaderista_id uuid not null references usuarios(id) on delete cascade,
  tipo tipo_marca_asistencia not null,
  marcado_en timestamptz not null default now(),
  tienda_id uuid references tiendas(id),
  lat double precision,
  lng double precision
);

create index asistencias_mercaderista_fecha_idx on asistencias (mercaderista_id, marcado_en);

create type estado_validacion as enum ('pendiente', 'aprobada', 'rechazada');

create table fotos_promocion (
  id uuid primary key default gen_random_uuid(),
  visita_id uuid references visitas(id) on delete cascade,
  tienda_id uuid not null references tiendas(id) on delete cascade,
  sku_id uuid references skus(id),
  mercaderista_id uuid not null references usuarios(id),
  storage_path text not null,                -- ruta dentro de Supabase Storage
  tomada_en timestamptz not null default now(),
  estado estado_validacion not null default 'pendiente',
  validado_por uuid references usuarios(id),
  validado_en timestamptz,
  comentario text
);

create index fotos_promocion_tienda_idx on fotos_promocion (tienda_id);
create index fotos_promocion_estado_idx on fotos_promocion (estado);

-- Cubicaje: conteo físico real hecho en tienda, insumo del cálculo de sugeridos
create table conteos_fisicos (
  id uuid primary key default gen_random_uuid(),
  visita_id uuid references visitas(id) on delete set null,
  tienda_id uuid not null references tiendas(id) on delete cascade,
  sku_id uuid not null references skus(id) on delete cascade,
  mercaderista_id uuid not null references usuarios(id),
  cantidad numeric(14,2) not null,
  contado_en timestamptz not null default now()
);

create index conteos_fisicos_tienda_sku_idx on conteos_fisicos (tienda_id, sku_id, contado_en);

-- Sugerido de compra calculado por Jimena, cruzando stock_cliente + conteos_fisicos + sell_out
create table ordenes_sugeridas (
  id uuid primary key default gen_random_uuid(),
  tienda_id uuid not null references tiendas(id) on delete cascade,
  sku_id uuid not null references skus(id) on delete cascade,
  fecha_calculo date not null,
  cantidad_sugerida numeric(14,2) not null,
  basado_en jsonb,                           -- snapshot de los insumos usados (stock, conteo, venta promedio)
  creado_por uuid references usuarios(id),
  creado_en timestamptz not null default now(),
  unique (tienda_id, sku_id, fecha_calculo)
);

-- ============================================================================
-- 6. Row Level Security
-- ============================================================================

alter table usuarios enable row level security;
alter table clientes enable row level security;
alter table tiendas enable row level security;
alter table skus enable row level security;
alter table sku_cliente enable row level security;
alter table metas enable row level security;
alter table sell_in enable row level security;
alter table sell_out enable row level security;
alter table stock_cliente enable row level security;
alter table rutas enable row level security;
alter table visitas enable row level security;
alter table asistencias enable row level security;
alter table fotos_promocion enable row level security;
alter table conteos_fisicos enable row level security;
alter table ordenes_sugeridas enable row level security;

-- Helper: rol del usuario autenticado
create or replace function auth_rol() returns rol_usuario
language sql stable security definer as $$
  select rol from usuarios where id = auth.uid()
$$;

-- Helper: tiendas asignadas a un mercaderista (vía sus rutas)
create or replace function tiendas_de_mercaderista() returns setof uuid
language sql stable security definer as $$
  select distinct v.tienda_id
  from visitas v
  join rutas r on r.id = v.ruta_id
  where r.mercaderista_id = auth.uid()
$$;

-- usuarios: cada quien ve su propio perfil; Mary ve todo el equipo
create policy usuarios_self_select on usuarios for select
  using (id = auth.uid() or auth_rol() = 'jefa_comercial');

-- Catálogos (clientes, tiendas, skus, sku_cliente): lectura para todo rol
-- autenticado — Mary/Jimena/Luisa ven todo; el mercaderista solo sus tiendas.
create policy clientes_read on clientes for select using (auth.role() = 'authenticated');
create policy skus_read on skus for select using (auth.role() = 'authenticated');
create policy sku_cliente_read on sku_cliente for select using (auth.role() = 'authenticated');

create policy tiendas_read on tiendas for select using (
  auth_rol() in ('jefa_comercial','analista_comercial','trade_marketing')
  or id in (select tiendas_de_mercaderista())
);

-- Sell in / metas: Mary y Jimena ven todo; mercaderista solo sus tiendas; Luisa sin acceso directo
create policy metas_read on metas for select using (
  auth_rol() in ('jefa_comercial','analista_comercial')
  or tienda_id in (select tiendas_de_mercaderista())
);
create policy metas_write on metas for insert with check (auth_rol() in ('jefa_comercial','analista_comercial'));
create policy metas_update on metas for update using (auth_rol() in ('jefa_comercial','analista_comercial'));

create policy sell_in_read on sell_in for select using (
  auth_rol() in ('jefa_comercial','analista_comercial')
  or tienda_id in (select tiendas_de_mercaderista())
);
create policy sell_in_write on sell_in for insert with check (auth_rol() in ('jefa_comercial','analista_comercial'));

-- Sell out / stock: todos los roles comerciales + el mercaderista para sus tiendas
create policy sell_out_read on sell_out for select using (
  auth_rol() in ('jefa_comercial','analista_comercial','trade_marketing')
  or tienda_id in (select tiendas_de_mercaderista())
);
create policy sell_out_write on sell_out for insert with check (auth_rol() in ('jefa_comercial','analista_comercial'));

create policy stock_read on stock_cliente for select using (
  auth_rol() in ('jefa_comercial','analista_comercial','trade_marketing')
  or tienda_id in (select tiendas_de_mercaderista())
);
create policy stock_write on stock_cliente for insert with check (auth_rol() in ('jefa_comercial','analista_comercial'));

-- Mercaderismo: Luisa ve todo; cada mercaderista solo lo propio
create policy rutas_read on rutas for select using (
  auth_rol() in ('jefa_comercial','trade_marketing') or mercaderista_id = auth.uid()
);
create policy visitas_read on visitas for select using (
  auth_rol() in ('jefa_comercial','trade_marketing')
  or ruta_id in (select id from rutas where mercaderista_id = auth.uid())
);
create policy visitas_update_propia on visitas for update using (
  ruta_id in (select id from rutas where mercaderista_id = auth.uid())
);

create policy asistencias_read on asistencias for select using (
  auth_rol() in ('jefa_comercial','trade_marketing') or mercaderista_id = auth.uid()
);
create policy asistencias_insert_propia on asistencias for insert with check (mercaderista_id = auth.uid());

create policy fotos_read on fotos_promocion for select using (
  auth_rol() in ('jefa_comercial','trade_marketing') or mercaderista_id = auth.uid()
);
create policy fotos_insert_propia on fotos_promocion for insert with check (mercaderista_id = auth.uid());
create policy fotos_validar on fotos_promocion for update using (auth_rol() = 'trade_marketing');

create policy conteos_read on conteos_fisicos for select using (
  auth_rol() in ('jefa_comercial','analista_comercial','trade_marketing') or mercaderista_id = auth.uid()
);
create policy conteos_insert_propio on conteos_fisicos for insert with check (mercaderista_id = auth.uid());

create policy ordenes_read on ordenes_sugeridas for select using (
  auth_rol() in ('jefa_comercial','analista_comercial')
  or tienda_id in (select tiendas_de_mercaderista())
);
create policy ordenes_write on ordenes_sugeridas for insert with check (auth_rol() in ('jefa_comercial','analista_comercial'));

-- ============================================================================
-- 7. Datos base (clientes de Moderno)
-- ============================================================================

insert into clientes (nombre, codigo) values
  ('Superpet',   'SUPERPET'),
  ('Cencosud',   'CENCOSUD'),
  ('Tottus',     'TOTTUS'),
  ('Rappi',      'RAPPI'),
  ('Dollarcity', 'DOLLARCITY'),
  ('Supesa',     'SUPESA'),
  ('Holi',       'HOLI');
