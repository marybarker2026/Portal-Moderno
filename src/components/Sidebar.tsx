"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <aside className="flex h-screen w-60 flex-col justify-between bg-albar-800 text-albar-100">
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
  );
}
