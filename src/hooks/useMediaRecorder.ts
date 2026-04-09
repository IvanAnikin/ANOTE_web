"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseMediaRecorderOptions {
  /** Called every `timeslice` ms with a standalone audio segment */
  onChunk?: (segmentBlob: Blob) => void;
  /** Called when recording stops with the final segment */
  onStop?: (lastSegmentBlob: Blob) => void;
  /** Interval in ms between segments (default 20000) */
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
  // Default to true to avoid hydration mismatch; update client-side in effect
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined",
    );
  }, []);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentChunksRef = useRef<Blob[]>([]);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const segmentTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef("audio/webm");
  const stoppingRef = useRef(false);

  // Keep latest callbacks in refs to avoid stale closures
  const onChunkRef = useRef(onChunk);
  onChunkRef.current = onChunk;
  const onStopRef = useRef(onStop);
  onStopRef.current = onStop;

  // Minimum segment size to be considered valid audio (skip empty/tiny segments)
  const MIN_SEGMENT_BYTES = 1000;

  const cleanup = useCallback(() => {
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
    if (segmentTimerRef.current) {
      clearInterval(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  // Start a new recording segment on the existing stream.
  // Each segment produces a standalone, valid audio file.
  const startSegment = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || stoppingRef.current) return;

    currentChunksRef.current = [];
    const mimeType = mimeTypeRef.current;
    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        currentChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const segmentBlob = new Blob(currentChunksRef.current, { type: mimeType });
      if (stoppingRef.current) {
        // User requested final stop — always signal (consumer filters tiny blobs)
        onStopRef.current?.(segmentBlob);
        cleanup();
        setIsRecording(false);
      } else {
        // Periodic segment rotation — skip tiny/empty segments
        if (segmentBlob.size >= MIN_SEGMENT_BYTES) {
          onChunkRef.current?.(segmentBlob);
        }
        startSegment();
      }
    };

    recorder.start();
  }, [cleanup]);

  const start = useCallback(async () => {
    if (mediaRecorderRef.current) return;
    stoppingRef.current = false;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    setElapsedSeconds(0);

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    mimeTypeRef.current = mimeType;

    startSegment();
    setIsRecording(true);

    // Elapsed timer
    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    // Segment rotation: stop the current recorder every `timeslice` ms.
    // The onstop handler will deliver the segment via onChunk and start a new one.
    segmentTimerRef.current = setInterval(() => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive" && !stoppingRef.current) {
        recorder.stop();
      }
    }, timeslice);
  }, [timeslice, cleanup, startSegment]);

  const stop = useCallback(() => {
    // Clear segment rotation first to prevent races
    if (segmentTimerRef.current) {
      clearInterval(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }
    stoppingRef.current = true;
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  return { isRecording, isSupported, elapsedSeconds, start, stop };
}
