export default function KpiCard({
  label,
  value,
  subvalue,
  tone = "neutral"
}: {
  label: string;
  value: string;
  subvalue?: string;
  tone?: "neutral" | "positivo" | "negativo";
}) {
  const toneClass =
    tone === "positivo" ? "text-estado-activo" : tone === "negativo" ? "text-estado-riesgo" : "text-albar-800";

  return (
    <div className="rounded-lg border border-albar-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-albar-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>{value}</p>
      {subvalue && <p className="mt-1 text-xs text-albar-500">{subvalue}</p>}
    </div>
  );
}
