import { useRef } from "react";
import type { Beat } from "../data/beats";
import { BEATS } from "../data/beats";

// The Stash, cardless: each beat is its one-of-one stamped brick, front and
// center in a uniform square. No cards, no buttons — the product is the UI.
// Tap the brick to hear it; drag it to the scale to weigh & bag.
const BASE = import.meta.env.BASE_URL;

export function Stash({
  currentId,
  onPreview,
  onOpenScale,
  freeIds,
}: {
  currentId: string | null;
  onPreview: (b: Beat) => void;
  onOpenScale: (b: Beat) => void;
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
          {BEATS.length} STAMPED BRICKS · TAP TO HEAR · DRAG TO THE SCALE
        </p>
      </div>
      <div className="stash-grid">
        {BEATS.map((b, i) => (
          <Work
            key={b.id}
            beat={b}
            index={i}
            playing={currentId === b.id}
            free={freeIds.has(b.id)}
            onPreview={onPreview}
            onOpenScale={onOpenScale}
          />
        ))}
      </div>
    </section>
  );
}

function Work({
  beat,
  index,
  playing,
  free,
  onPreview,
  onOpenScale,
}: {
  beat: Beat;
  index: number;
  playing: boolean;
  free: boolean;
  onPreview: (b: Beat) => void;
  onOpenScale: (b: Beat) => void;
}) {
  // Drag-to-scale (mouse + touch): 10px of movement opens the scale holding
  // the brick; a plain click/tap previews instead. A drag sets data-dragged
  // so the click that follows the pointerup is swallowed.
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const down = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!start.current || start.current.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) {
      start.current = null;
      (e.currentTarget as HTMLElement).dataset.dragged = "1";
      onOpenScale(beat);
    }
  };
  const up = () => {
    start.current = null;
  };

  return (
    <figure
      className={`work${playing ? " playing" : ""}`}
      style={{ "--d": `${0.07 * index}s`, "--tint": beat.palette[1] } as React.CSSProperties}
    >
      <div
        className="work-frame"
        role="button"
        tabIndex={0}
        aria-label={`${beat.name}, ${beat.strain}. Tap to preview, drag to the scale.`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onClick={(e) => {
          const el = e.currentTarget as HTMLElement;
          if (el.dataset.dragged === "1") {
            delete el.dataset.dragged;
            return;
          }
          onPreview(beat);
        }}
        onKeyDown={(e) => e.key === "Enter" && onPreview(beat)}
      >
        <img
          src={`${BASE}product/${beat.img}`}
          alt={`${beat.name} — stamped brick`}
          draggable={false}
          loading="lazy"
        />
        {free && <span className="work-free">FREE LEASE</span>}
        {playing && (
          <span className="work-live" aria-hidden="true">
            <i />
            {beat.bpm} BPM
          </span>
        )}
      </div>
      <figcaption className="work-caption">
        <span className="work-name">{beat.name}</span>
        <span className="work-strain">{beat.strain}</span>
        <span className="work-line">
          {beat.weightOz} OZ · ${beat.price} LEASE
        </span>
      </figcaption>
    </figure>
  );
}
