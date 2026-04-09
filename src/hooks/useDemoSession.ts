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
 * Stream report tokens from the SSE endpoint, calling onToken for each chunk.
 * Returns the full accumulated report text.
 */
async function streamReport(
  transcript: string,
  visitType: VisitType,
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/demo/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, visit_type: visitType }),
    signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Report generation failed");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response stream");

  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    // Keep the last (possibly incomplete) line in the buffer
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") continue;
      try {
        const parsed = JSON.parse(payload);
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.token) {
          full += parsed.token;
          onToken(parsed.token);
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue; // skip malformed lines
        throw e;
      }
    }
  }

  return full;
}

// ── Hook ────────────────────────────────────────────────────────────────────

const MAX_DURATION_SECONDS = 10 * 60; // 10 minutes

export function useDemoSession() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef<AbortController | null>(null);

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
    };
  }, []);

  // ── Periodic transcription + report during recording ──────────────────

  const handleChunk = useCallback(
    async (segmentBlob: Blob) => {
      // Queue if a request is already in-flight (no audio is lost)
      if (pendingRef.current) {
        pendingSegmentsRef.current.push(segmentBlob);
        return;
      }
      pendingRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Collect any queued segments + current one
        const toProcess = [...pendingSegmentsRef.current, segmentBlob];
        pendingSegmentsRef.current = [];

        dispatch({ type: "SET_TRANSCRIBING", value: true });
        const results = await Promise.all(
          toProcess.map((seg) => transcribeAudio(seg, controller.signal)),
        );
        for (const text of results) {
          const trimmed = text.trim();
          if (trimmed) {
            fullTranscriptRef.current +=
              (fullTranscriptRef.current ? " " : "") + trimmed;
          }
        }
        dispatch({ type: "SET_TRANSCRIPT", transcript: fullTranscriptRef.current });
        dispatch({ type: "SET_TRANSCRIBING", value: false });

        dispatch({ type: "SET_GENERATING", value: true });
        dispatch({ type: "SET_REPORT", report: "" });
        await streamReport(
          fullTranscriptRef.current,
          visitTypeRef.current,
          (token) => dispatch({ type: "APPEND_REPORT", token }),
          controller.signal,
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
      pendingRef.current = true;

      // Collect any queued segments + the last one
      const toProcess = [...pendingSegmentsRef.current, lastSegmentBlob];
      pendingSegmentsRef.current = [];

      dispatch({ type: "STOP_RECORDING" });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        dispatch({ type: "SET_TRANSCRIBING", value: true });
        const results = await Promise.all(
          toProcess.map((seg) => transcribeAudio(seg, controller.signal)),
        );
        for (const text of results) {
          const trimmed = text.trim();
          if (trimmed) {
            fullTranscriptRef.current +=
              (fullTranscriptRef.current ? " " : "") + trimmed;
          }
        }
        dispatch({ type: "SET_TRANSCRIPT", transcript: fullTranscriptRef.current });
        dispatch({ type: "SET_TRANSCRIBING", value: false });

        dispatch({ type: "SET_GENERATING", value: true });
        dispatch({ type: "SET_REPORT", report: "" });
        await streamReport(
          fullTranscriptRef.current,
          visitTypeRef.current,
          (token) => dispatch({ type: "APPEND_REPORT", token }),
          controller.signal,
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
    fullTranscriptRef.current = "";
    pendingSegmentsRef.current = [];
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
