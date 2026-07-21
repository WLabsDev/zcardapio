import type {
  Order,
  Plan,
  Product,
  ReportPeriod,
  ReportSnapshot,
  Restaurant,
  TopProductWeek,
  User,
} from "./types";

export const plans: Plan[] = [
  {
    id: "gratis",
    name: "Grátis",
    price: 0,
    description: "Para começar a divulgar seu cardápio.",
    features: [
      "Cardápio digital com link próprio",
      "Até 20 produtos",
      "QR code para mesas",
      "1 usuário",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49.9,
    description: "Para restaurantes que recebem pedidos online.",
    features: [
      "Produtos ilimitados",
      "Pedidos online com carrinho",
      "Personalização de cores e logo",
      "Relatórios de vendas",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 99.9,
    description: "Para redes e operações maiores.",
    features: [
      "Tudo do Pro",
      "Múltiplas unidades",
      "Domínio próprio",
      "Integração com WhatsApp",
      "Gerente de conta dedicado",
    ],
  },
];

export const restaurants: Restaurant[] = [
  {
    id: "r1",
    slug: "burguer-do-ze",
    name: "Burguer do Zé",
    description: "Hambúrgueres artesanais feitos na brasa, do jeito que você gosta.",
    segment: "Hamburgueria",
    logo: "https://placehold.co/128x128/ea580c/fff?text=BZ",
    cover:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80",
    address: "Rua das Flores, 123 — Centro, São Paulo/SP",
    phone: "(11) 99999-1234",
    openingHours: "Ter a Dom · 18h às 23h30",
    isOpen: true,
    deliveryFee: 7.9,
    minOrder: 25,
    deliveryTime: "40–55 min",
    rating: 4.8,
    categories: [
      { id: "c1", name: "Burgers" },
      { id: "c2", name: "Acompanhamentos" },
      { id: "c3", name: "Bebidas" },
      { id: "c4", name: "Sobremesas" },
    ],
    plan: "Pro",
    status: "ativo",
    createdAt: "2026-03-12",
  },
  {
    id: "r2",
    slug: "pizzaria-bella-napoli",
    name: "Pizzaria Bella Napoli",
    description: "Pizza napolitana de fermentação lenta, assada em forno a lenha.",
    segment: "Pizzaria",
    logo: "https://placehold.co/128x128/16a34a/fff?text=BN",
    cover:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
    address: "Av. Itália, 450 — Moema, São Paulo/SP",
    phone: "(11) 98888-5678",
    openingHours: "Todos os dias · 18h às 00h",
    isOpen: true,
    deliveryFee: 9.9,
    minOrder: 40,
    deliveryTime: "50–65 min",
    rating: 4.9,
    categories: [
      { id: "c1", name: "Pizzas Tradicionais" },
      { id: "c2", name: "Pizzas Especiais" },
      { id: "c3", name: "Bebidas" },
    ],
    plan: "Premium",
    status: "ativo",
    createdAt: "2026-01-20",
  },
  {
    id: "r3",
    slug: "sushi-kai",
    name: "Sushi Kai",
    description: "Culinária japonesa contemporânea com peixes selecionados.",
    segment: "Japonesa",
    logo: "https://placehold.co/128x128/dc2626/fff?text=SK",
    cover:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80",
    address: "Rua Liberdade, 89 — Liberdade, São Paulo/SP",
    phone: "(11) 97777-9012",
    openingHours: "Seg a Sáb · 11h30 às 22h",
    isOpen: false,
    deliveryFee: 12.9,
    minOrder: 60,
    deliveryTime: "35–50 min",
    rating: 4.7,
    categories: [
      { id: "c1", name: "Combinados" },
      { id: "c2", name: "Temakis" },
      { id: "c3", name: "Bebidas" },
    ],
    plan: "Grátis",
    status: "pendente",
    createdAt: "2026-07-02",
  },
];

export const products: Product[] = [
  // Burguer do Zé
  {
    id: "p1",
    restaurantId: "r1",
    categoryId: "c1",
    name: "Zé Clássico",
    description:
      "Pão brioche, blend 160g, queijo cheddar, alface, tomate e molho da casa.",
    price: 29.9,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    available: true,
    popular: true,
  },
  {
    id: "p2",
    restaurantId: "r1",
    categoryId: "c1",
    name: "Zé Bacon Duplo",
    description:
      "Dois blends de 160g, dobro de cheddar, bacon crocante e maionese defumada.",
    price: 39.9,
    image:
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80",
    available: true,
    popular: true,
  },
  {
    id: "p3",
    restaurantId: "r1",
    categoryId: "c1",
    name: "Zé Veggie",
    description: "Burger de grão-de-bico, queijo prato, rúcula e tomate seco.",
    price: 27.9,
    image:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&q=80",
    available: true,
  },
  {
    id: "p4",
    restaurantId: "r1",
    categoryId: "c2",
    name: "Batata Rústica",
    description: "Porção de batata rústica com alecrim e páprica. Serve 2.",
    price: 18.9,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80",
    available: true,
  },
  {
    id: "p5",
    restaurantId: "r1",
    categoryId: "c2",
    name: "Onion Rings",
    description: "Anéis de cebola empanados com molho barbecue.",
    price: 16.9,
    image:
      "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&q=80",
    available: false,
  },
  {
    id: "p6",
    restaurantId: "r1",
    categoryId: "c3",
    name: "Refrigerante Lata",
    description: "Coca-Cola, Guaraná ou Sprite — 350ml.",
    price: 6.5,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80",
    available: true,
  },
  {
    id: "p7",
    restaurantId: "r1",
    categoryId: "c3",
    name: "Suco Natural",
    description: "Laranja, limão ou abacaxi com hortelã — 500ml.",
    price: 10.9,
    image:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80",
    available: true,
  },
  {
    id: "p8",
    restaurantId: "r1",
    categoryId: "c4",
    name: "Brownie com Sorvete",
    description: "Brownie de chocolate meio amargo com sorvete de creme.",
    price: 15.9,
    image:
      "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&q=80",
    available: true,
    popular: true,
  },
  {
    id: "p15",
    restaurantId: "r1",
    categoryId: "c4",
    name: "Açaí na Tigela",
    description:
      "Açaí batido na hora. Escolha o tamanho, as frutas e os adicionais do seu jeito.",
    price: 18.9,
    image:
      "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&q=80",
    available: true,
    popular: true,
    optionGroups: [
      {
        id: "g1",
        name: "Tamanho",
        required: true,
        max: 1,
        options: [
          { id: "t1", name: "300ml", price: 0 },
          { id: "t2", name: "500ml", price: 6 },
          { id: "t3", name: "700ml", price: 10 },
        ],
      },
      {
        id: "g2",
        name: "Frutas (até 3, grátis)",
        max: 3,
        options: [
          { id: "f1", name: "Banana", price: 0 },
          { id: "f2", name: "Morango", price: 0 },
          { id: "f3", name: "Kiwi", price: 0 },
          { id: "f4", name: "Manga", price: 0 },
        ],
      },
      {
        id: "g3",
        name: "Adicionais",
        max: 5,
        options: [
          { id: "a1", name: "Leite Ninho", price: 3 },
          { id: "a2", name: "Nutella", price: 5 },
          { id: "a3", name: "Paçoca", price: 2.5 },
          { id: "a4", name: "Granola", price: 2 },
          { id: "a5", name: "Leite condensado", price: 2.5 },
        ],
      },
    ],
  },
  // Pizzaria Bella Napoli
  {
    id: "p9",
    restaurantId: "r2",
    categoryId: "c1",
    name: "Margherita",
    description: "Molho de tomate San Marzano, muçarela de búfala e manjericão.",
    price: 54.9,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
    available: true,
    popular: true,
  },
  {
    id: "p10",
    restaurantId: "r2",
    categoryId: "c1",
    name: "Calabresa",
    description: "Calabresa artesanal, cebola roxa e azeitonas pretas.",
    price: 49.9,
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80",
    available: true,
  },
  {
    id: "p11",
    restaurantId: "r2",
    categoryId: "c2",
    name: "Tartufo",
    description: "Creme de trufa negra, muçarela, cogumelos e parmesão.",
    price: 79.9,
    image:
      "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&q=80",
    available: true,
    popular: true,
  },
  {
    id: "p12",
    restaurantId: "r2",
    categoryId: "c3",
    name: "Vinho da Casa (taça)",
    description: "Tinto italiano selecionado pelo chef.",
    price: 24.9,
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80",
    available: true,
  },
  // Sushi Kai
  {
    id: "p13",
    restaurantId: "r3",
    categoryId: "c1",
    name: "Combinado 20 peças",
    description: "Seleção do chef: sashimis, niguiris e uramakis.",
    price: 89.9,
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80",
    available: true,
    popular: true,
  },
  {
    id: "p14",
    restaurantId: "r3",
    categoryId: "c2",
    name: "Temaki Salmão",
    description: "Salmão fresco, arroz temperado e cream cheese.",
    price: 32.9,
    image:
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&q=80",
    available: true,
  },
];

export const orders: Order[] = [
  {
    id: "o1",
    code: "#1042",
    restaurantId: "r1",
    customerName: "Mariana Souza",
    items: [
      { productId: "p2", name: "Zé Bacon Duplo", quantity: 2, unitPrice: 39.9 },
      { productId: "p4", name: "Batata Rústica", quantity: 1, unitPrice: 18.9 },
      { productId: "p6", name: "Refrigerante Lata", quantity: 2, unitPrice: 6.5 },
    ],
    total: 111.7,
    status: "preparando",
    paymentMethod: "Pix",
    deliveryType: "entrega",
    createdAt: "2026-07-19T19:32:00",
  },
  {
    id: "o2",
    code: "#1041",
    restaurantId: "r1",
    customerName: "Carlos Lima",
    items: [
      { productId: "p1", name: "Zé Clássico", quantity: 1, unitPrice: 29.9 },
      { productId: "p8", name: "Brownie com Sorvete", quantity: 1, unitPrice: 15.9 },
    ],
    total: 45.8,
    status: "pendente",
    paymentMethod: "Cartão na entrega",
    deliveryType: "entrega",
    createdAt: "2026-07-19T19:28:00",
  },
  {
    id: "o3",
    code: "#1040",
    restaurantId: "r1",
    customerName: "Ana Beatriz",
    items: [
      { productId: "p3", name: "Zé Veggie", quantity: 1, unitPrice: 27.9 },
    ],
    total: 27.9,
    status: "saiu_para_entrega",
    paymentMethod: "Pix",
    deliveryType: "entrega",
    createdAt: "2026-07-19T19:05:00",
  },
  {
    id: "o4",
    code: "#1039",
    restaurantId: "r1",
    customerName: "Pedro Alves",
    items: [
      { productId: "p2", name: "Zé Bacon Duplo", quantity: 1, unitPrice: 39.9 },
      { productId: "p7", name: "Suco Natural", quantity: 1, unitPrice: 10.9 },
    ],
    total: 50.8,
    status: "entregue",
    paymentMethod: "Dinheiro",
    deliveryType: "retirada",
    createdAt: "2026-07-19T18:40:00",
  },
  {
    id: "o5",
    code: "#1038",
    restaurantId: "r1",
    customerName: "Juliana Prado",
    items: [
      { productId: "p1", name: "Zé Clássico", quantity: 3, unitPrice: 29.9 },
    ],
    total: 89.7,
    status: "cancelado",
    paymentMethod: "Pix",
    deliveryType: "entrega",
    createdAt: "2026-07-19T18:12:00",
  },
];

export const users: User[] = [
  { id: "u1", name: "Willian Lucas", email: "admin@zcardapio.com.br", role: "admin", createdAt: "2026-01-05" },
  { id: "u2", name: "José Ferreira", email: "ze@burguerdoze.com.br", role: "restaurante", createdAt: "2026-03-12" },
  { id: "u3", name: "Giovanna Rossi", email: "gio@bellanapoli.com.br", role: "restaurante", createdAt: "2026-01-20" },
  { id: "u4", name: "Kenji Tanaka", email: "kenji@sushikai.com.br", role: "restaurante", createdAt: "2026-07-02" },
  { id: "u5", name: "Mariana Souza", email: "mari.souza@gmail.com", phone: "11999991234", role: "cliente", createdAt: "2026-04-18" },
  { id: "u6", name: "Carlos Lima", email: "carlos.lima@gmail.com", phone: "11988885678", role: "cliente", createdAt: "2026-05-30" },
];

export const reportData: Record<ReportPeriod, ReportSnapshot> = {
  "7d": {
    revenue: 1577.4,
    orders: 33,
    avgTicket: 47.8,
    conversion: 18.4,
    revenueByDay: [
      { label: "Seg", value: 186.4 },
      { label: "Ter", value: 142.8 },
      { label: "Qua", value: 201.5 },
      { label: "Qui", value: 178.2 },
      { label: "Sex", value: 289.7 },
      { label: "Sáb", value: 342.6 },
      { label: "Dom", value: 236.2 },
    ],
    ordersByHour: [
      { label: "11h", value: 3 },
      { label: "12h", value: 6 },
      { label: "13h", value: 4 },
      { label: "14h", value: 2 },
      { label: "15h", value: 1 },
      { label: "16h", value: 1 },
      { label: "17h", value: 2 },
      { label: "18h", value: 4 },
      { label: "19h", value: 7 },
      { label: "20h", value: 6 },
      { label: "21h", value: 4 },
      { label: "22h", value: 2 },
      { label: "23h", value: 1 },
    ],
  },
  "30d": {
    revenue: 6240.8,
    orders: 132,
    avgTicket: 47.28,
    conversion: 16.9,
    revenueByDay: [
      168, 142, 189, 201, 156, 232, 198, 174, 151, 196, 208, 162, 241, 205,
      181, 158, 203, 214, 169, 248, 212, 187, 164, 211, 223, 178, 256, 219,
      194, 171,
    ].map((value, i) => ({ label: String(i + 1), value })),
    ordersByHour: [
      { label: "11h", value: 12 },
      { label: "12h", value: 24 },
      { label: "13h", value: 17 },
      { label: "14h", value: 9 },
      { label: "15h", value: 5 },
      { label: "16h", value: 6 },
      { label: "17h", value: 8 },
      { label: "18h", value: 16 },
      { label: "19h", value: 27 },
      { label: "20h", value: 23 },
      { label: "21h", value: 15 },
      { label: "22h", value: 8 },
      { label: "23h", value: 4 },
    ],
  },
};

export const topProductsWeek: TopProductWeek[] = [
  { productId: "p2", quantity: 41 },
  { productId: "p1", quantity: 36 },
  { productId: "p15", quantity: 28 },
  { productId: "p8", quantity: 22 },
  { productId: "p4", quantity: 19 },
];

export function getRestaurantBySlug(slug: string) {
  return restaurants.find((r) => r.slug === slug);
}

export function getProductsByRestaurant(restaurantId: string) {
  return products.filter((p) => p.restaurantId === restaurantId);
}
