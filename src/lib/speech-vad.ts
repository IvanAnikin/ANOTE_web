"use client";

// Minimal, self-contained VAD wrapper around `@ricky0123/vad-web`.
//
// The integration is dynamic-import-only so the lib never enters the
// SSR bundle. Any failure (CSP block, asset 404, audio worklet failure,
// runtime error) is caught and reported via `disabled = true`, in which
// case the caller falls back to its current raw-upload behavior.
//
// Assets are pinned to a versioned jsDelivr URL so the static web app's
// CSP needs only a single host whitelist entry.

const VAD_VERSION = "0.0.30";
const ORT_VERSION = "1.24.3";
const CDN_BASE = "https://cdn.jsdelivr.net/npm";

export interface SpeechVad {
  /** When true, VAD did not initialize — caller should not filter. */
  disabled: boolean;
  /** True if any speech frame was detected since the last consume(). */
  hasSpeech: () => boolean;
  /** Reset the speech-detected flag. Call at segment boundaries. */
  consume: () => void;
  /** Free worklet, audio context, and ORT resources. */
  destroy: () => void;
}

const FALLBACK: SpeechVad = {
  disabled: true,
  hasSpeech: () => true,
  consume: () => {},
  destroy: () => {},
};

export async function createSpeechVad(stream: MediaStream): Promise<SpeechVad> {
  if (typeof window === "undefined") return FALLBACK;

  try {
    const mod = await import("@ricky0123/vad-web");
    const MicVAD = (mod as { MicVAD?: { new: (opts: unknown) => Promise<unknown> } }).MicVAD;
    if (!MicVAD?.new) return FALLBACK;

    let speechDetected = false;

    const vad = (await MicVAD.new({
      stream,
      model: "v5",
      baseAssetPath: `${CDN_BASE}/@ricky0123/vad-web@${VAD_VERSION}/dist/`,
      onnxWASMBasePath: `${CDN_BASE}/onnxruntime-web@${ORT_VERSION}/dist/`,
      positiveSpeechThreshold: 0.6,
      negativeSpeechThreshold: 0.45,
      redemptionFrames: 8,
      onSpeechStart: () => {
        speechDetected = true;
      },
      onFrameProcessed: (probs: { isSpeech?: number }) => {
        if (probs?.isSpeech !== undefined && probs.isSpeech > 0.6) {
          speechDetected = true;
        }
      },
    } as unknown as Parameters<typeof MicVAD.new>[0])) as {
      start: () => void;
      destroy: () => void;
    };

    vad.start();

    return {
      disabled: false,
      hasSpeech: () => speechDetected,
      consume: () => {
        speechDetected = false;
      },
      destroy: () => {
        try {
          vad.destroy();
        } catch {
          // Ignore cleanup errors
        }
      },
    };
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn("VAD init failed; falling back to raw upload.", err);
    }
    return FALLBACK;
  }
}
