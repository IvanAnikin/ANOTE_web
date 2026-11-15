# ANOTE — Technical and Functional Description for Regulatory Classification

**Document purpose:** Factual technical input for regulatory assessment under EU MDR 2017/745, MDCG guidance on software, GDPR (Regulation 2016/679), and the EU AI Act (Regulation 2024/1689).

**Prepared from:** Codebase inspection of `/Users/ivananikin/Documents/ANOTE-web` on 2026-06-15.

**Reviewer note:** This document is factual. It does not make legal conclusions. Items that could not be verified from the codebase are marked **[UNCLEAR]** or **[UNVERIFIED]**. Items that appear incomplete or potentially risky are marked **[FLAG]**.

---

## Table of Contents

1. Product overview
2. Feature inventory
3. Medical-device risk trigger review
4. AI and LLM behaviour
5. Data flow and GDPR map
6. Architecture
7. Security controls
8. Human oversight and clinical responsibility
9. Marketing and website claims
10. EU AI Act classification support
11. MDR classification support
12. Evidence appendix

---

## 1. Product Overview

### Product name
**ANOTE** (stylised: ANOTE)

### Product description
ANOTE is an AI-powered medical documentation assistant (ambient medical scribe) designed for Czech physicians and private clinics. It records a doctor–patient conversation, transcribes the audio to text, and uses a large language model to reformat and structure that transcript into a Czech medical report draft following Czech clinical documentation standards.

### Target users
- Licensed physicians (general practitioners, internists, gastroenterologists, radiologists, other specialists)
- Healthcare staff at private clinics and outpatient practices
- Intended operator/user is always a qualified medical professional

### Target customers
- Individual private-practice physicians (Czech Republic)
- Private clinics and clinic chains (e.g., EUC, Canadian Medical, ProCare — named in marketing materials)
- Hospital departments with protocol-heavy reporting (endoscopy, radiology/ultrasound)

### Countries / markets
- Czech Republic (primary, all UI in Czech)
- Planned EU expansion: Slovakia, Austria, Germany

### Intended use (as stated in legal documents and codebase)
*From Terms of Service §2:* "ANOTE is an application for transcribing medical conversations and generating structured medical reports using artificial intelligence. The application is intended exclusively as a tool to support medical documentation."

In practice: ANOTE captures audio during a clinical encounter, transcribes the speech to text, and structures the transcript into a formatted medical report draft. The doctor must review, edit, and approve the output before it is used clinically.

### Explicitly excluded uses (from Terms, system prompts, and stated intent)
- Diagnosing patients
- Recommending treatments or medications
- Prescribing medication
- Triaging patients or prioritising urgency
- Predicting disease or health deterioration
- Risk scoring
- Replacing clinical judgement
- Sending reports directly to patients or electronic health records (EHR) without physician review

### User workflow (web demo — as inspected)
1. Physician opens the ANOTE app (mobile) or demo page at `anote-appka.cz/demo`.
2. Optionally selects visit type (auto-detect, initial examination, follow-up, gastroscopy, colonoscopy, ultrasound).
3. Taps **Record** — the browser/app captures microphone audio.
4. Audio is sent in ~20-second segments to the transcription service (Azure Whisper).
5. Partial transcript appears live in the interface.
6. The backend simultaneously generates a partial report preview (refreshed every ~30 chars of new transcript).
7. Physician taps **Stop** — final audio segment is transcribed; final report is generated.
8. Report appears in the interface, structured with labelled sections.
9. Physician reviews the draft, edits it if needed.
10. Physician copies to clipboard or downloads as `.txt`, then pastes into their EHR or sends via email.

Alternative: Physician uploads a recorded audio file (MP3, WAV, M4A, WebM, up to 25 MB). Same pipeline from step 4.

### Who uses the app?
Only the physician (or clinic staff). The patient is present during the recorded consultation but does not interact with the app. The patient does not have an account, does not receive the report directly from the app, and does not have access to the app's output.

---

## 2. Feature Inventory

