"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useMediaRecorder } from "./useMediaRecorder";

// ── Types ───────────────────────────────────────────────────────────────────

export type VisitType =
  | "default"
  | "initial"
  | "followup"
  | "gastroscopy"
  | "colonoscopy"
  | "ultrasound";

export type DemoStatus =
  | "idle"
  | "recording"
  | "uploading"
  | "processing"
  | "generating"
  | "complete"
  | "error";

export interface DemoState {
  status: DemoStatus;
  transcript: string;
  report: string;
  visitType: VisitType;
  error: string | null;
  isTranscribing: boolean;
  isGenerating: boolean;
}

// ── Actions ─────────────────────────────────────────────────────────────────

type DemoAction =
  | { type: "START_RECORDING" }
  | { type: "STOP_RECORDING" }
  | { type: "START_UPLOAD" }
  | { type: "SET_TRANSCRIPT"; transcript: string }
  | { type: "SET_REPORT"; report: string }
  | { type: "APPEND_REPORT"; token: string }
  | { type: "SET_VISIT_TYPE"; visitType: VisitType }
  | { type: "SET_TRANSCRIBING"; value: boolean }
  | { type: "SET_GENERATING"; value: boolean }
  | { type: "SET_STATUS"; status: DemoStatus }
  | { type: "SET_ERROR"; error: string }
  | { type: "RESET" };

const initialState: DemoState = {
  status: "idle",
  transcript: "",
  report: "",
  visitType: "default",
  error: null,
  isTranscribing: false,
  isGenerating: false,
};

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "START_RECORDING":
      return { ...state, status: "recording", transcript: "", report: "", error: null };
    case "STOP_RECORDING":
      return { ...state, status: "processing" };
    case "START_UPLOAD":
      return { ...state, status: "uploading", transcript: "", report: "", error: null };
    case "SET_TRANSCRIPT":
      return { ...state, transcript: action.transcript };
    case "SET_REPORT":
      return { ...state, report: action.report };
    case "APPEND_REPORT":
      return { ...state, report: state.report + action.token };
    case "SET_VISIT_TYPE":
      return { ...state, visitType: action.visitType };
    case "SET_TRANSCRIBING":
      return { ...state, isTranscribing: action.value };
    case "SET_GENERATING":
      return { ...state, isGenerating: action.value };
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "SET_ERROR":
      return { ...state, status: "error", error: action.error };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ── API helpers ─────────────────────────────────────────────────────────────

async function transcribeAudio(
  blob: Blob,
  signal?: AbortSignal,
): Promise<string> {
  const form = new FormData();
  form.append("file", blob, "audio.webm");
  form.append("language", "cs");

  const res = await fetch("/api/demo/transcribe", {
    method: "POST",
    body: form,
    signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Transcription failed");
  }

  const data = await res.json();
  return data.transcript as string;
}

/**
 * Fetch a report from the backend.
 *
 * - When `useStream` is true, opens an SSE stream (`?stream=1`) and calls
 *   `onToken` incrementally as `data:` chunks arrive. Falls back to the
 *   JSON path automatically if the response is not `text/event-stream`.
 * - When `useStream` is false, performs the legacy JSON request and
 *   calls `onToken` once with the full text.
 *
 * Retries exactly once on a 5xx response to absorb transient cold-start
 * or upstream blips. 4xx and network errors are not retried.
 */
async function streamReport(
  transcript: string,
  visitType: VisitType,
  onToken: (token: string) => void,
  signal?: AbortSignal,
  useStream = false,
  onFinal?: (text: string) => void,
): Promise<string> {
  const url = useStream ? "/api/demo/report?stream=1" : "/api/demo/report";

  const doFetch = () =>
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(useStream ? { Accept: "text/event-stream" } : {}),
      },
      body: JSON.stringify({ transcript, visit_type: visitType }),
      signal,
    });

  let res = await doFetch();
  if (res.status >= 500 && res.status < 600 && !signal?.aborted) {
    res = await doFetch();
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Report generation failed");
  }

  const contentType = res.headers.get("Content-Type") ?? "";

  if (useStream && contentType.includes("text/event-stream") && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let full = "";

    // SSE framing: events are separated by blank lines; payload lines
    // begin with `data: `. We forward each non-`[DONE]` payload via
    // `onToken`. Aborts surface as `AbortError` from `reader.read()` and
    // propagate to the caller.
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const event = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        for (const rawLine of event.split("\n")) {
          if (!rawLine.startsWith("data:")) continue;
          const payload = rawLine.slice(5).trimStart();
          if (!payload || payload === "[DONE]") continue;
          // Accept either raw text payloads or JSON envelopes:
          //   {"text": "<delta>"}        — incremental chunk
          //   {"final": "<full text>"}    — canonical full report
          //   {"error": "<message>"}      — upstream failure
          let token = payload;
          if (payload.startsWith("{")) {
            try {
              const parsed = JSON.parse(payload) as {
                text?: string;
                token?: string;
                delta?: string;
                final?: string;
                error?: string;
              };
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (typeof parsed.final === "string") {
                full = parsed.final;
                onFinal?.(parsed.final);
                continue;
              }
              token = parsed.text ?? parsed.token ?? parsed.delta ?? "";
            } catch (e) {
              if (e instanceof Error && e.message) throw e;
              token = payload;
            }
          }
          if (token) {
            full += token;
            onToken(token);
          }
        }
      }
    }
    return full;
  }

  const data = await res.json();
  const report = data.report ?? "";
  if (report) {
    onToken(report);
  }
  return report;
}

