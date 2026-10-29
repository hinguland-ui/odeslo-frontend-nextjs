"use client";

import { useQueries } from "@tanstack/react-query";
import clsx from "clsx";
import { Avatar, Eyebrow, Panel } from "@/components/ui";
import { partnersApi } from "@/lib/api/deals";
import { useCategories } from "@/hooks/useCategories";
import { categoryOf } from "@/lib/utils/categories";

/** Left column: what does the society need? Shows eligible vendor count per category. */
export function CategoryPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const cats = useCategories();
  const keys = cats.keys;
  const counts = useQueries({
    queries: keys.map((c) => ({ queryKey: ["partners", "available", c], queryFn: () => partnersApi.available(c), staleTime: 60_000 })),
  });
  return (
    <Panel variant="soft" className="!p-4">
      <Eyebrow className="text-muted">What does the society need?</Eyebrow>
      <div className="mt-2.5 space-y-2.5">
        {keys.map((c, i) => {
          const cat = categoryOf(c);
          const n = counts[i]?.data?.length;
          return (
            <button key={c} type="button" onClick={() => onChange(c)}
              className={clsx("flex h-[58px] w-full items-center gap-2.5 rounded-[16px] border bg-white px-2.5 text-left transition", value === c ? "border-ink" : "border-transparent hover:border-line")}>
              <Avatar label={cat.abbr} tone={cat.tone} size={36} shape="rounded" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold leading-4 text-ink">{cat.label}</p>
                <p className="truncate text-[11px] leading-[13px] text-muted">Service · {n ?? "…"} vendor{n === 1 ? "" : "s"}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
