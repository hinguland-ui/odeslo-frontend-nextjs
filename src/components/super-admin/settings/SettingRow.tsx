"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Toggle } from "@/components/ui";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { useToast } from "@/components/providers/ToastProvider";
import { settingsApi } from "@/lib/api/ops";
import type { SettingField } from "./settingsSchema";

const MASK = "********";
const BOX = "flex h-11 items-center gap-2 rounded-[14px] bg-white px-3.5 ring-1 ring-line transition focus-within:ring-2 focus-within:ring-ink/25";
const INPUT = "min-w-0 flex-1 bg-transparent text-[13px] font-semibold leading-4 text-ink outline-none placeholder:font-medium placeholder:text-hint";

/**
 * One setting as a real input box: click it and type right there (the grey hint inside shows what goes in it).
 * Secrets keep an eye on the right: it shows what is saved, and hides it again.
 */
export function SettingRow({ def, value, onChange }: { def: SettingField; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId();

  if (def.kind === "bool")
    return (
      <div className="flex min-h-11 items-center justify-between gap-3 rounded-[14px] bg-white px-3.5 ring-1 ring-line">
        <span className="text-[13px] leading-4 text-body">{def.label}</span>
        <Toggle checked={!!value} onChange={onChange} label={def.label} />
      </div>
    );

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[12px] font-semibold leading-[15px] text-body">{def.label}</label>
      {def.kind === "secret" ? (
        <SecretInput id={id} def={def} value={value} onChange={onChange} />
      ) : def.kind === "select" ? (
        <SelectMenu value={String(value ?? "")} options={def.options ?? []} onChange={onChange} />
      ) : (
        <div className={BOX}>
          <input
            id={id}
            type={def.kind === "number" ? "number" : "text"}
            inputMode={def.kind === "number" ? "numeric" : undefined}
            value={String(value ?? "")}
            placeholder={def.placeholder ?? "—"}
            onChange={(e) => onChange(def.kind === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
            className={INPUT}
          />
        </div>
      )}
      {def.hint && <p className="mt-1 px-1 text-[11px] leading-[14px] text-body">{def.hint}</p>}
    </div>
  );
}

function SecretInput({ id, def, value, onChange }: { id: string; def: SettingField; value: unknown; onChange: (v: unknown) => void }) {
  const toast = useToast();
  const [shown, setShown] = useState(false);
  const [saved, setSaved] = useState<string | null>(null); // the saved secret, fetched only when the eye is opened
  const [busy, setBusy] = useState(false);

  const isSaved = value === MASK; // untouched and something is stored
  const typed = isSaved ? "" : String(value ?? "");

  const toggle = async () => {
    if (shown) return setShown(false);
    if (isSaved && saved === null) {
      setBusy(true);
      try {
        const all = await settingsApi.reveal(def.key);
        setSaved(String(all[def.field] ?? ""));
      } catch (e) {
        toast(e instanceof Error ? e.message : "Could not show the saved value", "error");
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    setShown(true);
  };

  // what the box shows: what you are typing, else the saved secret (only while the eye is open)
  const display = isSaved ? (shown ? saved ?? "" : "") : typed;
  return (
    <div className={BOX}>
      <input
        id={id}
        type={shown ? "text" : "password"}
        autoComplete="new-password"
        spellCheck={false}
        value={display}
        placeholder={isSaved ? "•••••••• saved. Click the eye to view, or type to replace" : def.placeholder ?? "Not set"}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT}
      />
      <button type="button" onClick={toggle} disabled={busy} aria-label={shown ? "Hide" : "Show"} title={shown ? "Hide" : "Show"} className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-mist hover:text-ink disabled:opacity-50">
        {shown ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
