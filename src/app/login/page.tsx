"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-albar-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-albar-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h1 className="mb-1 text-xl font-bold text-albar-800">Portal Moderno</h1>
        <p className="mb-6 text-sm text-albar-600">Ingresa con tu cuenta de Grupo Albar</p>

        <label className="mb-1 block text-sm font-medium text-albar-700">Correo</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border border-albar-300 px-3 py-2 text-sm focus:border-albar-600 focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-albar-700">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded border border-albar-300 px-3 py-2 text-sm focus:border-albar-600 focus:outline-none"
        />

        {error && <p className="mb-4 text-sm text-estado-riesgo">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-albar-800 py-2 text-sm font-semibold text-white hover:bg-albar-700 disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
