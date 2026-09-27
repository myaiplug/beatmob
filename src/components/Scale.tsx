import { useEffect, useRef, useState } from "react";
import { X, Package } from "lucide-react";
import type { Beat } from "../data/beats";
import { audio } from "../audio/engine";
import { Cover } from "./Cover";

// The digital scale — hardware look, hardware behavior: ON/OFF dims the LED,
// TARE zeroes it, UNIT flips oz↔g. Weighs whatever drops on the tray.
export function Scale({
  beat,
  onClose,
  onBag,
}: {
  beat: Beat | null;
  onClose: () => void;
  onBag: (b: Beat, tierIndex: number) => void;
}) {
  const [weight, setWeight] = useState("0.00");
  const [settled, setSettled] = useState(false);
  const [tier, setTier] = useState(0);
  const [power, setPower] = useState(true);
  const [unit, setUnit] = useState<"oz" | "g">("oz");
  const tareRef = useRef(false);

  useEffect(() => {
    if (!beat) return;
    setWeight("0.00");
    setSettled(false);
    setTier(0);
    tareRef.current = false;
    audio.blip();
    audio.scaleBeeps();
    const target = Number(beat.weightOz);
    let raf = 0;
    const t0 = performance.now();
    const dur = 1300;
    const tick = (t: number) => {
      if (tareRef.current) return;
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const jitter = p < 1 ? (Math.random() - 0.5) * 0.03 : 0;
      setWeight((target * eased + jitter).toFixed(2));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setWeight(target.toFixed(2));
        setSettled(true);
        audio.lockBeep();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [beat]);

  if (!beat) return null;

  const tare = () => {
    tareRef.current = true;
    setWeight("0.00");
    setSettled(false);
    audio.blip();
  };
  const flipUnit = () => {
    const next = unit === "oz" ? "g" : "oz";
    setUnit(next);
    const v = Number(weight);
    if (!Number.isNaN(v) && v > 0) setWeight(next === "g" ? (v * 28.3495).toFixed(2) : (v / 28.3495).toFixed(2));
    audio.blip();
  };

  return (
    <aside className={`scale${beat ? " on" : ""}`} role="dialog" aria-label="Digital scale">
      <div className="scale-head">
        <p className="scale-brand">
          <b>MOB·400</b> precision · max 400oz
        </p>
        <button className="icon-btn" onClick={onClose} aria-label="Close scale" style={{ width: 30, height: 30 }}>
          <X size={15} />
        </button>
      </div>
      <div className="scale-tray">
        <span className="tray-inner">
          {settled && !tareRef.current ? (
            <span className="tray-chip">
              <Cover beat={beat} />
              {beat.name}
            </span>
          ) : (
            <span className="tray-note">{settled ? "tared" : "placing product…"}</span>
          )}
        </span>
      </div>
      <div
        className={`scale-led${settled && !tareRef.current ? " settled" : ""}${power ? "" : " off"}`}
        aria-live="polite"
      >
        {power ? (
          <>
            {weight}
            <span className="unit">{unit === "oz" ? "oz" : "g"}</span>
          </>
        ) : (
          "— — —"
        )}
      </div>
      <div className="scale-keys">
        <button
          className={`scale-key${power ? " active" : ""}`}
          onClick={() => {
            setPower((p) => !p);
            audio.blip();
          }}
        >
          {power ? "ON" : "OFF"}
        </button>
        <button className="scale-key" onClick={tare} disabled={!power}>
          TARE
        </button>
        <button className="scale-key active" onClick={flipUnit} disabled={!power}>
          UNIT:{unit.toUpperCase()}
        </button>
      </div>
      <p className="scale-label">
        {beat.strain} · {beat.bpm} BPM · ${beat.price}/unit
      </p>
      <div>
        {beat.tiers.map((t, i) => (
          <button
            key={t.name}
            className={`tier-row${i === tier ? " sel" : ""}`}
            style={{ width: "100%", cursor: "pointer" }}
            onClick={() => setTier(i)}
          >
            <span>
              <strong style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em", textTransform: "uppercase", color: "#eef3f8" }}>
                {t.name}
              </strong>
              <span style={{ color: "#8b96a3", marginLeft: "0.5rem", fontSize: "0.72rem" }}>{t.note}</span>
            </span>
            <span className="tier-price">${t.price}</span>
          </button>
        ))}
      </div>
      <button
        className="btn btn-solid"
        style={{ width: "100%", justifyContent: "center", marginTop: "0.8rem" }}
        onClick={() => onBag(beat, tier)}
      >
        <Package size={14} /> Bag it — send to the phone
      </button>
    </aside>
  );
}
