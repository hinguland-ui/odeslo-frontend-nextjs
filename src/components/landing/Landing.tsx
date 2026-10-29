"use client";
/* eslint-disable @next/next/no-img-element */
import { Inter } from "next/font/google";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand/Brand";
import "./landing.css";
import { BellIcon, ChatIcon, DashArrow, FacebookIcon, FileIcon, InstagramIcon, LinkedinIcon, LockIcon, PinIcon, ShieldIcon, SparkIcon, ToolIcon, WalletIcon, XIcon } from "./icons";
import { DashDeals, DashJobs, HeroNoticeCard, HeroTrackCard, featureViews } from "./mocks";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const LOGIN = "/login";
const NAV = [
  { id: "top", label: "Home" },
  { id: "features", label: "Features" },
  { id: "why", label: "Why Odeslo" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

/* ---------- small building blocks ---------- */
function Btn({ href = LOGIN, children, variant, white }: { href?: string; children: ReactNode; variant?: "gradient" | "white" | "dark"; white?: boolean }) {
  if (variant === "gradient") {
    return (
      <Link href={href} className="thm-btn desk-btn desk-btn--gradient" aria-label={String(children)}>
        <div className={`layer${white ? " layer_white" : ""}`}><div className="inner"><div className="text">{children}</div></div></div>
      </Link>
    );
  }
  return (
    <Link href={href} className={`thm-btn desk-btn${variant === "white" ? " desk-btn--white" : ""}`} aria-label={String(children)}>
      <div className="inner"><div className="text">{children}</div></div>
    </Link>
  );
}

function Rv({ children, d = 0, kind, className = "", style }: { children: ReactNode; d?: number; kind?: "left" | "zoom"; className?: string; style?: CSSProperties }) {
  return <div className={`rv${kind ? ` rv-${kind}` : ""} ${className}`} style={{ "--d": `${d}ms`, ...style } as CSSProperties}>{children}</div>;
}

function Count({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1400);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <><span ref={ref}>{n === 0 ? "00" : String(n)}</span><span className="suf">{suffix}</span></>;
}

/* ---------- header ---------- */
function Header({ active }: { active: string }) {
  const [fixed, setFixed] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setFixed((v) => { const n = window.scrollY > 160; return n === v ? v : n; });
    const raf = requestAnimationFrame(on);
    window.addEventListener("scroll", on, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); };
  }, []);
  return (
    <>
      <header className={`header-area${fixed ? " is-fixed" : ""}`}>
        <div className="header__wrap mlr-50">
          <div className="xb-header-logo"><a href="#top" aria-label="Odeslo home"><BrandLogo height={34} /></a></div>
          <nav className="main-menu" aria-label="Primary">
            <ul>
              {NAV.map((n) => (<li key={n.id} className={active === n.id ? "active" : ""}><a href={`#${n.id}`}><span>{n.label}</span></a></li>))}
            </ul>
          </nav>
          <div className="xb-header-btn"><Btn variant="white">Login</Btn><Btn>Get started</Btn></div>
          <button className="xb-nav-mobile" aria-label="Open menu" onClick={() => setOpen(true)}><span /><span /><span /></button>
        </div>
      </header>
      <div className={`xb-header-menu${open ? " active" : ""}`}>
        <div className="xb-header-menu-scroll">
          <button className="xb-menu-close" aria-label="Close menu" onClick={() => setOpen(false)}>×</button>
          <div style={{ marginBottom: 28 }}><BrandLogo height={30} /></div>
          <nav><ul>{NAV.map((n) => (<li key={n.id}><a href={`#${n.id}`} onClick={() => setOpen(false)}>{n.label}</a></li>))}</ul></nav>
          <div className="xb-header-menu-actions"><Btn variant="white">Login</Btn><Btn>Get started</Btn></div>
        </div>
      </div>
      <div className={`xb-header-menu-backdrop${open ? " active" : ""}`} onClick={() => setOpen(false)} />
    </>
  );
}

