// ── AUDIO ENGINE ───────────────────────────────────────────────────────────
// Everything you hear is synthesized live with WebAudio: placeholder trap
// loops for each beat (seeded per beat) and every UI sound (blips, beeps,
// zips, pings, fanfare, frost shimmer, ambient pulse). Zero audio files.
// When real beats land (audioUrl in the catalog), the player streams the file
// through the same analyser/visualizer and the synth backs off.

import type { Beat } from "../data/beats";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const now = () => (audio.ctx ? audio.ctx.currentTime : 0);

type Noise = AudioBuffer;

class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  analyser: AnalyserNode | null = null;
  sfxBus: GainNode | null = null;
  ambientBus: GainNode = null as unknown as GainNode;
  private noiseCache: Noise | null = null;
  private beatTimer: ReturnType<typeof setInterval> | null = null;
  private beatStep = 0;
  private playingBeat: Beat | null = null;
  private mediaEl: HTMLAudioElement | null = null;

  ensure(): AudioContext {
    if (!this.ctx) {
      const AC: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.8;
      this.ambientBus = this.ctx.createGain();
      this.ambientBus.gain.value = 0.16;
      this.sfxBus.connect(this.analyser);
      this.ambientBus.connect(this.analyser);
      this.analyser.connect(this.master);
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  setVolume(v: number) {
    if (this.master) this.master.gain.value = v;
  }

  private noise(): Noise {
    const ctx = this.ensure();
    if (!this.noiseCache) {
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noiseCache = buf;
    }
    return this.noiseCache;
  }

  private env(gain: GainNode, t: number, peak: number, attack: number, decay: number) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  // ── UI SFX ────────────────────────────────────────────────────────────
  blip() {
    const ctx = this.ensure();
    const t = now();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(1760, t + 0.08);
    this.env(g, t, 0.12, 0.005, 0.12);
    o.connect(g).connect(this.sfxBus!);
    o.start(t);
    o.stop(t + 0.2);
  }

  scaleBeeps() {
    const ctx = this.ensure();
    const t = now();
    for (let i = 0; i < 4; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 1046 + i * 117;
      this.env(g, t + i * 0.11, 0.1, 0.004, 0.09);
      o.connect(g).connect(this.sfxBus!);
      o.start(t + i * 0.11);
      o.stop(t + i * 0.11 + 0.15);
    }
  }

  lockBeep() {
    const ctx = this.ensure();
    const t = now();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 1568;
    this.env(g, t, 0.14, 0.004, 0.35);
    o.connect(g).connect(this.sfxBus!);
    o.start(t);
    o.stop(t + 0.5);
  }

  zip() {
    const ctx = this.ensure();
    const t = now();
    const src = ctx.createBufferSource();
    src.buffer = this.noise();
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 6;
    f.frequency.setValueAtTime(600, t);
    f.frequency.exponentialRampToValueAtTime(4200, t + 0.28);
    const g = ctx.createGain();
    this.env(g, t, 0.16, 0.02, 0.3);
    src.connect(f).connect(g).connect(this.sfxBus!);
    src.start(t);
    src.stop(t + 0.4);
  }

  ping() {
    const ctx = this.ensure();
    const t = now();
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 1318; // E6 — phone message tone
    o2.type = "sine";
    o2.frequency.value = 1046;
    this.env(g, t, 0.1, 0.004, 0.25);
    o.connect(g);
    o2.connect(g);
    g.connect(this.sfxBus!);
    o.start(t);
    o2.start(t);
    o2.frequency.setValueAtTime(1318, t + 0.09);
    o.stop(t + 0.5);
    o2.stop(t + 0.5);
  }

  fanfare() {
    const ctx = this.ensure();
    const t = now();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      this.env(g, t + i * 0.07, 0.16, 0.01, 0.5);
      o.connect(g).connect(this.sfxBus!);
      o.start(t + i * 0.07);
      o.stop(t + i * 0.07 + 0.7);
    });
  }

  shimmer() {
    const ctx = this.ensure();
    const t = now();
    const src = ctx.createBufferSource();
    src.buffer = this.noise();
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.setValueAtTime(9000, t);
    f.frequency.exponentialRampToValueAtTime(500, t + 2.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.7);
    g.gain.linearRampToValueAtTime(0.0001, t + 2.8);
    src.connect(f).connect(g).connect(this.sfxBus!);
    src.start(t);
    src.stop(t + 3);
    // icy sparkle on top
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 2093;
    this.env(og, t + 0.5, 0.08, 0.02, 1.6);
    o.connect(og).connect(this.sfxBus!);
    o.start(t + 0.5);
    o.stop(t + 2.4);
  }

  // ── AMBIENT PULSE (rotates every ~9s) ─────────────────────────────────
  ambient() {
    const kind = Math.floor(Math.random() * 4);
    const ctx = this.ensure();
    const t = now();
    if (kind === 0) {
      // scanner static burst
      const src = ctx.createBufferSource();
      src.buffer = this.noise();
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = 2;
      f.frequency.setValueAtTime(700, t);
      f.frequency.linearRampToValueAtTime(1500, t + 0.9);
      const g = ctx.createGain();
      this.env(g, t, 0.5, 0.15, 0.8);
      src.connect(f).connect(g).connect(this.ambientBus);
      src.start(t);
      src.stop(t + 1.2);
    } else if (kind === 1) {
      // distant phone buzz
      for (let i = 0; i < 2; i++) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sawtooth";
        o.frequency.value = 140;
        this.env(g, t + i * 0.28, 0.35, 0.02, 0.16);
        o.connect(g).connect(this.ambientBus);
        o.start(t + i * 0.28);
        o.stop(t + i * 0.28 + 0.25);
      }
    } else if (kind === 2) {
      // scale beep, far away
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 830;
      this.env(g, t, 0.4, 0.01, 0.3);
      o.connect(g).connect(this.ambientBus);
      o.start(t);
      o.stop(t + 0.4);
    } else {
      // low rumble
      const src = ctx.createBufferSource();
      src.buffer = this.noise();
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 110;
      const g = ctx.createGain();
      this.env(g, t, 0.6, 0.6, 1.6);
      src.connect(f).connect(g).connect(this.ambientBus);
      src.start(t);
      src.stop(t + 2.4);
    }
  }

  setAmbientVolume(v: number) {
    if (this.ambientBus) this.ambientBus.gain.value = v;
  }

  // ── BEAT PREVIEW PLAYER ───────────────────────────────────────────────
  // Seeded step-sequencer: kick / clap / hats / 808 bass / pad, per beat.
  async play(beat: Beat): Promise<void> {
    this.stop();
    const ctx = this.ensure();
    this.playingBeat = beat;
    this.beatStep = 0;

    if (beat.tiers && false) return; // (files handled below when present)

    const rng = mulberry32(beat.synthSeed);
    const spb = 60 / beat.bpm / 4; // 16th-note duration
    const steps = 32; // 2 bars, loops

    // seeded patterns
    const kick: boolean[] = Array.from({ length: steps }, (_, i) =>
      i % 8 === 0 || (i % 8 === 6 && rng() > 0.3) || (i % 16 === 10 && rng() > 0.6),
    );
    const clap: boolean[] = Array.from({ length: steps }, (_, i) => i % 16 === 8);
    const hat: boolean[] = Array.from({ length: steps }, () => rng() > 0.28);
    const openHat = new Set([7, 23]);
    const bassNotes: number[] = Array.from({ length: steps }, (_, i) =>
      i % 8 === 0 || (i % 8 === 3 && rng() > 0.5) ? Math.floor(rng() * 3) : -1,
    );
    const roots = [beat.keyRoot / 4, (beat.keyRoot / 4) * 1.2, (beat.keyRoot / 4) * 1.5];
    const minorScale = [1, 9 / 8, 6 / 5, 4 / 3, 3 / 2, 8 / 5, 9 / 5];

    const scheduleStep = (step: number, t: number) => {
      const s = step % steps;
      if (kick[s]) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
        this.env(g, t, 0.85, 0.003, 0.28);
        o.connect(g).connect(this.analyser!);
        o.start(t);
        o.stop(t + 0.45);
      }
      if (clap[s]) {
        const src = ctx.createBufferSource();
        src.buffer = this.noise();
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 1800;
        f.Q.value = 1.2;
        const g = ctx.createGain();
        this.env(g, t, 0.4, 0.002, 0.14);
        src.connect(f).connect(g).connect(this.analyser!);
        src.start(t);
        src.stop(t + 0.25);
      }
      if (hat[s]) {
        const src = ctx.createBufferSource();
        src.buffer = this.noise();
        const f = ctx.createBiquadFilter();
        f.type = "highpass";
        f.frequency.value = openHat.has(s) ? 6000 : 8200;
        const g = ctx.createGain();
        this.env(g, t, openHat.has(s) ? 0.16 : 0.09, 0.001, openHat.has(s) ? 0.18 : 0.045);
        src.connect(f).connect(g).connect(this.analyser!);
        src.start(t);
        src.stop(t + 0.3);
      }
      if (bassNotes[s] >= 0) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = roots[bassNotes[s]];
        this.env(g, t, 0.5, 0.008, spb * 2.4);
        o.connect(g).connect(this.analyser!);
        o.start(t);
        o.stop(t + spb * 3);
      }
      // dark pad every bar
      if (s === 0 || s === 16) {
        [0, 2, 4].forEach((d) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sawtooth";
          o.frequency.value = beat.keyRoot * minorScale[d === 0 ? 0 : d === 2 ? 2 : 4];
          const f = ctx.createBiquadFilter();
          f.type = "lowpass";
          f.frequency.value = 900;
          this.env(g, t, 0.055, 0.4, spb * 14);
          o.connect(f).connect(g).connect(this.analyser!);
          o.start(t);
          o.stop(t + spb * 16);
        });
      }
    };

    const tick = () => {
      if (!this.ctx || !this.playingBeat) return;
      const lookahead = 0.18;
      while (now() + lookahead > this.beatStep * spb + (this.startAt ?? 0)) {
        const t = (this.startAt ?? 0) + this.beatStep * spb;
        scheduleStep(this.beatStep, Math.max(t, now() + 0.02));
        this.beatStep++;
      }
    };
    this.startAt = now() + 0.08;
    tick();
    this.beatTimer = setInterval(tick, 40);
  }

  private startAt: number | null = null;

  playFile(url: string) {
    this.stop();
    const ctx = this.ensure();
    const el = new Audio(url);
    el.loop = true;
    el.crossOrigin = "anonymous";
    const src = ctx.createMediaElementSource(el);
    src.connect(this.analyser!);
    el.play().catch(() => {});
    this.mediaEl = el;
  }

  stop() {
    if (this.beatTimer) clearInterval(this.beatTimer);
    this.beatTimer = null;
    this.playingBeat = null;
    this.startAt = null;
    if (this.mediaEl) {
      this.mediaEl.pause();
      this.mediaEl.src = "";
      this.mediaEl = null;
    }
  }

  sfx() {} // placeholder, replaced by bind below
}

// `this.sfx = this.sfx.bind(this)` inside ensure() keeps TS happy; no-op.
export const audio = new AudioEngine();
