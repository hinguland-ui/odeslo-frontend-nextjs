"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** CSS grid track, e.g. "1.6fr", "120px". Defaults to 1fr. */
  width?: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string | number;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  selectedKey?: string | number | null;
  rowClassName?: (row: T) => string | undefined;
  empty?: ReactNode;
  /** Row height in px (Figma uses 42–55). */
  rowHeight?: number;
  className?: string;
  footer?: ReactNode;
}

/** Bordered table section: mist header (11px muted) and rows separated by #f1f1f4 lines. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  onRowClick,
  selectedKey,
  rowClassName,
  empty,
  rowHeight = 50,
  className,
  footer,
}: DataTableProps<T>) {
  const template = columns.map((c) => c.width ?? "1fr").join(" ");
  return (
    <section className={clsx("overflow-hidden rounded-[24px] border border-line bg-white", className)}>
      <div className="overflow-x-auto scroll-thin">
        <div className="min-w-[560px]">
          <div
            className="grid h-[37px] items-center gap-3 bg-mist px-[18px] text-[11px] font-semibold leading-[13px] text-muted"
            style={{ gridTemplateColumns: template }}
          >
            {columns.map((c) => (
              <div key={c.key} className={clsx("truncate", c.className)}>
                {c.header}
              </div>
            ))}
          </div>
          {loading ? (
            <div className="space-y-2 p-[18px]">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9" />
              ))}
            </div>
          ) : !rows?.length ? (
            <div className="border-t border-mist">{empty ?? <EmptyState title="Nothing here yet" />}</div>
          ) : (
            rows.map((row) => {
              const key = rowKey(row);
              return (
                <div
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={clsx(
                    "grid items-center gap-3 border-t border-mist px-[18px] text-[13px] leading-4",
                    onRowClick && "cursor-pointer hover:bg-row-hi",
                    selectedKey === key ? "bg-row-hi" : "bg-white",
                    rowClassName?.(row),
                  )}
                  style={{ gridTemplateColumns: template, minHeight: rowHeight }}
                >
                  {columns.map((c) => (
                    <div key={c.key} className={clsx("min-w-0 py-2", c.className)}>
                      {c.render(row)}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
      {footer}
    </section>
  );
}

/** Two-line cell: 13px semibold title + 11px muted sub. */
export function CellTitle({ title, sub, className }: { title: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={clsx("min-w-0", className)}>
      <p className="truncate text-[13px] font-semibold leading-4 text-ink">{title}</p>
      {sub != null && <p className="truncate text-[11px] leading-[13px] text-muted">{sub}</p>}
    </div>
  );
}
