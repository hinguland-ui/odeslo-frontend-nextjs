/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";

export type PreloaderVariant = "orbit" | "spin" | "wordmark";

const FILE: Record<PreloaderVariant, string> = {
  orbit: "odeslo-1-orbit-draw",
  spin: "odeslo-2-spin-loader",
  wordmark: "odeslo-3-wordmark-reveal",
};

interface PreloaderProps {
  /** orbit: ring draws itself · spin: round loader · wordmark: logo + name (wide). */
  variant?: PreloaderVariant;
  /** Default follows the theme (dark logo on light, white logo on dark). Force "white" on a surface that is always dark. */
  tone?: "dark" | "white";
  /** Width in px (the wordmark is 3 : 1, the others are square). */
  size?: number;
  label?: string;
  className?: string;
}

/** The Odeslo animated loader (GIF from /brand/preloders). */
export function Preloader({ variant = "spin", tone, size = 96, label, className }: PreloaderProps) {
  return (
    <div role="status" aria-live="polite" className={clsx("flex flex-col items-center gap-2", className)}>
      {(["dark", "white"] as const).map((t) => (
        <img
          key={t}
          src={`/brand/preloders/${FILE[variant]}-${t}-logo.gif`}
          alt=""
          width={size}
          height={variant === "wordmark" ? size / 3 : size}
          style={{ width: size, height: variant === "wordmark" ? size / 3 : size }}
          draggable={false}
          // forced tone: only that logo. Auto: dark logo on the light theme, white logo on the dark theme.
          className={tone ? (tone === t ? "block" : "hidden") : t === "dark" ? "block dark:hidden" : "hidden dark:block"}
        />
      ))}
      <span className={clsx("text-[12px] font-semibold", label ? (tone === "white" ? "text-night-muted" : "text-muted") : "sr-only")}>{label ?? "Loading"}</span>
    </div>
  );
}

/** A loader centred in the space of a page or panel (while its data loads). */
export function PageLoader({ label, minHeight = 360, variant = "spin" }: { label?: string; minHeight?: number; variant?: PreloaderVariant }) {
  return (
    <div className="grid w-full place-items-center rounded-[24px]" style={{ minHeight }}>
      <Preloader variant={variant} size={variant === "wordmark" ? 300 : 120} label={label} />
    </div>
  );
}

/** Covers the whole screen: first load, signing in, paying, deleting… */
export function FullScreenLoader({ label, variant = "orbit", tone }: { label?: string; variant?: PreloaderVariant; tone?: "dark" | "white" }) {
  return (
    <div className={clsx("fixed inset-0 z-[100] grid place-items-center", tone === "white" ? "bg-[#1c1c22]" : "bg-white/95 backdrop-blur-sm")}>
      <Preloader variant={variant} tone={tone} size={variant === "wordmark" ? 420 : 160} label={label} />
    </div>
  );
}
