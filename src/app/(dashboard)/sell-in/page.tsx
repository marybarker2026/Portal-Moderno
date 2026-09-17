import { createClient } from "@/lib/supabase/server";
import { inicioMesActual, inicioMesSiguiente, mesLabel, fmtMonto } from "@/lib/fechas";

export default async function SellInPage() {
  const supabase = createClient();
  const periodo = inicioMesActual();
  const inicioSiguiente = inicioMesSiguiente();

  const [{ data: clientes }, { data: metas }, { data: sellIn }] = await Promise.all([
    supabase.from("clientes").select("id, nombre").order("nombre"),
    supabase.from("metas").select("cliente_id, monto_meta").eq("periodo", periodo).is("tienda_id", null),
    supabase
      .from("sell_in")
      .select("monto, tiendas!inner(cliente_id)")
      .gte("fecha", periodo)
      .lt("fecha", inicioSiguiente)
  ]);

  const metaPorCliente = new Map<string, number>();
  (metas ?? []).forEach((m) => {
    metaPorCliente.set(m.cliente_id, (metaPorCliente.get(m.cliente_id) ?? 0) + Number(m.monto_meta));
  });

  const sellInPorCliente = new Map<string, number>();
  (sellIn ?? []).forEach((r: any) => {
    const clienteId = r.tiendas?.cliente_id;
    if (!clienteId) return;
    sellInPorCliente.set(clienteId, (sellInPorCliente.get(clienteId) ?? 0) + Number(r.monto ?? 0));
  });

  const filas = (clientes ?? []).map((c) => {
    const meta = metaPorCliente.get(c.id) ?? 0;
    const real = sellInPorCliente.get(c.id) ?? 0;
    const avance = meta > 0 ? Math.round((real / meta) * 100) : null;
    return { ...c, meta, real, avance };
  });

  const totalMeta = filas.reduce((acc, f) => acc + f.meta, 0);
  const totalReal = filas.reduce((acc, f) => acc + f.real, 0);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-albar-800">Sell In</h1>
      <p className="mb-6 text-sm text-albar-600">
        Avance vs. meta por cliente — {mesLabel(periodo)}. La meta de Superpet es la regional de Lima.
      </p>

      <div className="overflow-hidden rounded-lg border border-albar-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-albar-50 text-left text-xs uppercase tracking-wide text-albar-500">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3 text-right">Meta del mes</th>
              <th className="px-4 py-3 text-right">Sell in real</th>
              <th className="px-4 py-3 text-right">Avance</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id} className="border-t border-albar-100">
                <td className="px-4 py-3 font-medium text-albar-800">{f.nombre}</td>
                <td className="px-4 py-3 text-right">{f.meta > 0 ? fmtMonto(f.meta) : "—"}</td>
                <td className="px-4 py-3 text-right">{fmtMonto(f.real)}</td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    f.avance === null
                      ? "text-albar-400"
                      : f.avance >= 90
                        ? "text-estado-activo"
                        : f.avance < 70
                          ? "text-estado-riesgo"
                          : "text-albar-600"
                  }`}
                >
                  {f.avance === null ? "—" : `${f.avance}%`}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-albar-200 bg-albar-50 font-semibold text-albar-800">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right">{fmtMonto(totalMeta)}</td>
              <td className="px-4 py-3 text-right">{fmtMonto(totalReal)}</td>
              <td className="px-4 py-3 text-right">{totalMeta > 0 ? `${Math.round((totalReal / totalMeta) * 100)}%` : "—"}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-4 text-xs text-albar-500">
        Las metas de {mesLabel(periodo)} ya están cargadas. La columna &ldquo;Sell in real&rdquo; se va a llenar
        sola en cuanto carguemos las transacciones de Pavso de este mes.
      </p>
    </div>
  );
}
