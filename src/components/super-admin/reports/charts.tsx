"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import {
  Area, AreaChart, Bar, BarChart, Brush, CartesianGrid, Cell, ComposedChart, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { EmptyState, Panel, Skeleton } from "@/components/ui";
import type { NameValue, Point } from "@/lib/api/reports";
import { inrShort, titleCase } from "@/lib/utils/format";

/** Chart colours: the same hues on light and dark, the axes and grid follow the theme. */
export const C = { violet: "#7b6ef6", green: "#2f9e44", blue: "#3558c4", amber: "#e8a33d", rose: "#e5566d", teal: "#14b8a6", grey: "#8c8c96", peach: "#f08a4b" };
const PALETTE = [C.violet, C.green, C.blue, C.amber, C.rose, C.teal, C.peach, C.grey];
const AXIS = { fontSize: 11, fill: "var(--color-muted)" };
const GRID = "var(--color-line)";

const money = (v: number) => (v >= 1000 ? inrShort(v) : `₹${Math.round(v)}`);
const full = (v: number) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function Tip({ active, payload, label, money: isMoney = [] }: { active?: boolean; payload?: { name: string; value: number; color: string; dataKey: string }[]; label?: string; money?: string[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[14px] border border-line bg-white px-3 py-2 text-[12px] shadow-lg">
      {label && <p className="mb-1 font-bold text-ink">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-body">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}</span>
          <span className="ml-auto pl-3 font-bold text-ink">{isMoney.includes(p.dataKey) ? full(p.value) : p.value.toLocaleString("en-IN")}</span>
        </p>
      ))}
    </div>
  );
}

/** Titled card around a chart, with a loading skeleton and an empty message. */
export function ChartCard({ title, sub, loading, empty, height = 260, className, aside, children }: { title: string; sub?: string; loading?: boolean; empty?: boolean; height?: number; className?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <Panel className={className}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold leading-[19px] text-ink">{title}</h2>
          {sub && <p className="mt-0.5 text-[11px] leading-[14px] text-muted">{sub}</p>}
        </div>
        {aside}
      </div>
      <div style={{ height }}>
        {loading ? <Skeleton className="h-full w-full" /> : empty ? <div className="grid h-full place-items-center"><EmptyState title="No data for these filters" /></div> : children}
      </div>
    </Panel>
  );
}

const tickEvery = (n: number) => Math.max(0, Math.ceil(n / 12) - 1);

