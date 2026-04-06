"use client";

import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/Button";
import type { DemoStatus } from "@/hooks/useDemoSession";
import { trackEvent } from "@/lib/analytics";

interface RecordingControlsProps {
  status: DemoStatus;
  isSupported: boolean;
  elapsedSeconds: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onUpload: (file: File) => void;
  onReset: () => void;
  dict: {
    recordButton: string;
    stopButton: string;
    uploadButton: string;
    newRecordingButton: string;
    timerLabel: string;
    maxDuration: string;
    uploadHint: string;
    dragDropHint: string;
    micDenied: string;
  };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const MAX_DURATION_DISPLAY = "10:00";
const ACCEPTED_AUDIO = ".mp3,.wav,.m4a,.webm,.ogg";

export function RecordingControls({
  status,
  isSupported,
  elapsedSeconds,
  onStartRecording,
  onStopRecording,
  onUpload,
  onReset,
  dict,
}: RecordingControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isIdle = status === "idle";
  const isRecording = status === "recording";
  const isComplete = status === "complete";
  const isError = status === "error";
  const isBusy =
    status === "uploading" ||
    status === "processing" ||
    status === "generating";

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        trackEvent("demo_upload_file", {
          fileType: file.type,
          fileSizeMB: (file.size / (1024 * 1024)).toFixed(1),
        });
        onUpload(file);
      }
      // Reset input so re-uploading the same file triggers change
      e.target.value = "";
    },
    [onUpload],
  );

  return (
    <div className="space-y-5">
      {/* Record / Stop button */}
      {isRecording ? (
        <Button
          variant="primary"
          className="w-full bg-red-600 hover:bg-red-700"
          onClick={onStopRecording}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          {dict.stopButton}
        </Button>
      ) : isComplete || isError ? (
        <Button variant="primary" className="w-full" onClick={onReset}>
          {dict.newRecordingButton}
        </Button>
      ) : (
        <Button
          variant="primary"
          className="w-full"
          onClick={onStartRecording}
          disabled={!isSupported || isBusy}
          loading={isBusy}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          </svg>
          {dict.recordButton}
        </Button>
      )}

      {/* Timer */}
      {isRecording && (
        <div className="text-center" aria-live="polite">
          <p className="text-2xl font-mono font-bold text-text-primary" aria-label={dict.timerLabel}>
            {formatTime(elapsedSeconds)} <span className="text-sm text-text-secondary font-normal">/ {MAX_DURATION_DISPLAY}</span>
          </p>
          <p className="text-xs text-text-secondary mt-1">{dict.maxDuration}</p>
        </div>
      )}

      {/* Upload button */}
      {!isRecording && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_AUDIO}
            onChange={handleFileChange}
            className="hidden"
            aria-label={dict.uploadButton}
          />
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy || isRecording}
            loading={status === "uploading"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            {dict.uploadButton}
          </Button>
          <p className="text-xs text-text-secondary mt-1.5 text-center">
            {dict.uploadHint}
          </p>
        </div>
      )}

      {/* Unsupported browser message */}
      {!isSupported && (
        <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 text-center">
          {dict.micDenied}
        </p>
      )}
    </div>
  );
}
