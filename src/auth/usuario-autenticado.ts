export type UsuarioAutenticado = {
  id: string;
  email: string;
  nombre: string;
  monedaBase: "COP" | "USD";
  planId: string;
  createdAt: Date;
  updatedAt: Date;
};
