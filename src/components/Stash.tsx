import { useRef } from "react";
import { Play, Package } from "lucide-react";
import type { Beat } from "../data/beats";
import { BEATS } from "../data/beats";
import { Cover } from "./Cover";

export function Stash({
  currentId,
  onPreview,
  onOpenScale,
  onAdd,
  freeIds,
}: {
  currentId: string | null;
  onPreview: (b: Beat) => void;
  onOpenScale: (b: Beat) => void;
  onAdd: (b: Beat) => void;
  freeIds: Set<string>;
}) {
  return (
    <section className="section" id="stash">
      <div className="section-head">
        <div>
          <p className="eyebrow">in stock</p>
          <h2 className="section-title">The Stash</h2>
        </div>
        <p className="mono" style={{ color: "var(--muted)", fontSize: "0.72rem", letterSpacing: "0.1em" }}>
          {BEATS.length} PACKS ON THE SHELF · BULK DEALS INSIDE THE PHONE
        </p>
      </div>
      <div className="stash-grid">
        {BEATS.map((b, i) => (
          <Pack
            key={b.id}
            beat={b}
            index={i}
            playing={currentId === b.id}
            free={freeIds.has(b.id)}
            onPreview={onPreview}
            onOpenScale={onOpenScale}
            onAdd={onAdd}
          />
        ))}
      </div>
    </section>
  );
}

function Pack({
  beat,
  index,
  playing,
  free,
  onPreview,
  onOpenScale,
  onAdd,
}: {
  beat: Beat;
  index: number;
  playing: boolean;
  free: boolean;
  onPreview: (b: Beat) => void;
  onOpenScale: (b: Beat) => void;
  onAdd: (b: Beat) => void;
}) {
  const ref = useRef<HTMLElement>(null);

  // 3D tilt on hover (fine pointer only).
  const tilt = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${-py * 6}deg) rotateY(${px * 6}deg) translateY(-3px)`;
  };
  const untilt = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  // Drag-to-scale (mouse + touch): 10px of movement opens the scale holding
  // the pack; a plain click/tap previews instead.
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const down = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!start.current || start.current.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) {
      start.current = null;
      onOpenScale(beat);
    }
  };
  const up = () => {
    start.current = null;
  };

  const mode = index % 2 === 0 ? "brick" : "baggie";

  return (
    <article
      ref={ref}
      className={`pack ${mode}${playing ? " playing" : ""}`}
      style={{ animationDelay: `${0.08 * index}s`, "--tint": beat.palette[1] } as React.CSSProperties}
      onPointerMove={tilt}
      onPointerLeave={untilt}
      onPointerDown={down}
      onPointerMoveCapture={move}
      onPointerUp={up}
    >
      {playing && <span className="playing-ring" aria-hidden="true" />}
      <span className="pack-lot" aria-hidden="true">LOT {beat.bpm} · SEAL {index + 1}</span>
      {free && <span className="pack-badge">FREE LEASE</span>}
      {mode === "brick" ? (
        <span className="tape" aria-hidden="true">
          <em>PROD. THEBEATMOB ▸ KEEP FROZEN ▸ PROD. THEBEATMOB ▸</em>
        </span>
      ) : (
        <span className="seal-chip" aria-hidden="true" />
      )}
      <span className="wrinkle w1" aria-hidden="true" />
      <span className="wrinkle w2" aria-hidden="true" />
      <span className="wrinkle w3" aria-hidden="true" />
      <span className="wrinkle w4" aria-hidden="true" />
      <div className="pack-cover">
        {mode === "brick" && (
          <>
            <span className="twist t-left" aria-hidden="true" />
            <span className="twist t-right" aria-hidden="true" />
          </>
        )}
        <Cover beat={beat} />
        <button
          className="pack-play"
          onClick={() => onPreview(beat)}
          aria-label={`Preview ${beat.name}`}
          title="Preview"
        >
          <Play size={16} fill="currentColor" />
        </button>
      </div>
      <div className="pack-body">
        <h3 className="pack-name">{beat.name}</h3>
        <p className="pack-strain">{beat.strain}</p>
        <div className="pack-meta">
          <span className="pack-weight">{beat.weightOz} OZ NET</span>
          <span className="pack-price">${beat.price}</span>
        </div>
        <div className="pack-actions">
          <button className="btn" onClick={() => onOpenScale(beat)}>
            <Package size={13} /> Weigh it
          </button>
          <button className="btn btn-solid" onClick={() => onAdd(beat)}>
            Bag it
          </button>
        </div>
      </div>
    </article>
  );
}
