import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const SCANNER_REGION_ID = "barcode-scanner-region";

type Props = {
  onScan: (code: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const settledRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_REGION_ID);
    scannerRef.current = scanner;
    let stopped = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 160 } },
        (decodedText) => {
          if (settledRef.current) return;
          settledRef.current = true;
          onScan(decodedText);
        },
        () => {
          // per-frame decode errors are normal while no barcode is in view
        },
      )
      .catch(() => {
        if (!stopped) setPermissionError(true);
      });

    return () => {
      stopped = true;
      const current = scannerRef.current;
      scannerRef.current = null;
      if (current) {
        current
          .stop()
          .then(() => current.clear())
          .catch(() => {
            // scanner already stopped or never started
          });
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl border border-stone-200 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lg sm:rounded-3xl sm:pb-5 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Scan barcode</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="flex size-9 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {permissionError ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-8 text-center dark:border-stone-700">
            <span className="text-4xl">📷</span>
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              Camera access is blocked
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Allow camera permission in your browser settings, then try scanning
              again. You can also add the meal manually below.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-fuchsia-600"
            >
              Enter manually
            </button>
          </div>
        ) : (
          <div
            id={SCANNER_REGION_ID}
            className="mt-4 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-950"
          />
        )}
      </div>
    </div>
  );
}
