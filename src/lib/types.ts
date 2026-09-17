export type RolUsuario =
  | "jefa_comercial"
  | "analista_comercial"
  | "trade_marketing"
  | "mercaderista";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

export const NAV_POR_ROL: Record<RolUsuario, string[]> = {
  // qué secciones del sidebar ve cada rol
  jefa_comercial: ["dashboard", "sell-in", "sell-out", "mercaderismo", "cubicaje"],
  analista_comercial: ["dashboard", "sell-in", "cubicaje"],
  trade_marketing: ["dashboard", "mercaderismo"],
  mercaderista: ["dashboard", "sell-out", "cubicaje"]
};
