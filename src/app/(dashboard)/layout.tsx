import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import type { RolUsuario } from "@/lib/types";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("nombre, rol")
    .eq("id", user!.id)
    .single();

  const rol = (perfil?.rol ?? "mercaderista") as RolUsuario;
  const nombre = perfil?.nombre ?? user!.email ?? "Usuario";

  return (
    <div className="min-h-screen bg-albar-50 lg:flex">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
