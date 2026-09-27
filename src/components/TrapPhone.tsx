import { useState } from "react";
import { X, Play, Send, Sparkles } from "lucide-react";
import type { Beat } from "../data/beats";
import { BEATS, keyCompat } from "../data/beats";
import { Cover } from "./Cover";

export type CartEntry = { beat: Beat; tierIndex: number; free: boolean };

export function TrapPhone({
  open,
  entries,
  unread,
  onOpen,
  onClose,
  onRemove,
  onPreview,
  onPromo,
  onSendWire,
  total,
  originalTotal,
  discountLabel,
}: {
  open: boolean;
  entries: CartEntry[];
  unread: number;
  onOpen: () => void;
  onClose: () => void;
  onRemove: (id: string) => void;
  onPreview: (b: Beat) => void;
  onPromo: (code: string) => void;
  onSendWire: () => void;
  total: number;
  originalTotal: number;
  discountLabel: string | null;
}) {
  const [thread, setThread] = useState<string | null>(null);
  const [promo, setPromo] = useState("");

  const active = entries.find((e) => e.beat.id === thread) ?? null;

  return (
    <>
      <button className="dock-btn" onClick={onOpen} aria-label={`Open the phone (${entries.length} in cart)`}>
        <Send size={20} />
        {unread > 0 && <span className="badge">{unread}</span>}
      </button>

      <div className={`phone${open ? " on" : ""}`} role="dialog" aria-label="The plug's phone">
        <div className="phone-screen">
          <svg className="crack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M12 0 L22 18 L14 34 L28 52 L20 72 L32 100" stroke="rgba(255,255,255,0.18)" strokeWidth="0.3" fill="none" />
            <path d="M22 18 L40 26" stroke="rgba(255,255,255,0.14)" strokeWidth="0.25" fill="none" />
            <path d="M78 100 L70 78 L82 60 L72 40" stroke="rgba(255,255,255,0.15)" strokeWidth="0.28" fill="none" />
          </svg>
          <div className="phone-notch">
            <span>9:17</span>
            <span className="low">▮ 4% battery · no service</span>
          </div>

          {active ? (
            <>
              <div className="phone-notch" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.4rem" }}>
                <button onClick={() => setThread(null)} aria-label="Back to inbox" style={{ color: "var(--ice)" }}>
                  ← inbox
                </button>
                <span>{active.beat.name}</span>
              </div>
              <div className="chat">
                <div className="bubble them">
                  {active.beat.summary}
                  <br />
                  <button className="inline-play" onClick={() => onPreview(active.beat)}>
                    <Play size={11} /> run the preview
                  </button>
                </div>
                <div className="bubble me">
                  {active.free ? "plug says this one's on him — free lease" : `cop it — ${active.beat.tiers[active.tierIndex].name} lease`}
                </div>
                {active.free && (
                  <div className="bubble them">
                    on the house. ICECOLD certified. credit rules apply, they're in the paperwork.
                  </div>
                )}
              </div>
              <div className="replies">
                <button className="reply" onClick={() => onPreview(active.beat)}>run it back</button>
                <button className="reply" onClick={() => onRemove(active.beat.id)}>drop it</button>
                <button
                  className="reply"
                  onClick={() => {
                    const pool = BEATS.filter((b) => !entries.some((e) => e.beat.id === b.id));
                    const next = pool.sort((a, b) => keyCompat(active.beat, b) - keyCompat(active.beat, a))[0];
                    if (next) onPreview(next);
                  }}
                >
                  next one
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="phone-notch" style={{ color: "var(--faint)", justifyContent: "center" }}>
                ✉ inbox — the plug
              </div>
              <div className="inbox">
                {entries.length === 0 && (
                  <p style={{ padding: "1.4rem 0.9rem", color: "var(--faint)", fontSize: "0.75rem", textAlign: "center" }}>
                    no messages. bag a pack and it lands here.
                  </p>
                )}
                {entries.map((e) => (
                  <button key={e.beat.id} className="thread" onClick={() => setThread(e.beat.id)}>
                    <span className="thread-pic">
                      <Cover beat={e.beat} />
                    </span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span className="thread-name">
                        {e.beat.name}
                        {e.free && <span className="thread-free">FREE</span>}
                      </span>
                      <span className="thread-sub">
                        {e.beat.weightOz} oz · {e.beat.strain}
                      </span>
                    </span>
                    <span className="tier-price mono" style={{ fontSize: "0.75rem" }}>
                      {e.free ? "$0" : `$${e.beat.tiers[e.tierIndex].price}`}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="phone-total">
            <span>
              {discountLabel && <span className="strike">${originalTotal}</span>}${total}
              {discountLabel && <span style={{ color: "var(--ok)", marginLeft: "0.5rem" }}>{discountLabel}</span>}
            </span>
            <span style={{ color: "var(--faint)", fontSize: "0.66rem" }}>
              {entries.length} PACK{entries.length === 1 ? "" : "S"} · {discountLabel ?? "bulk deals at 2/3/5"}
            </span>
          </div>
          <div className="phone-footer">
            <input
              className="promo-input"
              placeholder="promo code…"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && promo.trim()) {
                  onPromo(promo.trim());
                  setPromo("");
                }
              }}
              aria-label="Promo code"
            />
            <button className="btn btn-solid send-wire" onClick={onSendWire} disabled={entries.length === 0}>
              <Send size={13} /> send the wire
            </button>
          </div>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close phone"
            style={{ position: "absolute", top: "0.4rem", right: "0.4rem", zIndex: 6 }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

// hint chip under the hero (subtle ICECOLD teaser)
export function PromoHint() {
  return (
    <p className="hero-fine" style={{ marginTop: "0.6rem", display: "flex", gap: "0.4rem", alignItems: "center", justifyContent: "center" }}>
      <Sparkles size={12} aria-hidden="true" /> psst — there's a word that makes everything freeze. it's not subtle.
    </p>
  );
}
