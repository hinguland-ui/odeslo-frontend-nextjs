/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";

/** Odeslo app icon (dark rounded square with the orbit ring). Works on any background. */
export function BrandIcon({ size = 40, className }: { size?: number; className?: string }) {
  return <img src="/brand/odeslo-icon-app.svg" alt="Odeslo" width={size} height={size} className={clsx("shrink-0", className)} />;
}

/**
 * Horizontal logo: icon + dark "Odeslo" wordmark. The wordmark is dark, so use it on LIGHT backgrounds only.
 * On dark backgrounds use <BrandIcon /> with a white text.
 */
export function BrandLogo({ height = 32, className }: { height?: number; className?: string }) {
  return (
    <>
      <img src="/brand/odeslo-logo-horizontal-dark.svg" alt="Odeslo" height={height} style={{ height, width: "auto" }} className={clsx("shrink-0 dark:hidden", className)} />
      {/* the wordmark in the file is dark ink, so on a dark page we draw icon + light text instead */}
      <span className={clsx("hidden shrink-0 items-center gap-2.5 dark:flex", className)} role="img" aria-label="Odeslo">
        <img src="/brand/odeslo-icon-app.svg" alt="" height={height} style={{ height, width: height }} className="rounded-[26%] ring-1 ring-white/15" />
        <span className="font-bold tracking-[-0.02em] text-ink" style={{ fontSize: height * 0.62, lineHeight: 1 }}>Odeslo</span>
      </span>
    </>
  );
}

/** Icon + white wordmark text for dark backgrounds (login side panel, super admin menu). */
export function BrandOnDark({ subtitle, size = 40 }: { subtitle?: string; size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <BrandIcon size={size} className="rounded-[26%] ring-1 ring-white/15" />
      <div className="leading-none">
        <p className="text-[18px] font-bold leading-[22px] tracking-[-0.36px] text-white">Odeslo</p>
        {subtitle && <p className="text-[12px] text-violet-soft">{subtitle}</p>}
      </div>
    </div>
  );
}
