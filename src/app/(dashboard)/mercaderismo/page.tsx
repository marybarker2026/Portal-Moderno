export default function MercaderismoPage() {
  // Módulo puesto en stand by por pedido de Mary (16-sep-2026) mientras se
  // avanza el resto del portal. El modelo de datos (rutas, visitas,
  // asistencias, fotos_promocion) ya está listo en supabase/migrations.
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-albar-800">Mercaderismo</h1>
      <p className="mb-6 text-sm text-albar-600">Rutas, asistencia y fotos de ejecución de promociones.</p>
      <div className="rounded-lg border border-dashed border-albar-300 bg-white p-10 text-center text-sm text-albar-500">
        Módulo en stand by — se retoma cuando el resto del portal esté avanzado.
      </div>
    </div>
  );
}
