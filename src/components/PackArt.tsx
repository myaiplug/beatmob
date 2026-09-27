// The product inside the bag — real product photography per pack type,
// with a subtle per-pack tint/rotation so repeats don't look identical.
import type { Beat } from "../data/beats";
import { mulberry32ish } from "../audio/rng";

export type PackKind = "white" | "tan" | "sack";

// import.meta.env.BASE_URL respects the GitHub Pages "/beatmob/" subpath —
// a hardcoded absolute path would 404 there.
const SRC: Record<PackKind, string> = {
  white: `${import.meta.env.BASE_URL}product/brick-white.png`,
  tan: `${import.meta.env.BASE_URL}product/brick-tan.png`,
  sack: `${import.meta.env.BASE_URL}product/dub-sack.png`,
};

export function PackArt({ beat, kind }: { beat: Beat; kind: PackKind }) {
  const rng = mulberry32ish(beat.synthSeed);
  const rot = (rng() - 0.5) * 5;
  const scale = 1.1 + rng() * 0.14;
  const posX = 38 + rng() * 24;
  const posY = 38 + rng() * 24;
  return (
    <div
      className="art-photo"
      role="img"
      aria-label={kind === "sack" ? "Bag of product" : `Pressed brick, ${kind}`}
      style={{
        backgroundImage: `url(${SRC[kind]})`,
        backgroundPosition: `${posX}% ${posY}%`,
        // single combined "transform" — this engine doesn't compose the
        // separate translate/rotate/scale CSS properties reliably.
        transform: `rotate(${rot}deg) scale(${scale})`,
      }}
    />
  );
}
