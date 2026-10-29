import clsx from "clsx";
import type { ReactNode } from "react";

/** Back link, "Step x of y" progress bar, title and subtitle shared by every login step. */
export function FlowHeader({
  title,
  light,
  subtitle,
  step,
  total,
  onBack,
}: {
  title: string;
  light?: string;
  subtitle?: ReactNode;
  step?: number;
  total?: number;
  onBack?: () => void;
}) {
  return (
    <div className="mb-6">
      {(onBack || total) && (
        <div className="mb-4 flex items-center justify-between">
          {onBack ? (
            <button type="button" onClick={onBack} className="-ml-1 flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-semibold text-muted transition hover:bg-mist hover:text-ink">
              <span aria-hidden>←</span> Back
            </button>
          ) : (
            <span />
          )}
          {total ? <span className="text-[11px] font-semibold text-muted">Step {step} of {total}</span> : null}
        </div>
      )}
      {total ? (
        <div className="mb-4 flex gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={clsx("h-1 flex-1 rounded-full transition-colors", i < (step ?? 0) ? "bg-ink" : "bg-mist")} />
          ))}
        </div>
      ) : null}
      <h2 className="text-[26px] leading-[33px] tracking-[-0.4px] text-ink">
        <span className="font-bold">{title}</span>
        {light && <span className="font-medium text-muted"> {light}</span>}
      </h2>
      {subtitle && <p className="mt-1.5 text-[14px] leading-5 text-muted">{subtitle}</p>}
    </div>
  );
}
