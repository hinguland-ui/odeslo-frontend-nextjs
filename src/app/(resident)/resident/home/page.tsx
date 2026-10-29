"use client";

import { FullScreenLoader } from "@/components/ui/Preloader";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, EmptyState, Note, PageHeader, Panel, PanelTitle, StatCard } from "@/components/ui";
import { usePay } from "@/hooks/usePay";
import { residentApi } from "@/lib/api/resident";
import { dayMonth, greeting, inr, longToday, titleCase } from "@/lib/utils/format";

export default function ResidentHomePage() {
  const home = useQuery({ queryKey: ["resident", "home"], queryFn: residentApi.home });
  const bills = useQuery({ queryKey: ["resident", "maintenance"], queryFn: residentApi.maintenance, enabled: !!home.data?.maintenance });
  const pay = usePay();
  const h = home.data;
  const firstName = h?.resident.name.split(" ")[0] ?? "";
  const nextBill = bills.data?.unpaid_bills[0];

  return (
    <>
      {pay.isPending && <FullScreenLoader variant="spin" label="Payment in progress… keep this page open" />}
      <PageHeader
        title={`${greeting()}, ${firstName}.`}
        light={h ? `Welcome to ${h.society.name}.` : undefined}
        subtitle={`${longToday()}${h ? ` · Flat ${h.unit.label} · ${titleCase(h.resident.resident_type)}` : ""}`}
        actions={
          <>
            <Button variant="light" href="/resident/complaints">Raise complaint</Button>
            <Button href="/resident/services">Browse group deals</Button>
          </>
        }
      />

      {h?.resident.status === "rejected" && (
        <div className="mb-4 rounded-[20px] bg-pink-bg p-4">
          <p className="text-[14px] font-bold text-pink-fg">Your request was not approved</p>
          <p className="mt-1 text-[13px] leading-[18px] text-pink-fg">
            {h.resident.rejection_reason ? <>Reason from your society admin: <strong>&ldquo;{h.resident.rejection_reason}&rdquo;</strong></> : "Your society admin did not give a reason."}
          </p>
          <p className="mt-1 text-[12px] text-pink-fg/80">Fix your flat or details and send the request again. The admin gets it as a new request.</p>
          <Button className="mt-3" href="/resident/reapply">Edit &amp; apply again</Button>
        </div>
      )}
      {h?.limited_access && h.resident.status !== "rejected" && (
        <Note tone="yellow" className="mb-4">
          Your request is waiting for approval by your society admin. Group deals, maintenance and complaints open once you are approved.
        </Note>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard size="lg" tone="yellow" label="Maintenance due" value={h?.maintenance ? inr(h.maintenance.due) : "—"} loading={home.isLoading} sub={h?.maintenance?.due_date ? `Due ${dayMonth(h.maintenance.due_date)}` : "Nothing pending"} href="/resident/maintenance" />
        <StatCard size="lg" tone="blue" label="Active bookings" value={h?.active_bookings ?? 0} loading={home.isLoading} sub="Group deal bookings" href="/resident/bookings" />
        <StatCard size="lg" tone="lilac" label="Unread alerts" value={h?.unread_notifications ?? 0} loading={home.isLoading} sub="Notifications" href="/resident/notifications" />
        <StatCard size="lg" tone="green" label="Your flat" value={h?.unit.label ?? "—"} loading={home.isLoading} sub={h?.society.name} href="/resident/profile" />
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <Panel className="min-h-[300px]">
          <PanelTitle aside={<Link href="/resident/notices" className="font-semibold text-lilac-fg hover:underline">All notices</Link>}>Latest notices</PanelTitle>
          {h?.latest_notices?.length ? (
            <ul className="divide-y divide-mist">
              {h.latest_notices.map((n) => (
                <li key={n.id} className="flex items-center justify-between gap-3 py-3">
                  <p className="text-[13px] font-semibold text-ink">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-muted">{titleCase(n.category)} · {dayMonth(n.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No notices yet" />
          )}
        </Panel>

        <Panel variant="soft" className="min-h-[300px]">
          <PanelTitle>Pay maintenance</PanelTitle>
          {nextBill ? (
            <div className="space-y-3">
              <div className="rounded-[18px] bg-white p-4">
                <p className="text-[11px] text-muted">{nextBill.period} · {nextBill.bill_no}</p>
                <p className="mt-1 text-[26px] font-bold leading-[33px] text-ink">{inr(nextBill.outstanding)}</p>
                <p className="text-[12px] text-body">Due {dayMonth(nextBill.due_date)}</p>
              </div>
              <Button block size="lg" loading={pay.isPending} onClick={() => pay.mutate({ refType: "maintenance", refId: nextBill.id })}>Pay now</Button>
              <Button block variant="light" href="/resident/maintenance">All bills</Button>
            </div>
          ) : (
            <EmptyState title={h?.maintenance ? "You are all paid up" : "Maintenance is not shared with your account"} />
          )}
        </Panel>
      </div>
    </>
  );
}
