"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "@/entities/session";
import { recordScan } from "../model/record-scan";
import { PASSPORT_QR_PREFIX } from "./PassportQr";

interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorLike;

/** Extracts a target uid from a scanned/typed payload (`builder:<uid>`, a URL, or a raw uid). */
function extractUid(payload: string): string {
  const trimmed = payload.trim();
  if (trimmed.startsWith(PASSPORT_QR_PREFIX)) {
    return trimmed.slice(PASSPORT_QR_PREFIX.length);
  }
  try {
    const url = new URL(trimmed);
    const connect = url.searchParams.get("connect");
    if (connect) return connect;
  } catch {
    // not a URL — fall through
  }
  return trimmed;
}

/**
 * Passport scanner (task #7): camera QR scan via the native BarcodeDetector
 * (opt-in — triggers the camera permission prompt), with a manual
 * code-entry fallback for browsers without BarcodeDetector. On a successful
 * read it records a scanEdge connecting the two builders.
 */
export function PassportScanner() {
  const { uid } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supportsCamera =
    typeof window !== "undefined" &&
    "BarcodeDetector" in window &&
    Boolean(navigator.mediaDevices?.getUserMedia);

  const connect = async (payload: string) => {
    if (!uid) return;
    const target = extractUid(payload);
    setError(null);
    setMessage(null);
    try {
      await recordScan(uid, target);
      setMessage("연결 완료! 🎉");
    } catch (scanError) {
      setError(
        scanError instanceof Error ? scanError.message : "연결에 실패했어요.",
      );
    }
  };

  useEffect(() => {
    if (!scanning || !supportsCamera) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    const Detector = (window as unknown as { BarcodeDetector: BarcodeDetectorCtor })
      .BarcodeDetector;
    const detector = new Detector({ formats: ["qr_code"] });

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const tick = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) {
              await connect(codes[0].rawValue);
              setScanning(false);
              return;
            }
          } catch {
            // transient decode error — keep scanning
          }
          raf = requestAnimationFrame(() => void tick());
        };
        raf = requestAnimationFrame(() => void tick());
      } catch {
        setError("카메라를 열 수 없어요. 코드를 직접 입력해 주세요.");
        setScanning(false);
      }
    };

    void start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
    };
    // connect is stable enough for this opt-in scanner; uid gates it inside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning, supportsCamera]);

  return (
    <div>
      <h2>상대 QR 스캔</h2>
      {supportsCamera && (
        <>
          <button type="button" onClick={() => setScanning((value) => !value)}>
            {scanning ? "스캔 중지" : "카메라로 스캔"}
          </button>
          {scanning && (
            <video ref={videoRef} playsInline muted style={{ width: "100%", maxWidth: 320 }} />
          )}
        </>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void connect(manualCode);
          setManualCode("");
        }}
      >
        <label>
          코드 직접 입력
          <input
            value={manualCode}
            onChange={(event) => setManualCode(event.target.value)}
            placeholder="상대방 코드"
          />
        </label>
        <button type="submit" disabled={!manualCode.trim()}>
          연결
        </button>
      </form>

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
