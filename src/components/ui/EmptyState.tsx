import clsx from "clsx";
import type { ReactNode } from "react";

export function EmptyState({ title, hint, action, className }: { title: ReactNode; hint?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={clsx("flex flex-col items-center justify-center gap-1.5 px-6 py-12 text-center", className)}>
      <span className="mb-1 grid size-10 place-items-center rounded-full bg-mist text-[18px] text-muted">○</span>
      <p className="text-[13px] font-semibold text-ink">{title}</p>
      {hint && <p className="max-w-sm text-[12px] leading-[15px] text-muted">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return (
    <div className="rounded-[16px] bg-pink-bg px-4 py-3 text-[12px] font-medium leading-[15px] text-pink-fg">
      {message}
      {onRetry && (
        <button onClick={onRetry} className="ml-2 font-bold underline">
          Retry
        </button>
      )}
    </div>
  );
}
