"use client";

import { useEffect, type ReactNode } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  /** Stacking level. A modal opened from inside another (file preview) passes a higher one. */
  z?: number;
}

export function Modal({ open, onClose, title, subtitle, children, footer, width = 480, z = 80 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 grid place-items-center bg-black/50 backdrop-blur-[2px] p-4 animate-fade-in" style={{ zIndex: z }} onMouseDown={onClose}>
      <div
        className={clsx("max-h-[90vh] w-full overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl animate-slide-up scroll-thin")}
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-bold leading-[23px] text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[12px] leading-[15px] text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full bg-mist text-[14px] text-body hover:bg-line" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
