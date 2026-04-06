"use client";

import { useCallback, useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface ReportPanelProps {
  report: string;
  isGenerating: boolean;
  visitType: string;
  visitTypeLabel: string;
  dict: {
    reportLabel: string;
    reportPlaceholder: string;
    generating: string;
    copyButton: string;
    downloadButton: string;
    copied: string;
    complete: string;
  };
  isComplete: boolean;
}

export function ReportPanel({
  report,
  isGenerating,
  visitType,
  visitTypeLabel,
  dict,
  isComplete,
}: ReportPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report);
    setCopied(true);
    trackEvent("demo_copy_report");
    setTimeout(() => setCopied(false), 2000);
  }, [report]);

  const handleDownload = useCallback(() => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "anote-report.txt";
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("demo_download_report");
  }, [report]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide" id="report-heading">
            {dict.reportLabel}
          </h3>
          {visitType !== "default" && report && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {visitTypeLabel}
            </span>
          )}
        </div>
        {isGenerating && (
          <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium" role="status">
            <svg
              className="animate-spin h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {dict.generating}
          </span>
        )}
        {isComplete && report && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium" role="status">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {dict.complete}
          </span>
        )}
      </div>

      <div
        className="flex-1 min-h-[200px] md:min-h-[300px] rounded-xl border border-border bg-white p-4 overflow-y-auto text-sm leading-relaxed text-text-primary"
        role="region"
        aria-labelledby="report-heading"
        aria-live="polite"
        aria-atomic="false"
      >
        {report ? (
          <div className="whitespace-pre-wrap animate-fade-in">
            {report.split("\n").map((line, i) => {
              if (
                line.trim() &&
                !line.startsWith(" ") &&
                line.endsWith(":") &&
                line.length < 60
              ) {
                return (
                  <p key={i} className="font-bold text-text-primary mt-3 first:mt-0">
                    {line}
                  </p>
                );
              }
              if (line.trim() === "") {
                return <br key={i} />;
              }
              return <p key={i}>{line}</p>;
            })}
          </div>
        ) : isGenerating ? (
          <div className="space-y-3" aria-hidden="true">
            <div className="skeleton h-5 w-48" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-full" />
            <div className="mt-4 skeleton h-5 w-40" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4" />
          </div>
        ) : (
          <p className="text-text-secondary italic">
            {dict.reportPlaceholder}
          </p>
        )}
      </div>

      {report && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-black/5 transition-colors"
            aria-label={copied ? dict.copied : dict.copyButton}
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            )}
            {copied ? dict.copied : dict.copyButton}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-black/5 transition-colors"
            aria-label={dict.downloadButton}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {dict.downloadButton}
          </button>
        </div>
      )}
    </div>
  );
}
