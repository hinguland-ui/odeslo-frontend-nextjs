/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";

/** Panel-style illustrations (SVG, see public/landing/ui). They mirror the real Odeslo screens. */
const ui = (name: string) => `/landing/ui/${name}.png`;

export function HeroNoticeCard({ d = 0 }: { d?: number }) {
  return <div className="item photo rv" style={{ "--d": `${d}ms` } as CSSProperties}><img src={ui("hero-notice")} alt="Society notices and approvals" /></div>;
}

export function HeroTrackCard({ d = 0 }: { d?: number }) {
  return <div className="item photo rv" style={{ "--d": `${d}ms` } as CSSProperties}><img src={ui("hero-track")} alt="Live vendor visit tracking" /></div>;
}

function Dash({ name, alt }: { name: string; alt: string }) {
  return (
    <div className="dash-img">
      <img className="dash-art" src={ui(name)} alt={alt} />
      <div className="logo-hub"><span><img src="/brand/odeslo-icon-app.svg" alt="Odeslo" /></span></div>
    </div>
  );
}
export const DashDeals = () => <Dash name="dash-deals" alt="Group deals with vendor offers" />;
export const DashJobs = () => <Dash name="dash-jobs" alt="Live job tracking and chat" />;

export const featureViews: ReactNode[] = [
  <img key="1" src={ui("feature-1")} alt="Group deals" />,
  <img key="2" src={ui("feature-2")} alt="Job chat" />,
  <img key="3" src={ui("feature-3")} alt="Live visit tracking" />,
  <img key="4" src={ui("feature-4")} alt="Multiple homes" />,
  <img key="5" src={ui("feature-5")} alt="Secure files and payments" />,
];
