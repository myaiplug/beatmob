// Procedural SVG cover per beat, keyed by its palette + seed. Swap for real
// art anytime: drop files in /public/covers/ and use the url instead.
import type { Beat } from "../data/beats";
import { mulberry32ish } from "../audio/rng";

export function Cover({ beat, className }: { beat: Beat; className?: string }) {
  const rng = mulberry32ish(beat.synthSeed);
  const [bg, accent, hi] = beat.palette;
  const rings = Array.from({ length: 3 }, (_, i) => 40 + i * 26 + rng() * 18);
  const rot = Math.floor(rng() * 90);
  const bars = Array.from({ length: 12 }, () => 0.2 + rng() * 0.8);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={`${beat.name} cover`}>
      <defs>
        <radialGradient id={`g-${beat.id}`} cx="30%" cy="25%">
          <stop offset="0%" stopColor={hi} stopOpacity="0.5" />
          <stop offset="100%" stopColor={bg} />
        </radialGradient>
        <linearGradient id={`l-${beat.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={bg} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#g-${beat.id})`} />
      <g transform={`rotate(${rot} 50 50)`} stroke={accent} fill="none" opacity="0.35">
        {rings.map((r, i) => (
          <circle key={i} cx="50" cy="50" r={r} strokeWidth={i === 1 ? 1.2 : 0.5} strokeDasharray={i === 2 ? "3 5" : undefined} />
        ))}
      </g>
      <g>
        {bars.map((h, i) => (
          <rect key={i} x={8 + i * 7} y={88 - h * 34} width="3.4" height={h * 34} rx="1.6" fill={`url(#l-${beat.id})`} opacity="0.85" />
        ))}
      </g>
      <text x="50" y="24" textAnchor="middle" fill={hi} fontSize="7.5" fontFamily="Anton, sans-serif" letterSpacing="2" opacity="0.92">
        {beat.name.toUpperCase()}
      </text>
      <text x="50" y="96" textAnchor="middle" fill={accent} fontSize="4.2" fontFamily="JetBrains Mono, monospace" letterSpacing="1.5" opacity="0.9">
        {beat.weightOz} OZ · {beat.bpm} BPM
      </text>
    </svg>
  );
}
