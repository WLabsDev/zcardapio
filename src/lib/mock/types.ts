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

/** Horário de funcionamento de um dia da semana. */
export type DayHours = {
  /** 0 = domingo ... 6 = sábado */
  day: number;
  /** "18:00" */
  open: string;
  /** "23:30" */
  close: string;
  /** dia fechado */
  closed: boolean;
};

export type PaymentMethod = "pix" | "cartao" | "dinheiro";

export type DeliveryZone = { id: string; name: string; fee: number };

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
  /** cor de destaque do cardápio (hex) — aplicada como --primary no /r/[slug] */
  primaryColor?: string;
  /** horário estruturado por dia da semana */
  hours?: DayHours[];
  /** mensagem de pausa temporária (restaurante fechado momentaneamente) */
  pauseMessage?: string;
  /** aviso/promoção exibido no topo do cardápio */
  bannerText?: string;
  /** número de WhatsApp para contato/pedidos */
  whatsapp?: string;
  /** mensagem personalizada pós-pedido */
  confirmMessage?: string;
  /** métodos de pagamento aceitos */
  paymentMethods?: PaymentMethod[];
  /** tema do cardápio */
  theme?: "claro" | "escuro";
  /** fonte de destaque do cardápio */
  font?: "bricolage" | "jakarta" | "mono";
  /** estilo dos botões */
  buttonStyle?: "arredondado" | "reto";
  /** paleta personalizada (hex); vazio = padrão do tema */
  headingColor?: string;
  productTitleColor?: string;
  bodyColor?: string;
  mutedColor?: string;
  bgColor?: string;
  cardColor?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  /** aceita pedidos agendados */
  acceptsScheduled?: boolean;
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
  /** preço unitário já somado às opções extras */
  unitPrice: number;
  notes?: string;
  options?: { groupName: string; name: string; price: number }[];
};

export type Order = {
  id: string;
  code: string;
  restaurantId: string;
  /** presentes quando o pedido vem da API */
  restaurantName?: string;
  restaurantSlug?: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  deliveryType: "entrega" | "retirada";
  address?: string;
  zoneName?: string;
  scheduledFor?: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
