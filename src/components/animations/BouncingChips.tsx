"use client";

import { useEffect, useRef } from "react";

interface ChipState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
}

interface BouncingChipsProps {
  chips: string[];
  chipClassName?: string;
}

/**
 * BouncingChips renders a small set of labelled pill-shaped chips that float
 * and bounce inside their bounding container. Positions are written directly
 * to each chip's `style.transform` via requestAnimationFrame so React does not
 * re-render per frame. The animation pauses when scrolled off-screen and is
 * disabled entirely for users with `prefers-reduced-motion: reduce`.
 */
export function BouncingChips({ chips, chipClassName = "" }: BouncingChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stateRef = useRef<ChipState[]>([]);
  const rafRef = useRef<number>(0);
  const inViewRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chipEls = chipRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (chipEls.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cW = container.clientWidth;
    let cH = container.clientHeight;

    // Initialise chip states with random positions + velocities.
    stateRef.current = chipEls.map((el, i) => {
      const w = el.offsetWidth || 40;
      const h = el.offsetHeight || 24;
      const speed = 0.5 + Math.random() * 0.6; // px/frame ~ 30–66 px/s at 60fps
      const angle = Math.random() * 2 * Math.PI;
      // Stagger initial positions horizontally to reduce spawn overlap.
      const xStart = chipEls.length > 1
        ? (i * (Math.max(0, cW - w))) / (chipEls.length - 1)
        : Math.random() * Math.max(0, cW - w);
      return {
        x: Math.max(0, Math.min(xStart, Math.max(0, cW - w))),
        y: Math.random() * Math.max(0, cH - h),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w,
        h,
      };
    });

    // Apply initial positions synchronously.
    stateRef.current.forEach((s, i) => {
      const el = chipEls[i];
      if (el) el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
    });

    if (reducedMotion) {
      // Static placement only — no animation loop.
      return;
    }

    const ro = new ResizeObserver(([entry]) => {
      cW = entry.contentRect.width;
      cH = entry.contentRect.height;
      for (const s of stateRef.current) {
        s.x = Math.min(s.x, Math.max(0, cW - s.w));
        s.y = Math.min(s.y, Math.max(0, cH - s.h));
      }
    });
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(container);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      if (!inViewRef.current) return;

      const state = stateRef.current;
      const n = state.length;

      // Move and wall-bounce.
      for (let i = 0; i < n; i++) {
        const s = state[i];
        s.x += s.vx;
        s.y += s.vy;
        if (s.x <= 0) {
          s.x = 0;
          s.vx = Math.abs(s.vx);
        } else if (s.x >= cW - s.w) {
          s.x = cW - s.w;
          s.vx = -Math.abs(s.vx);
        }
        if (s.y <= 0) {
          s.y = 0;
          s.vy = Math.abs(s.vy);
        } else if (s.y >= cH - s.h) {
          s.y = cH - s.h;
          s.vy = -Math.abs(s.vy);
        }
      }

      // Chip-chip collisions (simplified elastic — swap velocities on overlap).
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = state[i];
          const b = state[j];
          const overlapX = a.x < b.x + b.w && a.x + a.w > b.x;
          const overlapY = a.y < b.y + b.h && a.y + a.h > b.y;
          if (!overlapX || !overlapY) continue;

          // Swap velocities.
          const tvx = a.vx;
          const tvy = a.vy;
          a.vx = b.vx;
          a.vy = b.vy;
          b.vx = tvx;
          b.vy = tvy;

          // Separate along the axis of smaller overlap to prevent sticking.
          const dx = (a.x + a.w / 2) - (b.x + b.w / 2);
          const dy = (a.y + a.h / 2) - (b.y + b.h / 2);
          const sepX = (a.w + b.w) / 2 - Math.abs(dx);
          const sepY = (a.h + b.h) / 2 - Math.abs(dy);
          if (sepX < sepY) {
            const push = sepX / 2;
            if (dx < 0) {
              a.x = Math.max(0, a.x - push);
              b.x = Math.min(cW - b.w, b.x + push);
            } else {
              a.x = Math.min(cW - a.w, a.x + push);
              b.x = Math.max(0, b.x - push);
            }
          } else {
            const push = sepY / 2;
            if (dy < 0) {
              a.y = Math.max(0, a.y - push);
              b.y = Math.min(cH - b.h, b.y + push);
            } else {
              a.y = Math.min(cH - a.h, a.y + push);
              b.y = Math.max(0, b.y - push);
            }
          }
        }
      }

      // Write positions to DOM.
      for (let i = 0; i < n; i++) {
        const el = chipEls[i];
        if (el) el.style.transform = `translate3d(${state[i].x}px, ${state[i].y}px, 0)`;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
    };
  }, [chips]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      aria-hidden="true"
    >
      {chips.map((label, i) => (
        <span
          key={label}
          ref={(el) => {
            chipRefs.current[i] = el;
          }}
          className={`absolute top-0 left-0 text-xs font-bold text-primary bg-primary/10 rounded px-2 py-0.5 whitespace-nowrap select-none will-change-transform ${chipClassName}`}
          style={{ transform: "translate3d(0,0,0)" }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
