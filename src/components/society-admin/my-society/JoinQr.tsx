"use client";

import QRCode from "qrcode";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

const SIZE = 640;

/** Draws the QR with the Odeslo logo in the middle (error correction H keeps it scannable) and returns a PNG data URL. */
async function makeQr(text: string): Promise<string> {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, text, { width: SIZE, margin: 2, errorCorrectionLevel: "H", color: { dark: "#1c1c22", light: "#ffffff" } });
  const ctx = canvas.getContext("2d");
  if (ctx) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const box = SIZE * 0.22;
        const x = (SIZE - box) / 2;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(x - 8, x - 8, box + 16, box + 16, 22);
        ctx.fill();
        ctx.drawImage(img, x, x, box, box);
        resolve();
      };
      img.onerror = () => resolve(); // no logo: the plain QR still scans
      img.src = "/brand/logo.png";
    });
  }
  return canvas.toDataURL("image/png");
}

/** The society's join QR: residents scan it with the phone camera and land on sign-up with the society already chosen. */
export function JoinQr({ url, societyName, code }: { url: string; societyName: string; code: string }) {
  const [png, setPng] = useState("");
  useEffect(() => {
    let alive = true;
    makeQr(url).then((p) => alive && setPng(p)).catch(() => alive && setPng(""));
    return () => { alive = false; };
  }, [url]);

  const download = () => {
    const a = document.createElement("a");
    a.href = png;
    a.download = `${societyName.replace(/[^\w]+/g, "-")}-join-QR.png`;
    a.click();
  };

  return (
    <div className="rounded-[18px] bg-night p-4 text-center">
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.8px] text-night-muted">Scan to join</p>
      <div className="mx-auto grid size-[210px] place-items-center rounded-[18px] bg-white p-2.5">
        {png ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={png} alt={`QR code to join ${societyName}`} className="size-full" />
        ) : (
          <span className="size-8 animate-spin rounded-full border-2 border-line border-t-ink" aria-label="Preparing QR" />
        )}
      </div>
      <p className="mt-3 text-[13px] font-bold text-white">{societyName}</p>
      <p className="text-[11px] text-night-muted">Society code {code}</p>
      <Button variant="white" size="sm" className="mt-3" disabled={!png} onClick={download}><Download size={15} /> Download QR (PNG)</Button>
    </div>
  );
}
