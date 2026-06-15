"use client";

import { useCallback, useEffect, useRef } from "react";
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
  const transcriptRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

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
      initial={{ opacity: 0, x: 60, rotateY: -8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.33, 1, 0.68, 1] }}
      className="relative flex justify-center lg:justify-end"
    >
      <ParallaxFloat speed={0.15}>
        <div className="relative w-[280px] sm:w-[320px] lg:w-[340px] mb-[-80px]">
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
