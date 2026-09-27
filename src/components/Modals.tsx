import { useState } from "react";
import { PartyPopper, Snowflake } from "lucide-react";
import type { Beat } from "../data/beats";
import { BEATS } from "../data/beats";
import { Cover } from "./Cover";

export const RULES = [
  "credit required in the title: Prod. TheBeatMob",
  "if released through a distributor, producer credit: Brian Jutz — thebeatmobb@gmail.com",
  "standard non-exclusive lease terms (streams capped at the tier limit)",
  "one free lease per person",
];

// ── Lucky user (confetti handled by App via canvas-confetti) ────────────────
export function LuckyModal({ onPick }: { onPick: (b: Beat) => void }) {
  const [picked, setPicked] = useState(false);
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Lucky user">
      <div className="modal glass">
        <PartyPopper size={34} color="var(--ice)" aria-hidden="true" />
        <h2 className="modal-title" style={{ marginTop: "0.8rem" }}>
          You're this month's<br />lucky user.
        </h2>
        <p style={{ color: "var(--muted)", marginTop: "0.8rem", fontSize: "0.85rem" }}>
          One beat lease, on the house. Pick your pack:
        </p>
        <div className="pick-grid">
          {BEATS.map((b) => (
            <button
              key={b.id}
              className="thread"
              style={{ flexDirection: "column", border: "1px solid var(--border)", borderRadius: 10 }}
              onClick={() => {
                setPicked(true);
                onPick(b);
              }}
            >
              <span style={{ width: "100%", aspectRatio: "1", borderRadius: 8, overflow: "hidden" }}>
                <Cover beat={b} />
              </span>
              <span style={{ fontSize: "0.7rem", width: "100%" }}>{b.name}</span>
            </button>
          ))}
        </div>
        {picked && <p style={{ color: "var(--ok)", fontSize: "0.8rem", marginTop: "0.9rem" }}>sent to your phone — it's in the inbox.</p>}
        <p className="modal-fine">
          The fine print: this is real, not a scam, no hidden anything, no strings. The prize is one free beat lease, chosen
          from the stash above. Rules apply (credit + lease terms shown in the phone).
        </p>
      </div>
    </div>
  );
}

// ── ICECOLD frozen modal ────────────────────────────────────────────────────
export function FrostModal({ onPick }: { onPick: (b: Beat) => void }) {
  const [picked, setPicked] = useState<Beat | null>(null);
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Icecold certified">
      <div className="modal glass frost-modal">
        <Snowflake size={38} color="var(--ice-hot)" aria-hidden="true" />
        <p className="eyebrow" style={{ marginTop: "0.7rem" }}>product frozen · freezer sealed</p>
        <h2 className="modal-title" style={{ marginTop: "0.4rem" }}>
          The product is<br />Icecold Certified.
        </h2>
        <p style={{ color: "var(--muted)", marginTop: "0.8rem", fontSize: "0.85rem" }}>
          The freezer opens once: <strong style={{ color: "var(--ice-hot)" }}>one instrumental, any pack, completely free.</strong>
        </p>
        <div className="pick-grid">
          {BEATS.map((b) => (
            <button
              key={b.id}
              className="thread"
              style={{
                flexDirection: "column",
                border: picked?.id === b.id ? "1px solid var(--ice)" : "1px solid var(--border)",
                borderRadius: 10,
              }}
              onClick={() => {
                setPicked(b);
                onPick(b);
              }}
            >
              <span style={{ width: "100%", aspectRatio: "1", borderRadius: 8, overflow: "hidden" }}>
                <Cover beat={b} />
              </span>
              <span style={{ fontSize: "0.7rem", width: "100%" }}>{b.name}</span>
            </button>
          ))}
        </div>
        {picked && (
          <p style={{ color: "var(--ok)", fontSize: "0.8rem", marginTop: "0.9rem" }}>
            {picked.name} is bagged and free. It's in the phone's inbox.
          </p>
        )}
        <ol className="rules" style={{ listStyle: "decimal", paddingLeft: "1.1rem" }}>
          {RULES.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ol>
        <p className="modal-fine">The frost thaws on its own. Enjoy the cold while it lasts.</p>
      </div>
    </div>
  );
}

// ── Checkout ("send the wire") ─────────────────────────────────────────────
export function WireModal({ total, count, onClose }: { total: number; count: number; onClose: () => void }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Send the wire">
      <div className="modal glass">
        <p className="eyebrow">the wire</p>
        <h2 className="modal-title" style={{ marginTop: "0.5rem" }}>
          {count} pack{count === 1 ? "" : "s"} · ${total}
        </h2>
        <p style={{ color: "var(--muted)", marginTop: "0.9rem", fontSize: "0.85rem", lineHeight: 1.6 }}>
          Payment connects here when the store opens for real (Stripe or CashApp — your call). For now, reach the plug
          directly and he'll square the wire:
        </p>
        <p className="mono" style={{ marginTop: "0.7rem", color: "var(--ice-hot)" }}>
          thebeatmobb@gmail.com
        </p>
        <ol className="rules" style={{ listStyle: "decimal", paddingLeft: "1.1rem" }}>
          {RULES.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ol>
        <button className="btn btn-solid" style={{ marginTop: "1.3rem" }} onClick={onClose}>
          back to the stash
        </button>
      </div>
    </div>
  );
}
