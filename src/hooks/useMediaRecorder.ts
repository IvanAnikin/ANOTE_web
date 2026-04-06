"use client";

import { useCallback, useRef, useState } from "react";

export interface UseMediaRecorderOptions {
  /** Called every `timeslice` ms with all accumulated chunks so far */
  onChunk?: (blob: Blob) => void;
  /** Called when recording stops with the final complete blob */
  onStop?: (blob: Blob) => void;
  /** Interval in ms between ondataavailable events (default 20000) */
  timeslice?: number;
}

export interface UseMediaRecorderReturn {
  isRecording: boolean;
  isSupported: boolean;
  elapsedSeconds: number;
  start: () => Promise<void>;
  stop: () => void;
}

export function useMediaRecorder({
  onChunk,
  onStop,
  timeslice = 20_000,
}: UseMediaRecorderOptions = {}): UseMediaRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep latest callbacks in refs to avoid stale closures
  const onChunkRef = useRef(onChunk);
  onChunkRef.current = onChunk;
  const onStopRef = useRef(onStop);
  onStopRef.current = onStop;

  const isSupported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (mediaRecorderRef.current) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    chunksRef.current = [];
    setElapsedSeconds(0);

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
        const accumulated = new Blob(chunksRef.current, { type: mimeType });
        onChunkRef.current?.(accumulated);
      }
    };

    recorder.onstop = () => {
      const finalBlob = new Blob(chunksRef.current, { type: mimeType });
      onStopRef.current?.(finalBlob);
      cleanup();
      setIsRecording(false);
    };

    recorder.start(timeslice);
    setIsRecording(true);

    // Elapsed timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  }, [timeslice, cleanup]);

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  return { isRecording, isSupported, elapsedSeconds, start, stop };
}
