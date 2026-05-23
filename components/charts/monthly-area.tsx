"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { brl, brlCompact, dateBR } from "@/lib/format";

type Props = {
  data: Array<{ date: string; income: number; expense: number }>;
};

export function MonthlyArea({ data }: Props) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 12, right: 8, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--danger)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--danger)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
            }}
            stroke="var(--muted)"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            tickFormatter={(v) => brlCompact(Number(v))}
            stroke="var(--muted)"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            cursor={{ stroke: "var(--line-strong)", strokeWidth: 1 }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              boxShadow: "var(--shadow-2)",
              fontSize: 12,
            }}
            labelFormatter={(v) => dateBR(v as string)}
            formatter={(value, name) => [
              brl(Number(value)),
              name === "income" ? "Receita" : "Despesa",
            ]}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="var(--accent)"
            strokeWidth={1.75}
            fill="url(#gIncome)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="var(--danger)"
            strokeWidth={1.75}
            fill="url(#gExpense)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
