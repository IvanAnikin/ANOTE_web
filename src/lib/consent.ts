/**
 * Cookie consent (Google Consent Mode v2).
 *
 * The default state (everything denied) is set by an inline script in the root
 * layout before Google Tag Manager loads — see CONSENT_DEFAULT_SCRIPT. This
 * module stores the visitor's choice and sends the consent update.
 */

export type ConsentChoice = "all" | "necessary";

export const CONSENT_STORAGE_KEY = "anote_consent";
/** Ask again after 12 months. */
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
/** Window event that reopens the banner (footer "Cookie settings"). */
export const CONSENT_OPEN_EVENT = "anote:open-consent";

const GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
} as const;

const DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

/**
 * Runs in <head> before GTM. Plain ES5, no dependencies. Keep the storage key
 * and the max age in sync with the constants above.
 */
export const CONSENT_DEFAULT_SCRIPT = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
gtag('set','ads_data_redaction',true);
try{var s=JSON.parse(localStorage.getItem('${CONSENT_STORAGE_KEY}')||'null');
if(s&&s.c==='all'&&Date.now()-s.t<${CONSENT_MAX_AGE_MS}){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});}}catch(e){}
`;

export function readConsent(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as { c?: string; t?: number };
    if (stored.c !== "all" && stored.c !== "necessary") return null;
    if (typeof stored.t !== "number" || Date.now() - stored.t > CONSENT_MAX_AGE_MS) {
      return null;
    }
    return stored.c;
  } catch {
    return null;
  }
}

/** Analytics/marketing cookies that may exist from an earlier "accept all". */
const TRACKING_COOKIE_PREFIXES = ["_ga", "_gid", "_gat", "_gcl", "_fbp", "_fbc"];

function removeTrackingCookies(): void {
  const host = window.location.hostname;
  const parts = host.split(".");
  // anote.cz, .anote.cz, www.anote.cz, … — GA writes to the top-level domain.
  const domains = new Set<string>([""]);
  for (let i = 0; i < parts.length - 1; i++) {
    const d = parts.slice(i).join(".");
    domains.add(d);
    domains.add(`.${d}`);
  }

  for (const entry of document.cookie.split(";")) {
    const name = entry.split("=")[0]?.trim();
    if (!name || !TRACKING_COOKIE_PREFIXES.some((p) => name.startsWith(p))) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

export function saveConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ c: choice, t: Date.now() }),
    );
  } catch {
    // Storage blocked: the choice still applies to this page view.
  }

  window.gtag?.("consent", "update", choice === "all" ? GRANTED : DENIED);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "consent_update", consent_choice: choice });

  if (choice === "necessary") removeTrackingCookies();
}

export function openConsentSettings(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