| # | Feature | Where implemented | User-facing description | Input | Output | Output type | Could influence clinical decision? | Doctor must review? | Warnings / disclaimers |
|---|---------|------------------|------------------------|-------|--------|-------------|-----------------------------------|--------------------|-----------------------|
| 1 | **Audio recording** | Mobile app (Flutter, MediaRecorder); Web demo (browser MediaRecorder API, `src/hooks/useMediaRecorder.ts`) | Capture microphone audio during clinical encounter | Doctor–patient speech via microphone | Raw audio blob (WebM/Opus), segmented every 20 seconds | Administrative capture | No | N/A | Microphone permission prompt shown |
| 2 | **Speech-activity detection (VAD)** | Web demo only (`src/lib/speech-vad.ts`; `@ricky0123/vad-web` v0.0.30 with ONNX Runtime) | Filters silent audio segments to avoid wasted API calls | Audio stream | Boolean: speech detected yes/no | Administrative filter | No | N/A | None shown; falls back to raw upload on failure |
| 3 | **Local (on-device) transcription** | Mobile app only (Flutter + sherpa-onnx, Whisper Small 358 MB or Large-v3-Turbo ~1 GB) | Transcription runs entirely on the doctor's phone; audio never leaves the device | Audio | Text transcript | Transcription (no clinical interpretation) | No (output is verbatim transcription) | Implicitly yes (transcript is reviewed before report use) | "Audio neopouští zařízení" stated in UI and marketing |
| 4 | **Cloud transcription** | Web demo: Azure Whisper API via Next.js proxy (`src/app/api/demo/transcribe/route.ts`). Mobile: Azure `gpt-4o-transcribe` | Speech-to-text via Azure cloud | Audio file (≤25 MB) + language="cs" + Czech medical prompt anchor | Text transcript | Transcription (no clinical interpretation) | No (output is verbatim, prompted toward medical Czech vocabulary) | Implicitly yes | Rate limit 20 requests/hour per IP |
| 5 | **Live transcript preview** | `src/hooks/useDemoSession.ts` | Transcript updates in real time while recording | Periodic audio segments | Cumulative text transcript growing on screen | Transcription | No | No (preview only, not final) | None shown |
| 6 | **Final transcript** | `useDemoSession.ts` (`handleRecordingStop`) | Transcript of the full consultation, displayed after recording stops | Full audio | Complete text transcript | Transcription | No | Implicitly yes | None shown specifically for transcript |
| 7 | **Visit-type selection** | Web demo: `src/components/demo/VisitTypeSelector.tsx`; Mobile: app UI | Doctor selects the type of encounter (or uses auto-detect) | Doctor click/tap | Selected type label passed to backend | Administrative configuration | No | N/A | None |
| 8 | **Automatic visit-type detection** | Backend (`backend/main.py` lines 499–507) | AI infers whether the consultation is an initial exam or follow-up from the transcript content | Transcript text | Visit type selection (default → initial or followup template) | Structural classification | No (affects report template, not clinical content) | Implicitly yes | None shown |
| 9 | **Report generation** | Backend (`/report` endpoint, `backend/main.py` lines 670–825) | AI formats the transcript into a structured medical report | Text transcript + visit type + date | Structured Czech-language medical report draft | Transcription + formatting + structural organisation | **Potentially** — see Section 3 | **Yes — explicitly required by Terms §3** | "Veškerý obsah generovaných zpráv musí být zkontrolován kvalifikovaným lékařem před jakýmkoliv klinickým použitím." (Terms §3) |
| 10 | **Live report preview** | `useDemoSession.ts` (periodic regeneration during recording) | Partial report shown during recording, updated as new transcript accumulates | Partial transcript (minimum 30 chars delta) | Partial report draft | Same as report generation | Same as row 9 | Yes | "Generujeme zprávu..." status only; no extra disclaimer |
| 11 | **Report section — Identifikace pacienta** | Backend system prompt | Patient identification header (name, age/DOB, visit date) | Transcript + today's date | Structured header | Transcription | No | Yes | None |
| 12 | **Report section — NO (Nynější onemocnění)** | Backend system prompt | Chief complaint and present illness | Transcript | Structured NO section with symptom narrative, duration, modifiers | Transcription + formatting | Low (formats what was said) | Yes | None |
| 13 | **Report section — RA, OA, FA, AA, GA, SA** | Backend system prompt | Anamnesis sections (family, personal, medication, allergy, gynaecological, social) | Transcript | Structured anamnesis text | Transcription + formatting | Low (formats what was said; allergy captured verbatim) | Yes | None |
| 14 | **Report section — Adherence** | Backend system prompt | Patient compliance and cooperation | Transcript | Summary of adherence-related statements | Transcription + formatting | Low | Yes | None |
| 15 | **Report section — Objektivní nález** | Backend system prompt | Objective clinical findings (vital signs, physical examination) | Transcript | Structured objective findings | Transcription + formatting (distinguishes measured values from patient-reported subjective claims) | Low (formats what was measured/stated) | Yes | None |
| 16 | **Report section — Hodnocení** | Backend system prompt (line 211–212): "Uveď jen to, co zaznělo od lékaře (diagnóza, suspektní stav). Pokud nezaznělo: 'neuvedeno'." | Working diagnosis or clinical conclusion | Transcript (doctor's own words) | Structured assessment section | **Transcription of doctor's own diagnostic statement** — not AI-generated diagnosis | **[FLAG] Contains diagnostic content, but sourced from doctor's own speech — see Section 3** | Yes | None |
| 17 | **Report section — Návrh vyšetření** | Backend system prompt: "pouze pokud zaznělo. Jinak 'neuvedeno'." | Proposed investigations | Transcript (doctor's own words) | Structured list of planned tests | **Transcription of doctor's own instructions** — not AI-generated | **[FLAG] Contains clinical recommendations, but sourced from doctor's speech** | Yes | None |
| 18 | **Report section — Návrh terapie** | Backend system prompt: "pouze pokud zaznělo. Jinak 'neuvedeno'." | Proposed therapy | Transcript (doctor's own words) | Structured therapy plan | **Transcription of doctor's own treatment plan** — not AI-generated | **[FLAG] Contains therapeutic recommendations, but sourced from doctor's speech** | Yes | None |
| 19 | **Report section — Pokyny a plán kontrol** | Backend system prompt: "pouze pokud zaznělo. Jinak 'neuvedeno'." | Follow-up instructions | Transcript (doctor's own words) | Structured follow-up plan | Transcription | Low | Yes | None |
| 20 | **Gastroscopy report template** | Backend system prompt (`_build_sections_gastroscopy`) | Structured endoscopy report: indication, premedication, instrument, procedure, findings, conclusion, recommendations | Transcript of procedure dictation | Structured gastroscopy report | **Formatting of physician's dictation into procedure report structure** — includes clinical sub-sections (mucosal findings, pathologies, interventions) | **[FLAG] Formats clinically significant procedural findings — see Section 3** | Yes | None |
| 21 | **Colonoscopy report template** | Backend system prompt (`_build_sections_colonoscopy`) | Structured colonoscopy report | Transcript of procedure dictation | Structured colonoscopy report | Same as gastroscopy | **[FLAG] Same as gastroscopy** | Yes | None |
| 22 | **Ultrasound report template** | Backend system prompt (`_build_sections_ultrasound`) | Structured abdominal ultrasound report including organ-by-organ findings and elastography | Transcript of radiologist/sonographer dictation | Structured ultrasound report with organ sub-sections, measurements, FibroScan interpretation | **Formatting of sonographer's dictation including elastography staging (F0–F4, S0–S3)** | **[FLAG] Formats fibrosing stage classifications and organ-level pathology descriptions — see Section 3** | Yes | None |
| 23 | **Copy to clipboard** | `src/components/demo/ReportPanel.tsx` | Copy report text | Report draft | Text in clipboard | Export | No | No (occurs after doctor reviews) | None |
| 24 | **Download as .txt** | `ReportPanel.tsx` | Download report as `anote-report.txt` | Report draft | `.txt` file | Export | No | No (occurs after doctor reviews) | None |
| 25 | **Email export** | Backend (`/send-report-email` endpoint, `backend/main.py` lines 631–667) + SMTP | Email the report to a specified address | Report text + recipient email address | Email with report body | Export | No | No (doctor initiates) | Email footer: "Tato zpráva byla automaticky odeslána aplikací ANOTE." |
| 26 | **Account / login** | Mobile app (Flutter) — **[UNCLEAR — not in this codebase]** | User authentication | Credentials | Session token | Authentication | No | N/A | **[UNCLEAR]** |
| 27 | **Subscription / trial** | Mobile app + pricing page (`/cenik`) | 7-day free trial then subscription | **[UNCLEAR — payment provider not identified in codebase]** | Subscription status | Commercial | No | N/A | "7 dní zdarma. Poté měsíční předplatné. Cena bude oznámena." |
| 28 | **Web demo** | `/cs/demo` page, rate-limited, unauthenticated public access | Fully functional demonstration of transcription + report generation for website visitors | Any audio | Real structured medical report | Same as production — no mock output in production config | **Same as rows 9–19** | Yes (demo disclaimer shown) | "Demo slouží pouze pro demonstrační účely. Nepoužívejte pro skutečnou klinickou dokumentaci." |
| 29 | **Contact form** | `src/app/api/contact/route.ts`, `data/submissions.json` | Lead capture form | Name, email, optional phone and message | Entry stored to JSON file; notification email to operator | Administrative | No | N/A | GDPR consent checkbox required |
| 30 | **Admin panel** | `/admin` page + `/api/admin/submissions` API | View and export contact form submissions | Admin password | List of contact form submissions (CSV or JSON) | Administrative | No | N/A | Password protected |
| 31 | **Backend health check** | `GET /health` (no auth) | Pre-warms Container App from scale-to-zero | None | `{"status": "ok"}` | Infrastructure | No | N/A | None |
| 32 | **Test/scenario API** | `POST /test-report/{scenario_name}` (token required) | Load a demo scenario file and generate a report | Scenario `.txt` filename | Generated report for scenario | Development/testing | Same as row 9 | N/A (dev tool) | Token authenticated |
| 33 | **Error handling** | Frontend: error state displayed in UI; Backend: HTTP 4xx/5xx with detail | Surface errors to user | N/A | Error messages | Administrative | No | N/A | Rate limit errors: "Příliš mnoho požadavků. Zkuste to za chvíli." |
| 34 | **Analytics** | Plausible (server-side script), Google Tag Manager (GTM-5JCQPNZ9), `src/lib/analytics.ts` | Track page views and demo usage events | Page views, button clicks | Aggregated events: demo_page_view, demo_start, demo_report_generated | Analytics | No | N/A | "Webové stránky ANOTE nepoužívají sledovací cookies." (Privacy Policy §7) |
| 35 | **VAD / speech detection** | `src/lib/speech-vad.ts`, `@ricky0123/vad-web` (Silero VAD v5 via ONNX) | Skip sending silent audio segments | Audio frames | Speech/silence binary flag | Technical optimisation | No | N/A | None |

---

## 3. Medical-Device Risk Trigger Review

For each trigger, the assessment is based on the actual system prompt found in `backend/main.py` (lines 95–514), the UI, and the reported output structure.

### 3.1 Does the AI diagnose or suggest a diagnosis?

**Answer: No (with qualification)**

**Evidence:**
- System prompt for Hodnocení section (line 211–212): *"Uveď jen to, co zaznělo od lékaře (diagnóza, suspektní stav). Pokud nezaznělo: 'neuvedeno'."* (State only what the doctor said — diagnosis, suspected condition. If nothing was said: "not stated".)
- The AI is instructed to transcribe the doctor's own diagnostic statements, not to generate a diagnosis autonomously.
- If the doctor says nothing diagnostic, the section outputs "neuvedeno" (not stated).

**Risk qualifier:** The formatted text in the Hodnocení section may appear clinically authoritative even though it is a reformatted version of what the doctor said aloud. A reviewer relying on this output without understanding it is a transcription may treat it as having more weight than intended.

**[FLAG]** The static showcase example on the website (`cs.json` lines 108–118) shows a Hodnocení entry "Suspektní akutní bronchitida, v.s. infekční etiologie. Diferenciálně komunitní pneumonie." (Suspected acute bronchitis, likely infectious etiology. Differential: community-acquired pneumonia.) This is a **hand-authored marketing example**, not actual AI output from the dialogue shown. The dialogue transcript does not include the doctor stating this diagnosis. This creates a misleading impression of what the AI generates independently.

**Suggested mitigation:** Remove or correct the showcase example so it accurately reflects what would appear from the provided dialogue. Add label "Ilustrativní příklad" (Illustrative example only).

---

### 3.2 Does the AI predict disease or health deterioration?

**Answer: No**

**Evidence:** No system prompt section, no output structure, and no feature instructs the model to generate prognostic predictions. The AI is source-grounded — it outputs "neuvedeno" for any section where the doctor said nothing.

---

### 3.3 Does the AI recommend treatment?

**Answer: No (with qualification)**

**Evidence:**
- System prompt for Návrh terapie (line 217–219): *"Léčba, medikace, režimová opatření – pouze pokud zaznělo. Jinak 'neuvedeno'."* (Treatment, medication, lifestyle measures — only if mentioned. Otherwise "not stated".)
- Treatment recommendations in the output are transcriptions of what the doctor said.

**[FLAG]** The Gastroscopy template includes a "Doporučení" section that lists "Medikace (inhibitor protonové pumpy – název, dávka, délka podávání)" (Medication — PPI, name, dose, duration). The template prompts the AI to extract and structure this from the transcript. The model is thus instructed to identify, extract, and format specific medication details from the doctor's dictation. This is structured reformatting, not autonomous recommendation, but the output is formatted as a clinical recommendation.

**[FLAG]** The static showcase example (`cs.json` line 118) includes "Amoxicilin + kys. klavulanová (s ohledem na alergii na penicilin zvážit alternativu — klarithromycin)." The example dialogue does NOT include the doctor stating this treatment plan — the AI appears to have generated a clinical recommendation (or the showcase example was authored manually). In either case, this is a publicly visible example that suggests the AI generates treatment recommendations, which is a regulatory risk even if the AI does not do so in practice.

**Suggested mitigation:** Correct the showcase example. In all templates, add a note that the Návrh terapie section reproduces what was said in the consultation.

---

### 3.4 Does the AI recommend medication or dosage?

**Answer: No (with qualification)**

**Evidence:** Same as 3.3. The AI captures medication names, dosages, and regimens from the transcript. In the gastroscopy and colonoscopy templates, dosage and duration are explicitly prompted fields that the AI fills from the transcript.

**[FLAG]** The level of medication information captured (name, dose, frequency, duration) in structured form is clinically significant. Transcription errors in the ASR layer could propagate into the structured medication field. The system prompt acknowledges this: *"Přepis může obsahovat chyby z automatického rozpoznávání řeči — interpretuj smysl, ne doslovný text."* (Transcript may contain ASR errors — interpret the meaning, not the literal text.) This means the model may **correct** or **interpret** medication names and dosages rather than transcribing them verbatim. This introduces a small but non-zero risk of model-introduced errors in dosage information.

**Suggested mitigation:** Add explicit UI disclaimer that all medication details must be verified by the physician before use. Consider instructing the model NOT to interpret medication names and dosages, but to transcribe them verbatim (flagging unclear transcription with "ASR chyba?" rather than guessing).

---

### 3.5 Does the AI prioritise urgency or perform triage?

**Answer: No**

**Evidence:** No feature, prompt section, or output structure involves urgency scoring, triage classification, or urgency signals. No RED flag or alert system exists in the output.

**Exception — Colonoscopy template:** The Doporučení section includes: "Varovné příznaky: bolesti břicha, zvracení, krvácení z konečníku, teplota, zimnice → vyhledat lékařskou péči / linka 155" (Warning signs: abdominal pain, vomiting, rectal bleeding, fever → seek medical care / call 155). This is a standard post-procedure safety instruction that the AI is asked to extract from the doctor's dictation. The model does not autonomously generate this list — it appears in the structural template and is populated from the transcript. However, this instruction is pre-baked into the template structure, meaning the model is prompted to produce this content.

**[FLAG]** The colonoscopy template's Doporučení section includes a partial pre-authored safety instruction list in the template guidance (lines 398–401). The model may include or expand these in the output even if the doctor did not explicitly dictate them, because the structural prompt lists them as expected output fields. This should be verified empirically.

---

### 3.6 Does the AI score clinical risk?

**Answer: No**

**Evidence:** No risk score calculation, no validated clinical scale (HEART, NEWS, CHADS2, etc.), no risk stratification output.

---

### 3.7 Does the AI interpret medical findings beyond rewriting what was said?

**Answer: Partially — for ultrasound and endoscopy report types**

**Evidence:**
- The ultrasound template includes: "FibroScan: medián (kPa), IQR/med (%), stupeň fibrózy (F0–F4)" (lines 454–456) and "Závěr: Hlavní diagnózy (steatóza, steatofibróza, normální nález apod.). Stupeň fibrózy a steatózy dle elastografie (pokud provedena)."
- The model is prompted to extract and structure fibrosing stage classifications (F0–F4) and steatosis grade (S0–S3) from the transcript.
- This goes beyond pure verbatim transcription — it involves identifying and assigning structured classifications to measured values.

**[FLAG]** If the sonographer dictates "ARFI 1.4 m/s, IQR 15%, FibroScan 8.2 kPa" but does not explicitly state the fibrosis stage, the model (following the template) may be prompted to infer or calculate the stage. Whether it does this in practice requires empirical testing. The system prompt does say "Pokud orgán nebyl zmíněn: 'nevyšetřeno'" (if not mentioned, write "not examined") but the elastography section template explicitly lists the classification outputs as expected fields.

**Suggested mitigation:** Add explicit instruction that fibrosing stage must only be populated if the doctor/sonographer explicitly stated it. Do not allow the model to infer a stage from a kPa value alone.

---

### 3.8 Does the AI detect abnormalities?

**Answer: No — the AI does not perform image analysis or autonomous signal processing**

The AI processes natural-language text transcripts only. It does not analyse medical images, ECG signals, lab values, or physiological data.

**Qualification:** The ASR model (Whisper) processes audio signals. It is not performing clinical interpretation of the audio — it is performing speech-to-text conversion. However, a Whisper prompt anchor *"Lékařská zpráva. Pacient udává obtíže, anamnéza, vyšetření, diagnóza, doporučení."* (`src/app/api/demo/transcribe/route.ts` lines 75–77) biases Whisper toward medical vocabulary. This is a transcription quality measure, not clinical interpretation.

---

### 3.9 Does the AI recommend referral to a specialist?

**Answer: No (with qualification)**

**Evidence:** The system prompt does not instruct the model to generate referral recommendations. However, if the doctor says "I'm referring you to a cardiologist," the model will transcribe that into the appropriate section.

---

### 3.10 Does the AI make patient-specific clinical recommendations?

**Answer: Not autonomously — it formats the doctor's own statements**

The AI does not have access to any patient database, EHR, or history beyond the current consultation transcript. All content in the report is derived from the transcript. The model does not add patient-specific clinical content from its training data.

**[FLAG]** The system prompt's instruction to "interpretuj smysl, ne doslovný text" (interpret meaning, not literal text) in the context of ASR error correction means the model is allowed to make small inferential leaps when the transcript is garbled. In a medication context, this could result in a model-inferred drug name or dosage that differs from what was said.

---

### 3.11 Does the AI generate content that could be mistaken as final medical advice?

**Answer: Yes — the output format is indistinguishable from a completed medical record**

**Evidence:** The output is structured identically to a formal Czech medical report using standard Czech clinical document sections (NO, RA, OA, FA, AA, GA, SA, Objektivní nález, Hodnocení, Návrh vyšetření, Návrh terapie, Pokyny). The formatting is professional. No watermark, AI-generated badge, or draft label appears in the body of the exported report.

**[FLAG]** When exported (copy to clipboard, download as `.txt`, or email), the report contains no indication that it was AI-generated. A recipient (e.g., consultant receiving the report by email) cannot distinguish it from a manually typed report. The Terms of Service disclaimer is not included in the exported document.

**The email body does include one footer:** *"Tato zpráva byla automaticky odeslána aplikací ANOTE."* (This report was automatically sent by the ANOTE application.) However, this does not clearly state that the content itself is AI-generated and requires physician review.

**Suggested mitigation:** Prepend a disclaimer line to the exported/emailed report, e.g.: *"NÁVRH — Vygenerováno aplikací ANOTE na základě přepisu konzultace. Zkontrolovat a schválit před klinickým použitím." (DRAFT — Generated by ANOTE from consultation transcript. Review and approve before clinical use.)*

---

## 4. AI and LLM Behaviour

### 4.1 Which AI models are used?

| Component | Model | Provider | Mode |
|-----------|-------|----------|------|
| Speech-to-text (mobile, local) | Whisper Small (358 MB) or Large-v3-Turbo (~1 GB) | OpenAI model weights, run locally via sherpa-onnx | Fully on-device, no network |
| Speech-to-text (web demo, cloud) | `whisper` deployment on Azure OpenAI | Microsoft Azure (`anote-openai.openai.azure.com`) | Cloud, West Europe |
| Speech-to-text (mobile, cloud mode) | `gpt-4o-transcribe` (per marketing) | Microsoft Azure | Cloud, West Europe |
| Report generation (primary) | `gpt-4-1-mini` (env var `AZURE_OPENAI_DEPLOYMENT`, default `gpt-4-1-mini`) | Microsoft Azure OpenAI (`anote-web-api` container) | Cloud, West Europe |
| Report generation (fallback) | `gpt-5-nano` (env var `AZURE_OPENAI_FALLBACK_DEPLOYMENT`) | Microsoft Azure OpenAI | Cloud, West Europe |
| Report generation (dev fallback) | `gpt-4-1-mini` (env var `OPENAI_CHAT_MODEL`) | OpenAI API (non-Azure) | Cloud |

**[FLAG] Model name discrepancy:** Marketing materials (`MARKETING.md` §5) state the primary model is "GPT-5-chat" and fallback is "gpt-4o-mini". The code (`backend/main.py` lines 59–61) shows default `CHAT_MODEL = gpt-4-1-mini` and `FALLBACK_MODEL = gpt-5-nano`. These are different model identifiers. The actual deployed model depends on the Azure OpenAI deployment name set in the environment variable `AZURE_OPENAI_DEPLOYMENT`. This should be reconciled before regulatory submissions.

### 4.2 Local vs. cloud processing

| Processing step | Local (on-device) | Cloud |
|----------------|-------------------|-------|
| Audio capture | Always local (browser/app) | — |
| Transcription — mobile local mode | Yes (Whisper via sherpa-onnx) | No |
| Transcription — mobile cloud mode | No | Azure OpenAI (West Europe) |
| Transcription — web demo | No | Azure OpenAI (West Europe) |
| Report generation | No | Azure OpenAI via FastAPI backend (Azure Container Apps, West Europe) |

**The web demo always uses cloud transcription and cloud report generation.** The mobile app supports an on-device local mode for transcription, with cloud report generation always required.

### 4.3 Prompt templates

The complete system prompt is built dynamically in `backend/main.py` function `_build_system_prompt()` (lines 466–514). It is composed of:
1. A role introduction
2. A ZÁSADY (rules) block (`_build_base_rules()`, lines 95–144)
3. A visit-type-specific structural template
4. A language footer

#### Full ZÁSADY block (rules, lines 99–144):

```
ZÁSADY
- Nevymýšlej ani nedoplňuj informace, které v přepisu nejsou.
- Pokud informace chybí, napiš přesně: „neuvedeno".
- Pokud je něco výslovně popřeno (typicky po dotazu lékaře), zaznamenej to jako NEGACI.
  Negace má přednost před „neuvedeno". Používej formulace jako:
  • „alergie neguje"
  • „zvýšenou teplotu neguje"
  • [further examples of negation phrasings]
- U chronických onemocnění aktivně zaznamenávej negace komplikací (těžké hypoglykémie,
  noční hypoglykémie, retinopatie, neuropatie apod.), pokud byly výslovně popřeny.
- Rozlišuj „pacient výslovně popřel" vs „nebylo zmíněno".
- Zachovej přesná čísla, jednotky, dávkování a frekvenci (mg, ml, 1–0–1, 2× denně, týdny…).
- Aktivně zachycuj přibližné údaje: dobu trvání (asi 3 měsíce), četnost (2× týdně),
  hmotnostní změny, dávkování, naměřené hodnoty. Zachovej formulaci s „asi" / „přibližně".
- Rozlišuj subjektivní údaje (udává pacient) vs objektivní nález (naměřeno / zjištěno).
- Při rozporu v přepisu uveď obě verze a označ „rozpor v přepisu".
- Přepis může obsahovat chyby z automatického rozpoznávání řeči — interpretuj smysl,
  ne doslovný text.
- V přepisu se střídají repliky lékaře a pacienta. Otázky, pokyny a diagnózy přiřaď lékaři.
  Odpovědi a subjektivní popisy přiřaď pacientovi.
- U změn medikace nebo léčby zaznamenej, kdo změnu doporučil (jiný lékař, specialista).
- Rozlišuj ALERGII (imunitní reakce) a INTOLERANCI / nesnášenlivost (nežádoucí účinek).
- Preferovaná terminologie u poslechového nálezu plic: „chrůpky" (nikoli „chropy").
- Děti pacienta patří do RA (Rodinná anamnéza), NE do SA.
- DŮKLADNĚ projdi celý přepis. Raději uveď informaci navíc, než aby chyběla.
```

#### User prompt (identical for all visit types):
```
Převeď tento přepis do strukturované lékařské zprávy v češtině:

{transcript}
```

#### Role introduction:
```
Jsi asistent pro tvorbu lékařské dokumentace. Z poskytnutého přepisu [návštěvy/vyšetření]
vytvoř formální lékařskou zprávu v češtině.
```

### 4.4 Hidden instructions

None found. The complete system prompt is constructed in clear Python code in `backend/main.py`. There are no additional hidden instructions, secondary system messages, or injection mechanisms.

### 4.5 Fine-tuning or RAG

**No.** No fine-tuning, retrieval-augmented generation, vector databases, knowledge bases, or external clinical guidelines are referenced in the codebase. The model uses only its pre-training knowledge plus the in-context structural templates. No patient history, EHR data, or clinical database is accessed.

### 4.6 Patient data sent to third-party APIs

| Data | Sent to | Notes |
|------|---------|-------|
| Audio (web demo) | Azure OpenAI Whisper API (`anote-openai.openai.azure.com`, West Europe) | Sent for transcription, not stored (per Microsoft Azure OpenAI zero-retention policy for API calls, and per ANOTE Privacy Policy) |
| Text transcript | Azure OpenAI Chat Completions API (via FastAPI backend on Azure Container Apps, West Europe) | Sent for report generation; explicitly not logged in code (line 692: "transcript and report content are deliberately NOT logged (GDPR)") |
| Audio (mobile local mode) | Not sent externally | Stays on device |
| Contact form data | Gmail SMTP → operator email (ianikin2002@gmail.com) | Name, email, phone, message |

**[FLAG]** The web demo also loads Google Tag Manager (GTM-5JCQPNZ9) and Facebook/Meta pixel (configured via GTM, visible in the CSP allow-list). GTM and Meta pixel may collect page-level analytics data including the fact that the user visited the demo page and generated a report (`demo_report_generated` event). No medical content is passed to these analytics providers, but the analytics event names could reveal that a user performed a medical documentation task.

### 4.7 Data used for training

**Per Privacy Policy §2.3 and MARKETING.md §5:** "Data nejsou uchovávána na serverech a nejsou používána k trénování modelů." (Data is not stored on servers and is not used for model training.)

This relies on Microsoft Azure OpenAI's terms, which provide a zero-retention / no-training guarantee when the data processing addendum (DPA) is in place. **[UNVERIFIED]** Whether the appropriate Azure OpenAI DPA has been signed by the operator has not been verified from the codebase.

### 4.8 Zero-retention settings

The backend explicitly does not log transcript or report content (line 692). Azure OpenAI provides zero-retention for API calls when the appropriate subscription tier and settings are used. **[UNVERIFIED]** The specific Azure OpenAI configuration (data processing terms, whether "abuse monitoring" is enabled or opted out) was not inspectable from the codebase.

### 4.9 Output determinism

The model API is called with no explicit `temperature` parameter set. The OpenAI/Azure OpenAI default temperature for `gpt-4` class models is typically 1.0. No `seed` parameter is used. Outputs are **non-deterministic** — the same transcript may produce slightly different reports on repeated calls. The streaming implementation adds further variation because the model generates tokens sequentially.

### 4.10 Hallucination controls

**Present:**
- "Nevymýšlej ani nedoplňuj informace, které v přepisu nejsou." (Do not invent or add information not in the transcript)
- "Pokud informace chybí, napiš přesně: 'neuvedeno'." (If information is missing, write "not stated")
- "Raději uveď informaci navíc, než aby chyběla." (Prefer to include extra information rather than omit)
- Source-grounded: all clinical sections are explicitly scoped to "pouze pokud zaznělo" (only if mentioned in transcript)
- Conflict handling: "Při rozporu v přepisu uveď obě verze a označ 'rozpor v přepisu'." (If transcript contradicts itself, state both versions and mark "contradiction in transcript")

**Absent:**
- No retrieval mechanism to ground against external clinical sources
- No secondary model to verify outputs
- No output validation or clinical plausibility check
- No confidence scores or uncertainty markers in the output
- No detection of ASR hallucinations (Whisper is known to hallucinate text on low-energy or silent audio; the VAD feature partially mitigates this for silent segments)

**[FLAG]** The instruction "interpretuj smysl, ne doslovný text" (interpret meaning, not literal text) is a hallucination mitigation for ASR errors, but it also gives the model licence to paraphrase or interpret. In a medication or dosage context, this interpretation could introduce clinical errors.

---

## 5. Data Flow and GDPR Map

### 5.1 Scope

This section covers data from the **web application** perspective. The mobile app has additional on-device data (recording history, local transcripts) that are **outside the scope of this codebase** and should be assessed separately from the mobile app repository.

### 5.2 Data flow diagram (text form)

```
[Doctor's device: browser / phone]
    |
    | 1. Audio captured by MediaRecorder API (stays in RAM)
    v
[Audio blob: 20-second segments]
    |
    | 2. POST /api/demo/transcribe (multipart/form-data, audio blob)
    |    ← rate limited per IP (20 req/hour)
    v
[Next.js API route: src/app/api/demo/transcribe/route.ts]
    |
    | 3. POST to Azure Whisper API (HTTPS, West Europe)
    |    Headers: api-key (server-side env var, never exposed to client)
    |    Body: audio file + language="cs" + Czech medical prompt anchor
    v
[Azure OpenAI Whisper endpoint: anote-openai.openai.azure.com]
    |
    | 4. Returns: {"text": "transcribed text..."}
    v
[Next.js returns transcript to browser]
    |
    | 5. Browser accumulates transcript segments into full transcript
    |
    | 6. POST /api/demo/report (or /api/demo/report?stream=1)
    |    Body: {transcript, visit_type}
    v
[Next.js API route: src/app/api/demo/report/route.ts]
    |
    | 7. POST to FastAPI backend: https://anote-web-api.[...].westeurope.azurecontainerapps.io/report
    |    Headers: Authorization: Bearer {ANOTE_API_TOKEN} (server-side)
    |    Body: {transcript, language:"cs", visit_type}
    v
[FastAPI backend: backend/main.py — Azure Container Apps, West Europe]
    |
    | 8. Builds system prompt (visit type, today's date)
    | 9. Sends to Azure OpenAI Chat Completions API (HTTPS)
    |    Messages: [system: <prompt>, user: "Převeď tento přepis..."]
    |    Model: CHAT_MODEL (gpt-4-1-mini or configured deployment)
    |    max_completion_tokens: 4096
    v
[Azure OpenAI Chat endpoint — West Europe]
    |
    | 10. Returns generated report (streaming or JSON)
    v
[FastAPI streams/returns report to Next.js → Next.js forwards to browser]
    |
    | 11. Report displayed in browser for doctor review
    |
    | 12a. Doctor copies to clipboard → pastes into EHR (no further ANOTE involvement)
    | 12b. Doctor downloads anote-report.txt (no ANOTE server involvement)
    | 12c. Doctor triggers email export → POST /send-report-email
    v
[FastAPI: sends report via SMTP (smtp.gmail.com or configured SMTP)]
    → Email delivered to doctor's email address

[Separate: Contact form]
[Doctor fills contact form → POST /api/contact]
    → Submission stored to data/submissions.json (local filesystem on Azure SWA)
    → Notification email sent to ianikin2002@gmail.com via SMTP
```

### 5.3 Data inventory table

| Data item | Category | Example | Source | Destination | Storage location | Retention | Encrypted in transit | Encrypted at rest | Access | Deletion | Personal data? | Health data (Art 9)? | Leaves device? | Leaves EU/EEA? |
|-----------|----------|---------|--------|-------------|-----------------|-----------|---------------------|------------------|--------|----------|---------------|---------------------|---------------|----------------|
| Audio recording (web demo) | Health-related personal data | Doctor–patient conversation audio | Browser microphone | Azure Whisper API | RAM only (Next.js process buffer); **not stored to disk or database** | Session only; deleted after transcription | HTTPS/TLS | N/A (in transit only) | ANOTE backend + Azure OpenAI | Automatic (end of API call) | Yes (voice data of patient and doctor) | **Yes** (conversation contains patient health information) | Yes (leaves browser; leaves Azure region) | No (Azure West Europe) |
| Audio recording (mobile local) | Health-related personal data | Same | Phone microphone | On-device only | Phone RAM during processing; **never transmitted** | Session only unless saved locally | N/A | Flash/RAM on device | Doctor only (device owner) | When doctor deletes from app | Yes | **Yes** | No | No |
| Text transcript | Health-related personal data | "Pacient udává 5 dní trvající kašel…" | Whisper ASR output | Azure OpenAI Chat endpoint via FastAPI | **Not stored** — passed in API call only; explicitly not logged | Duration of API call only | HTTPS/TLS | N/A | ANOTE backend + Azure OpenAI | Automatic | Yes | **Yes** | Yes (leaves browser; goes to backend + Azure) | No (Azure West Europe) |
| Generated medical report | Health-related personal data | Structured report with sections NO, FA, Hodnocení… | Azure OpenAI output | Browser (displayed); optionally email | **Not stored on server** — returned to client only | Duration of API call only; client-side RAM until page reload | HTTPS/TLS | N/A | ANOTE backend + Azure OpenAI during generation; doctor's device after | Automatic on server side; doctor controls client-side copy | Yes | **Yes** | Yes (generated in cloud) | No (Azure West Europe) |
| Patient name (if dictated) | Personal data (identifiable) | "Pacientka Jana Nováková" | Doctor's speech during consultation | Within transcript → report | Not stored by ANOTE | Same as transcript | Same as transcript | N/A | Same as transcript | Same as transcript | Yes | **Yes** | Yes | No |
| Doctor email address (email export) | Personal data | lekarna@klinika.cz | Doctor input in app | SMTP server | Email server of recipient | As per email provider | STARTTLS (SMTP_USE_TLS=true default) | On email server | Doctor + email provider | Manual by doctor | Yes | No | Yes | **Potentially** (Gmail SMTP for demo; depends on deployment) |
| Contact form: name, email, phone | Personal data | "MUDr. Jan Novák, jan@klinika.cz" | Contact form submission | `data/submissions.json` | **Local filesystem on Azure Static Web App** (West Europe) | Max 12 months (per Privacy Policy §5) | HTTPS/TLS | Azure SWA managed storage | Admin panel (ADMIN_SECRET password) | Manual deletion by operator | Yes | No | Yes (submitted over HTTPS) | No (Azure West Europe) |
| Contact form: message text | Potentially health-related | "Chci ANOTE pro endoskopické centrum" | Contact form | `data/submissions.json` | Same as above | Same as above | Same | Same | Same | Same | Yes | Potentially | Yes | No |
| Plausible analytics events | Non-personal (aggregated) | demo_start, demo_report_generated | Browser | Plausible Analytics server | Plausible server | Per Plausible retention settings | HTTPS | Plausible-managed | Operator + Plausible | Per Plausible policy | No (no PII) | No | Yes | **[UNCLEAR — Plausible EU/US servers]** |
| Google Tag Manager + Meta pixel | Potentially personal | Page URL, IP address, browser fingerprint | Browser | Google + Facebook/Meta servers | Google/Meta servers | Google/Meta retention | HTTPS | Google/Meta-managed | Google, Meta, Operator | Per Google/Meta policies | Yes (IP address) | No | Yes | **Yes — US servers** |
| API token | Administrative credential | Bearer token in HTTP header | Env var | Next.js → FastAPI | Env vars only | Indefinite (until rotated) | HTTPS | Server-side env var | ANOTE developer | Manual rotation | No | No | Yes (in HTTP headers, server-side) | No |
| Crash / error logs | Technical data | HTTP 502 from Azure OpenAI | Backend logger | Azure Container Apps logs | Azure Monitor / application logs | Azure default retention | HTTPS | Azure-managed | ANOTE developer | Azure log management | No (transcript content explicitly not logged) | No | Yes | No |

### 5.4 Key GDPR findings

1. **Legal basis for processing health data is unclear.** The Privacy Policy states Art. 6(1)(a) (consent) and Art. 6(1)(f) (legitimate interest). For **health data (Art. 9 GDPR)**, only Art. 9(2)(h) (medical care purposes, under professional secrecy) or Art. 9(2)(a) (explicit consent) are typically available. The current Privacy Policy does not address Art. 9. **[FLAG — legal review required]**

2. **Data controller is identified only as "provozovatel aplikace ANOTE" with contact email.** No company name, address, or registration number is provided. GDPR Art. 13 requires the full identity of the data controller. **[FLAG]**

3. **No DPA (Data Processing Agreement) documentation** with Azure/Microsoft was found in the codebase or referenced in the Privacy Policy. Processing health data on Azure OpenAI requires a DPA. **[FLAG — verify DPA is signed]**

4. **Google Analytics / Meta pixel** may capture IP addresses and browser fingerprints that constitute personal data under GDPR. The Privacy Policy states "Webové stránky ANOTE nepoužívají sledovací cookies" (no tracking cookies). GTM loads Facebook pixel, which may set cookies. **[FLAG — inconsistency with Privacy Policy claim]**

5. **Contact form data** (`data/submissions.json`) is stored on the server filesystem. Deletion process is unclear — no automated deletion after 12 months is implemented in code. **[FLAG]**

6. **Patient data (transcript, report) is processed on behalf of the physician.** Under GDPR, ANOTE may be a **data processor** (acting on behalf of the physician who is the data controller). No processor agreement model is implemented. **[FLAG — legal review required]**

---

## 6. Architecture

### 6.1 System components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DOCTOR'S DEVICE                                  │
│                                                                         │
│  ┌─────────────────────────┐    ┌──────────────────────────────────┐   │
│  │ Mobile App (Flutter)    │    │ Browser (Web Demo)                │   │
│  │ iOS / Android           │    │ Next.js 16.2.2 SPA               │   │
│  │                         │    │ React 19, Tailwind CSS 4          │   │
│  │ - Local Whisper (ONNX)  │    │ Framer Motion 12                 │   │
│  │ - on-device STT         │    │ MediaRecorder API                │   │
│  │ - report editing UI     │    │ VAD (@ricky0123/vad-web)         │   │
│  │ - recording history     │    │                                  │   │
│  └────────────┬────────────┘    └──────────────┬───────────────────┘   │
└───────────────┼──────────────────────────────────┼─────────────────────┘
                │ HTTPS                            │ HTTPS
                ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     AZURE WEST EUROPE                                    │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Azure Static Web Apps                                            │  │
│  │ anote-appka.cz (canonical) / yellow-forest-086a45303.7.azurestaticapps.net │
│  │                                                                  │  │
│  │ Next.js App Router                                               │  │
│  │ ├── /[lang]/* — marketing pages (CS + EN)                       │  │
│  │ ├── /admin — admin panel                                        │  │
│  │ └── /api/*                                                      │  │
│  │      ├── /api/contact → stores to data/submissions.json         │  │
│  │      ├── /api/admin/submissions → reads submissions.json        │  │
│  │      ├── /api/demo/transcribe → proxy to Azure Whisper          │  │
│  │      ├── /api/demo/report → proxy to FastAPI backend            │  │
│  │      └── /api/demo/health → pre-warm FastAPI                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Azure Container Apps: anote-web-api                              │  │
│  │ Resource group: anote-rg, West Europe                            │  │
│  │ Image: ca859739e5daacr.azurecr.io/anote-web-api:<tag>           │  │
│  │                                                                  │  │
│  │ FastAPI (Python 3.12, uvicorn)                                   │  │
│  │ ├── GET  /health — unauthenticated health check                  │  │
│  │ ├── GET  /scenarios — list demo scenario files                   │  │
│  │ ├── POST /report — generate medical report (Bearer auth)         │  │
│  │ ├── POST /send-report-email — email report (Bearer auth)         │  │
│  │ └── POST /test-report/{name} — dev/test (Bearer auth)           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Azure OpenAI: anote-openai.openai.azure.com                      │  │
│  │ Deployments:                                                     │  │
│  │  - whisper — audio transcription (Whisper model)                 │  │
│  │  - [AZURE_OPENAI_DEPLOYMENT] — chat/report generation            │  │
│  │  - [AZURE_OPENAI_FALLBACK_DEPLOYMENT] — fallback chat model      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Azure Container Registry: ca859739e5daacr.azurecr.io            │  │
│  │ Stores Docker images for the FastAPI backend                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│               THIRD-PARTY SERVICES (outside Azure West Europe)          │
│                                                                         │
│  Plausible Analytics — privacy-first, no cookies (server location: [UNCLEAR])│
│  Google Tag Manager (GTM-5JCQPNZ9) — US                               │
│  Facebook/Meta pixel — US                                              │
│  Gmail SMTP (smtp.gmail.com) — US (for contact form notifications)      │
│  jsDelivr CDN (cdn.jsdelivr.net) — global CDN (for VAD/ONNX assets)   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 APIs and endpoints

| Method | Path | Auth | Rate limit | Description |
|--------|------|------|-----------|-------------|
| GET | `/health` | None | None | Backend health check |
| GET | `/scenarios` | None | None | List demo scenario names |
| POST | `/report` | Bearer token | None (rely on Next.js rate limiter) | Generate structured medical report |
| POST | `/report?stream=1` | Bearer token | None | Generate report with SSE streaming |
| POST | `/send-report-email` | Bearer token | None | Email report via SMTP |
| POST | `/test-report/{name}` | Bearer token | None | Dev: generate report from scenario file |
| POST | `/api/demo/transcribe` | None (Next.js API route) | 20 req/hour/IP | Proxy to Azure Whisper |
| POST | `/api/demo/report` | None (Next.js API route) | 30 req/hour/IP | Proxy to FastAPI /report |
| GET | `/api/demo/health` | None | None | Pre-warm backend |
| POST | `/api/contact` | None | 5 req/hour/IP | Contact form submission |
| GET | `/api/admin/submissions` | ADMIN_SECRET | None | Get contact submissions |

### 6.3 Authentication

- **Backend ↔ Next.js:** Bearer token (`ANOTE_API_TOKEN`) transmitted in HTTP Authorization header. Token is a static secret stored in environment variables.
- **Admin panel:** Single shared password (`ADMIN_SECRET`) transmitted as URL query parameter or HTTP header. **[FLAG] Transmitting secrets in URL query strings is a security risk — query strings appear in server logs and browser history.**
- **End users (web demo):** No authentication required. Public access with IP-based rate limiting.
- **Mobile app:** **[UNCLEAR — not in this codebase]** — authentication is implemented in the Flutter mobile app and its separate backend.

### 6.4 Storage

- **No medical data stored at rest** — transcripts and reports are processed in-memory/in-transit only.
- **Contact form submissions:** `data/submissions.json` on the Azure Static Web App filesystem. No encryption at rest beyond Azure platform default.
- **Mobile app — recording history:** Stored locally on user's device. **[UNCLEAR — format and encryption not inspectable from this codebase]**

### 6.5 Cloud providers and regions

| Service | Provider | Region |
|---------|----------|--------|
| Web hosting | Azure Static Web Apps | West Europe |
| FastAPI backend | Azure Container Apps | West Europe |
| Container registry | Azure Container Registry | West Europe |
| AI / LLM | Azure OpenAI | West Europe |
| SMTP (demo/contact) | Gmail (smtp.gmail.com) | United States |
| Analytics | Plausible | **[UNCLEAR]** |
| Analytics | Google Tag Manager + GA | United States |
| Analytics | Meta pixel | United States |
| VAD model assets | jsDelivr CDN | Global CDN |

### 6.6 CI/CD

- GitHub Actions workflow: `.github/workflows/azure-static-web-apps-yellow-forest-086a45303.yml`
- Triggers: push to `main`, pull request to `main`
- Steps: `npm ci`, `tsc --noEmit` (type check), `npm run build`, deploy to Azure SWA
- Backend (FastAPI) deployed manually via `az acr build` + `az containerapp update`
- No automated tests found in the codebase for the web project

### 6.7 Monitoring and error reporting

- Backend: Python `logging` module, INFO level. Logs go to Azure Container Apps console/log stream.
- Frontend: `console.error()` for API errors. No structured error reporting service (e.g., Sentry) found.
- **[FLAG] No monitoring dashboards, alerting, or incident notification configured in codebase.**

### 6.8 Secrets management

- Secrets stored in environment variables:
  - Azure SWA: App Settings in Azure Portal (injected as env vars)
  - FastAPI: via Container App environment variable configuration
- Local development: `.env.local` file (not committed to git per `.gitignore`)
- **[FLAG] `.env.local` was found readable in the local filesystem and contains live API keys including `AZURE_WHISPER_KEY` and `ANOTE_API_TOKEN`. This is standard for local development but should not be committed or exposed.**

---

## 7. Security Controls

### 7.1 Existing controls

| Control | Status | Details |
|---------|--------|---------|
| HTTPS/TLS | ✅ Present | Azure SWA enforces HTTPS. SMTP uses STARTTLS (configurable) |
| Security headers | ✅ Present | X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy: camera=(), geolocation=() |
| Content Security Policy | ✅ Present | `staticwebapp.config.json`: restricts connect-src to self + listed Azure and analytics domains |
| Bearer token auth (backend) | ✅ Present | Static token in Authorization header; HTTPException 401 on mismatch |
| IP-based rate limiting | ✅ Present (limited) | In-memory Map; resets on process restart; 20 transcribe + 30 report per IP/hour; 5 contact per IP/hour |
| Input validation | ✅ Present | File size (25 MB), MIME type check, Pydantic models on backend, Zod schema on contact form |
| Microphone permission | ✅ Present | Browser MediaRecorder API requires explicit user permission |
| No audio storage on server | ✅ Present | Confirmed in code: audio never written to disk |
| No transcript/report logging | ✅ Present | Explicit comment in backend (line 692) |
| Admin panel password protection | ✅ Present (weak) | Single shared ADMIN_SECRET |
| Request size limits | ✅ Present | 25 MB audio file limit enforced in Next.js route |

### 7.2 Missing or weak controls

| Gap | Risk | Priority |
|-----|------|----------|
| CORS: backend allows `allow_origins=["*"]` | High — any origin can call the FastAPI backend directly with a valid token | High |
| Admin secret passed in URL query parameter | Medium — appears in server logs, browser history, referrer headers | High |
| In-memory rate limiting | Medium — lost on container restart; ineffective for distributed deployments | Medium |
| No audit log | Medium — no record of who accessed what, when | Medium |
| No structured error reporting / alerting | Medium — errors not monitored systematically | Medium |
| No automated deletion of contact form data after 12 months | Medium — Privacy Policy states 12-month retention but no automated enforcement | Medium |
| Footer disclaimer in exported report | High for regulatory — exported report does not identify itself as AI-generated draft | High |
| No DPA documentation with Azure | High for GDPR | High |
| Admin secret default value `changeme` in `.env.local.example` | Low (if changed in production) | Low |
| Password stored in browser `sessionStorage` | Low — accessible to XSS, but admin panel is internal | Low |
| No dependency scanning or vulnerability management process documented | Low-medium | Medium |
| No WAF (Web Application Firewall) configured | Low-medium | Medium |

---

## 8. Human Oversight and Clinical Responsibility

### 8.1 Where the app tells doctors that outputs are drafts

| Location | Exact text | Language |
|----------|-----------|----------|
| Demo page disclaimer | "Demo slouží pouze pro demonstrační účely. Nepoužívejte pro skutečnou klinickou dokumentaci." | CS |
| Demo page disclaimer | "This demo is for demonstration purposes only. Do not use for actual clinical documentation." | EN |
| Terms of Service §3 | "Veškerý obsah generovaných zpráv musí být zkontrolován kvalifikovaným lékařem před jakýmkoliv klinickým použitím." | CS |
| Terms of Service §3 | "All generated report content must be reviewed by a qualified physician before any clinical use." | EN |
| Marketing compliance rule (MARKETING.md §11) | "Demonstrační obsah. Každou zprávu musí před klinickým použitím zkontrolovat lékař." | CS |
| Email export footer | "Tato zpráva byla automaticky odeslána aplikací ANOTE." | CS |

**[FLAG]** No disclaimer appears within the generated report itself. The disclaimer is shown below the demo UI but not inside the report panel. When the report is exported (copy/download/email), no draft or AI-generated label travels with it.

### 8.2 Whether the app requires review before use

- Terms §3 explicitly requires physician review before any clinical use.
- No technical enforcement of this requirement exists — the app does not require a confirmation step before copying or emailing.
- The export actions (copy, download, email) are one-tap operations with no review confirmation dialog.

**[FLAG]** There is no required acknowledgement or confirmation step ("I have reviewed this report") before export. This is a gap in technical human oversight enforcement.

### 8.3 Whether the doctor can edit all generated text

- Web demo: The report is displayed in a read-only formatted view in the browser. **Copy and download expose raw text** which can be edited outside the app. The web demo does not have an inline text editor.
- Mobile app: **[CONFIRMED in marketing materials and FAQ]** — "Vygenerovaná zpráva je plně editovatelná přímo v aplikaci." (The generated report is fully editable within the app.) Editing is available before export.

**[FLAG]** The web demo does not have an inline editor for the generated report. A doctor using the demo cannot edit the draft within the browser; they must copy it to a text editor externally.

### 8.4 Automatic sending to patients or EHR

**No.** No automatic transmission to EHR, patient portal, or patient email occurs. All export actions require explicit doctor action. The email export sends to an email address the doctor provides; there is no integration with any EHR API.

### 8.5 Final confirmation step before export

**None.** Export (copy, download, email) is immediate. No "Confirm I have reviewed this report" step exists.

### 8.6 Disclaimers location summary

| Location | Present? |
|----------|----------|
| Demo page UI | ✅ Below report panel |
| Website Terms of Service | ✅ §3 |
| Privacy Policy | Partial (§4 mentions processing) |
| Exported report body (copy/download) | ❌ Absent |
| Emailed report body | Partial (footer says "automatically sent by ANOTE" — does not say "AI-generated draft") |
| Marketing creatives (MARKETING.md requirement) | Required per §11 but not yet implemented on live materials |
| Mobile app onboarding | **[UNCLEAR — not in this codebase]** |
| Report preview in UI | ❌ No draft watermark within report panel |

---

## 9. Marketing and Website Claims

The following claims were found in `MARKETING.md`, `src/dictionaries/cs.json`, `src/dictionaries/en.json`, and `README.md`.

| # | Claim | Location | Risk level | Regulatory concern | Safer alternative |
|---|-------|----------|-----------|-------------------|------------------|
| 1 | "Lékařské zprávy automaticky." / "Medical reports, automatically." | Hero heading, `cs.json` line 25, `en.json` line 25, footer | Low | Correctly describes documentation automation, not clinical decision-making | Acceptable as-is |
| 2 | "ANOTE přepíše a vytvoří strukturovanou lékařskou zprávu — přímo na vašem telefonu." | Hero description, `cs.json` line 28 | **Medium** | "Přímo na vašem telefonu" (right on your phone) is only accurate for local mode. Cloud mode sends audio to Azure. MARKETING.md §5 acknowledges this inconsistency. | "lokálně nebo cloudově dle vašeho nastavení" (locally or in the cloud per your settings) |
| 3 | "GDPR" (badge) | Hero badges, `cs.json` line 30 | Medium | Claims GDPR compliance. Legal basis for processing Art. 9 health data not documented. No DPA confirmed. | "Navrženo pro GDPR" (Designed for GDPR compliance) or remove until formal legal review complete |
| 4 | "On-device přepis" / "On-device transcription" | Trust strip, `cs.json` line 246; `en.json` line 246 | **Medium** | Only accurate for mobile app local mode. Web demo always uses cloud. | "On-device přepis (lokální režim)" |
| 5 | "Zero retention" | Trust strip, privacy features | Low-Medium | Azure OpenAI zero-retention depends on subscription terms. Privacy Policy states this. Requires verification via DPA. | "Zero retention při cloudovém zpracování — dle podmínek Azure OpenAI" |
| 6 | "End-to-end šifrování" / "End-to-end encryption" | Privacy section `cs.json` line 138, `en.json` line 138 | **Medium** | "End-to-end encryption" has a specific technical meaning (E2EE) — typically client-to-client with no server decryption. ANOTE uses TLS in transit + Azure at-rest encryption, not true E2EE (the server decrypts data to process it). | "Šifrování při přenosu (HTTPS/TLS) a v klidu (Azure managed encryption)" |
| 7 | "V lokálním režimu přepis probíhá na zařízení — žádný zvuk neopouští telefon" | Privacy features, `cs.json` line 141 | Low | Accurate for mobile local mode | Acceptable; clarify this applies to mobile local mode only |
| 8 | "Data zůstávají v EU" / "EU Data Residency" | Multiple locations | Low | Accurate for Azure West Europe processing. Gmail SMTP (contact form) is US-based. Google Analytics and Meta pixel are US-based. | Add qualifier: "Zdravotní data zpracovávána v EU (Azure West Europe). Analytická data viz zásady ochrany soukromí." |
| 9 | "Zprávy skoro nemusím upravovat." | Testimonial, `cs.json` line 186 | **Medium–High** | This testimonial (currently a placeholder "MUDr. [Jméno]") if published as a real claim could suggest the AI produces clinically reliable output requiring minimal review. This conflicts with the Terms §3 requirement for physician review of all content. | Before publishing: add clarification that reports require professional review. Avoid testimonials implying reports are "ready to use". |
| 10 | "Whisper optimalizovaný pro češtinu" | FAQ, `cs.json` line 201 | Low | Standard Whisper with a Czech medical prompt anchor. Not a custom fine-tuned model. | "Whisper s parametry optimalizovanými pro českou lékařskou terminologii" |
| 11 | Demo report showcase showing "Hodnocení: Suspektní akutní bronchitida, v.s. infekční etiologie. Diferenciálně komunitní pneumonie." and "Návrh terapie: Amoxicilin + kys. klavulanová (s ohledem na alergii na penicilin zvážit alternativu — klarithromycin)" | `cs.json` lines 110, 118; homepage showcase section | **High** | The displayed doctor–patient dialogue does not include the doctor stating this diagnosis or therapy recommendation. The showcase creates a false impression that the AI independently generates clinical recommendations including medication alternatives based on allergy. This could affect regulatory classification. | Replace with a showcase where the doctor explicitly states the diagnosis and treatment in the dialogue, so the AI's role is clearly that of a transcription formatter. Alternatively, label: "Lékař navrhuje ve svém diktátu: Amoxicilin…" |
| 12 | "~15 sekund od ukončení nahrávání k hotové strukturované zprávě" | MARKETING.md §8, `cs.json` pricing comparison | Low | Marketing claim dependent on network conditions and model latency. | Acceptable if based on measured data; add "(typicky)" |
| 13 | "Data nejsou používána k trénování modelů" | FAQ, `cs.json` line 207; Privacy Policy | Low-Medium | Relies on Azure OpenAI's terms. Not independently verifiable from the codebase. | Add reference to Azure OpenAI DPA |
| 14 | "AI asistent pro českou lékařskou dokumentaci" | MARKETING.md §1 | Low | Accurately describes the product | Acceptable |
| 15 | "Plně editovatelná zpráva" (Fully editable report) | FAQ | Medium | True for mobile app; web demo has read-only report panel (only copy/download available) | Clarify: "Plně editovatelná v mobilní aplikaci; v web demu zkopírujte a upravte ve svém editoru" |
| 16 | Testimonials: "MUDr. [Jméno]" (placeholder) | `cs.json` line 179–190 | Low now; **High** if published with invented names | Placeholder. MARKETING.md §13 warns these must not be used in paid campaigns | Collect real physician testimonials before any advertising |

---

## 10. EU AI Act Classification Support

*Facts only. No legal conclusions.*

| Question | Finding | Evidence |
|----------|---------|----------|
| Is the app used in healthcare? | Yes | Intended use is medical documentation for licensed physicians in clinical encounters. |
| Is it used by professionals only? | Yes (currently) | Only licensed physicians and clinic staff are the intended users. Patients do not use the app. |
| Does it make or assist decisions about patients? | Indirectly — it assists documentation of decisions the doctor has already made aloud | The AI formats and structures the doctor's own statements. It does not initiate or generate independent clinical decisions. |
| Does it influence access to healthcare? | No direct influence | ANOTE does not control referrals, authorisations, or access to healthcare services. |
| Does it perform diagnosis, prognosis, triage, risk assessment, or treatment recommendation? | No autonomously | The AI transcribes and formats what the doctor already said on these topics. The doctor's own statements about diagnosis and treatment are captured, not generated by the AI. |
| Is it only a productivity/documentation assistant? | Yes, as designed and as implemented | The system prompt is explicitly scoped to transcription and formatting of the consultation. No section generates clinically novel content. |
| Is there human review? | Required by Terms §3; not technically enforced | The doctor must review before clinical use per Terms of Service. No technical confirmation step exists. |
| Are users informed that AI generated the draft? | Partially | Demo disclaimer visible on demo page. Terms §3 requires review. Exported reports have no AI-generated label. |
| Are patients informed when AI is used? | **No** | Patients are recorded during the consultation. No patient consent flow or notification is implemented. |
| Are logs kept? | Minimal | Backend logs request metadata (visit type, stream mode) but explicitly not transcript or report content. No audit log of user actions. |
| Are instructions for use available? | Partial | Website FAQ and terms describe intended use. No formal Instructions for Use (IFU) document exists. |
| Are accuracy/limitations documented? | Partial | Terms §3 states outputs may contain inaccuracies. No systematic accuracy testing, benchmarks, or limitations document exists. |
| Does the system use an AI model as a component? | Yes | Azure OpenAI (GPT-class model) for report generation; Azure Whisper for transcription; on-device Whisper for local transcription; Silero VAD for speech detection. |
| Is there a general-purpose AI model used? | Yes | Azure OpenAI Chat Completions with GPT-4 class model |
| Is the output used directly for clinical purposes? | Not without physician review (by design and Terms) | The output is a draft that requires physician review and editing before any clinical use. |
| Are patients' health data processed? | Yes | Audio and transcript of doctor–patient consultations contain patient health data (Art. 9 GDPR). |

---

## 11. MDR Classification Support

*Facts only. No legal conclusions.*

| Question | Finding | Evidence |
|----------|---------|----------|
| Does the software have a stated medical purpose? | Described as "a tool to support medical documentation" (Terms §2) — not a medical device purpose as defined in MDR Art. 2(1) | Terms of Service §2 |
| Does the software provide information used for diagnosis or therapeutic decisions? | The output contains sections labelled "Hodnocení" (Assessment), "Návrh vyšetření" (Proposed investigations), "Návrh terapie" (Proposed therapy) — these are transcriptions of what the doctor said, not independently generated clinical information | System prompt, lines 211–219 |
| Does it monitor physiological processes? | No | No sensor integration, no vital sign monitoring, no physiological data input |
| Are outputs used directly for patient management? | Not without physician review (by design) | The output is a documentation draft. Doctor must review before any clinical use. |
| Are outputs only administrative/documentation drafts? | Yes, as designed | The product is positioned as a transcription and documentation formatting tool, not a clinical decision support system |
| Do all outputs require physician review? | Yes, per Terms §3 | No technical enforcement, but stated as a requirement |
| Does the software perform calculations or transformations with clinical significance? | Partially — for ultrasound/elastography reports | The ultrasound template prompts the model to extract and structure fibrosing stage (F0–F4) and steatosis grade (S0–S3) from the transcript. This involves structured classification of clinical measurements. |
| Does the software control or influence a medical device? | No | No interface with any medical device |
| Could any feature fall under Rule 11 (software intended to provide information for diagnosis or treatment decisions)? | **Unclear — requires legal assessment** | The Hodnocení, Návrh vyšetření, and Návrh terapie sections contain diagnostic and therapeutic information. The key question is whether the software "provides" this information or merely "captures and reformats" the physician's own words. The system prompt's explicit grounding ("only if mentioned in transcript") supports the "captures and reformats" interpretation. The showcase example (which implies AI-generated clinical content) and the ASR interpretation rule ("interpret meaning, not literal text") slightly complicate this. **Requires legal assessment.** |
| Is there any output that could be directly used for clinical decision-making without review? | By design, no. Technically, an exported report could be used without review. | No technical safeguard prevents unapproved use |
| Is the software intended for use by healthcare professionals only? | Yes | Intended users are licensed physicians and clinic staff |
| Does the software generate content that could be mistaken for final clinical documentation? | Yes | The output format is structurally identical to a completed Czech medical report. Exported documents carry no draft label or AI-generated notice. |

---

## 12. Evidence Appendix

### 12.1 Files reviewed

| File | Key contents |
|------|-------------|
| `backend/main.py` | Full FastAPI backend: all API endpoints, complete system prompts for all visit types, ZÁSADY rules block, model configuration, email function |
| `backend/requirements.txt` | Python dependencies: fastapi, openai, uvicorn, pydantic, httpx |
| `backend/Dockerfile` | Container build: Python 3.12-slim |
| `backend/README.md` | Deployment instructions, Azure resource references |
| `src/app/api/demo/transcribe/route.ts` | Whisper proxy, MIME validation, rate limiting, Czech medical prompt anchor |
| `src/app/api/demo/report/route.ts` | FastAPI report proxy, SSE passthrough |
| `src/app/api/demo/health/route.ts` | Backend pre-warm endpoint |
| `src/app/api/contact/route.ts` | Contact form handling, Zod validation, submission storage |
| `src/app/api/admin/submissions/route.ts` | Admin API, ADMIN_SECRET auth |
| `src/app/admin/page.tsx` | Admin panel UI |
| `src/hooks/useDemoSession.ts` | Demo state machine: recording, transcription, report generation, SSE streaming |
| `src/hooks/useMediaRecorder.ts` | MediaRecorder abstraction with VAD integration |
| `src/lib/speech-vad.ts` | Silero VAD via @ricky0123/vad-web and ONNX Runtime |
| `src/lib/demo-rate-limit.ts` | In-memory IP rate limiting |
| `src/lib/email.ts` | Nodemailer SMTP for contact notifications |
| `src/lib/submissions.ts` | JSON file-based contact form storage |
| `src/lib/analytics.ts` | Plausible + GTM event tracking |
| `src/lib/constants.ts` | Site config, brand colours |
| `src/dictionaries/cs.json` | Full Czech UI copy: all user-visible text, disclaimer, terms, privacy policy, showcase example |
| `src/dictionaries/en.json` | Full English UI copy: same structure |
| `src/components/demo/DemoUI.tsx` | Demo page layout, analytics tracking |
| `src/components/demo/ReportPanel.tsx` | Report display, copy, download buttons |
| `src/proxy.ts` | Next.js middleware: locale routing, Azure hostname redirect |
| `staticwebapp.config.json` | Security headers, CSP |
| `.github/workflows/azure-static-web-apps-*.yml` | CI/CD pipeline |
| `.env.local` | Local development environment variables (contains live API keys — NOT committed to git) |
| `MARKETING.md` | Internal marketing brief: claims, positioning, known inconsistencies |
| `README.md` | Project overview, tech stack, environment variables |
| `package.json` | npm dependencies: Next.js 16.2.2, React 19, @ricky0123/vad-web, onnxruntime-web, framer-motion, zod, nodemailer |

### 12.2 API endpoints reviewed

| Endpoint | Auth | Rate limit |
|----------|------|-----------|
| `POST /report` | Bearer token | Via Next.js proxy: 30/hour/IP |
| `POST /report?stream=1` | Bearer token | Same |
| `POST /send-report-email` | Bearer token | None |
| `GET /health` | None | None |
| `GET /scenarios` | None | None |
| `POST /test-report/{name}` | Bearer token | None |
| `POST /api/demo/transcribe` | None (public) | 20/hour/IP |
| `POST /api/demo/report` | None (public) | 30/hour/IP |
| `GET /api/demo/health` | None | None |
| `POST /api/contact` | None | 5/hour/IP |
| `GET /api/admin/submissions` | ADMIN_SECRET | None |

### 12.3 Prompt files reviewed

All prompts are inline in `backend/main.py`:
- `_build_base_rules()` — lines 95–144 — ZÁSADY (rules) shared by all visit types
- `_build_sections_initial()` — lines 147–222 — 14-section template for initial/default visits
- `_build_sections_followup()` — lines 225–275 — compact template for follow-up visits
- `_build_sections_gastroscopy()` — lines 278–336 — gastroscopy procedure report
- `_build_sections_colonoscopy()` — lines 339–402 — colonoscopy procedure report
- `_build_sections_ultrasound()` — lines 405–463 — abdominal ultrasound report
- `_build_system_prompt()` — lines 466–514 — assembles role intro + rules + template + language footer

**User prompt (identical for all types):**
```
Převeď tento přepis do strukturované lékařské zprávy v češtině:

{transcript text}
```

### 12.4 UI screens reviewed

| Screen | Key content for regulatory assessment |
|--------|--------------------------------------|
| `/cs/demo` (Demo page) | Disclaimer "Demo slouží pouze pro demonstrační účely…" below report panel |
| `/cs` (Homepage) | Report showcase example with pre-authored diagnostic and therapeutic content |
| `/cs/podminky` (Terms) | §3 physician review requirement |
| `/cs/ochrana-soukromi` (Privacy Policy) | Data categories, legal basis, retention |
| `/cs/bezpecnost` (Security page) | Privacy feature list |
| `/cs/faq` (FAQ) | Accuracy claims, GDPR claims, editing claims |
| `/cs/cenik` (Pricing) | Feature list, trial terms |

### 12.5 Third-party services identified

| Service | Purpose | EU/US | Receives health data? |
|---------|---------|-------|----------------------|
| Azure OpenAI (Microsoft) | Transcription + report generation | EU (West Europe) | Yes — audio and transcript |
| Azure Container Apps (Microsoft) | Backend hosting | EU (West Europe) | Yes — transcript (in-flight) |
| Azure Static Web Apps (Microsoft) | Web hosting | EU (West Europe) | No |
| Azure Container Registry (Microsoft) | Docker image storage | EU (West Europe) | No |
| Gmail SMTP (Google) | Contact form email notifications | US | No (contains only contact form data) |
| Plausible Analytics | Page analytics | **[UNCLEAR — verify Plausible server location]** | No |
| Google Tag Manager | Analytics tag management | US | No (event names only) |
| Google Analytics | Page analytics | US | No (event names, IP) |
| Facebook/Meta pixel | Marketing analytics | US | No (event names, IP) |
| jsDelivr CDN | VAD/ONNX model assets | Global | No |
| @ricky0123/vad-web | VAD model (Silero v5 via ONNX) | Browser-local | No |

### 12.6 Unknowns / missing information

1. **Mobile app codebase** not present in this repository. The mobile app (Flutter/Dart) with local Whisper, recording history, in-app editing, mobile SMTP, and mobile authentication is in a separate repository. A full regulatory assessment requires inspection of the mobile app code.

2. **Azure OpenAI subscription type and DPA** — cannot be confirmed from codebase. Zero-retention and no-training guarantees depend on the specific Azure OpenAI subscription tier and a signed Data Processing Addendum.

3. **Authentication and subscription system for mobile app** — not inspectable from this codebase.

4. **Actual deployed model identifiers** — `AZURE_OPENAI_DEPLOYMENT` env var value in production determines which GPT model is used. Code shows default `gpt-4-1-mini`; marketing says "GPT-5-chat". Cannot confirm from codebase.

5. **Plausible Analytics server location** — not confirmed. If Plausible Cloud is used, servers may be in EU; if self-hosted on EU infrastructure, compliant. Requires confirmation.

6. **Whether mobile app sends audio to Azure or any third party in cloud mode** — referenced in marketing but mobile code not inspectable here.

7. **SMTP configuration in production for email export** — `SMTP_HOST` configured for contact form notifications. Backend `/send-report-email` uses separate SMTP config. In production, the SMTP provider receiving medical report emails should be GDPR-compliant and EU-based.

8. **Patient notification / consent** — no patient consent mechanism found. Whether Czech law requires patient consent for AI-assisted documentation of consultations requires legal input.

9. **Instructions for Use (IFU)** — no formal IFU document found. The FAQ and Terms partially serve this function but do not constitute a formal IFU.

10. **Accuracy testing / validation data** — no validation study, benchmark dataset, or accuracy testing results found in the codebase.

### 12.7 Questions for the founder/developer

1. What is the actual Azure OpenAI deployment name (`AZURE_OPENAI_DEPLOYMENT`) in production? Is it `gpt-4o-mini`, `gpt-4.1-mini`, a custom deployment, or something else?
2. Has a Microsoft Azure OpenAI Data Processing Addendum been signed? If so, is the "abuse monitoring opt-out" or equivalent zero-retention configuration enabled?
3. Is the contact form submission data (`data/submissions.json`) backed up? Where are backups stored and for how long?
4. What is the mobile app's exact authentication mechanism? Does it use patient identifiers or only anonymous session tokens?
5. Does the mobile app's recording history store identified patient data locally on the device?
6. Is Plausible Analytics self-hosted on EU infrastructure, or is Plausible Cloud used? What is the data processing agreement with Plausible?
7. Has legal counsel reviewed GDPR compliance, specifically the legal basis for processing Art. 9 special category health data?
8. Has the CORS policy on the FastAPI backend been restricted to specific allowed origins in production? The code shows `allow_origins=["*"]` with a comment "tighten in production".
9. Is there a process for vulnerability disclosure or security incident response?
10. Is any intended clinical use planned for the future that goes beyond documentation assistance (e.g., automatic risk flagging, medication dosage checking, diagnostic assistance)? If so, this would require a separate regulatory assessment.
11. What consent, if any, is obtained from patients before their consultations are recorded and transcribed?
12. For the gastroscopy and colonoscopy report types: does the model ever add the standard warning signs list (bolesti břicha, krvácení, etc.) from the template even if the doctor did not explicitly state them in the dictation? This should be tested empirically.

---

*End of document.*

*Prepared: 2026-06-15. Based on codebase inspection only. Legal conclusions require qualified legal counsel.*
