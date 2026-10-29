import clsx from "clsx";
import { Children, Fragment, isValidElement, type ChangeEvent, type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { SelectMenu, type MenuOption } from "./SelectMenu";

const BOX = "w-full rounded-[14px] bg-mist px-[14px] text-[13px] font-semibold leading-[16.5px] text-ink outline-none transition placeholder:font-medium placeholder:text-hint focus:ring-2 focus:ring-ink/10 disabled:opacity-60";

/** Label (12px semibold muted) above a control. */
export function Field({ label, hint, children, className }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={clsx("block min-w-0", className)}>
      <span className="mb-1.5 block text-[12px] font-semibold leading-[15px] text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-[13px] text-muted">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(BOX, "h-11", className)} {...rest} />;
}

export function Textarea({ className, rows = 4, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={clsx(BOX, "resize-none py-3 font-normal", className)} {...rest} />;
}

/** Option labels / values read from <option> children (also inside fragments and arrays). */
function readOptions(children: ReactNode): MenuOption[] {
  const out: MenuOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>;
    if (el.type === Fragment) return out.push(...readOptions(el.props.children));
    if (el.type === "option") {
      const label = Children.toArray(el.props.children).join("");
      out.push({ value: String(el.props.value ?? label), label });
    }
  });
  return out;
}

/**
 * Same API as a native select (value, onChange(e) with e.target.value, <option> children, disabled) but drawn as the
 * Odeslo dropdown: rounded list, tick on the chosen row, keyboard support, never clipped by the screen edge.
 */
export function Select({ className, children, value, onChange, disabled, id, name }: SelectHTMLAttributes<HTMLSelectElement>) {
  const options = readOptions(children);
  return (
    <SelectMenu
      className={className}
      value={String(value ?? "")}
      options={options}
      disabled={disabled}
      onChange={(v) => onChange?.({ target: { value: v, id, name }, currentTarget: { value: v, id, name } } as unknown as ChangeEvent<HTMLSelectElement>)}
      placeholder={options.find((o) => o.value === "")?.label ?? "Select"}
    />
  );
}