// Toggle to enable opt-in SSE end-to-end. The `anote-web-api` backend
// exposes `?stream=1` since image `0.2.0`; flip this to `false` to
// fall back to the JSON path if the stream regresses.
const ENABLE_SSE_REPORT = true;

// Skip periodic regeneration when transcript growth since the last
// report request is below this many characters.
const REPORT_MIN_DELTA_CHARS = 30;

// ── Hook ────────────────────────────────────────────────────────────────────

const MAX_DURATION_SECONDS = 10 * 60; // 10 minutes
const MIN_SEGMENT_BYTES = 1000; // Skip segments too small to be valid audio

export function useDemoSession() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef<AbortController | null>(null);

  // Dedicated controller for the in-flight `/report` call. Allows a
  // newer transcript to abort an older report request without canceling
  // the (still-useful) transcribe pipeline.
  const reportAbortRef = useRef<AbortController | null>(null);

  // Transcript length at the time the most recent `/report` was issued.
  // Used to debounce regeneration when growth is below the threshold.
  const lastReportTranscriptLenRef = useRef(0);

  // Keep visitType in a ref so callbacks don't go stale
  const visitTypeRef = useRef(state.visitType);
  visitTypeRef.current = state.visitType;

  // Prevent overlapping periodic transcription requests
  const pendingRef = useRef(false);

  // Accumulated transcript built from individual segments
  const fullTranscriptRef = useRef("");

  // Queue for segments that arrive while a request is in-flight
  const pendingSegmentsRef = useRef<Blob[]>([]);

  // Abort in-flight requests on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      reportAbortRef.current?.abort();
    };
  }, []);

  // ── Periodic transcription + report during recording ──────────────────

  const handleChunk = useCallback(
    async (segmentBlob: Blob) => {
      // A newer chunk has arrived: abort any stale `/report` so the
      // newest transcript wins (B-5). Transcribe queueing below
      // preserves audio bytes already uploaded.
      reportAbortRef.current?.abort();
      reportAbortRef.current = null;

      // Queue if a request is already in-flight (no audio is lost)
      if (pendingRef.current) {
        pendingSegmentsRef.current.push(segmentBlob);
        return;
      }
      pendingRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Collect any queued segments + current one, filtering tiny/empty blobs
        const toProcess = [...pendingSegmentsRef.current, segmentBlob]
          .filter((seg) => seg.size >= MIN_SEGMENT_BYTES);
        pendingSegmentsRef.current = [];

        if (toProcess.length === 0) return;

        dispatch({ type: "SET_TRANSCRIBING", value: true });
        const settled = await Promise.allSettled(
          toProcess.map((seg) => transcribeAudio(seg, controller.signal)),
        );
        for (const result of settled) {
          if (result.status === "fulfilled") {
            const trimmed = result.value.trim();
            if (trimmed) {
              fullTranscriptRef.current +=
                (fullTranscriptRef.current ? " " : "") + trimmed;
            }
          }
        }
        dispatch({ type: "SET_TRANSCRIPT", transcript: fullTranscriptRef.current });
        dispatch({ type: "SET_TRANSCRIBING", value: false });

        // Debounce (B-4): skip regeneration on tiny transcript growth.
        const currentLen = fullTranscriptRef.current.length;
        const delta = currentLen - lastReportTranscriptLenRef.current;
        if (delta < REPORT_MIN_DELTA_CHARS) {
          return;
        }
        lastReportTranscriptLenRef.current = currentLen;

        // Issue a fresh report request with its own controller so a
        // newer chunk can abort just this call (B-5).
        const reportController = new AbortController();
        reportAbortRef.current = reportController;

        dispatch({ type: "SET_GENERATING", value: true });
        dispatch({ type: "SET_REPORT", report: "" });
        await streamReport(
          fullTranscriptRef.current,
          visitTypeRef.current,
          (token) => dispatch({ type: "APPEND_REPORT", token }),
          reportController.signal,
          ENABLE_SSE_REPORT,
          (text) => dispatch({ type: "SET_REPORT", report: text }),
        );
        dispatch({ type: "SET_GENERATING", value: false });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("Periodic transcription error:", err);
        dispatch({ type: "SET_TRANSCRIBING", value: false });
        dispatch({ type: "SET_GENERATING", value: false });
      } finally {
        // Only reset if not aborted (handleRecordingStop takes over on abort)
        if (!controller.signal.aborted) {
          pendingRef.current = false;
        }
      }
    },
    [],
  );

  // ── Final processing after recording stops ────────────────────────────

  const handleRecordingStop = useCallback(
    async (lastSegmentBlob: Blob) => {
      // Abort any in-flight chunk request before starting final processing
      abortRef.current?.abort();
      reportAbortRef.current?.abort();
      pendingRef.current = true;

      // Collect any queued segments + the last one, filtering tiny/empty blobs
      const toProcess = [...pendingSegmentsRef.current, lastSegmentBlob]
        .filter((seg) => seg.size >= MIN_SEGMENT_BYTES);
      pendingSegmentsRef.current = [];

      dispatch({ type: "STOP_RECORDING" });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        dispatch({ type: "SET_TRANSCRIBING", value: true });
        const settled = await Promise.allSettled(
          toProcess.map((seg) => transcribeAudio(seg, controller.signal)),
        );
        for (const result of settled) {
          if (result.status === "fulfilled") {
            const trimmed = result.value.trim();
            if (trimmed) {
              fullTranscriptRef.current +=
                (fullTranscriptRef.current ? " " : "") + trimmed;
            }
          }
        }
        dispatch({ type: "SET_TRANSCRIPT", transcript: fullTranscriptRef.current });
        dispatch({ type: "SET_TRANSCRIBING", value: false });

        // Final report always runs regardless of debounce threshold.
        lastReportTranscriptLenRef.current = fullTranscriptRef.current.length;
        const reportController = new AbortController();
        reportAbortRef.current = reportController;

        dispatch({ type: "SET_GENERATING", value: true });
        dispatch({ type: "SET_REPORT", report: "" });
        await streamReport(
          fullTranscriptRef.current,
          visitTypeRef.current,
          (token) => dispatch({ type: "APPEND_REPORT", token }),
          reportController.signal,
          ENABLE_SSE_REPORT,
          (text) => dispatch({ type: "SET_REPORT", report: text }),
        );
        dispatch({ type: "SET_GENERATING", value: false });

        dispatch({ type: "SET_STATUS", status: "complete" });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          dispatch({ type: "SET_ERROR", error: (err as Error).message });
        }
      } finally {
        pendingRef.current = false;
      }
    },
    [],
  );

  // ── Media recorder ────────────────────────────────────────────────────

  const recorder = useMediaRecorder({
    timeslice: 20_000,
    onChunk: handleChunk,
    onStop: handleRecordingStop,
  });

  // ── Auto-stop at max duration ─────────────────────────────────────────

  if (recorder.isRecording && recorder.elapsedSeconds >= MAX_DURATION_SECONDS) {
    recorder.stop();
  }

  // ── Public actions ────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    fullTranscriptRef.current = "";
    pendingSegmentsRef.current = [];
    lastReportTranscriptLenRef.current = 0;
    reportAbortRef.current?.abort();
    reportAbortRef.current = null;
    dispatch({ type: "START_RECORDING" });
    try {
      await recorder.start();
    } catch {
      dispatch({
        type: "SET_ERROR",
        error: "Microphone access denied or unavailable",
      });
    }
  }, [recorder]);

  const stopRecording = useCallback(() => {
    recorder.stop();
  }, [recorder]);

  const uploadFile = useCallback(
    async (file: File) => {
      // Client-side validation
      if (file.size > 25 * 1024 * 1024) {
        dispatch({ type: "SET_ERROR", error: "File too large (max 25 MB)" });
        return;
      }

      dispatch({ type: "START_UPLOAD" });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        dispatch({ type: "SET_TRANSCRIBING", value: true });
        const transcript = await transcribeAudio(file, controller.signal);
        dispatch({ type: "SET_TRANSCRIPT", transcript });
        dispatch({ type: "SET_TRANSCRIBING", value: false });

        dispatch({ type: "SET_STATUS", status: "generating" });
        dispatch({ type: "SET_GENERATING", value: true });
        dispatch({ type: "SET_REPORT", report: "" });
        await streamReport(
          transcript,
          visitTypeRef.current,
          (token) => dispatch({ type: "APPEND_REPORT", token }),
          controller.signal,
          ENABLE_SSE_REPORT,
          (text) => dispatch({ type: "SET_REPORT", report: text }),
        );
        dispatch({ type: "SET_GENERATING", value: false });

        dispatch({ type: "SET_STATUS", status: "complete" });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          dispatch({ type: "SET_ERROR", error: (err as Error).message });
        }
      }
    },
    [],
  );

  const setVisitType = useCallback((vt: VisitType) => {
    dispatch({ type: "SET_VISIT_TYPE", visitType: vt });
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    reportAbortRef.current?.abort();
    reportAbortRef.current = null;
    fullTranscriptRef.current = "";
    pendingSegmentsRef.current = [];
    lastReportTranscriptLenRef.current = 0;
    if (recorder.isRecording) {
      recorder.stop();
    }
    dispatch({ type: "RESET" });
  }, [recorder]);

  return {
    ...state,
    elapsedSeconds: recorder.elapsedSeconds,
    isSupported: recorder.isSupported,
    startRecording,
    stopRecording,
    uploadFile,
    setVisitType,
    reset,
  };
}
