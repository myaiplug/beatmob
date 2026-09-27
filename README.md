# THE BEATMOB STORE

Beat/instrumental lease storefront for Brian Jutz (Prod.TheBeatMob).
All product is musical. 100% beat.

## Features
- Reactive media-player interface with procedurally synthesized placeholder
  beats (swap in real previews via `audioUrl` in the catalog)
- Drag-to-scale: dragging a pack opens the digital scale, weigh + bag it
- The trap phone: cart as a text inbox — threads, plug summaries, inline
  previews, quick replies, promo entry, "send the wire" checkout
- Bulk ladder: 2 packs 15% / 3-4 25% / 5+ 40%
- Lucky user: 1-in-8 roll on bag-up → confetti + honest prize modal
- ICECOLD: promo code freezes the whole site and grants one free lease
- Ambient room sound every ~9s (toggleable), all synthesized
- Fully responsive; respects reduced motion

## Run
    npm install
    npm run dev

## Deploy
Push to `main` — GitHub Actions builds and publishes to Pages
(https://myaiplug.github.io/beatmob/).

## Real beats
See `scripts/beat-prep/README.md` — an ffmpeg pipeline trims, masters and
bakes producer tags into 60s previews, then drop the mp3s into `public/beats/`
and give each catalog entry its `audioUrl`.
