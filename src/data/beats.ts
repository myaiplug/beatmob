// ── THE BEATMOB CATALOG ────────────────────────────────────────────────────
// Placeholder beats: every sound + cover is synthesized in the browser from
// this data. To go REAL: add mp3 previews to /public/beats/ and give each beat
// an `audioUrl` — the player uses the file when present, the synth otherwise.
// (See README / scripts/beat-prep for the ffmpeg pipeline that trims, masters
// and tags your previews before they land here.)

export type LeaseTier = { name: string; price: number; note: string };

export type Beat = {
  id: string;
  name: string;
  strain: string; // key · vibe, shown as the "strain"
  keyRoot: number; // Hz of the tonic (bass derives from this)
  minor: boolean;
  bpm: number;
  weightOz: string; // BPM/100, displayed as oz on the scale
  price: number; // Single
  tiers: LeaseTier[];
  summary: string; // the plug's text about it
  palette: [string, string, string]; // cover + accent colors
  synthSeed: number;
  /** One-of-one product shot (public/product/<file>) — stamped brick art. */
  img: string;
  /** Real preview file (from /beats/...) — when set, the player uses it. */
  audioUrl?: string;
};

export const BEATS: Beat[] = [
  {
    id: "frostbite",
    name: "Frostbite",
    strain: "F minor · dark trap",
    keyRoot: 174.6,
    minor: true,
    bpm: 140,
    weightOz: "1.40",
    price: 30,
    tiers: [
      { name: "Single", price: 30, note: "mp3 lease, non-exclusive" },
      { name: "Half Zip", price: 60, note: "wav + trackout stem" },
      { name: "Exclusive", price: 250, note: "full rights, off the shelf" },
    ],
    summary:
      "coldest one in the stash. slow-creep bells, 808s hit like a deep freeze. made for late nights — prod. TheBeatMob",
    palette: ["#0e1a26", "#9fd8ff", "#dff2ff"],
    synthSeed: 101,
    img: "frostbite.png"
  },
  {
    id: "late-night",
    name: "Late Night",
    strain: "G minor · smoky drill",
    keyRoot: 196.0,
    minor: true,
    bpm: 142,
    weightOz: "1.42",
    price: 30,
    tiers: [
      { name: "Single", price: 30, note: "mp3 lease, non-exclusive" },
      { name: "Half Zip", price: 60, note: "wav + trackout stem" },
      { name: "Exclusive", price: 250, note: "full rights, off the shelf" },
    ],
    summary:
      "smoke-room drill. sliding 808s, muted keys, tempo leans back. for the 3am writes — prod. TheBeatMob",
    palette: ["#1a1220", "#c9a7ff", "#efe3ff"],
    synthSeed: 202,
    img: "late-night.png"
  },
  {
    id: "snowbird",
    name: "Snowbird",
    strain: "D minor · ambient trap",
    keyRoot: 146.8,
    minor: true,
    bpm: 136,
    weightOz: "1.36",
    price: 25,
    tiers: [
      { name: "Single", price: 25, note: "mp3 lease, non-exclusive" },
      { name: "Half Zip", price: 50, note: "wav + trackout stem" },
      { name: "Exclusive", price: 200, note: "full rights, off the shelf" },
    ],
    summary:
      "floaty one. airy pads, soft snares, 808s whisper. cruising music — prod. TheBeatMob",
    palette: ["#101820", "#8fe3c9", "#e2fff5"],
    synthSeed: 303,
    img: "snowbird.png"
  },
  {
    id: "brick-talk",
    name: "Brick Talk",
    strain: "A minor · gritty street",
    keyRoot: 220.0,
    minor: true,
    bpm: 145,
    weightOz: "1.45",
    price: 30,
    tiers: [
      { name: "Single", price: 30, note: "mp3 lease, non-exclusive" },
      { name: "Half Zip", price: 60, note: "wav + trackout stem" },
      { name: "Exclusive", price: 250, note: "full rights, off the shelf" },
    ],
    summary:
      "corner-store energy. knocking drums, stabby bass, no fluff. rappity-rap pack — prod. TheBeatMob",
    palette: ["#241408", "#ffb36b", "#ffe8cf"],
    synthSeed: 404,
    img: "brick-talk.png"
  },
  {
    id: "cold-front",
    name: "Cold Front",
    strain: "C minor · cinematic trap",
    keyRoot: 130.8,
    minor: true,
    bpm: 138,
    weightOz: "1.38",
    price: 35,
    tiers: [
      { name: "Single", price: 35, note: "mp3 lease, non-exclusive" },
      { name: "Half Zip", price: 70, note: "wav + trackout stem" },
      { name: "Exclusive", price: 300, note: "full rights, off the shelf" },
    ],
    summary:
      "big screen trap. strings sweep in, 808s roll under. intro-music energy — prod. TheBeatMob",
    palette: ["#0a1424", "#7fb2ff", "#d6e6ff"],
    synthSeed: 505,
    img: "cold-front.png"
  },
  {
    id: "trap-phone",
    name: "Trap Phone",
    strain: "E minor · piano menace",
    keyRoot: 164.8,
    minor: true,
    bpm: 148,
    weightOz: "1.48",
    price: 30,
    tiers: [
      { name: "Single", price: 30, note: "mp3 lease, non-exclusive" },
      { name: "Half Zip", price: 60, note: "wav + trackout stem" },
      { name: "Exclusive", price: 250, note: "full rights, off the shelf" },
    ],
    summary:
      "menacing piano loop over hard knocking drums. one you can chase the whole city to — prod. TheBeatMob",
    palette: ["#14141c", "#ff9f9f", "#ffe0e0"],
    synthSeed: 606,
    img: "trap-phone.png"
  },
];

/** Rough compatibility score used by the phone's "next one" suggestion. */
export function keyCompat(a: Beat, b: Beat): number {
  const root = Math.abs(a.keyRoot - b.keyRoot);
  const bpmDelta = Math.abs(a.bpm - b.bpm);
  const keyScore = root === 0 ? 3 : root <= 12 ? 2 : root <= 25 ? 1 : 0;
  return keyScore * 2 + (bpmDelta <= 4 ? 2 : bpmDelta <= 8 ? 1 : 0);
}
