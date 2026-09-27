#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# THE BEATMOB · preview prep pipeline
#
# Bulk-processes a folder of finished beats into web-ready previews:
#   1. trims to PREVIEW_LEN seconds (default 60)
#   2. runs a mastering pass (EQ → compression → loudnorm → limiter)
#   3. lays producer tags intermittently — intro, verse start, a
#      telephone-FX tag mid-verse, and a wet tag on the first chorus —
#      each one mixed WITH the beat (ducked, effects, never flat and loud)
#   4. encodes small mp3s for the store
#   5. emits a beats-manifest.json the store's catalog can import
#
# Usage:
#   ./prep-beats.sh <beats_dir> <tag.wav> [out_dir]
#
# Env overrides:
#   TAG_TIMES    comma list of tag start times (default "0,16,32,45")
#   TAG_STYLE    order of FX variants (default "intro,verse,phone,chorus")
#   PREVIEW_LEN  seconds (default 60)
#   MP3_KBPS     preview bitrate (default 128 — small + protected-enough)
#
# Requires: ffmpeg 4+, bash. Your tag file should be ONE dry spoken drop
# ("TheBeatMob on the beat" or similar), mono or stereo, a few seconds.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BEATS_DIR="${1:?usage: prep-beats.sh <beats_dir> <tag.wav> [out_dir]}"
TAG_FILE="${2:?usage: prep-beats.sh <beats_dir> <tag.wav> [out_dir]}"
OUT_DIR="${3:-./previews}"
TAG_TIMES="${TAG_TIMES:-0,16,32,45}"
PREVIEW_LEN="${PREVIEW_LEN:-60}"
MP3_KBPS="${MP3_KBPS:-128}"

mkdir -p "$OUT_DIR"
MANIFEST="$OUT_DIR/beats-manifest.json"
echo '{"beats": [' > "$MANIFEST"
FIRST=1

# FX variants — every tag sits IN the mix, ducked under, never slapped on top.
intro_fx='highpass=f=90, aecho=0.4:0.35:70:0.18, volume=0.9'                                   # clean-ish, small room
verse_fx='aecho=0.6:0.5:110:0.28, volume=0.9'                                                  # wet, slaps with the beat
phone_fx='highpass=f=300, lowpass=f=3400, aecho=0.5:0.4:55:0.22, acompressor=threshold=-19dB:ratio=4:makeup=4dB, volume=1.1'  # telephone mid-verse
chorus_fx='aecho=0.7:0.6:150|210:0.3|0.24, volume=1.0'                                         # wide, rides the chorus

# master chain: clean low end, gentle glue comp, streaming loudness, safety ceiling
MASTER='highpass=f=28, equalizer=f=60:t=q:w=1.0:g=2, equalizer=f=8000:t=q:w=0.7:g=1.5, acompressor=threshold=-18dB:ratio=2.5:attack=8:release=180:makeup=2dB, loudnorm=I=-14:TP=-1.2:LRA=9, alimiter=limit=0.95'

IFS=',' read -r -a TIMES <<< "$TAG_TIMES"
STYLES=("intro" "verse" "phone" "chorus")

shopt -s nullglob globstar
for f in "$BEATS_DIR"/*.{wav,mp3,aiff,flac,m4a}; do
  [ -e "$f" ] || continue
  base="$(basename "$f")"
  name="${base%.*}"
  out="$OUT_DIR/$name.mp3"
  echo "▸ processing: $base → $(basename "$out")"

  # Build the filtergraph: [0] mastered beat, [1] tag split into variants at times.
  FILTER="[0:a]atrim=0:${PREVIEW_LEN},${MASTER}[m];"
  MIX=""
  N=${#TIMES[@]}
  for i in "${!TIMES[@]}"; do
    t="${TIMES[$i]}"
    style="${STYLES[$(( i % 4 ))]}"
    case "$style" in
      intro)  fx="$intro_fx" ;;
      verse)  fx="$verse_fx" ;;
      phone)  fx="$phone_fx" ;;
      *)      fx="$chorus_fx" ;;
    esac
    ms=$(( t * 1000 ))
    FILTER+="[1:a]asplit=1[t$i];[t$i]${fx},adelay=${ms}|${ms},apad=pad_dur=1[a$i];"
    MIX+="[a$i]"
  done

  # duck the mastered beat under the summed tags (tag is the sidechain)
  FILTER+="${MIX}amix=inputs=${N}:normalize=0[tags];"
  FILTER+="[m][tags]sidechaincompress=threshold=0.04:ratio=9:attack=4:release=220[mduck];"
  FILTER+="[mduck][tags]amix=inputs=2:normalize=0,alimiter=limit=0.96[out]"

  ffmpeg -hide_banner -loglevel error -y \
    -i "$f" -i "$TAG_FILE" \
    -filter_complex "$FILTER" \
    -map "[out]" -t "$PREVIEW_LEN" \
    -codec:a libmp3lame -b:a "${MP3_KBPS}k" "$out"

  # manifest entry (name without extension — drop into the catalog)
  [ $FIRST -eq 0 ] && echo "," >> "$MANIFEST"
  FIRST=0
  printf '    {"id": "%s", "name": "%s", "audioUrl": "/beatmob/beats/%s.mp3"}' \
    "$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')" \
    "$name" "$name" >> "$MANIFEST"
done

echo "" >> "$MANIFEST"
echo "]}" >> "$MANIFEST"
echo ""
echo "✔ done — previews in $OUT_DIR, manifest at $MANIFEST"
echo "  copy previews into the site's public/beats/ and paste the manifest"
echo "  entries into src/data/beats.ts (audioUrl per beat)."
