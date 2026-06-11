"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDemoSession } from "@/hooks/useDemoSession";
import { RecordingControls } from "./RecordingControls";
import { VisitTypeSelector } from "./VisitTypeSelector";
import { TranscriptPanel } from "./TranscriptPanel";
import { ReportPanel } from "./ReportPanel";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary } from "@/lib/dictionary-types";

interface DemoUIProps {
  dict: Dictionary;
}

type MobileTab = "transcript" | "report";

export function DemoUI({ dict }: DemoUIProps) {
  const t = dict.demoPage;
  const session = useDemoSession();
  const [mobileTab, setMobileTab] = useState<MobileTab>("transcript");

  // Non-blocking backend pre-warm on mount. Errors are swallowed so a
  // failing health ping never surfaces to the user or blocks rendering.
  useEffect(() => {
    const controller = new AbortController();
    trackEvent("demo_page_view");
    fetch("/api/demo/health", {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    }).catch(() => {});
    return () => controller.abort();
  }, []);

  // Track report complete
  const prevReportRef = useRef("");
  useEffect(() => {
    if (
      session.report &&
      session.report !== prevReportRef.current &&
      !session.isGenerating &&
      session.status === "complete"
    ) {
      trackEvent("demo_report_generated");
      prevReportRef.current = session.report;
    }
  }, [session.report, session.isGenerating, session.status, session.visitType]);

  const handleStartRecording = useCallback(() => {
    trackEvent("demo_start", { method: "recording" });
    session.startRecording();
  }, [session]);

  const handleStopRecording = useCallback(() => {
    session.stopRecording();
  }, [session]);

  const visitTypeLabel =
    t.visitTypes[session.visitType as keyof typeof t.visitTypes] ??
    session.visitType;

  return (
    <div className="space-y-6">
      {/* Desktop: three-column layout */}
      <div className="hidden md:grid md:grid-cols-[240px_1fr_1fr] gap-6">
        {/* Controls column */}
        <div className="space-y-6">
          <RecordingControls
            status={session.status}
            isSupported={session.isSupported}
            elapsedSeconds={session.elapsedSeconds}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onUpload={session.uploadFile}
            onReset={session.reset}
            dict={t}
          />
          <VisitTypeSelector
            value={session.visitType}
            onChange={session.setVisitType}
            label={t.visitTypeLabel}
            options={t.visitTypes}
            disabled={session.status !== "idle"}
          />
        </div>

        {/* Transcript column */}
        <TranscriptPanel
          transcript={session.transcript}
          isTranscribing={session.isTranscribing}
          dict={t}
        />

        {/* Report column */}
        <ReportPanel
          report={session.report}
          isGenerating={session.isGenerating}
          visitType={session.visitType}
          visitTypeLabel={visitTypeLabel}
          dict={t}
          isComplete={session.status === "complete"}
        />
      </div>

      {/* Mobile: stacked layout */}
      <div className="md:hidden space-y-5">
        {/* Controls always visible */}
        <RecordingControls
          status={session.status}
          isSupported={session.isSupported}
          elapsedSeconds={session.elapsedSeconds}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onUpload={session.uploadFile}
          onReset={session.reset}
          dict={t}
        />

        <VisitTypeSelector
          value={session.visitType}
          onChange={session.setVisitType}
          label={t.visitTypeLabel}
          options={t.visitTypes}
          disabled={session.status !== "idle"}
        />

        {/* Tab switcher */}
        <div className="flex rounded-xl border border-border bg-surface overflow-hidden" role="tablist" aria-label={`${t.transcriptLabel} / ${t.reportLabel}`}>
          <button
            role="tab"
            aria-selected={mobileTab === "transcript"}
            aria-controls="panel-transcript"
            id="tab-transcript"
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mobileTab === "transcript"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
            onClick={() => setMobileTab("transcript")}
          >
            {t.transcriptLabel}
          </button>
          <button
            role="tab"
            aria-selected={mobileTab === "report"}
            aria-controls="panel-report"
            id="tab-report"
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mobileTab === "report"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
            onClick={() => setMobileTab("report")}
          >
            {t.reportLabel}
          </button>
        </div>

        {/* Active tab content */}
        <div
          id={`panel-${mobileTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${mobileTab}`}
        >
          {mobileTab === "transcript" ? (
            <TranscriptPanel
              transcript={session.transcript}
              isTranscribing={session.isTranscribing}
              dict={t}
            />
          ) : (
            <ReportPanel
              report={session.report}
              isGenerating={session.isGenerating}
              visitType={session.visitType}
              visitTypeLabel={visitTypeLabel}
              dict={t}
              isComplete={session.status === "complete"}
            />
          )}
        </div>
      </div>

      {/* Error message */}
      {session.status === "error" && session.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          {session.error}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-text-secondary text-center leading-relaxed border-t border-border pt-5" role="note">
        {t.disclaimer}
      </p>
    </div>
  );
}
