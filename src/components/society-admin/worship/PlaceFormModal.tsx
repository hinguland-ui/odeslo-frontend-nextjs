"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Chip, Field, Input, Modal, Textarea } from "@/components/ui";
import { AuthImage } from "@/components/ui/AuthImage";
import { useToast } from "@/components/providers/ToastProvider";
import { useAction } from "@/hooks/useAction";
import { checkFile, useUploadLimits } from "@/lib/api/uploads";
import { worshipApi, type PlaceKind, type PlaceTiming, type WorshipPlace } from "@/lib/api/worship";
import { errorText } from "@/components/auth/finishLogin";
import { KindIcon } from "@/components/worship/KindIcon";
import { KINDS, kindInfo, to12h, to24h } from "@/lib/utils/worship";
import { X } from "lucide-react";

const MAX_PHOTOS = 4;
const blank: PlaceTiming = { label: "", time: "", note: "" };

/** Add or edit a temple / masjid / church / gurudwara: details, timings in the admin's own words, a few photos. */
export function PlaceFormModal({ open, onClose, place }: { open: boolean; onClose: () => void; place?: WorshipPlace | null }) {
  // mounted only while open, so every opening starts from the place's saved values
  return open ? <PlaceFormBody key={place?.id ?? "new"} onClose={onClose} place={place} /> : null;
}