/* ---------- hero ---------- */
function Hero() {
  return (
    <section className="hero-area" id="top">
      <div className="xb-hero-inner radius-50 mlr-50 pos-rel">
        <div className="container">
          <div className="xb-hero-content text-center">
            <div className="sec-title"><h1 className="title hero-up">The society platform that gets work done</h1></div>
            <p className="xb-item--content rv" style={{ "--d": "100ms" } as CSSProperties}>Residents, vendors and admins stay connected in one place, every day.</p>
            <Rv d={200}><Btn variant="gradient">Get started</Btn></Rv>
            <p className="xb-item--offer rv" style={{ "--d": "300ms" } as CSSProperties}>Sign in with just your mobile number</p>
          </div>
          <div className="xb-hero-bottom">
            <HeroNoticeCard d={400} />
            <div className="item mini bg-pink rv" style={{ "--d": "500ms" } as CSSProperties}>
              <div><h3 className="xb-item--title">Live</h3><p className="xb-item--content">Chat &amp; alerts</p></div>
              <div className="xb-item--img"><img src="/landing/ui/hero-chat.svg" alt="" /></div>
            </div>
            <div className="item circle_up_down rv" style={{ "--d": "600ms" } as CSSProperties}>
              <a className="inner" href="#brand" aria-label="Scroll down">
                <img src="/landing/img/hero-badge.png" alt="" />
                <svg width="25" height="26" viewBox="0 0 25 26" fill="none"><path d="M11.2997 25.5104C11.9626 26.1632 13.0374 26.1632 13.7003 25.5104L24.5028 14.8754C25.1657 14.2226 25.1657 13.1648 24.5028 12.5121C23.8399 11.8593 22.7652 11.8593 22.1023 12.5121L12.5 21.9653L2.89773 12.5121C2.23483 11.8593 1.16007 11.8593 0.497173 12.5121C-0.165724 13.1648 -0.165724 14.2226 0.497173 14.8754L11.2997 25.5104ZM10.8025 0V24.3286H14.1975V0H10.8025Z" fill="#1c1c22" /></svg>
              </a>
            </div>
            <div className="item mini bg-gary rv" style={{ "--d": "700ms" } as CSSProperties}>
              <div><h3 className="xb-item--title">Easy</h3><p className="xb-item--content">Online payments</p></div>
              <div className="xb-item--img"><img src="/landing/img/hero-img02.png" alt="" /></div>
            </div>
            <HeroTrackCard d={800} />
          </div>
        </div>
        <div className="xb-bg-shape">
          <div className="shape shape--1"><img src="/landing/img/hero-cloud01.png" alt="" /></div>
          <div className="shape shape--2"><img src="/landing/img/hero-cloud02.png" alt="" /></div>
          <div className="shape shape--3"><img src="/landing/img/hero-cloud02.png" alt="" /></div>
        </div>
      </div>
    </section>
  );
}

