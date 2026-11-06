"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDemoSession } from "@/hooks/useDemoSession";
import { ParallaxFloat } from "@/components/animations/ParallaxFloat";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary } from "@/lib/dictionary-types";

interface HeroPhoneDemoProps {
  dict: Dictionary;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function HeroPhoneDemo({ dict }: HeroPhoneDemoProps) {
  const t = dict.demoPage;
  const session = useDemoSession();
  const demoRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const recordButtonRef = useRef<HTMLButtonElement>(null);
  const arrowSvgRef = useRef<SVGSVGElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [arrow, setArrow] = useState<{ path: string; head: string } | null>(null);

  // Non-blocking backend pre-warm
  useEffect(() => {
    const c = new AbortController();
    fetch("/api/demo/health", { method: "GET", signal: c.signal, cache: "no-store" }).catch(() => {});
    return () => c.abort();
  }, []);

  // Auto-scroll transcript to bottom as it grows
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [session.transcript]);

  // Auto-scroll report to bottom as it streams in
  useEffect(() => {
    if (reportRef.current) {
      reportRef.current.scrollTop = reportRef.current.scrollHeight;
    }
  }, [session.report]);

  useLayoutEffect(() => {
    if (session.status !== "idle" || !session.isSupported) {
      setArrow(null);
      return;
    }

    const root = demoRef.current;
    const hint = hintRef.current;
    const phone = phoneRef.current;
    const button = recordButtonRef.current;
    const svg = arrowSvgRef.current;
    if (!root || !hint || !phone || !button || !svg) return;

    const updateArrow = () => {
      const hintRect = hint.getBoundingClientRect();
      const phoneRect = phone.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const isDesktop = window.matchMedia("(min-width: 1280px)").matches;
      const start = isDesktop
        ? { x: hintRect.right, y: hintRect.top + hintRect.height / 2 }
        : { x: hintRect.left + hintRect.width / 2, y: hintRect.bottom };
      const target = {
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2,
      };
      const approach = isDesktop
        ? { x: target.x - 100, y: target.y - 80 }
        : { x: phoneRect.right + 18, y: target.y - 60 };
      const directionLength = Math.hypot(target.x - approach.x, target.y - approach.y);
      const direction = {
        x: (target.x - approach.x) / directionLength,
        y: (target.y - approach.y) / directionLength,
      };
      const tip = {
        x: target.x - direction.x * (buttonRect.width / 2 + 12),
        y: target.y - direction.y * (buttonRect.height / 2 + 12),
      };
      const matrix = svg.getScreenCTM();
      if (!matrix) return;
      const toSvg = (point: { x: number; y: number }) =>
        new DOMPoint(point.x, point.y).matrixTransform(matrix.inverse());
      const p = (point: { x: number; y: number }) => {
        const { x, y } = toSvg(point);
        return `${x} ${y}`;
      };
      const arrowLength = Math.hypot(target.x - start.x, target.y - start.y);
      const loopCenter = {
        x: start.x + (target.x - start.x) / 3,
        y: start.y + (target.y - start.y) / 3,
      };
      const loopRadius = Math.min(18, arrowLength * 0.035);
      const loopStart = {
        x: loopCenter.x + direction.y * loopRadius,
        y: loopCenter.y - direction.x * loopRadius,
      };
      const loopSegments = Array.from({ length: 4 }, (_, index) => {
        const from = -Math.PI / 2 + index * Math.PI / 2;
        const to = from + Math.PI / 2;
        const controlScale = (4 / 3) * Math.tan(Math.PI / 8);
        const pointAt = (angle: number) => ({
          x: loopCenter.x + loopRadius * (direction.x * Math.cos(angle) - direction.y * Math.sin(angle)),
          y: loopCenter.y + loopRadius * (direction.y * Math.cos(angle) + direction.x * Math.sin(angle)),
        });
        const tangentAt = (angle: number) => ({
          x: loopRadius * (-direction.x * Math.sin(angle) - direction.y * Math.cos(angle)),
          y: loopRadius * (-direction.y * Math.sin(angle) + direction.x * Math.cos(angle)),
        });
        const fromPoint = pointAt(from);
        const toPoint = pointAt(to);
        const fromTangent = tangentAt(from);
        const toTangent = tangentAt(to);
        return `C ${p({ x: fromPoint.x + fromTangent.x * controlScale, y: fromPoint.y + fromTangent.y * controlScale })} ${p({ x: toPoint.x - toTangent.x * controlScale, y: toPoint.y - toTangent.y * controlScale })} ${p(toPoint)}`;
      });
      const path = `M ${p(start)} C ${p({ x: start.x + direction.x * arrowLength * 0.2, y: start.y + direction.y * arrowLength * 0.2 })} ${p({ x: loopStart.x - direction.x * 12, y: loopStart.y - direction.y * 12 })} ${p(loopStart)} ${loopSegments.join(" ")} C ${p({ x: loopStart.x + direction.x * arrowLength * 0.12, y: loopStart.y + direction.y * arrowLength * 0.12 })} ${p({ x: tip.x - direction.x * arrowLength * 0.2, y: tip.y - direction.y * arrowLength * 0.2 })} ${p(tip)}`;
      const perpendicular = { x: -direction.y, y: direction.x };
      const headLength = 12;
      const headWidth = 6;
      const headStart = {
        x: tip.x - direction.x * headLength + perpendicular.x * headWidth,
        y: tip.y - direction.y * headLength + perpendicular.y * headWidth,
      };
      const headEnd = {
        x: tip.x - direction.x * headLength - perpendicular.x * headWidth,
        y: tip.y - direction.y * headLength - perpendicular.y * headWidth,
      };

      setArrow({ path, head: `M ${p(headStart)} L ${p(tip)} L ${p(headEnd)}` });
    };

    updateArrow();
    const resizeObserver = new ResizeObserver(updateArrow);
    resizeObserver.observe(root);
    resizeObserver.observe(hint);
    resizeObserver.observe(phone);
    resizeObserver.observe(button);
    window.addEventListener("resize", updateArrow);
    window.addEventListener("scroll", updateArrow, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateArrow);
      window.removeEventListener("scroll", updateArrow);
    };
  }, [session.isSupported, session.status]);

  // Analytics: report complete
  const prevReportRef = useRef("");
  useEffect(() => {
    if (
      session.report &&
      session.report !== prevReportRef.current &&
      !session.isGenerating &&
      session.status === "complete"
    ) {
      trackEvent("demo_report_generated", { location: "hero_phone" });
      prevReportRef.current = session.report;
    }
  }, [session.report, session.isGenerating, session.status]);

  const handleStartRecording = useCallback(() => {
    trackEvent("demo_start", { method: "recording", location: "hero_phone" });
    session.startRecording();
  }, [session]);

  const isIdle = session.status === "idle";
  const isRecording = session.status === "recording";
  const isBusy =
    session.status === "uploading" ||
    session.status === "processing" ||
    session.status === "generating";
  const isComplete = session.status === "complete";
  const isError = session.status === "error";

  // ── Status bar content ──────────────────────────────────────────────────────

  const statusLeft = isRecording
    ? formatTime(session.elapsedSeconds)
    : isBusy
    ? "..."
    : isComplete
    ? "✓"
    : "9:41";

  // ── Screen content ──────────────────────────────────────────────────────────

  function renderScreenContent() {
    if (isIdle) {
      return (
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="h-2 w-3/4 bg-white/10 rounded" />
          <div className="h-2 w-full bg-white/10 rounded" />
          <div className="h-2 w-5/6 bg-white/10 rounded" />
          <div className="h-2 w-2/3 bg-primary/30 rounded" />
          <div className="mt-4 h-2 w-full bg-white/10 rounded" />
          <div className="h-2 w-4/5 bg-white/10 rounded" />
          <div className="h-2 w-3/4 bg-primary/30 rounded" />
          <div className="mt-4 h-2 w-full bg-white/10 rounded" />
          <div className="h-2 w-2/3 bg-white/10 rounded" />
        </div>
      );
    }

    if (isRecording) {
      return (
        <div
          ref={transcriptRef}
          className="flex-1 overflow-y-auto scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {session.transcript ? (
            <p className="text-[9px] text-white/80 leading-relaxed whitespace-pre-wrap break-words">
              {session.transcript}
            </p>
          ) : (
            <div className="space-y-2 animate-pulse">
              <div className="h-1.5 w-3/4 bg-white/20 rounded" />
              <div className="h-1.5 w-full bg-white/20 rounded" />
              <div className="h-1.5 w-1/2 bg-white/20 rounded" />
            </div>
          )}
        </div>
      );
    }

    if (isBusy) {
      return (
        <div className="flex-1 space-y-2 animate-pulse overflow-hidden">
          <div className="h-1.5 w-3/4 bg-white/20 rounded" />
          <div className="h-1.5 w-full bg-white/20 rounded" />
          <div className="h-1.5 w-5/6 bg-white/20 rounded" />
          <div className="h-1.5 w-2/3 bg-white/20 rounded" />
          <div className="mt-3 h-1.5 w-full bg-white/20 rounded" />
          <div className="h-1.5 w-4/5 bg-white/20 rounded" />
          <div className="h-1.5 w-3/4 bg-white/15 rounded" />
        </div>
      );
    }

    if (isComplete || isError) {
      const content = isError
        ? session.error ?? "Error"
        : session.report;

      return (
        <div
          ref={reportRef}
          className="flex-1 overflow-y-auto scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {content ? (
            <p
              className={`text-[9px] leading-relaxed whitespace-pre-wrap break-words ${
                isError ? "text-red-400/80" : "text-white/80"
              }`}
            >
              {content}
            </p>
          ) : (
            <div className="space-y-2 animate-pulse">
              <div className="h-1.5 w-3/4 bg-white/20 rounded" />
              <div className="h-1.5 w-full bg-white/20 rounded" />
              <div className="h-1.5 w-1/2 bg-white/20 rounded" />
            </div>
          )}
        </div>
      );
    }

    return null;
  }

  // ── Record button ────────────────────────────────────────────────────────────

  function renderRecordButton() {
    if (isIdle) {
      return (
        <button
          onClick={session.isSupported ? handleStartRecording : undefined}
          disabled={!session.isSupported}
          aria-label={session.isSupported ? t.recordButton : t.unsupportedBrowser}
          ref={recordButtonRef}
          className={`w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-glow)] transition-transform ${
            session.isSupported
              ? "hover:scale-105 active:scale-95 cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-white animate-pulse" />
        </button>
      );
    }

    if (isRecording) {
      return (
        <button
          onClick={session.stopRecording}
          aria-label={t.stopButton}
          className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:bg-red-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <div className="w-4 h-4 rounded-sm bg-white" />
        </button>
      );
    }

    if (isBusy) {
      return (
        <div className="w-14 h-14 rounded-full bg-primary/50 flex items-center justify-center" aria-label="Processing…">
          <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      );
    }

    // complete or error → new recording
    return (
      <button
        onClick={session.reset}
        aria-label={t.newRecordingButton}
        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-glow)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      </button>
    );
  }

  return (
    <motion.div
      ref={demoRef}
      initial={{ opacity: 0, x: 60, rotateY: -8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.33, 1, 0.68, 1] }}
      className="relative flex flex-col items-center xl:flex-row xl:justify-end"
    >
      {isIdle && session.isSupported && (
        <>
          <div
            ref={hintRef}
            className="z-20 mb-8 whitespace-nowrap rounded-2xl border border-primary/20 bg-white/95 px-3 py-3 text-center text-xs font-bold text-primary shadow-lg sm:px-5 sm:text-sm xl:absolute xl:right-[364px] xl:top-[38%] xl:mb-0 xl:w-auto xl:-translate-y-1/2 xl:text-left"
          >
            {t.phoneDemoHint}
          </div>
          <svg
            ref={arrowSvgRef}
            className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible text-primary"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            {arrow && (
              <>
                <path d={arrow.path} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d={arrow.head} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
          </svg>
        </>
      )}
      <ParallaxFloat speed={0.15}>
        <div ref={phoneRef} className="relative w-[280px] sm:w-[320px] lg:w-[340px] mb-[-80px]">
          {/* Phone frame */}
          <div className="aspect-[9/19] rounded-[2.5rem] bg-gradient-to-b from-dark-bg to-dark-bg-lighter border-4 border-dark-bg shadow-xl overflow-hidden">
            <div className="h-full flex flex-col p-4 pt-8">
              {/* Status bar */}
              <div className="flex justify-between text-white/40 text-xs mb-4">
                <span className={isRecording ? "text-red-400 font-mono" : ""}>
                  {statusLeft}
                </span>
                <span className="flex items-center gap-1">
                  {isRecording && (
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                  )}
                  ●●●
                </span>
              </div>

              {/* App header */}
              <div className="text-center mb-4">
                <span className="text-xl font-bold text-white">ANOTE</span>
              </div>

              {/* Screen content */}
              {renderScreenContent()}

              {/* Record / action button */}
              <div className="flex justify-center py-4">
                {renderRecordButton()}
              </div>
            </div>
          </div>

          {/* Shadow underneath */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-dark-bg/20 blur-2xl rounded-full" />
        </div>
      </ParallaxFloat>
    </motion.div>
  );
}
