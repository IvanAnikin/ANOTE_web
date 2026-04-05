/* global plausible */

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string> },
    ) => void;
  }
}

/**
 * Track a custom event via Plausible Analytics.
 * No-ops gracefully when Plausible is not loaded (dev mode, ad blockers, SSR).
 */
export function trackEvent(
  name: string,
  props?: Record<string, string>,
): void {
  if (typeof window === "undefined") return;
  window.plausible?.(name, props ? { props } : undefined);
}
