"use client";

import {
  ComposedChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/format";

export type Candle = { time: string; open: number; high: number; low: number; close: number };

function timeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function CandlestickChart({ candles }: { candles: Candle[] }) {
  if (candles.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-muted">
        No price history yet.
      </div>
    );
  }

  const data = candles.map((c) => ({
    ...c,
    label: timeLabel(c.time),
    bullish: c.close >= c.open,
    wickRange: [c.low, c.high] as [number, number],
    bodyRange: [Math.min(c.open, c.close), Math.max(c.open, c.close)] as [number, number],
  }));

  const lows = candles.map((c) => c.low);
  const highs = candles.map((c) => c.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const pad = (max - min) * 0.08 || max * 0.01 || 1;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }} barCategoryGap="20%">
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--color-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis
            domain={[min - pad, max + pad]}
            stroke="var(--color-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(v) => formatCurrency(v, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              fontSize: 12,
            }}
            formatter={(_value, _name, item) => {
              const c = item.payload as Candle;
              return [
                `O ${formatCurrency(c.open)}  H ${formatCurrency(c.high)}  L ${formatCurrency(c.low)}  C ${formatCurrency(c.close)}`,
                "",
              ];
            }}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="wickRange" stackId="candle" barSize={2} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={`wick-${i}`} fill={d.bullish ? "var(--color-success)" : "var(--color-danger)"} />
            ))}
          </Bar>
          <Bar dataKey="bodyRange" stackId="candle" barSize={9} radius={1} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={`body-${i}`} fill={d.bullish ? "var(--color-success)" : "var(--color-danger)"} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
