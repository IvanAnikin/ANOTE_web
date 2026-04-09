"use client";

import { useCallback, useReducer, useRef } from "react";
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

async function generateReport(
  transcript: string,
  visitType: VisitType,
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

  const data = await res.json();
  return data.report as string;
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

  // ── Periodic transcription + report during recording ──────────────────

  const handleChunk = useCallback(
    async (blob: Blob) => {
      // Skip if a request is already in-flight
      if (pendingRef.current) return;
      pendingRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        dispatch({ type: "SET_TRANSCRIBING", value: true });
        const transcript = await transcribeAudio(blob, controller.signal);
        dispatch({ type: "SET_TRANSCRIPT", transcript });
        dispatch({ type: "SET_TRANSCRIBING", value: false });

        dispatch({ type: "SET_GENERATING", value: true });
        const report = await generateReport(
          transcript,
          visitTypeRef.current,
          controller.signal,
        );
        dispatch({ type: "SET_REPORT", report });
        dispatch({ type: "SET_GENERATING", value: false });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Periodic transcription error:", err);
        }
        dispatch({ type: "SET_TRANSCRIBING", value: false });
        dispatch({ type: "SET_GENERATING", value: false });
      } finally {
        pendingRef.current = false;
      }
    },
    [],
  );

  // ── Final processing after recording stops ────────────────────────────

  const handleRecordingStop = useCallback(
    async (blob: Blob) => {
      // Abort any in-flight chunk request before starting final processing
      abortRef.current?.abort();
      pendingRef.current = true;

      dispatch({ type: "STOP_RECORDING" });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        dispatch({ type: "SET_TRANSCRIBING", value: true });
        const transcript = await transcribeAudio(blob, controller.signal);
        dispatch({ type: "SET_TRANSCRIPT", transcript });
        dispatch({ type: "SET_TRANSCRIBING", value: false });

        dispatch({ type: "SET_GENERATING", value: true });
        const report = await generateReport(
          transcript,
          visitTypeRef.current,
          controller.signal,
        );
        dispatch({ type: "SET_REPORT", report });
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
        const report = await generateReport(
          transcript,
          visitTypeRef.current,
          controller.signal,
        );
        dispatch({ type: "SET_REPORT", report });
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