function PlaceFormBody({ onClose, place }: { onClose: () => void; place?: WorshipPlace | null }) {
  const toast = useToast();
  const qc = useQueryClient();
  const limits = useUploadLimits();
  const input = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<PlaceKind>(place?.kind ?? "mandir");
  const [name, setName] = useState(place?.name ?? "");
  const [dedicated, setDedicated] = useState(place?.dedicated_to ?? "");
  const [description, setDescription] = useState(place?.description ?? "");
  const [address, setAddress] = useState(place?.address ?? "");
  const [contact, setContact] = useState(place?.contact ?? "");
  const [timings, setTimings] = useState<PlaceTiming[]>(place?.timings.length ? place.timings.map((t) => ({ ...t, note: t.note ?? "" })) : [{ ...blank }]);
  const [photos, setPhotos] = useState<string[]>(place?.photos ?? []); // already saved
  const [files, setFiles] = useState<File[]>([]); // chosen, uploaded on save
  const [busy, setBusy] = useState(false);

  const info = kindInfo(kind);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const save = useAction(
    async () => {
      setBusy(true);
      const body = {
        kind,
        name: name.trim(),
        dedicated_to: dedicated.trim() || null,
        description: description.trim() || null,
        address: address.trim() || null,
        contact: contact.trim() || null,
        timings: timings.filter((t) => t.label.trim() && t.time.trim()).map((t) => ({ label: t.label.trim(), time: t.time.trim(), note: t.note?.trim() || null })),
      };
      try {
        const saved = place ? await worshipApi.update(place.id, body) : await worshipApi.create(body);
        let failed = 0;
        for (const f of files) await worshipApi.addPhoto(saved.id, f).catch(() => { failed++; });
        if (failed) toast(`${failed} photo${failed > 1 ? "s" : ""} could not be uploaded. Open the place and try again.`, "error");
        return saved;
      } finally {
        setBusy(false);
      }
    },
    { success: place ? "Saved" : "Place added", invalidate: [["worship"]], onSuccess: onClose },
  );

  const replaceSaved = async (path: string, file: File | undefined) => {
    if (!place || !file) return;
    const problem = checkFile(file, "image", limits);
    if (problem) return toast(problem, "error");
    try {
      const updated = await worshipApi.addPhoto(place.id, file, path); // takes the old photo's place; the old file is deleted
      setPhotos(updated.photos);
      qc.invalidateQueries({ queryKey: ["worship"] });
      toast("Photo replaced");
    } catch (e) {
      toast(errorText(e), "error");
    }
  };

  const removeSaved = async (path: string) => {
    if (!place) return;
    try {
      const updated = await worshipApi.removePhoto(place.id, path);
      setPhotos(updated.photos);
    } catch (e) {
      toast(errorText(e), "error");
    }
  };

  const pick = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (photos.length + next.length >= MAX_PHOTOS) { toast(`At most ${MAX_PHOTOS} photos`, "error"); break; }
      const problem = checkFile(f, "image", limits);
      if (problem) { toast(problem, "error"); continue; }
      next.push(f);
    }
    setFiles(next);
    if (input.current) input.current.value = "";
  };

  const setTiming = (i: number, patch: Partial<PlaceTiming>) => setTimings((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addSuggestion = (label: string) =>
    setTimings((rows) => (rows.some((r) => r.label === label) ? rows : [...rows.filter((r) => r.label.trim() || r.time.trim()), { label, time: "", note: "" }]));
  const valid = name.trim().length >= 2;

  return (
    <Modal
      open
      onClose={onClose}
      width={640}
      title={place ? "Edit place" : "Add a place of worship"}
      subtitle="Residents of your society will see this in their app."
      footer={
        <>
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid || busy} loading={busy} onClick={() => save.mutate(undefined)}>{place ? "Save changes" : "Add place"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-muted">Kind of place</p>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <Chip key={k.value} size="md" active={kind === k.value} onClick={() => setKind(k.value)}>
                <KindIcon kind={k.value} size={18} className="mr-1.5 -ml-0.5" />{k.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={info.nameHint} /></Field>
          <Field label={`${info.dedicatedLabel} (optional)`}><Input value={dedicated} onChange={(e) => setDedicated(e.target.value)} placeholder={info.dedicatedHint} /></Field>
        </div>
        <Field label="About this place (optional)"><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Where it is, what happens here, who looks after it" /></Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Address / landmark (optional)"><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Behind Tower B" /></Field>
          <Field label="Contact number (optional)"><Input inputMode="tel" value={contact} onChange={(e) => setContact(e.target.value.replace(/[^\d+ ]/g, "").slice(0, 20))} placeholder="98250 12345" /></Field>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[12px] font-semibold text-muted">Timings</p>
            <button type="button" className="text-[12px] font-semibold text-lilac-fg hover:underline" onClick={() => setTimings((r) => [...r, { ...blank }])}>+ Add a row</button>
          </div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {info.timings.map((t) => <Chip key={t} size="xs" onClick={() => addSuggestion(t)}>+ {t}</Chip>)}
          </div>
          <div className="space-y-2">
            {timings.map((t, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                <Input value={t.label} onChange={(e) => setTiming(i, { label: e.target.value })} placeholder="Name, e.g. Morning aarti" />
                <Input
                  type="time"
                  aria-label="Time"
                  className="cursor-pointer"
                  value={to24h(t.time)}
                  onChange={(e) => setTiming(i, { time: to12h(e.target.value) })}
                  // the whole box opens the clock, not only its small icon
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* browser without showPicker: use the arrows */ } }}
                />
                <button type="button" aria-label="Remove row" className="grid size-9 place-items-center rounded-full bg-mist text-[13px] text-body hover:bg-line" onClick={() => setTimings((r) => (r.length > 1 ? r.filter((_, j) => j !== i) : [{ ...blank }]))}><X size={15} /></button>
                <Input className="col-span-3 !h-9 !text-[12px]" value={t.note ?? ""} onChange={(e) => setTiming(i, { note: e.target.value })} placeholder="Note (optional): Tuesday 8 PM, Ekadashi special..." />
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted">Pick the time on the clock. Anything else (&quot;Tuesday 8 PM&quot;, &quot;after sunset&quot;) goes in the note.</p>
        </div>

        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-muted">Photos ({photos.length + files.length} of {MAX_PHOTOS})</p>
          <div className="flex flex-wrap gap-2.5">
            {photos.map((p) => (
              <div key={p} className="group relative size-[88px] overflow-hidden rounded-[16px]">
                <AuthImage path={p} className="size-full object-cover" />
                <button type="button" aria-label="Remove photo" onClick={() => removeSaved(p)} className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"><X size={13} /></button>
                <label className="absolute inset-x-1 bottom-1 cursor-pointer rounded-full bg-black/60 py-0.5 text-center text-[10px] font-bold text-white">
                  Replace
                  <input type="file" accept="image/*" hidden onChange={(e) => { replaceSaved(p, e.target.files?.[0]); e.target.value = ""; }} />
                </label>
              </div>
            ))}
            {previews.map((u, i) => (
              <div key={u} className="relative size-[88px] overflow-hidden rounded-[16px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="size-full object-cover" />
                <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 text-[9px] font-bold text-white">NEW</span>
                <button type="button" aria-label="Remove photo" onClick={() => setFiles((f) => f.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"><X size={13} /></button>
              </div>
            ))}
            {photos.length + files.length < MAX_PHOTOS && (
              <button type="button" onClick={() => input.current?.click()} className="grid size-[88px] place-items-center rounded-[16px] border-2 border-dashed border-dash text-[12px] font-semibold text-muted hover:bg-mist">
                + Photo
              </button>
            )}
          </div>
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => pick(e.target.files)} />
        </div>
      </div>
    </Modal>
  );
}
