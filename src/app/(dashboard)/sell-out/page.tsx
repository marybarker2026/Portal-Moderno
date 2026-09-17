export default function SellOutPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-albar-800">Sell Out y Stock</h1>
      <p className="mb-6 text-sm text-albar-600">
        Consolidado de los 4 dashboards actuales (Superpet, Cencosud, Tottus, Supesa) — aquí Superpet es nacional.
      </p>
      <div className="rounded-lg border border-dashed border-albar-300 bg-white p-10 text-center text-sm text-albar-500">
        Tabla y gráfico por cliente/tienda/SKU — pendiente de conectar a sell_out y stock_cliente.
      </div>
    </div>
  );
}
