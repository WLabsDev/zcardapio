export type Plan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export type Category = {
  id: string;
  name: string;
};

export type ProductOption = {
  id: string;
  name: string;
  price: number;
};

export type OptionGroup = {
  id: string;
  name: string;
  /** obrigatório escolher pelo menos 1 */
  required?: boolean;
  /** máximo de escolhas no grupo (1 = escolha única) */
  max: number;
  options: ProductOption[];
};

export type Product = {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  popular?: boolean;
  optionGroups?: OptionGroup[];
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  description: string;
  segment: string;
  logo: string;
  cover: string;
  address: string;
  phone: string;
  openingHours: string;
  isOpen: boolean;
  deliveryFee: number;
  minOrder: number;
  deliveryTime: string;
  rating: number;
  categories: Category[];
  plan: string;
  status: "ativo" | "pendente" | "bloqueado";
  createdAt: string;
};

export type OrderStatus =
  | "pendente"
  | "confirmado"
  | "preparando"
  | "saiu_para_entrega"
  | "entregue"
  | "cancelado";

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
};

export type Order = {
  id: string;
  code: string;
  restaurantId: string;
  /** presentes quando o pedido vem da API */
  restaurantName?: string;
  restaurantSlug?: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  deliveryType: "entrega" | "retirada";
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "restaurante" | "cliente";
  createdAt: string;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type ReportPeriod = "7d" | "30d";

export type ReportSnapshot = {
  revenue: number;
  orders: number;
  avgTicket: number;
  /** visitas ao cardápio que viraram pedido, em % */
  conversion: number;
  revenueByDay: ChartPoint[];
  ordersByHour: ChartPoint[];
};

export type TopProductWeek = {
  productId: string;
  quantity: number;
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  preparando: "Preparando",
  saiu_para_entrega: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
