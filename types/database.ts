/**
 * Tipos manuais espelhando db/schema.sql.
 * Após linkar o projeto Supabase (`supabase link`), substitua executando:
 *   npx supabase gen types typescript --project-id <REF> > types/database.ts
 */

export type Theme = "light" | "dark" | "sepia";
export type Accent = "sage" | "clay" | "cobalt" | "plum";
export type Density = "compact" | "comfortable";

export type UserRole = "user" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  city: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
};

export type UserPreferences = {
  user_id: string;
  theme: Theme;
  accent: Accent;
  density: Density;
  hide_amounts: boolean;
  weekly_summary_email: boolean;
  budget_alerts: boolean;
  goal_milestones: boolean;
  ai_insights_email: boolean;
  pin_lock: boolean;
  local_ai: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  icon: string | null;
  color: string | null;
  kind: "income" | "expense";
  position: number;
  created_at: string;
};

export type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  position: number;
};

export type Account = {
  id: string;
  user_id: string;
  name: string;
  provider: string | null;
  mask: string | null;
  balance: number;
  sync_status: "synced" | "error" | "off" | "manual";
  last_synced_at: string | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  merchant: string;
  amount: number;
  occurred_at: string;
  is_recurring: boolean;
  notes: string | null;
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  planned_amount: number;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  target_amount: number;
  saved_amount: number;
  monthly_contribution: number;
  interest_rate: number;
  deadline: string | null;
  created_at: string;
};

export type Trip = {
  id: string;
  user_id: string;
  name: string;
  destination: string | null;
  starts_on: string | null;
  ends_on: string | null;
  total_budget: number;
  saved_amount: number;
  monthly_contribution: number;
  cover_color: string | null;
  created_at: string;
};

export type TripItem = {
  id: string;
  trip_id: string;
  kind: string;
  description: string;
  planned_amount: number;
  actual_amount: number | null;
  status: "planned" | "reserved" | "purchased";
  occurred_at: string | null;
};

export type Insight = {
  id: string;
  user_id: string;
  kind: "win" | "alert" | "idea";
  icon: string | null;
  title: string;
  detail: string | null;
  action_label: string | null;
  action_href: string | null;
  created_at: string;
  dismissed_at: string | null;
};

type TableDef<Row, RequiredInsert> = {
  Row: Row;
  Insert: Partial<Row> & RequiredInsert;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile, { id: string; email: string }>;
      user_preferences: TableDef<UserPreferences, { user_id: string }>;
      categories: TableDef<Category, { user_id: string; slug: string; name: string; kind: "income" | "expense" }>;
      subcategories: TableDef<Subcategory, { category_id: string; name: string }>;
      accounts: TableDef<Account, { user_id: string; name: string }>;
      transactions: TableDef<Transaction, { user_id: string; merchant: string; amount: number; occurred_at: string }>;
      budgets: TableDef<Budget, { user_id: string; category_id: string; month: string; planned_amount: number }>;
      goals: TableDef<Goal, { user_id: string; name: string; target_amount: number }>;
      trips: TableDef<Trip, { user_id: string; name: string }>;
      trip_items: TableDef<TripItem, { trip_id: string; kind: string; description: string }>;
      insights: TableDef<Insight, { user_id: string; kind: "win" | "alert" | "idea"; title: string }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
