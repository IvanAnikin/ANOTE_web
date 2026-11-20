/* global plausible */

type SafeAnalyticsEvent =
  | "contact_form_submit"
  | "cta_click"
  | "demo_page_view"
  | "demo_start"
  | "demo_report_generated"
  | "pricing_view"
  | "email_click"
  | "phone_click"
  | "social_click"
  | "video_play";

type SafePayload = Partial<{
  location:
    | "hero"
    | "navbar"
    | "pricing"
    | "compact_cta"
    | "pricing_page"
    | "bottom_cta"
    | "footer"
    | "contact_page"
    | "hero_phone"
    | "demo_video"
    | "specialty_page"
    | "article";
  method: "recording" | "upload";
  network: "facebook" | "instagram";
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
  "social_click",
  "video_play",
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
  "hero_phone",
  "demo_video",
  "specialty_page",
  "article",
]);

const allowedMethods = new Set<NonNullable<SafePayload["method"]>>([
  "recording",
  "upload",
]);

const allowedNetworks = new Set<NonNullable<SafePayload["network"]>>([
  "facebook",
  "instagram",
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
  const network = props.network as NonNullable<SafePayload["network"]> | undefined;

  if (location && allowedLocations.has(location)) {
    next.location = location;
  }

  if (method && allowedMethods.has(method)) {
    next.method = method;
  }

  if (network && allowedNetworks.has(network)) {
    next.network = network;
  }

  return next;
}

export function trackEvent(name: string, props?: Record<string, string>): void {
  if (typeof window === "undefined") return;
  if (!safeEvents.has(name as SafeAnalyticsEvent)) return;

  const payload = sanitizePayload(props);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });

  window.plausible?.(name, Object.keys(payload).length ? { props: payload } : undefined);
}
