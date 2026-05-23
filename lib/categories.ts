import {
  Briefcase,
  Car,
  Coffee,
  HeartPulse,
  Home,
  type LucideIcon,
  PiggyBank,
  Receipt,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";

export type CategoryKind = "income" | "expense";

export type CategorySeed = {
  slug: string;
  name: string;
  icon: keyof typeof categoryIcons;
  color: string;          // OKLch token-friendly hex/oklch — used for soft chip backgrounds
  kind: CategoryKind;
  subcategories: string[];
};

export const categoryIcons = {
  home: Home,
  car: Car,
  coffee: Coffee,
  heart: HeartPulse,
  sparkles: Sparkles,
  receipt: Receipt,
  briefcase: Briefcase,
  wallet: Wallet,
  bag: ShoppingBag,
  piggy: PiggyBank,
} satisfies Record<string, LucideIcon>;

export const defaultCategories: CategorySeed[] = [
  {
    slug: "moradia",
    name: "Moradia",
    icon: "home",
    color: "oklch(0.7 0.08 145)",
    kind: "expense",
    subcategories: [
      "Aluguel",
      "Condomínio",
      "Água",
      "Luz",
      "Gás",
      "Internet",
      "Seguro residencial",
      "Manutenção",
      "IPTU",
    ],
  },
  {
    slug: "transporte",
    name: "Transporte",
    icon: "car",
    color: "oklch(0.7 0.09 245)",
    kind: "expense",
    subcategories: ["Combustível", "Estacionamento", "Pedágio", "Manutenção"],
  },
  {
    slug: "dia-a-dia",
    name: "Dia a dia",
    icon: "coffee",
    color: "oklch(0.72 0.09 70)",
    kind: "expense",
    subcategories: [
      "Mercado",
      "Restaurantes",
      "Cafés",
      "Padaria",
      "Delivery",
      "Cuidados pessoais",
      "Vestuário",
    ],
  },
  {
    slug: "saude",
    name: "Saúde",
    icon: "heart",
    color: "oklch(0.68 0.12 25)",
    kind: "expense",
    subcategories: ["Plano de saúde", "Farmácia", "Consultas", "Exames", "Academia"],
  },
  {
    slug: "lazer",
    name: "Lazer",
    icon: "sparkles",
    color: "oklch(0.7 0.13 320)",
    kind: "expense",
    subcategories: [
      "Streaming",
      "Shows",
      "Cinema",
      "Viagens curtas",
      "Hobbies",
      "Livros",
      "Jogos",
      "Eventos",
    ],
  },
  {
    slug: "obrigacoes",
    name: "Obrigações",
    icon: "receipt",
    color: "oklch(0.6 0.05 270)",
    kind: "expense",
    subcategories: ["Impostos", "Empréstimos", "Cartão de crédito", "Assinaturas"],
  },
  {
    slug: "carro-uber",
    name: "Carro Uber/99",
    icon: "briefcase",
    color: "oklch(0.66 0.1 50)",
    kind: "expense",
    subcategories: ["Aluguel do carro", "Lavagem", "Revisão"],
  },
  {
    slug: "renda",
    name: "Renda",
    icon: "wallet",
    color: "oklch(0.62 0.13 150)",
    kind: "income",
    subcategories: ["Uber", "99", "Renda extra"],
  },
];
