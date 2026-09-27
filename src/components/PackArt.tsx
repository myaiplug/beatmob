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
  const rot = (rng() - 0.5) * 6;
  const scale = 1.04 + rng() * 0.1;
  const posX = 40 + rng() * 20;
  const posY = 40 + rng() * 20;
  return (
    <div className="art-photo" aria-label={`${kind === "sack" ? "Bag of product" : "Pressed brick, " + kind}`} role="img">
      <img
        src={SRC[kind]}
        alt=""
        draggable={false}
        style={{
          transform: `rotate(${rot}deg) scale(${scale})`,
          objectPosition: `${posX}% ${posY}%`,
        }}
      />
    </div>
  );
}
