export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
}

export const CONSENT_STORAGE_KEY = "anote_cookie_consent";
export const CONSENT_CHANGE_EVENT = "anote:consent-changed";

export const DEFAULT_CONSENT: ConsentState = {
  analytics: false,
  marketing: false,
};

export function sanitizeConsent(value: unknown): ConsentState {
  if (!value || typeof value !== "object") {
    return DEFAULT_CONSENT;
  }

  const candidate = value as Partial<ConsentState>;

  return {
    analytics: candidate.analytics === true,
    marketing: candidate.marketing === true,
  };
}

export function toConsentMode(consent: ConsentState) {
  return {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
  } as const;
}

export function getStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    return sanitizeConsent(JSON.parse(raw));
  } catch {
    return null;
  }
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
}

function pushConsentSnapshot(event: string, consent: ConsentState) {
  window.dataLayer?.push({
    event,
    consent_analytics: consent.analytics ? "granted" : "denied",
    consent_marketing: consent.marketing ? "granted" : "denied",
  });
}

export function applyConsent(consent: ConsentState, event = "consent_update") {
  if (typeof window === "undefined") return;

  ensureDataLayer();
  window.gtag?.("consent", "update", toConsentMode(consent));
  pushConsentSnapshot(event, consent);
}

export function saveConsent(consent: ConsentState) {
  if (typeof window === "undefined") return;

  const normalized = sanitizeConsent(consent);
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(normalized));
  applyConsent(normalized);
  window.dispatchEvent(
    new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: normalized }),
  );
}

export function hasAnalyticsConsent() {
  return getStoredConsent()?.analytics === true;
}
