"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, ErrorState, PageHeader } from "@/components/ui";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { useToast } from "@/components/providers/ToastProvider";
import { AreaTrend, BookingsChart, ChartCard, MaintenanceChart, RaisedResolved, RevenueChart, SocietyRevenue, C } from "@/components/super-admin/reports/charts";
import { presetRange, ReportFiltersBar, type Preset } from "@/components/super-admin/reports/ReportFilters";
import { useCategories } from "@/hooks/useCategories";
import { useLookups } from "@/hooks/useLookups";
import { reportsApi, type ReportFilters, type ReportOverview, type ReportSection } from "@/lib/api/reports";
import { isoDate } from "@/lib/utils/format";

type CardPreset = Preset | "global";

const PRESETS: { id: CardPreset; label: string }[] = [
  { id: "global", label: "Same as top filter" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "quarter", label: "This quarter" },
  { id: "year", label: "This year" },
  { id: "custom", label: "Custom dates" },
];

const DATE = "h-[32px] cursor-pointer rounded-[16px] bg-mist px-2.5 text-[12px] font-semibold text-ink outline-none focus:ring-2 focus:ring-ink/15";

/** Excel / PDF of this one chart for the dates picked on its own card. */
function ExportMenu({ onPick, busy }: { onPick: (f: "xlsx" | "pdf") => void; busy: boolean }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, [open]);
  return (
    <div ref={box} className="relative">
      <button type="button" disabled={busy} onClick={() => setOpen((o) => !o)} className="inline-flex h-[32px] items-center gap-1.5 rounded-[16px] bg-ink px-3 text-[12px] font-semibold text-white transition hover:bg-ink-soft disabled:opacity-60">
        <Download size={14} /> {busy ? "Preparing…" : "Export"}
      </button>
      {open && (
        <div className="absolute right-0 top-[38px] z-30 w-[170px] rounded-[16px] border border-line bg-white p-1.5 shadow-xl">
          <button type="button" onClick={() => { setOpen(false); onPick("xlsx"); }} className="flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium text-ink hover:bg-mist"><FileSpreadsheet size={15} className="text-green-fg" /> Excel (.xlsx)</button>
          <button type="button" onClick={() => { setOpen(false); onPick("pdf"); }} className="flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium text-ink hover:bg-mist"><FileText size={15} className="text-pink-fg" /> PDF</button>
        </div>
      )}
    </div>
  );
}

/**
 * One chart with its OWN dates and its own export. Each card asks the server for the period it shows,
 * so changing the dates on one chart never moves the others, and its Excel / PDF has exactly that period.
 */