/** Money in over time (group deals + maintenance stacked) with the net line after refunds. */
export function RevenueChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval={tickEvery(data.length)} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={money} width={52} />
        <Tooltip content={<Tip money={["booking", "maintenance", "net", "refunds"]} />} cursor={{ fill: "var(--color-mist)", opacity: 0.6 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="booking" name="Group deals" stackId="r" fill={C.violet} radius={[0, 0, 0, 0]} />
        <Bar dataKey="maintenance" name="Maintenance" stackId="r" fill={C.green} radius={[4, 4, 0, 0]} />
        <Line dataKey="net" name="Net after refunds" stroke={C.amber} strokeWidth={2.2} dot={false} type="monotone" />
        {data.length > 45 && <Brush dataKey="label" height={20} stroke={C.violet} travellerWidth={8} fill="transparent" />}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function BookingsChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 6, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval={tickEvery(data.length)} />
        <YAxis yAxisId="a" tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
        <YAxis yAxisId="b" orientation="right" tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
        <Tooltip content={<Tip />} cursor={{ fill: "var(--color-mist)", opacity: 0.6 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="a" dataKey="bookings" name="Bookings" fill={C.blue} radius={[4, 4, 0, 0]} />
        <Line yAxisId="b" dataKey="units" name="Units booked" stroke={C.rose} strokeWidth={2} dot={false} type="monotone" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function AreaTrend({ data, dataKey, name, color = C.teal }: { data: Point[]; dataKey: keyof Point; name: string; color?: string }) {
  const id = `g-${String(dataKey)}`;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval={tickEvery(data.length)} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
        <Tooltip content={<Tip />} />
        <Area dataKey={dataKey as string} name={name} stroke={color} strokeWidth={2} fill={`url(#${id})`} type="monotone" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RaisedResolved({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval={tickEvery(data.length)} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
        <Tooltip content={<Tip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Line dataKey="complaints" name="Raised" stroke={C.rose} strokeWidth={2} dot={false} type="monotone" />
        <Line dataKey="resolved" name="Resolved" stroke={C.green} strokeWidth={2} dot={false} type="monotone" />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Ring chart with its legend (name, value and share) next to it. */
export function Donut({ data, nameFormat = titleCase, money: isMoney }: { data: NameValue[]; nameFormat?: (s: string) => string; money?: boolean }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex h-full items-center gap-3">
      <div className="h-full min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="92%" paddingAngle={data.length > 1 ? 2 : 0} stroke="none">
              {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => (isMoney ? full(Number(v)) : Number(v).toLocaleString("en-IN"))} contentStyle={{ borderRadius: 14, border: "1px solid var(--color-line)", background: "var(--color-white)", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-[44%] shrink-0 space-y-1.5 overflow-hidden text-[12px]">
        {data.slice(0, 8).map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="min-w-0 flex-1 truncate text-body">{nameFormat(d.name)}</span>
            <span className="font-bold text-ink">{isMoney ? money(d.value) : d.value}</span>
            <span className="w-9 text-right text-muted">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal stacked bars: revenue of each society. */
export function SocietyRevenue({ data }: { data: { name: string; booking: number; maintenance: number }[] }) {
  const rows = [...data].reverse();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={money} />
        <YAxis type="category" dataKey="name" tick={{ ...AXIS, fill: "var(--color-body)" }} tickLine={false} axisLine={false} width={120} tickFormatter={(v: string) => (v.length > 17 ? `${v.slice(0, 16)}…` : v)} />
        <Tooltip content={<Tip money={["booking", "maintenance"]} />} cursor={{ fill: "var(--color-mist)", opacity: 0.6 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="booking" name="Group deals" stackId="s" fill={C.violet} />
        <Bar dataKey="maintenance" name="Maintenance" stackId="s" fill={C.green} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Plain columns with one colour per bar (deal categories, job status, ratings...). */
export function Columns({ data, dataKey = "value", name = "Count", money: isMoney, colorful }: { data: readonly object[]; dataKey?: string; name?: string; money?: boolean; colorful?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data as object[]} margin={{ top: 6, right: 4, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval={0} tickFormatter={(v: string) => (v.length > 11 ? `${v.slice(0, 10)}…` : v)} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={isMoney ? 52 : 36} tickFormatter={isMoney ? money : undefined} />
        <Tooltip content={<Tip money={isMoney ? [dataKey] : []} />} cursor={{ fill: "var(--color-mist)", opacity: 0.6 }} />
        <Bar dataKey={dataKey} name={name} radius={[5, 5, 0, 0]} fill={C.violet}>
          {colorful && data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Billed vs collected per period with the collection rate line. */
export function MaintenanceChart({ data }: { data: { period: string; billed: number; collected: number; rate: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 6, right: 4, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="period" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis yAxisId="a" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={money} width={52} />
        <YAxis yAxisId="b" orientation="right" tick={AXIS} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={40} />
        <Tooltip content={<Tip money={["billed", "collected"]} />} cursor={{ fill: "var(--color-mist)", opacity: 0.6 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="a" dataKey="billed" name="Billed" fill={C.blue} radius={[4, 4, 0, 0]} />
        <Bar yAxisId="a" dataKey="collected" name="Collected" fill={C.green} radius={[4, 4, 0, 0]} />
        <Line yAxisId="b" dataKey="rate" name="Collection %" stroke={C.amber} strokeWidth={2.2} dot={{ r: 3 }} type="monotone" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/** Pastel number tile used above the charts. */
export function Kpi({ label, value, sub, tone = "bg-blue-bg", loading }: { label: string; value: ReactNode; sub?: ReactNode; tone?: string; loading?: boolean }) {
  return (
    <div className={clsx("min-h-[92px] rounded-[20px] p-3.5", tone)}>
      <p className="text-[12px] font-semibold leading-[15px] text-body">{label}</p>
      <p className="mt-1 text-[22px] font-bold leading-[28px] text-ink">{loading ? <span className="inline-block h-6 w-20 animate-pulse rounded-md bg-white/60" /> : value}</p>
      {sub != null && <p className="mt-0.5 truncate text-[11px] leading-[13px] text-body">{sub}</p>}
    </div>
  );
}
