import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Moderno",
  description: "Sell In, Sell Out, Stock y Mercaderismo — Moderno / Grupo Albar"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
