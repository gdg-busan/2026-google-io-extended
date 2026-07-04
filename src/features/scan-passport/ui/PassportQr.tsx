"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useSession } from "@/entities/session";

/** Prefix marking a Builder Passport QR payload (disambiguates from other QRs). */
export const PASSPORT_QR_PREFIX = "builder:";

/**
 * Renders MY Passport QR — encodes `builder:<uid>` so another attendee's
 * scanner records a scanEdge targeting me. Shown on the passport page.
 */
export function PassportQr() {
  const { uid, isReady } = useSession();
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    QRCode.toDataURL(`${PASSPORT_QR_PREFIX}${uid}`, { width: 240, margin: 1 })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  if (!isReady) {
    return <p>불러오는 중…</p>;
  }

  return (
    <div>
      <h2>내 QR</h2>
      <p>상대방이 이 QR을 스캔하면 서로 연결돼요.</p>
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- data: URL, no optimization needed
        <img src={dataUrl} alt="내 Builder Passport QR" width={240} height={240} />
      ) : (
        <p>QR 생성 중…</p>
      )}
    </div>
  );
}
