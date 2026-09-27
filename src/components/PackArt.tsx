// The product inside the bag — drawn per pack type:
// pressed white brick, light-tan pressed brick (embossed stamp), dub sack of flower.
import type { Beat } from "../data/beats";
import { mulberry32ish } from "../audio/rng";

export type PackKind = "white" | "tan" | "sack";

export function PackArt({ beat, kind }: { beat: Beat; kind: PackKind }) {
  if (kind === "sack") return <SackArt seed={beat.synthSeed} weight={beat.weightOz} />;
  return <BrickArt seed={beat.synthSeed} tone={kind} weight={beat.weightOz} bpm={beat.bpm} />;
}

// ── pressed brick, vacuum sealed ────────────────────────────────────────────
function BrickArt({ seed, tone, weight, bpm }: { seed: number; tone: "white" | "tan"; weight: string; bpm: number }) {
  const rng = mulberry32ish(seed);
  const white = tone === "white";
  const slabTop = white ? "#f7f4ec" : "#d6ad74";
  const slabBot = white ? "#e0d9c8" : "#b1854a";
  const grain = white ? "#b9b1a0" : "#8a6338";
  const stampInk = white ? "#c4bca8" : "#96622c";

  // pressed grain
  const specks = Array.from({ length: 42 }, () => ({
    x: 26 + rng() * 148,
    y: 76 + rng() * 48,
    r: 0.4 + rng() * 1.1,
    o: 0.15 + rng() * 0.3,
  }));
  // vacuum stretch lines
  const lines = [0, 1, 2].map((i) => ({ x: 10 + i * 4, o: 0.1 + i * 0.05 }));
  // air pocket bubbles at the seal edge
  const bubbles = [0, 1, 2].map(() => ({ x: 24 + rng() * 152, y: 66 + rng() * 8, r: 1 + rng() * 2.4 }));

  return (
    <svg viewBox="0 0 200 200" className={white ? "art brick-white" : "art brick-tan"} role="img" aria-label={`Pressed ${tone} brick`}>
      <defs>
        <linearGradient id={`slab-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={slabTop} />
          <stop offset="100%" stopColor={slabBot} />
        </linearGradient>
        <radialGradient id={`slabglow-${seed}`} cx="35%" cy="20%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* slab shadow on the bag */}
      <ellipse cx="100" cy="138" rx="86" ry="9" fill="#000" opacity="0.45" />
      {/* the pressed slab */}
      <rect x="18" y="72" width="164" height="58" rx="7" fill={`url(#slab-${seed})`} />
      <rect x="18" y="72" width="164" height="58" rx="7" fill={`url(#slabglow-${seed})`} />
      {/* pressed grain */}
      {specks.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={grain} opacity={s.o} />
      ))}
      {/* pressed seams */}
      <line x1="18" y1="91" x2="182" y2="91" stroke={grain} strokeWidth="0.6" opacity="0.22" />
      <line x1="18" y1="111" x2="182" y2="111" stroke={grain} strokeWidth="0.6" opacity="0.16" />

      {/* embossed center stamp */}
      <g transform="translate(100 101)" textAnchor="middle">
        <circle r="21" fill="none" stroke={stampInk} strokeWidth="1.6" opacity="0.85" />
        <circle r="23.5" fill="none" stroke={stampInk} strokeWidth="0.7" opacity="0.5" />
        {/* emboss: dark copy up-left, light copy down-right */}
        <text y="-3" fontFamily="Anton, sans-serif" fontSize="11" letterSpacing="1.5" fill={grain} opacity="0.5" transform="translate(-0.7 -0.7)">MOB</text>
        <text y="-3" fontFamily="Anton, sans-serif" fontSize="11" letterSpacing="1.5" fill={stampInk}>MOB</text>
        <text y="-3" fontFamily="Anton, sans-serif" fontSize="11" letterSpacing="1.5" fill="#ffffff" opacity="0.3" transform="translate(0.7 0.7)">MOB</text>
        <text y="9" fontFamily="'JetBrains Mono', monospace" fontSize="5.4" letterSpacing="1.6" fill={stampInk} opacity="0.9">PURE PRESS</text>
      </g>

      {/* printed weight corner */}
      <text x="172" y="124" textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="6.5" letterSpacing="1" fill={white ? "#a89f8a" : "#7c5426"} opacity="0.95">
        {weight} OZ · {bpm}
      </text>

      {/* vacuum-seal stretch lines */}
      {lines.map((l, i) => (
        <line key={i} x1={l.x} y1="66" x2={l.x + 26} y2="136" stroke="#fff" strokeWidth={i === 0 ? 1 : 0.7} opacity={l.o} />
      ))}
      {bubbles.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.22" />
      ))}
      {/* taut plastic pinches at slab corners */}
      <path d="M18 78 Q 10 74 6 66" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.25" />
      <path d="M182 78 Q 190 74 194 66" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.25" />
      <path d="M18 124 Q 10 128 6 136" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.2" />
      <path d="M182 124 Q 190 128 194 136" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.2" />
    </svg>
  );
}

