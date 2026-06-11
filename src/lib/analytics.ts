/* global plausible */

import { hasAnalyticsConsent } from "@/lib/consent";

type SafeAnalyticsEvent =
  | "contact_form_submit"
  | "cta_click"
  | "demo_page_view"
  | "demo_start"
  | "demo_report_generated"
  | "pricing_view"
  | "email_click"
  | "phone_click";

type SafePayload = Partial<{
  location:
    | "hero"
    | "navbar"
    | "pricing"
    | "compact_cta"
    | "pricing_page"
    | "bottom_cta"
    | "footer"
    | "contact_page";
  method: "recording" | "upload";
}>;

const safeEvents = new Set<SafeAnalyticsEvent>([
  "contact_form_submit",
  "cta_click",
  "demo_page_view",
  "demo_start",
  "demo_report_generated",
  "pricing_view",
  "email_click",
  "phone_click",
]);

const allowedLocations = new Set<NonNullable<SafePayload["location"]>>([
  "hero",
  "navbar",
  "pricing",
  "compact_cta",
  "pricing_page",
  "bottom_cta",
  "footer",
  "contact_page",
]);

const allowedMethods = new Set<NonNullable<SafePayload["method"]>>([
  "recording",
  "upload",
]);

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string> },
    ) => void;
    dataLayer?: Array<Record<string, string> | unknown[]>;
    gtag?: (...args: unknown[]) => void;
  }
}

function sanitizePayload(props?: Record<string, string>): Record<string, string> {
  if (!props) return {};

  const next: Record<string, string> = {};
  const location = props.location as NonNullable<SafePayload["location"]> | undefined;
  const method = props.method as NonNullable<SafePayload["method"]> | undefined;

  if (location && allowedLocations.has(location)) {
    next.location = location;
  }

  if (method && allowedMethods.has(method)) {
    next.method = method;
  }

  return next;
}

export function trackEvent(name: string, props?: Record<string, string>): void {
  if (typeof window === "undefined") return;
  if (!safeEvents.has(name as SafeAnalyticsEvent)) return;

  const payload = sanitizePayload(props);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });

  if (!hasAnalyticsConsent()) return;
  window.plausible?.(name, Object.keys(payload).length ? { props: payload } : undefined);
}
