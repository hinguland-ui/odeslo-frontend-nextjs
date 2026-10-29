import Link from "next/link";
import clsx from "clsx";
import { Eyebrow, Panel } from "@/components/ui";
import { TONE, type Tone } from "@/lib/utils/tones";

export interface NeedsYouItem {
  label: string;
  count: number;
  href: string;
  tone: Tone;
}

/** Dark "NEEDS YOU · n" card with links to each queue. */
export function NeedsYouCard({ items }: { items: NeedsYouItem[] }) {
  const total = items.reduce((s, i) => s + i.count, 0);
  return (
    <Panel variant="dark">
      <Eyebrow className="text-violet-soft">Needs you · {total}</Eyebrow>
      <div className="mt-2.5 space-y-2.5">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex h-[39px] items-center justify-between rounded-[14px] bg-night px-3 transition hover:bg-night-line"
          >
            <span className="text-[13px] font-semibold leading-4 text-white">{item.label}</span>
            <span className={clsx("grid h-[19px] min-w-[25px] place-items-center rounded-full px-2 text-[12px] font-bold text-ink", TONE[item.tone].bg)}>
              {item.count}
            </span>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
