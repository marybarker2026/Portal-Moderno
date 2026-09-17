import KpiCard from "@/components/KpiCard";
import { createClient } from "@/lib/supabase/server";
import { inicioMesActual, inicioMesSiguiente, mesLabel, fmtMonto } from "@/lib/fechas";

export default async function DashboardPage() {
  const supabase = createClient();
  const periodo = inicioMesActual();
  const inicioSiguiente = inicioMesSiguiente();

  const [{ data: metas }, { data: sellIn }, { data: sellOut }, { data: ultimaFechaStock }] = await Promise.all([
    supabase.from("metas").select("monto_meta").eq("periodo", periodo),
    supabase.from("sell_in").select("monto").gte("fecha", periodo).lt("fecha", inicioSiguiente),
    supabase.from("sell_out").select("monto").gte("fecha", periodo).lt("fecha", inicioSiguiente),
    supabase.from("stock_cliente").select("fecha").order("fecha", { ascending: false }).limit(1).maybeSingle()
  ]);

  const { data: stock } = ultimaFechaStock
    ? await supabase.from("stock_cliente").select("cantidad").eq("fecha", ultimaFechaStock.fecha)
    : { data: [] as { cantidad: number }[] };

  const totalMeta = (metas ?? []).reduce((acc, m) => acc + Number(m.monto_meta), 0);
  const totalSellIn = (sellIn ?? []).reduce((acc, r) => acc + Number(r.monto ?? 0), 0);
  const totalSellOut = (sellOut ?? []).reduce((acc, r) => acc + Number(r.monto ?? 0), 0);
  const totalStock = (stock ?? []).reduce((acc, r) => acc + Number(r.cantidad ?? 0), 0);
  const avance = totalMeta > 0 ? Math.round((totalSellIn / totalMeta) * 100) : 0;

  const sinTransacciones = totalSellIn === 0 && totalSellOut === 0;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-albar-800">Resumen</h1>
      <p className="mb-6 text-sm text-albar-600">Avance del mes en curso — todos los clientes</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Sell In vs. meta"
          value={totalMeta > 0 ? `${avance}%` : "—"}
          subvalue={totalMeta > 0 ? `${fmtMonto(totalSellIn)} de ${fmtMonto(totalMeta)}` : "Sin meta cargada este mes"}
          tone={avance >= 90 ? "positivo" : avance > 0 && avance < 70 ? "negativo" : "neutral"}
        />
        <KpiCard label="Sell Out del mes" value={fmtMonto(totalSellOut)} subvalue="Suma de todos los clientes" />
        <KpiCard
          label="Stock en tiendas"
          value={totalStock > 0 ? totalStock.toLocaleString("es-PE") : "—"}
          subvalue={ultimaFechaStock ? `Al ${mesLabel(ultimaFechaStock.fecha)}` : "Aún sin datos cargados"}
        />
        <KpiCard label="Fotos por validar" value="—" subvalue="Módulo Mercaderismo en stand by" />
      </div>

      {sinTransacciones && (
        <p className="mt-6 text-xs text-albar-500">
          Las metas de {mesLabel(periodo)} ya están cargadas y conectadas. Sell In, Sell Out y Stock mostrarán
          cifras reales en cuanto carguemos las transacciones desde Pavso y los portales de cada cliente.
        </p>
      )}
    </div>
  );
}
