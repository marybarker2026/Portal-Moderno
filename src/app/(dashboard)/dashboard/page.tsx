import KpiCard from "@/components/KpiCard";

// Vista de resumen — placeholder con la forma final de las tarjetas KPI.
// Los valores se reemplazan por consultas reales a sell_in / sell_out / metas
// una vez conectado el proyecto de Supabase (ver README).
export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-albar-800">Resumen</h1>
      <p className="mb-6 text-sm text-albar-600">Avance del mes en curso — todos los clientes</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Sell In vs. meta" value="—" subvalue="Conectar Supabase" />
        <KpiCard label="Sell Out del mes" value="—" subvalue="Conectar Supabase" />
        <KpiCard label="Stock en tiendas" value="—" subvalue="Conectar Supabase" />
        <KpiCard label="Fotos por validar" value="—" subvalue="Conectar Supabase" />
      </div>
    </div>
  );
}
