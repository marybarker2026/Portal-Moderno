# Portal Moderno

Portal interno de Moderno (canal de distribución de Grupo Albar — Barker, Natural Home, Yogy)
para consolidar Sell In vs. meta, Sell Out y Stock por cliente, y mercaderismo (rutas, asistencia,
fotos de ejecución y cubicaje).

Stack: **Next.js** (App Router) + **Supabase** (Postgres + Auth + Storage + RLS) + **Vercel**.

## 1. Crear el proyecto en Supabase

1. Crea una cuenta / proyecto en https://supabase.com (o usa uno existente).
2. En el SQL Editor del proyecto, pega y ejecuta `supabase/migrations/0001_init_schema.sql`.
   Esto crea todas las tablas, los tipos (incluido el estado de SKU de 3 valores: `activo`,
   `no_aplica`, `descontinuado`), los índices y las políticas de RLS por rol.
3. En **Authentication > Users**, crea un usuario por cada persona del equipo (Mary, Jimena,
   Luisa, y uno por mercaderista).
4. Por cada usuario creado, inserta su fila en la tabla `usuarios` con el `rol` que le
   corresponde (`jefa_comercial`, `analista_comercial`, `trade_marketing`, `mercaderista`) —
   el `id` debe ser el mismo uuid que Supabase le asignó en Authentication.
5. Copia la URL del proyecto y las llaves (`Project Settings > API`).

## 2. Correr el portal localmente

```bash
npm install
cp .env.example .env.local     # y completa con los datos del paso 1
npm run dev
```

Abre http://localhost:3000 — te pedirá iniciar sesión y luego te lleva a `/dashboard`, con el
menú lateral ajustado según el rol de quien entró.

## 3. Desplegar en Vercel

1. Sube este proyecto a un repositorio (GitHub/GitLab).
2. En https://vercel.com, "Add New Project" e importa el repositorio.
3. En **Environment Variables**, agrega las mismas 3 variables de `.env.example`.
4. Deploy.

## Estructura

```
supabase/migrations/     esquema de base de datos (tablas, RLS)
src/app/                 páginas (App Router) — login + secciones del dashboard
src/app/(dashboard)/     todo lo que requiere sesión: layout con sidebar + secciones
src/components/          Sidebar, KpiCard, etc.
src/lib/supabase/        clientes de Supabase (browser y server)
src/lib/types.ts         roles y qué ve cada uno en el menú
```

## Estado actual

Esto es un scaffold: la estructura, la autenticación, el modelo de datos completo y el diseño
(colores tierra, sidebar) ya están. Las páginas de Sell In, Sell Out/Stock y Cubicaje tienen la
forma final pero sin datos aún — falta conectar cada consulta a las tablas correspondientes una
vez migrados los datos reales (Pavso + bases de cada cliente).

El módulo de **Mercaderismo** está modelado en la base de datos pero la pantalla queda en stand
by por ahora, a pedido explícito.
