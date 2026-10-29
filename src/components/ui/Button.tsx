import Link from "next/link";
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "dark" | "light" | "white" | "danger" | "violet" | "warn" | "success";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  dark: "bg-ink text-white hover:bg-ink-soft",
  light: "bg-mist text-ink hover:bg-line",
  white: "bg-white text-ink hover:bg-mist",
  danger: "bg-pink-bg text-pink-fg hover:brightness-95",
  violet: "bg-violet text-white hover:brightness-110",
  warn: "bg-yellow-bg text-yellow-fg hover:brightness-95",
  success: "bg-green-bg text-green-fg hover:brightness-95",
};

const SIZE: Record<Size, string> = {
  sm: "h-[38px] rounded-[19px] px-4 text-[13px]",
  md: "h-11 rounded-[22px] px-[18px] text-[13px]",
  lg: "h-12 rounded-[24px] px-[18px] text-[13px]",
};

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: Size;
  /** Dark "+" circle on the left, as on "+ Launch group deal". */
  plus?: boolean;
  href?: string;
  loading?: boolean;
  block?: boolean;
  children: ReactNode;
}

export function Button({ variant = "dark", size = "md", plus, href, loading, block, className, children, disabled, ...rest }: Props) {
  const cls = clsx(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold leading-4 transition disabled:opacity-50",
    VARIANT[variant],
    SIZE[size],
    plus && "pl-[5px] pr-[18px] justify-start gap-3",
    block && "w-full",
    className,
  );
  const content = (
    <>
      {plus && (
        <span className="grid size-[34px] place-items-center rounded-full bg-ink-soft text-[18px] font-semibold leading-[23px] text-white">
          +
        </span>
      )}
      {loading ? <Spinner /> : null}
      <span>{children}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={clsx("size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent", className)} />;
}
