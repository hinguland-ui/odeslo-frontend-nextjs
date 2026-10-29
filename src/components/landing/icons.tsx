import type { SVGProps } from "react";

/** Small stroke icons used by the landing page (24px grid, currentColor). */
type P = SVGProps<SVGSVGElement>;
const base = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const PinIcon = (p: P) => (<svg {...base} {...p}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
export const ChatIcon = (p: P) => (<svg {...base} {...p}><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12Z" /><path d="M9 11h6M9 14h3.5" /></svg>);
export const ShieldIcon = (p: P) => (<svg {...base} {...p}><path d="M12 3 5 6v5.5c0 4.3 2.8 8 7 9.5 4.2-1.5 7-5.2 7-9.5V6l-7-3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></svg>);
export const WalletIcon = (p: P) => (<svg {...base} {...p}><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" /><rect x="4" y="8" width="16" height="11" rx="2.5" /><circle cx="16" cy="13.5" r="1.2" /></svg>);
export const BellIcon = (p: P) => (<svg {...base} {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></svg>);
export const FileIcon = (p: P) => (<svg {...base} {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>);
export const PhoneIcon = (p: P) => (<svg {...base} {...p}><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></svg>);
export const HomeIcon = (p: P) => (<svg {...base} {...p}><path d="m4 11 8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19.5V11Z" /><path d="M10 21v-6h4v6" /></svg>);
export const ToolIcon = (p: P) => (<svg {...base} {...p}><path d="M14.5 6.5a4 4 0 0 0 5 5L11 20a2.1 2.1 0 0 1-3-3l8.5-8.5" /><path d="m13 8 3 3" /></svg>);
export const ReceiptIcon = (p: P) => (<svg {...base} {...p}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></svg>);
export const LockIcon = (p: P) => (<svg {...base} {...p}><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>);
export const SparkIcon = (p: P) => (<svg {...base} {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3.5 3.5M14.5 14.5 18 18M18 6l-3.5 3.5M9.5 14.5 6 18" /></svg>);
export const PlusIcon = (p: P) => (<svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>);

export function InstagramIcon(p: P) { return (<svg {...base} strokeWidth={2} {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></svg>); }
export function FacebookIcon(p: P) { return (<svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...p}><path d="M13.5 21v-7.5H16l.5-3h-3V8.7c0-.9.3-1.5 1.6-1.5h1.5V4.5c-.3 0-1.2-.1-2.2-.1-2.3 0-3.9 1.4-3.9 4v2.1H7.5v3H10V21h3.5Z" /></svg>); }
export function XIcon(p: P) { return (<svg viewBox="0 0 15 15" fill="currentColor" width={15} height={15} {...p}><path d="M8.43 6.13 13.7 0h-1.25L7.87 5.32 4.22 0H0l5.53 8.04L0 14.47h1.25l4.83-5.62 3.86 5.62h4.22L8.43 6.13Zm-1.71 1.99-.56-.8L1.7.94h1.92l3.6 5.15.56.8 4.67 6.68H10.5L6.72 8.12Z" /></svg>); }
export function LinkedinIcon(p: P) { return (<svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...p}><path d="M6.4 9.5H3.3V20h3.1V9.5ZM4.9 4.3a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM20.7 20v-5.7c0-2.8-1.5-4.1-3.5-4.1-1.6 0-2.3.9-2.7 1.5V9.5h-3.1V20h3.1v-5.8c0-1.5.3-3 2.2-3s1.9 1.7 1.9 3.1V20h3.1Z" /></svg>); }

/** Arrow used in the white round buttons on the dashboard cards (pixel-art diagonal arrow). */
export function DashArrow() {
  const r = { fill: "#CDFACE", transform: "rotate(-40.2798" } as const;
  const rect = (x: number, y: number, w: number, h: number) => (
    <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={r.fill} transform={`${r.transform} ${x} ${y})`} />
  );
  return (
    <svg width="35" height="34" viewBox="0 0 35 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      {rect(6.2998, 23.9724, 25.5808, 3.24836)}
      {rect(9.91309, 8.13764, 3.24836, 3.24836)}
      {rect(14.4902, 8.51508, 3.24836, 3.24836)}
      {rect(19.0703, 8.89301, 3.24836, 3.24836)}
      {rect(23.2695, 13.8491, 3.24836, 3.24836)}
      {rect(22.8926, 18.4279, 3.24836, 3.24836)}
      {rect(22.5146, 23.006, 3.24836, 3.24836)}
    </svg>
  );
}
