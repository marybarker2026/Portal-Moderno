export function inicioMesActual(): string {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`;
}

export function inicioMesSiguiente(): string {
  const ahora = new Date();
  const siguiente = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);
  return `${siguiente.getFullYear()}-${String(siguiente.getMonth() + 1).padStart(2, "0")}-01`;
}

export function mesLabel(periodo: string): string {
  return new Date(`${periodo}T00:00:00`).toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric"
  });
}

export function fmtMonto(n: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0
  }).format(n);
}
