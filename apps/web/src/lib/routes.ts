import type { UserRole } from "@/types/api";

export const routes = {
  home: "/",
  catalog: "/catalogo",
  stores: "/tiendas",
  trackOrder: "/rastrear-pedido",
  login: "/login",
  buyerRegister: "/registro/comprador",
  sellerRegister: "/registro/vendedor",
  buyerDashboard: "/comprador",
  buyerCart: "/comprador/carrito",
  buyerCheckout: "/comprador/checkout",
  buyerOrders: "/comprador/pedidos",
  buyerProfile: "/comprador/perfil",
  sellerDashboard: "/vendedor",
  sellerProfile: "/vendedor/perfil",
  adminDashboard: "/admin",
};

export function dashboardForRole(role: UserRole) {
  if (role === "buyer") {
    return routes.buyerDashboard;
  }

  if (role === "seller") {
    return routes.sellerDashboard;
  }

  return routes.adminDashboard;
}
