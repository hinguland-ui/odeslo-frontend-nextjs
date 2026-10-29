"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from "recharts";
import { Panel, Skeleton } from "@/components/ui";
import type { RevenueReportRow } from "@/lib/api/dashboard";
import { inrShort } from "@/lib/utils/format";

/** ISO week number (W38 …). */
function isoWeek(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/** Last 8 weeks of deal (booking) payments, oldest first. */
export function weeklyDealRevenue(rows: RevenueReportRow[] | undefined, weeks = 8) {
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (weeks - 1 - i) * 7);
    return { week: `W${isoWeek(d)}`, amount: 0 };
  });
  rows
    ?.filter((r) => r.ref_type === "booking")
    .forEach((r) => {
      const b = buckets.find((x) => x.week === `W${isoWeek(new Date(r.date))}`);
      if (b) b.amount += r.amount;
    });
  return buckets;
}

export function WeeklyRevenueChart({ rows, loading }: { rows?: RevenueReportRow[]; loading: boolean }) {
  const data = weeklyDealRevenue(rows);
  const last = data.length - 1;
  return (
    <Panel className="flex min-h-[593px] flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold leading-[21px] text-ink">Deal revenue by week</h2>
        <span className="text-[12px] leading-[15px] text-muted">GMV · last 8 weeks</span>
      </div>
      <div className="mt-3 flex-1">
        {loading ? (
          <Skeleton className="h-full min-h-[480px]" />
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={480}>
            <BarChart data={data} margin={{ top: 24, right: 0, left: 0, bottom: 0 }} barCategoryGap="18%">
              <XAxis
                dataKey="week"
                axisLine={{ stroke: "var(--color-line)" }}
                tickLine={false}
                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                tickMargin={12}
              />
              <Bar dataKey="amount" radius={[10, 10, 4, 4]} minPointSize={4} isAnimationActive={false}>
                {data.map((_, i) => (
                  <Cell key={i} fill={i === last ? "var(--color-violet)" : "var(--color-blue-bg)"} />
                ))}
                <LabelList
                  dataKey="amount"
                  position="top"
                  offset={7}
                  formatter={(v) => inrShort(Number(v))}
                  style={{ fill: "var(--color-body)", fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  );
}