// ── dub sack: sandwich bag of flower ───────────────────────────────────────
function SackArt({ seed, weight }: { seed: number; weight: string }) {
  const rng = mulberry32ish(seed);
  const greens = ["#3f6d33", "#567f3a", "#6f9a4c", "#2e5527"];
  // bud clusters: each is a blob of leaf curls + pistils + crystals
  const buds = Array.from({ length: 9 }, () => {
    const cx = 34 + rng() * 132;
    const cy = 66 + rng() * 88;
    const s = 9 + rng() * 9;
    const leaves = Array.from({ length: 5 }, () => ({
      x: (rng() - 0.5) * s * 1.6,
      y: (rng() - 0.5) * s * 1.3,
      rx: s * (0.55 + rng() * 0.4),
      ry: s * (0.4 + rng() * 0.35),
      rot: rng() * 180,
      g: greens[Math.floor(rng() * greens.length)],
    }));
    const pistils = Array.from({ length: 3 }, () => ({
      x1: (rng() - 0.5) * s * 1.5, y1: (rng() - 0.5) * s,
      x2: (rng() - 0.5) * s * 2, y2: (rng() - 0.5) * s * 1.6,
    }));
    const crystals = Array.from({ length: 4 }, () => ({
      x: (rng() - 0.5) * s * 1.7, y: (rng() - 0.5) * s * 1.4, r: 0.5 + rng() * 0.8,
    }));
    return { cx, cy, s, leaves, pistils, crystals };
  });

  return (
    <svg viewBox="0 0 200 200" className="art sack" role="img" aria-label="Sandwich bag of product">
      {/* the bag */}
      <rect x="20" y="30" width="160" height="146" rx="10" fill="#eaf2fb" opacity="0.045" />
      <rect x="20" y="30" width="160" height="146" rx="10" fill="none" stroke="#dfe9f4" strokeWidth="1.4" opacity="0.3" />
      {/* zip seal track */}
      <line x1="24" y1="44" x2="176" y2="44" stroke="#dfe9f4" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.4" />
      <line x1="24" y1="50" x2="176" y2="50" stroke="#dfe9f4" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.25" />
      <rect x="160" y="40" width="9" height="14" rx="2" fill="#dfe9f4" opacity="0.5" />

      {/* the flower */}
      {buds.map((b, i) => (
        <g key={i} transform={`translate(${b.cx} ${b.cy})`}>
          {b.leaves.map((l, j) => (
            <ellipse key={j} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} transform={`rotate(${l.rot} ${l.x} ${l.y})`} fill={l.g} stroke="#1d3a18" strokeWidth="0.8" />
          ))}
          {b.pistils.map((p, j) => (
            <line key={j} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#d78a3c" strokeWidth="0.9" opacity="0.85" strokeLinecap="round" />
          ))}
          {b.crystals.map((c, j) => (
            <circle key={j} cx={c.x} cy={c.y} r={c.r} fill="#f4f9ee" opacity="0.9" />
          ))}
        </g>
      ))}

      {/* bag glare */}
      <polygon points="34,176 84,30 104,30 54,176" fill="#ffffff" opacity="0.07" />
      {/* sharpie weight on the bag */}
      <text x="167" y="168" textAnchor="end" fontFamily="'Permanent Marker', cursive" fontSize="13" fill="#cfd9e4" opacity="0.9" transform="rotate(-2 167 168)">
        {weight}
      </text>
    </svg>
  );
}