/* ---------- brand strip ---------- */
const SERVICES = ["Plumbing", "Electrical", "Cleaning", "Security", "Painting", "Carpentry", "Pest control", "Gardening", "Lift service"];
function Brand() {
  const list = [...SERVICES, ...SERVICES];
  return (
    <section id="brand" className="brand pt-60">
      <div className="container">
        <div className="xb-brand-top">
          <span className="text">Every service your society needs</span>
          <span className="line"><span className="xb-animate-leftRight"><span className="line line--1"><span /></span></span></span>
        </div>
        <div className="xb-hero-brand-wrap">
          <div className="xb-item--marquee">
            <ul className="xb-item--brand_list">
              {list.map((s, i) => (<li key={i}><SparkIcon />{s}</li>))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- dashboard cards ---------- */
function Dash() {
  return (
    <section className="dash_board pt-130">
      <div className="container">
        <div className="dash-grid">
          <Rv>
            <div className="xb-dashboard-item">
              <div className="xb-item--top ul_li_between"><h3 className="xb-item--title"><a href={LOGIN}>Post a deal, get vendor offers</a></h3><a href={LOGIN} className="xb-item--arrow" aria-label="Open"><DashArrow /></a></div>
              <DashDeals />
            </div>
          </Rv>
          <Rv d={100}>
            <div className="xb-dashboard-item">
              <div className="xb-item--top ul_li_between"><h3 className="xb-item--title"><a href={LOGIN}>Track every job in one place</a></h3><a href={LOGIN} className="xb-item--arrow" aria-label="Open"><DashArrow /></a></div>
              <DashJobs />
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

/* ---------- features ---------- */
const FEATURES = [
  { icon: "fea_icon01", title: "Group Deals Vendors Can Apply To", body: "Post a need once. Approved vendors apply with their offers and the society picks the best one." },
  { icon: "fea_icon02", title: "Chat On Every Job", body: "Talk to the vendor inside the job. Messages arrive in real time, so nobody has to share a phone number." },
  { icon: "fea_icon03", title: "Live Visit Tracking", body: "See when your vendor is on the way, with live location shared while they travel to your home." },
  { icon: "fea_icon04", title: "Multiple Homes, One Login", body: "Switch between homes in a tap, or add another one. The society admin approves it." },
  { icon: "fea_icon05", title: "Secure Files & Payments", body: "Uploads are encrypted at rest and previewed before saving. Pay online through Razorpay." },
];
function Features() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % FEATURES.length), 4500);
    return () => clearInterval(t);
  }, [paused]);
  return (
    <section className="feature pt-125" id="features">
      <div className="container">
        <Rv><div className="sec-title text-center"><h2 className="title">Everything Your Society Needs</h2></div></Rv>
        <div className="feature-grid">
          <div className="hd-feature-item-left">
            <h2 className="xb-item--title">Deliver Great Service To Every Home</h2>
            <p className="xb-item--content">Bring residents, vendors and admins together with fast responses, clear approvals and live updates.</p>
            <div className="hd-feautre-btn"><Btn variant="gradient">Get started</Btn></div>
          </div>
          <div className="xbf-hd-feature-item-right" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="xbf-hd-feature-tab">
              <div className="xbf-mockup-frame">
                <div className="xbf-mockup-container" style={{ transform: `translateY(${-i * 250}px)` }}>
                  {featureViews.map((v, k) => (<div key={k} className={`xbf-mockup-view${k === i ? " active" : ""}`}>{v}</div>))}
                </div>
              </div>
            </div>
            <div className="xbf-rt-feature-v3-right-part">
              {FEATURES.map((f, k) => (
                <div key={f.title} className={`xbf-rt-according-main${k === i ? " active" : ""}`} onClick={() => setI(k)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setI(k)}>
                  <div className="xbf-item-header-row"><img src={`/landing/img/icon-${f.icon}.svg`} alt="" className="xbf-feature-icon" /><h3 className="xbf-rt-text-style-h5">{f.title}</h3></div>
                  <div className="xbf-rt-overflow-hidden">
                    <div><div className="xbf-rt-according-para-wrap"><p className="xbf-rt-no-margin">{f.body}</p></div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- stats + slider ---------- */
const STATS = [
  { tag: "Panels", n: 4, s: "", t: "Role-based panels" },
  { tag: "Security", n: 100, s: "%", t: "Files encrypted at rest" },
  { tag: "Access", n: 1, s: "", t: "Login for every role" },
  { tag: "Maps", n: 3, s: "", t: "Map styles to pick from" },
  { tag: "OTP", n: 6, s: "", t: "Digit OTP sign-in" },
];
const SLIDES = [
  { img: "story-live.svg", big: "Live", t: "Visit tracking", quote: <>“Know exactly when help arrives. Vendors <span>share live location on the way,</span> and you can chat from the same job, <span>all in real time.</span>”</>, who: "For residents", role: "Resident app & web portal" },
  { img: "story-quick.svg", big: "Quick", t: "Vendor applications", quote: <>“Browse open group deals, <span>apply with your best offer</span> and get the job once the society awards it, <span>with payments recorded.</span>”</>, who: "For vendors", role: "Vendor portal" },
  { img: "story-safe.svg", big: "Safe", t: "Encrypted storage", quote: <>“Approve homes, vendors and payments from <span>one dashboard,</span> and keep every document <span>private and organised.</span>”</>, who: "For society admins", role: "Society admin panel" },
];
function Story() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);
  const cardBtn = (<a className="xb-item--btn" href={LOGIN}><img src="/landing/ui/plus.svg" alt="" /><span>Get started <i>›</i></span></a>);
  return (
    <section className="success_story pt-125" id="why">
      <div className="container">
        <Rv><div className="sec-title text-center mb-65"><h2 className="title">Built For Every Role</h2></div></Rv>
        <div className="story-grid">
          {STATS.map((s, k) => (
            <div key={s.tag} className={k === 4 ? "story-card5" : ""}>
              <Rv d={k * 100}>
                <div className={`xb-story-item bg--${k + 1}`}>
                  <div className="xb-item--logo">{s.tag}</div>
                  <div className="xb-item--holder"><h3 className="xb-item--number"><Count to={s.n} suffix={s.s} /></h3><p className="xb-item--text">{s.t}</p></div>
                  {cardBtn}
                </div>
              </Rv>
            </div>
          ))}
          <div className="story-slider-col">
            <Rv d={100} style={{ height: "100%" }}>
              <div className="xb-story-slider-wrap">
                <div className="xb-story-slider">
                  <div className="xb-story-track" style={{ transform: `translateX(-${i * 100}%)` }}>
                    {SLIDES.map((s) => (
                      <div className="xb-story-slide" key={s.who}>
                        <div className="xb-story-slide-box">
                          <div className="xb-story-item bg--6">
                            <div className="xb-item--img"><img src={`/landing/ui/${s.img}`} alt="" /></div>
                            <div className="xb-item--holder"><h3 className="xb-item--number">{s.big}</h3><p className="xb-item--text">{s.t}</p></div>
                            {cardBtn}
                          </div>
                          <div className="xb-story-slide-content">
                            <div className="xb-item--logo">{s.who}</div>
                            <p className="xb-item--content">{s.quote}</p>
                            <div className="xb-item--holder ul_li_between">
                              <div className="xb-item--author"><h3 className="xb-item--name">{s.who}</h3><p className="xb-item--desig">{s.role}</p></div>
                              <div className="xb-item-quote"><img src="/landing/ui/quote.svg" alt="" /></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="xb-story-pagination">
                    {SLIDES.map((s, k) => (<button key={s.who} className={k === i ? "active" : ""} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} />))}
                  </div>
                </div>
              </div>
            </Rv>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- integration orbit ---------- */
const ORBIT = ["razorpay", "google", "whatsapp", "telegram", "gmail", "googlemaps", "googledrive", "notion", "github", "stripe", "figma", "zoom", "android", "apple"];
function Integration() {
  return (
    <section className="intigration mlr-50">
      <div className="xb-intigration-wrapper radius-50">
        <div className="container">
          <div className="xb-intigration-inner">
            <Rv><div className="sec-title"><h2 className="title clr-white">Connect With The Tools You Love</h2></div></Rv>
            <div className="xb-intigration-logo">
              <img className="logo" src="/brand/odeslo-icon-app.svg" alt="" />Odeslo
              <div className="bg_shape"><img src="/landing/img/integrate-logo-bg.jpg" alt="" /></div>
            </div>
            <p className="xb-content">Payments, maps, messaging and storage fit into the apps your society already uses.</p>
            <div className="xb-blur-shape">
              <div className="shape shape--1"><img src="/landing/img/integrate-blure-shape01.png" alt="" /></div>
              <div className="shape shape--2"><img src="/landing/img/integrate-blure-shape02.png" alt="" /></div>
              <div className="shape shape--3"><img src="/landing/img/integrate-round-line.png" alt="" /></div>
            </div>
            <div className="xb-integrations-logo-inner">
              {ORBIT.map((name, k) => (
                <div key={k} className="xb-integrations-logo" data-direction={k < 7 ? "left" : "right"} style={{ animationDelay: `-${((k % 7) * 15 / 7 + (k < 7 ? 1 : 0)).toFixed(2)}s`, "--o": `${8 + (k % 7) * 14}%` } as CSSProperties}><img src={`/landing/logos/${name}.svg`} alt="" /></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- fun facts ---------- */
function Funfact() {
  const col = (n: string, t: string, d: number, items: ReactNode, tint?: boolean) => (
    <div className="funfact-col">
      <Rv d={d} kind="left"><div className="xb-funfact-item"><h3 className="xb-item--number">{n}</h3><p className="xb-item--text">{t}</p><div className="xb-item--img"><div className={`circles${tint ? " tint" : ""}`}>{items}</div></div></div></Rv>
    </div>
  );
  return (
    <section className="funfact" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="xb-funfact-wrapper">
          <Rv><div className="sec-title text-center" style={{ paddingTop: 0 }}><h2 className="title">Rely On Odeslo</h2></div></Rv>
          <div className="xb-funfact-inner" style={{ marginTop: 60 }}>
            <div className="funfact-row">
              {col("4", "Panels, one platform", 0, ["R", "V", "A", "S"].map((c) => <span key={c}>{c}</span>))}
              {col("Live", "Updates, chat & tracking", 150, <><span><BellIcon /></span><span><ChatIcon /></span><span><PinIcon /></span></>, true)}
              {col("100%", "Encrypted uploads", 300, <><span><LockIcon /></span><span><FileIcon /></span><span><ShieldIcon /></span></>)}
            </div>
            <div className="xb-animate-leftRight"><span className="line line--1"><span /></span><span className="line line--2"><span /></span></div>
            <span className="xb-blur-line" /><span className="xb-blur-line two" />
          </div>
          <div className="xb-faq-btn"><Btn variant="gradient">Get started</Btn></div>
        </div>
      </div>
    </section>
  );
}

/* ---------- faq ---------- */
const FAQ: { q: string; a: ReactNode }[] = [
  { q: "How do I sign in?", a: <>Enter your mobile number, get a 6-digit OTP and you’re in. New here? Pick your role and finish a short onboarding.</> },
  { q: "Can I live in more than one home?", a: <><span>Yes.</span> Add another home from your resident profile. Once the society admin approves it, you can switch between homes anytime.</> },
  { q: "How do vendors get work?", a: <>Vendors apply to open group deals posted by societies. When a society awards a deal, you get the job, chat with residents and share live location on the way.</> },
  { q: "Are my documents and photos safe?", a: <><span>Yes.</span> Uploads are validated and encrypted at rest, and previewed inside the app before anything is saved.</> },
  { q: "How do payments work?", a: <>Societies can turn on Razorpay in settings so residents and vendors can pay online. Everything is recorded in the admin dashboard.</> },
  { q: "What happens if a society is removed?", a: <>Vendor job history and payment records are kept, so vendors never lose their work records.</> },
];
function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq pt-130" id="faq">
      <div className="container">
        <div className="xb-faq-wrapper">
          <div className="faq-grid">
            <div className="xb-faq-left">
              <div className="sec-title"><h2 className="title">Frequently Asked Questions</h2></div>
              <p className="xb-content">Still can’t find the answer here? Sign in and ask your society admin, we’ll be happy to help.</p>
              <div className="xb-faq-btn"><Btn variant="gradient">Sign in</Btn></div>
            </div>
            <div className="xb-faq xb-desk-faq">
              <ul className="accordion_box">
                {FAQ.map((f, k) => (
                  <li key={f.q} className={`accordion block${open === k ? " active-block" : ""}`}>
                    <button className={`acc-btn${open === k ? " active" : ""}`} aria-expanded={open === k} onClick={() => setOpen(open === k ? -1 : k)}>{f.q}<span className="arrow" /></button>
                    <div className="acc_body"><div><div className="content"><p>{f.a}</p></div></div></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- cta ---------- */
function Cta() {
  const bub = (cls: string, Ic: typeof BellIcon, d: number) => (<div className={`icon ${cls}`}><Rv d={d} kind="zoom"><div className="bub"><Ic /></div></Rv></div>);
  return (
    <section className="cta cta-section">
      <div className="container">
        <div className="xb-cta-wrapper">
          <div className="xb-cta-left">
            <div className="sec-title"><h2 className="title clr-white">One login for every home and job</h2></div>
            <p className="xb-content">Post deals, track jobs, chat and pay securely.</p>
            <div className="xb-cta-btn ul_li"><Btn variant="gradient" white>Get started</Btn><span className="xb-free">Sign in with OTP</span></div>
          </div>
          <div className="xb-cta-right">
            <img className="phone" src="/landing/ui/phone.png" alt="Job list in the Odeslo app" />
            <div className="xb-icon">
              {bub("icon--1", WalletIcon, 0)}{bub("icon--2", ChatIcon, 100)}{bub("icon--3", PinIcon, 200)}{bub("icon--4", BellIcon, 300)}{bub("icon--5", ShieldIcon, 400)}
              <div className="icon icon--6 icon--pill"><Rv kind="zoom" d={500}><span style={{ display: "flex", alignItems: "center", gap: 8 }}><ToolIcon width={22} height={22} />New Job</span></Rv></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */
function Footer() {
  const store = (icon: string, small: string, big: string) => (
    <a href="#" className="store-btn" aria-label={`${small} ${big}`}><img src={`/landing/logos/${icon}-white.svg`} alt="" /><span><small>{small}</small>{big}</span></a>
  );
  return (
    <footer className="footer mlr-50" id="contact">
      <div className="hd-footer-wrapper radius-50">
        <div className="container">
          <div className="hd-footer-inner">
            <Rv><div className="xb-footer-logo"><img src="/brand/odeslo-logo-horizontal-dark.svg" alt="Odeslo" /></div></Rv>
            <div className="xb-footer-cols">
              <div className="fcol fcol--about">
                <p>One platform for residents, vendors and society admins. Group deals, live job tracking, chat and secure payments.</p>
                <div className="store-row">{store("googleplay", "GET IT ON", "Google Play")}{store("appstore", "Download on the", "App Store")}</div>
              </div>
              <div className="fcol"><h4>Explore</h4><ul><li><a href="#top">Home</a></li><li><a href="#features">Features</a></li><li><a href="#why">Why Odeslo</a></li><li><a href="#faq">FAQ</a></li></ul></div>
              <div className="fcol"><h4>Get started</h4><ul><li><Link href={LOGIN}>Resident sign in</Link></li><li><Link href={LOGIN}>Vendor sign in</Link></li><li><Link href={LOGIN}>Society admin</Link></li><li><Link href={LOGIN}>Register society</Link></li></ul></div>
              <div className="fcol"><h4>Legal</h4><ul><li><a href="#">Terms of service</a></li><li><Link href="/privacy-policy">Privacy policy</Link></li><li><Link href="/delete-account">Delete account</Link></li></ul></div>
            </div>
            <div className="xb-footer_bottom hd-footer-bottom ul_li_between">
              <p>Copyright © 2026 <a href="#top">Odeslo,</a> All rights reserved.</p>
              <ul className="xb-social-media">
                <li><a href="#" aria-label="Instagram"><InstagramIcon /></a></li>
                <li><a href="#" aria-label="Facebook"><FacebookIcon /></a></li>
                <li><a href="#" aria-label="X"><XIcon /></a></li>
                <li><a href="#" aria-label="LinkedIn"><LinkedinIcon /></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- page ---------- */
export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("top");
  const [showTop, setShowTop] = useState(false);

  // reveal elements as they scroll into view
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>(".rv");
    if (!els) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // active menu item + back-to-top
  const onScroll = useCallback(() => {
    setShowTop(window.scrollY > 600);
    let cur = "top";
    for (const n of NAV) {
      const el = document.getElementById(n.id);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = n.id;
    }
    setActive(cur);
  }, []);
  useEffect(() => {
    const raf = requestAnimationFrame(onScroll);
    let ticking = false;
    const on = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); };
    window.addEventListener("scroll", on, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); };
  }, [onScroll]);

  return (
    <div ref={root} className={`odl ${inter.variable}`}>
      <Header active={active} />
      <main>
        <Hero />
        <div className="group_section">
          <Brand />
          <Dash />
          <Features />
        </div>
        <Story />
        <Integration />
        <Funfact />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <div className={`xb-backtotop${showTop ? " active" : ""}`}>
        <a href="#top" className="scroll" aria-label="Back to top">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12V2M2.5 6.5 7 2l4.5 4.5" /></svg>
        </a>
      </div>
    </div>
  );
}
