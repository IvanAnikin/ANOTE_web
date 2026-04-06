"use client";

import { useCallback, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface TranscriptPanelProps {
  transcript: string;
  isTranscribing: boolean;
  dict: {
    transcriptLabel: string;
    transcriptPlaceholder: string;
    transcribing: string;
    copyButton: string;
    copied: string;
  };
}

export function TranscriptPanel({
  transcript,
  isTranscribing,
  dict,
}: TranscriptPanelProps) {
  const [copied, setCopied] = useState(false);
  const prevTranscriptRef = useRef("");

  // Track if transcript changed for fade-in effect
  const transcriptChanged = transcript !== prevTranscriptRef.current;
  if (transcriptChanged) {
    prevTranscriptRef.current = transcript;
  }

  const handleCopy = useCallback(async () => {
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    trackEvent("demo_copy_transcript");
    setTimeout(() => setCopied(false), 2000);
  }, [transcript]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide" id="transcript-heading">
          {dict.transcriptLabel}
        </h3>
        {isTranscribing && (
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
            {dict.transcribing}
          </span>
        )}
      </div>

      <div
        className="flex-1 min-h-[200px] md:min-h-[300px] rounded-xl border border-border bg-white p-4 overflow-y-auto text-sm leading-relaxed text-text-primary"
        role="region"
        aria-labelledby="transcript-heading"
        aria-live="polite"
        aria-atomic="false"
      >
        {transcript ? (
          <p className="whitespace-pre-wrap animate-fade-in">{transcript}</p>
        ) : isTranscribing ? (
          <div className="space-y-3" aria-hidden="true">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-4/6" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4" />
          </div>
        ) : (
          <p className="text-text-secondary italic">
            {dict.transcriptPlaceholder}
          </p>
        )}
      </div>

      {transcript && (
        <div className="mt-3 flex justify-end">
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
        </div>
      )}
    </div>
  );
}
