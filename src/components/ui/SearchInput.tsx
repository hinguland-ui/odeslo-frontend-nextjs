import Image from "next/image";
import clsx from "clsx";

/** Mist search pill with the Figma search icon. */
export function SearchInput({ value, onChange, placeholder = "Search", className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={clsx("flex h-[38px] min-w-[220px] items-center gap-2.5 rounded-[19px] bg-mist px-4", className)}>
      <Image src="/icons/search.svg" alt="" width={16} height={16} className="dark:invert" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[13px] font-medium leading-4 text-ink outline-none placeholder:text-hint"
      />
    </label>
  );
}