function ReportCard({
  section, title, sub, base, empty, children,
}: {
  section: ReportSection;
  title: string;
  sub: string;
  /** The filters at the top of the page: society, category, payment mode, grouping and the default dates. */
  base: ReportFilters;
  empty: (d: ReportOverview) => boolean;
  children: (d: ReportOverview) => ReactNode;
}) {
  const toast = useToast();
  // "global" follows the dates at the top; picking another period here changes only this chart
  const [preset, setPreset] = useState<CardPreset>("global");
  const [custom, setCustom] = useState(() => presetRange("30d"));
  const [busy, setBusy] = useState(false);
  const range = preset === "global" ? { from: base.date_from, to: base.date_to } : preset === "custom" ? custom : presetRange(preset);
  const filters: ReportFilters = { ...base, date_from: range.from, date_to: range.to };

  const q = useQuery({ queryKey: ["report", filters], queryFn: () => reportsApi.overview(filters), placeholderData: (prev) => prev, staleTime: 30_000 });
  const d = q.data;

  const download = async (fmt: "xlsx" | "pdf") => {
    setBusy(true);
    try { await reportsApi.export(fmt, filters, section); } catch (e) { toast(e instanceof Error ? e.message : "Export failed", "error"); } finally { setBusy(false); }
  };

  const controls = (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <SelectMenu size="sm" align="end" width={170} className="w-[150px]" value={preset} onChange={(v) => setPreset(v as CardPreset)} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
      <ExportMenu onPick={download} busy={busy} />
    </div>
  );

  return (
    <ChartCard
      title={title}
      sub={d ? `${sub} · ${new Date(`${d.filters.date_from}T00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} to ${new Date(`${d.filters.date_to}T00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : sub}
      aside={controls}
      loading={q.isLoading}
      empty={!!d && empty(d)}
      height={300}
    >
      {preset === "custom" && (
        <div className="mb-2 flex items-center gap-2">
          <input type="date" aria-label="From" value={custom.from} max={custom.to} onChange={(e) => e.target.value && setCustom((c) => ({ ...c, from: e.target.value }))} onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* arrows still work */ } }} className={DATE} />
          <span className="text-[12px] text-muted">to</span>
          <input type="date" aria-label="To" value={custom.to} min={custom.from} max={isoDate()} onChange={(e) => e.target.value && setCustom((c) => ({ ...c, to: e.target.value }))} onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* arrows still work */ } }} className={DATE} />
        </div>
      )}
      <div className={clsx("w-full", preset === "custom" ? "h-[calc(100%-40px)]" : "h-full")}>{d && children(d)}</div>
      {q.error && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
    </ChartCard>
  );
}

const initial = (): ReportFilters => {
  const r = presetRange("30d");
  return { date_from: r.from, date_to: r.to, society_ids: [], category: "", mode: "", group_by: "" };
};

export default function ReportsPage() {
  const toast = useToast();
  const look = useLookups();
  const cats = useCategories();
  const [filters, setFilters] = useState<ReportFilters>(initial);
  const [preset, setPreset] = useState<Preset>("30d");
  const [busy, setBusy] = useState<"" | "xlsx" | "pdf">("");

  const patch = (p: Partial<ReportFilters>) => setFilters((f) => ({ ...f, ...p }));
  const choosePreset = (p: Preset) => {
    setPreset(p);
    if (p !== "custom") { const r = presetRange(p); patch({ date_from: r.from, date_to: r.to }); }
  };
  const reset = () => { setFilters(initial()); setPreset("30d"); };
  const downloadAll = async (fmt: "xlsx" | "pdf") => {
    setBusy(fmt);
    try { await reportsApi.export(fmt, filters); } catch (e) { toast(e instanceof Error ? e.message : "Export failed", "error"); } finally { setBusy(""); }
  };

  return (
    <>
      <PageHeader
        title="Reports,"
        light="six charts, every filter."
        subtitle="Filters at the top apply to all charts. Each chart can also use its own dates, and has its own Excel / PDF."
        actions={
          <>
            <Button variant="light" loading={busy === "xlsx"} onClick={() => downloadAll("xlsx")}><FileSpreadsheet size={16} /> All · Excel</Button>
            <Button loading={busy === "pdf"} onClick={() => downloadAll("pdf")}><FileText size={16} /> All · PDF</Button>
          </>
        }
      />

      <ReportFiltersBar
        filters={filters}
        preset={preset}
        onPreset={choosePreset}
        onChange={patch}
        onReset={reset}
        societies={look.societies.map((s) => ({ id: s.id, name: s.name }))}
        categories={cats.tops.map((c) => ({ key: c.key, name: c.name }))}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportCard section="revenue" title="Revenue over time" sub="Group deals + maintenance, net after refunds" base={filters}
          empty={(d) => !d.timeseries.some((t) => t.booking || t.maintenance)}>
          {(d) => <RevenueChart data={d.timeseries} />}
        </ReportCard>

        <ReportCard section="societies" title="Revenue by society" sub="Top societies, group deals + maintenance" base={filters}
          empty={(d) => !d.revenue_by_society.some((s) => s.total)}>
          {(d) => <SocietyRevenue data={d.revenue_by_society} />}
        </ReportCard>

        <ReportCard section="bookings" title="Bookings over time" sub="Bookings and units booked" base={filters}
          empty={(d) => !d.timeseries.some((t) => t.bookings)}>
          {(d) => <BookingsChart data={d.timeseries} />}
        </ReportCard>

        <ReportCard section="maintenance" title="Maintenance billed vs collected" sub="By billing period, with collection %" base={filters}
          empty={(d) => !d.maintenance_by_period.length}>
          {(d) => <MaintenanceChart data={d.maintenance_by_period} />}
        </ReportCard>

        <ReportCard section="complaints" title="Complaints raised vs resolved" sub="Per period" base={filters}
          empty={(d) => !d.timeseries.some((t) => t.complaints || t.resolved)}>
          {(d) => <RaisedResolved data={d.timeseries} />}
        </ReportCard>

        <ReportCard section="residents" title="Residents joined" sub="New sign-ups per period" base={filters}
          empty={(d) => !d.timeseries.some((t) => t.residents)}>
          {(d) => <AreaTrend data={d.timeseries} dataKey="residents" name="Joined" color={C.teal} />}
        </ReportCard>
      </div>
    </>
  );
}
