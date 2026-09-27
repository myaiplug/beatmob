import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Volume2, VolumeX } from "lucide-react";
import type { Beat } from "./data/beats";
import { BEATS } from "./data/beats";
import { audio } from "./audio/engine";
import { Hero } from "./components/Hero";
import { Stash } from "./components/Stash";
import { PlayerBar } from "./components/PlayerBar";
import { Scale } from "./components/Scale";
import { TrapPhone, type CartEntry } from "./components/TrapPhone";
import { LuckyModal, FrostModal, WireModal } from "./components/Modals";

const CART_KEY = "beatmob-cart-v1";
const ICECOLD = /^(ice\s?cold|icecold)$/i;

function bulkDiscount(n: number): { pct: number; label: string } | null {
  if (n >= 5) return { pct: 0.4, label: "40% BULK" };
  if (n >= 3) return { pct: 0.25, label: "25% BULK" };
  if (n >= 2) return { pct: 0.15, label: "15% BULK" };
  return null;
}

export default function App() {
  // ── state ──
  const [entries, setEntries] = useState<CartEntry[]>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const saved = raw ? (JSON.parse(raw) as { id: string; tierIndex: number; free: boolean }[]) : [];
      return saved
        .map((s) => {
          const beat = BEATS.find((b) => b.id === s.id);
          return beat ? { beat, tierIndex: s.tierIndex ?? 0, free: !!s.free } : null;
        })
        .filter((e): e is CartEntry => e !== null);
    } catch {
      return [];
    }
  });
  const [unread, setUnread] = useState(0);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [scaleBeat, setScaleBeat] = useState<Beat | null>(null);
  const [current, setCurrent] = useState<Beat | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [ambient, setAmbient] = useState(true);
  const [lucky, setLucky] = useState(false);
  const [frost, setFrost] = useState(false);
  const [wire, setWire] = useState(false);
  const freeIds = useMemo(() => new Set(entries.filter((e) => e.free).map((e) => e.beat.id)), [entries]);
  const luckyRef = useRef(false);

  // persist cart
  useEffect(() => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(entries.map((e) => ({ id: e.beat.id, tierIndex: e.tierIndex, free: e.free }))),
    );
  }, [entries]);

  // ambient pulse every ~9s
  useEffect(() => {
    if (!ambient) return;
    const id = setInterval(() => audio.ambient(), 9000);
    return () => clearInterval(id);
  }, [ambient]);

  // keyboard: space / arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (current) toggle();
      } else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // frost thaw
  useEffect(() => {
    if (!frost) return;
    document.body.classList.add("frost");
    const id = setTimeout(() => setFrost(false), 12000);
    return () => {
      clearTimeout(id);
      document.body.classList.remove("frost");
    };
  }, [frost]);

  // ── player ──
  const playBeat = useCallback((b: Beat) => {
    setCurrent(b);
    setPlaying(true);
    void audio.play(b);
  }, []);

  const toggle = () => {
    if (!current) return;
    if (playing) {
      audio.stop();
      setPlaying(false);
    } else {
      setPlaying(true);
      void audio.play(current);
    }
  };
  const next = () => {
    const i = current ? BEATS.findIndex((b) => b.id === current.id) : -1;
    playBeat(BEATS[(i + 1) % BEATS.length]);
  };
  const prev = () => {
    const i = current ? BEATS.findIndex((b) => b.id === current.id) : 0;
    playBeat(BEATS[(i - 1 + BEATS.length) % BEATS.length]);
  };

  // ── cart ──
  const addBeat = (beat: Beat, tierIndex = 0, free = false) => {
    setEntries((prev) => {
      if (prev.some((e) => e.beat.id === beat.id)) return prev;
      return [{ beat, tierIndex, free }, ...prev];
    });
    setUnread((u) => u + 1);
    audio.zip();
    setTimeout(() => audio.ping(), 420);
  };

  const bagFromScale = (beat: Beat, tierIndex: number) => {
    setScaleBeat(null);
    addBeat(beat, tierIndex);
    rollLucky();
  };

  const quickAdd = (beat: Beat) => {
    if (entries.some((e) => e.beat.id === beat.id)) {
      setPhoneOpen(true);
      return;
    }
    addBeat(beat);
    rollLucky();
  };

  // ── lucky roll (1 in 8, once per visit) ──
  const rollLucky = () => {
    if (luckyRef.current) return;
    if (Math.random() < 1 / 8) {
      luckyRef.current = true;
      setTimeout(() => {
        setLucky(true);
        audio.fanfare();
        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0 },
          colors: ["#9fd8ff", "#dff2ff", "#ffffff", "#8fe3c9"],
          scalar: 1.1,
        });
      }, 650);
    }
  };

  const claimFree = (beat: Beat) => {
    addBeat(beat, 0, true);
    setLucky(false);
    setPhoneOpen(true);
  };
  const claimFrostFree = (beat: Beat) => {
    if (!entries.some((e) => e.beat.id === beat.id)) addBeat(beat, 0, true);
    else
      setEntries((prev) => prev.map((e) => (e.beat.id === beat.id ? { ...e, free: true } : e)));
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.beat.id !== id));
  };

  const promo = (code: string) => {
    if (ICECOLD.test(code)) {
      setFrost(true);
      audio.shimmer();
    } else {
      audio.blip();
    }
  };

  // ── totals ──
  const originalTotal = entries.reduce((s, e) => s + (e.free ? 0 : e.beat.tiers[e.tierIndex].price), 0);
  const deal = bulkDiscount(entries.length);
  const total = Math.round(originalTotal * (1 - (deal?.pct ?? 0)));

  return (
    <>
      <Hero />
      <Stash
        currentId={playing ? current?.id ?? null : null}
        onPreview={playBeat}
        onOpenScale={(b) => setScaleBeat(b)}
        onAdd={quickAdd}
        freeIds={freeIds}
      />

      <footer className="site">
        THE BEATMOB — all product is musical. 100% beat. No actual product, just heat.
        <br />
        Producer credit: Brian Jutz · Prod.TheBeatMob · thebeatmobb@gmail.com
      </footer>

      {/* ambient toggle */}
      <div className="dock" style={{ bottom: "10.8rem" }}>
        <button
          className="dock-btn"
          onClick={() => {
            audio.ensure();
            setAmbient((a) => {
              audio.setAmbientVolume(!a ? 0.16 : 0);
              return !a;
            });
          }}
          aria-label={ambient ? "Mute the room" : "Let the room breathe"}
          title={ambient ? "ambient sound: on" : "ambient sound: off"}
        >
          {ambient ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      <TrapPhone
        open={phoneOpen}
        entries={entries}
        unread={unread}
        onOpen={() => {
          setPhoneOpen(true);
          setUnread(0);
        }}
        onClose={() => setPhoneOpen(false)}
        onRemove={removeEntry}
        onPreview={playBeat}
        onPromo={promo}
        onSendWire={() => setWire(true)}
        total={total}
        originalTotal={originalTotal}
        discountLabel={deal?.label ?? null}
      />

      <Scale beat={scaleBeat} onClose={() => setScaleBeat(null)} onBag={bagFromScale} />

      {current && (
        <PlayerBar
          beat={current}
          playing={playing}
          volume={volume}
          onToggle={toggle}
          onPrev={prev}
          onNext={next}
          onVolume={(v) => {
            setVolume(v);
            audio.setVolume(v);
          }}
        />
      )}

      {lucky && <LuckyModal onPick={claimFree} />}
      {frost && <FrostModal onPick={claimFrostFree} />}
      {wire && <WireModal total={total} count={entries.length} onClose={() => setWire(false)} />}

      <div id="frostOverlay" aria-hidden="true" />
    </>
  );
}
