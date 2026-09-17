"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { RolUsuario } from "@/lib/types";
import { NAV_POR_ROL } from "@/lib/types";

const ITEMS: Record<string, { href: string; label: string }> = {
  dashboard: { href: "/dashboard", label: "Resumen" },
  "sell-in": { href: "/sell-in", label: "Sell In" },
  "sell-out": { href: "/sell-out", label: "Sell Out y Stock" },
  mercaderismo: { href: "/mercaderismo", label: "Mercaderismo" },
  cubicaje: { href: "/cubicaje", label: "Cubicaje" }
};

export default function Sidebar({ rol, nombre }: { rol: RolUsuario; nombre: string }) {
  const pathname = usePathname();
  const visibles = NAV_POR_ROL[rol];
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      {/* Barra superior — solo en celular/tablet (se oculta desde pantallas grandes, "lg") */}
      <header className="flex items-center justify-between border-b border-albar-700 bg-albar-800 px-4 py-3 lg:hidden">
        <div>
          <p className="text-base font-bold text-white">Portal Moderno</p>
          <p className="text-[11px] text-albar-300">Barker · Natural Home · Yogy</p>
        </div>
        <button
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={abierto}
          className="rounded p-2 text-albar-100 hover:bg-albar-700"
        >
          <span className={`block h-0.5 w-6 bg-current transition ${abierto ? "translate-y-2 rotate-45" : "mb-1.5"}`} />
          <span className={`block h-0.5 w-6 bg-current transition ${abierto ? "opacity-0" : "mb-1.5"}`} />
          <span className={`block h-0.5 w-6 bg-current transition ${abierto ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </header>

      {/* Menú desplegable en celular/tablet */}
      {abierto && (
        <nav className="flex flex-col gap-1 border-b border-albar-700 bg-albar-800 px-3 py-3 lg:hidden">
          {visibles.map((key) => {
            const item = ITEMS[key];
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={key}
                href={item.href as any}
                onClick={() => setAbierto(false)}
                className={`rounded px-3 py-2 text-sm ${
                  active ? "bg-albar-700 text-white" : "text-albar-200 hover:bg-albar-700/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-2 border-t border-albar-700 pt-3 text-sm">
            <p className="font-medium text-white">{nombre}</p>
            <p className="text-xs capitalize text-albar-300">{rol.replace("_", " ")}</p>
          </div>
        </nav>
      )}

      {/* Menú lateral fijo — solo en pantallas grandes (escritorio) */}
      <aside className="hidden h-screen w-60 flex-col justify-between bg-albar-800 text-albar-100 lg:flex">
        <div>
          <div className="border-b border-albar-700 px-5 py-6">
            <p className="text-lg font-bold text-white">Portal Moderno</p>
            <p className="text-xs text-albar-300">Barker · Natural Home · Yogy</p>
          </div>
          <nav className="mt-4 flex flex-col gap-1 px-3">
            {visibles.map((key) => {
              const item = ITEMS[key];
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={key}
                  href={item.href as any}
                  className={`rounded px-3 py-2 text-sm ${
                    active ? "bg-albar-700 text-white" : "text-albar-200 hover:bg-albar-700/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-albar-700 px-5 py-4 text-sm">
          <p className="font-medium text-white">{nombre}</p>
          <p className="text-xs capitalize text-albar-300">{rol.replace("_", " ")}</p>
        </div>
      </aside>
    </>
  );
}
