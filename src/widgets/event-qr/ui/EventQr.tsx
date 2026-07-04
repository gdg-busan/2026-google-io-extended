"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { EVENT_NAME } from "@/shared/config/event";

/**
 * Event-entry QR (task #8). Encodes the site's own origin so it can be
 * printed and put on tables — attendees scan it to join. Rendered
 * client-side because it needs the live origin.
 */
export function EventQr() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    const url = window.location.origin;
    QRCode.toDataURL(url, { width: 320, margin: 2 })
      .then((qr) => {
        setOrigin(url);
        setDataUrl(qr);
      })
      .catch(() => {
        setOrigin(url);
        setDataUrl(null);
      });
  }, []);

  return (
    <main>
      <h1>{EVENT_NAME}</h1>
      <p>이 QR을 찍고 접속하세요</p>
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- data: URL
        <img src={dataUrl} alt="행사 접속 QR" width={320} height={320} />
      ) : (
        <p>QR 생성 중…</p>
      )}
      {origin && <p>{origin}</p>}
    </main>
  );
}
