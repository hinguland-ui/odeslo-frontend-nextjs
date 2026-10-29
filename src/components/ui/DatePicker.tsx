"use client";

import clsx from "clsx";
import { format, isValid, parse } from "date-fns";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

const DATE_FMT = "yyyy-MM-dd";
const toDate = (v: string | undefined) => {
  if (!v) return undefined;
  const d = parse(v.slice(0, 10), DATE_FMT, new Date());
  return isValid(d) ? d : undefined;
};

const BOX = "flex h-11 w-full items-center justify-between gap-2 rounded-[14px] bg-mist px-[14px] text-left text-[13px] font-semibold leading-[16.5px] text-ink outline-none transition focus-visible:ring-2 focus-visible:ring-ink/10 disabled:opacity-60";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  );
}

/** A popover that stays attached to its trigger, flips above when there is no room below, closes on outside click / Esc. */
function Popover({ trigger, open, onOpen, onClose, children, width = 320 }: {
  trigger: (props: { ref: React.RefObject<HTMLButtonElement | null>; onClick: () => void; "aria-expanded": boolean }) => ReactNode;
  open: boolean; onOpen: () => void; onClose: () => void; children: ReactNode; width?: number;
}) {
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const place = useCallback(() => {
    const b = btn.current?.getBoundingClientRect();
    if (!b) return;
    const h = pop.current?.offsetHeight ?? 360;
    const below = window.innerHeight - b.bottom;
    const top = below < h + 16 && b.top > h + 16 ? b.top - h - 8 : b.bottom + 8;
    const left = Math.min(Math.max(8, b.left), window.innerWidth - width - 8);
    setPos({ top, left });
  }, [width]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const raf = requestAnimationFrame(place); // measure again once the popover has its real height
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!pop.current?.contains(t) && !btn.current?.contains(t)) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open, onClose]);

  return (
    <>
      {trigger({ ref: btn, onClick: open ? onClose : onOpen, "aria-expanded": open })}
      {open && typeof document !== "undefined" && createPortal(
        <div ref={pop} className="odl-pop fixed z-[70] animate-slide-up rounded-[20px] border border-line bg-white p-3 shadow-[0_18px_50px_rgba(28,28,34,0.18)]"
          style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, width, visibility: pos ? "visible" : "hidden" }}>
          {children}
        </div>,
        document.body,
      )}
    </>
  );
}

function Calendar({ value, min, max, onPick }: { value?: Date; min?: string; max?: string; onPick: (d: Date) => void }) {
  const minD = toDate(min), maxD = toDate(max);
  return (
    <DayPicker
      mode="single"
      selected={value}
      defaultMonth={value ?? minD ?? new Date()}
      onSelect={(d) => d && onPick(d)}
      disabled={[...(minD ? [{ before: minD }] : []), ...(maxD ? [{ after: maxD }] : [])]}
      showOutsideDays
      weekStartsOn={1}
      captionLayout="dropdown"
      startMonth={new Date(new Date().getFullYear() - 1, 0)}
      endMonth={new Date(new Date().getFullYear() + 5, 11)}
    />
  );
}

interface BaseProps { value: string; onChange: (v: string) => void; min?: string; max?: string; placeholder?: string; disabled?: boolean; className?: string; "aria-label"?: string }

/** Date field: shows "Mon, 12 Oct 2026", picks from a calendar. Value stays "YYYY-MM-DD". */
export function DatePicker({ value, onChange, min, max, placeholder = "Select date", disabled, className, ...aria }: BaseProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const d = toDate(value);
  return (
    <Popover open={open} onOpen={() => setOpen(true)} onClose={close}
      trigger={(p) => (
        <button type="button" disabled={disabled} className={clsx(BOX, className)} aria-label={aria["aria-label"]} {...p}>
          <span className={clsx("truncate", !d && "font-medium text-hint")}>{d ? format(d, "EEE, d MMM yyyy") : placeholder}</span>
          <CalendarIcon />
        </button>
      )}>
      <Calendar value={d} min={min} max={max} onPick={(x) => { onChange(format(x, DATE_FMT)); close(); }} />
    </Popover>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

/** Date + time field. Value stays "YYYY-MM-DDTHH:mm" (same as the old datetime-local input). */
export function DateTimePicker({ value, onChange, min, max, placeholder = "Select date & time", disabled, className, ...aria }: BaseProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const d = toDate(value);
  const hh = value?.length >= 16 ? Number(value.slice(11, 13)) : 9;
  const mm = value?.length >= 16 ? Number(value.slice(14, 16)) : 0;
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  const pm = hh >= 12;

  const emit = (date: Date | undefined, h24: number, m: number) => {
    if (!date) return;
    onChange(`${format(date, DATE_FMT)}T${pad(h24)}:${pad(m)}`);
  };
  const to24 = (h: number, isPm: boolean) => (h % 12) + (isPm ? 12 : 0);
  const sel = "h-9 flex-1 rounded-[12px] bg-mist px-2 text-[13px] font-semibold text-ink outline-none focus:ring-2 focus:ring-ink/10";

  return (
    <Popover open={open} onOpen={() => setOpen(true)} onClose={close}
      trigger={(p) => (
        <button type="button" disabled={disabled} className={clsx(BOX, className)} aria-label={aria["aria-label"]} {...p}>
          <span className={clsx("truncate", !d && "font-medium text-hint")}>{d ? `${format(d, "EEE, d MMM yyyy")} · ${pad(h12)}:${pad(mm)} ${pm ? "PM" : "AM"}` : placeholder}</span>
          <CalendarIcon />
        </button>
      )}>
      <Calendar value={d} min={min} max={max} onPick={(x) => emit(x, hh, mm)} />
      <div className="mt-2 flex items-center gap-2 border-t border-line pt-3">
        <span className="text-[12px] font-semibold text-muted">Time</span>
        <select className={sel} value={h12} onChange={(e) => emit(d ?? new Date(), to24(Number(e.target.value), pm), mm)} aria-label="Hour">{HOURS.map((h) => <option key={h} value={h}>{pad(h)}</option>)}</select>
        <select className={sel} value={MINUTES.includes(mm) ? mm : Math.round(mm / 5) * 5 % 60} onChange={(e) => emit(d ?? new Date(), hh, Number(e.target.value))} aria-label="Minute">{MINUTES.map((m) => <option key={m} value={m}>{pad(m)}</option>)}</select>
        <select className={sel} value={pm ? "PM" : "AM"} onChange={(e) => emit(d ?? new Date(), to24(h12, e.target.value === "PM"), mm)} aria-label="AM or PM"><option>AM</option><option>PM</option></select>
      </div>
      <button type="button" onClick={close} className="mt-3 h-9 w-full rounded-[18px] bg-ink text-[13px] font-semibold text-white hover:bg-ink-soft">Done</button>
    </Popover>
  );
}
