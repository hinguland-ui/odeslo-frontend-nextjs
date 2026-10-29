import type { ReactNode } from "react";

interface PageHeaderProps {
  /** ExtraBold part, e.g. "Residents," */
  title: ReactNode;
  /** Regular part, e.g. "128 approved." */
  light?: ReactNode;
  subtitle?: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}

/** 26px two-weight page title with optional actions on the right. */
export function PageHeader({ title, light, subtitle, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="mb-4 flex min-h-11 flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        {breadcrumb && <p className="mb-1 text-[12px] leading-[15px] text-muted">{breadcrumb}</p>}
        <h1 className="text-[26px] leading-[33px] tracking-[-0.78px] text-ink">
          <span className="font-extrabold">{title}</span>
          {light != null && <span className="font-normal"> {light}</span>}
        </h1>
        {subtitle && <p className="mt-0.5 text-[13px] leading-4 text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
