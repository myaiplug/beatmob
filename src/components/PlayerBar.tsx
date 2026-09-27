import { useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import type { Beat } from "../data/beats";
import { audio } from "../audio/engine";
import { Cover } from "./Cover";

export function PlayerBar({
  beat,
  playing,
  volume,
  onToggle,
  onPrev,
  onNext,
  onVolume,
}: {
  beat: Beat;
  playing: boolean;
  volume: number;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onVolume: (v: number) => void;
}) {
  const vizRef = useRef<HTMLCanvasElement>(null);

  // Live waveform bars from the shared analyser.
  useEffect(() => {
    const canvas = vizRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const bins = 24;
    const draw = () => {
      const analyser = audio.analyser;
      if (!analyser) return;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const bw = w / bins;
      for (let i = 0; i < bins; i++) {
        const v = data[Math.floor((i / bins) * data.length)] / 255;
        const bh = Math.max(2 * dpr, v * h);
        ctx.fillStyle = `rgba(159, 216, 255, ${0.35 + v * 0.65})`;
        ctx.fillRect(i * bw + bw * 0.22, h - bh, bw * 0.56, bh);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`player${playing || beat ? " on" : ""}`}>
      <div className="player-bar glass">
        <button className="player-cover" onClick={onToggle} aria-label="Toggle preview">
          <Cover beat={beat} />
        </button>
        <div className="player-info">
          <div className="player-name">{beat.name}</div>
          <div className="player-strain mono">
            {beat.strain} · {beat.bpm} BPM
          </div>
        </div>
        <div className="viz">
          <canvas ref={vizRef} aria-hidden="true" />
        </div>
        <div className="player-controls">
          <button className="icon-btn" onClick={onPrev} aria-label="Previous beat">
            <SkipBack />
          </button>
          <button className="icon-btn" onClick={onToggle} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause /> : <Play fill="currentColor" />}
          </button>
          <button className="icon-btn" onClick={onNext} aria-label="Next beat">
            <SkipForward />
          </button>
        </div>
        <div className="vol">
          <Volume2 size={13} aria-hidden="true" style={{ display: "inline", verticalAlign: "middle", marginRight: 4, opacity: 0.6 }} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolume(Number(e.target.value))}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
