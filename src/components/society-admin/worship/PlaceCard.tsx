"use client";

import clsx from "clsx";
import { useState } from "react";
import { Badge, Panel } from "@/components/ui";
import { AuthImage } from "@/components/ui/AuthImage";
import { useToast } from "@/components/providers/ToastProvider";
import { openFile } from "@/lib/api/client";
import type { WorshipPlace } from "@/lib/api/worship";
import { KindTile } from "@/components/worship/KindIcon";
import { kindInfo } from "@/lib/utils/worship";
import { TONE } from "@/lib/utils/tones";

/** One place: photos, who it is for, and its timings. `actions` is only passed for the admin. */
export function PlaceCard({ place, actions }: { place: WorshipPlace; actions?: React.ReactNode }) {
  const toast = useToast();
  const info = kindInfo(place.kind);
  const [shown, setShown] = useState(0);
  const photo = place.photos[shown];

  return (
    <Panel className={clsx(!place.is_active && "opacity-70")}>
      <div className="flex flex-col gap-4 sm:flex-row">
        {place.photos.length > 0 && (
          <div className="sm:w-[220px] sm:shrink-0">
            <button type="button" className="block w-full overflow-hidden rounded-[18px]" onClick={() => openFile(photo!).catch((e) => toast(e.message, "error"))}>
              <AuthImage path={photo!} className="h-[150px] w-full object-cover" />
            </button>
            {place.photos.length > 1 && (
              <div className="mt-2 flex gap-1.5">
                {place.photos.map((p, i) => (
                  <button key={p} type="button" onClick={() => setShown(i)} className={clsx("size-9 overflow-hidden rounded-[10px] ring-2", i === shown ? "ring-ink" : "ring-transparent opacity-70")}>
                    <AuthImage path={p} className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <KindTile kind={place.kind} size={48} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={info.tone} dot={false}>{info.label}</Badge>
                {!place.is_active && <Badge tone="gray" dot={false}>Hidden from residents</Badge>}
              </div>
              <h3 className="mt-1 text-[16px] font-bold leading-[20px] text-ink">{place.name}</h3>
              {place.dedicated_to && <p className="text-[12px] font-semibold text-muted">{info.dedicatedLabel}: {place.dedicated_to}</p>}
            </div>
          </div>
          {place.description && <p className="mt-1.5 text-[13px] leading-[18px] text-body">{place.description}</p>}
          {(place.address || place.contact) && (
            <p className="mt-1.5 text-[12px] leading-4 text-muted">
              {place.address}{place.address && place.contact ? " · " : ""}
              {place.contact && <a href={`tel:${place.contact}`} className="font-semibold text-lilac-fg hover:underline">{place.contact}</a>}
            </p>
          )}
          {place.timings.length > 0 && (
            <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {place.timings.map((t, i) => (
                <li key={i} className={clsx("rounded-[14px] px-3 py-2", TONE[info.tone].bg)}>
                  <p className="text-[11px] font-bold uppercase leading-[13px] tracking-[0.5px] text-muted">{t.label}</p>
                  <p className="text-[14px] font-bold leading-[18px] text-ink">{t.time}</p>
                  {t.note && <p className="text-[11px] leading-[14px] text-body">{t.note}</p>}
                </li>
              ))}
            </ul>
          )}
          {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
    </Panel>
  );
}
