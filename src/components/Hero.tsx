import { useEffect, useRef } from "react";

// Drifting frost particles behind the hero type.
export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let running = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const N = reduce ? 12 : 70;
    const parts = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.0006,
      vy: -0.00035 - Math.random() * 0.0007,
      o: 0.15 + Math.random() * 0.5,
    }));
    const draw = () => {
      if (!running) return;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 224, 255, ${p.o})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    if (reduce) {
      draw();
      running = false; // one static frame
      cancelAnimationFrame(raf);
    } else draw();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <header className="hero" id="top">
      <canvas id="frostCanvas" ref={canvasRef} aria-hidden="true" />
      <div className="hero-inner">
        <p className="eyebrow rise" style={{ animationDelay: "0.05s" }}>
          Prod. TheBeatMob · beat leasing
        </p>
        <h1 className="hero-title rise" style={{ animationDelay: "0.15s" }}>
          The Beatmob<br />Store
        </h1>
        <p className="hero-sub rise" style={{ animationDelay: "0.3s" }}>
          Stamped bricks of pure sound. Tap one to hear it. Drag it to the scale when it is talking to you.
        </p>
        <p className="hero-fine rise" style={{ animationDelay: "0.45s" }}>
          All product is musical. 100% beat. No actual product, just heat.
        </p>
      </div>
      <span className="scroll-cue">scroll to the stash ↓</span>
    </header>
  );
}
