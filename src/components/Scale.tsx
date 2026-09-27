import { useEffect, useState } from "react";
import { X, Package } from "lucide-react";
import type { Beat } from "../data/beats";
import { audio } from "../audio/engine";
import { Cover } from "./Cover";

// The digital scale: pack drops on the tray, LED weight ticks up, then BAG IT
// sends it to the phone.
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

  useEffect(() => {
    if (!beat) return;
    setWeight("0.00");
    setSettled(false);
    setTier(0);
    audio.blip();
    audio.scaleBeeps();
    const target = Number(beat.weightOz);
    let raf = 0;
    const t0 = performance.now();
    const dur = 1300;
    const tick = (t: number) => {
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

  return (
    <aside className={`scale glass${beat ? " on" : ""}`} role="dialog" aria-label="Digital scale">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p className="eyebrow">digital scale · certified</p>
        <button className="icon-btn" onClick={onClose} aria-label="Close scale">
          <X size={16} />
        </button>
      </div>
      <div className={`scale-tray${settled ? " loaded" : ""}`}>
        {settled ? (
          <span className="tray-chip">
            <Cover beat={beat} />
            {beat.name}
          </span>
        ) : (
          "product on tray…"
        )}
      </div>
      <div className={`scale-led${settled ? " settled" : ""}`} aria-live="polite">
        {weight} <span style={{ fontSize: "1rem", opacity: 0.7 }}>OZ</span>
      </div>
      <p className="scale-label">
        {beat.strain} · {beat.bpm} BPM · price per unit <strong>${beat.price}</strong>
      </p>
      <div style={{ marginTop: "0.8rem" }}>
        {beat.tiers.map((t, i) => (
          <button
            key={t.name}
            className="tier-row"
            style={{
              width: "100%",
              cursor: "pointer",
              background: i === tier ? "rgba(159,216,255,0.08)" : "transparent",
              borderLeft: i === tier ? "2px solid var(--ice)" : "2px solid transparent",
            }}
            onClick={() => setTier(i)}
          >
            <span>
              <strong style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {t.name}
              </strong>
              <span style={{ color: "var(--muted)", marginLeft: "0.5rem", fontSize: "0.72rem" }}>{t.note}</span>
            </span>
            <span className="tier-price">${t.price}</span>
          </button>
        ))}
      </div>
      <button
        className="btn btn-solid"
        style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
        onClick={() => onBag(beat, tier)}
      >
        <Package size={14} /> Bag it — send to the phone
      </button>
    </aside>
  );
}
