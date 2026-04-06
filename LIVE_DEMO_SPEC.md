# ANOTE Web — Live Demo Tech Spec

> Implementation plan for the interactive browser-based demo at `/demo`.

---

## 1. Goal

Replace the current placeholder `/demo` page with a fully working live demo where visitors can:

1. **Record their voice** directly in the browser (up to 10 minutes)
2. **Upload an audio file** (mp3, wav, m4a, webm, ogg — up to 25 MB)
3. **Watch live transcription** appear as audio is processed
4. **Select a visit type** (or let AI auto-detect)
5. **See a structured Czech medical report** generated in real-time
6. **Copy or download** the final report

No sign-up required. Open to all visitors.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (Next.js client component)                          │
│  • MediaRecorder API → capture audio chunks (webm/opus)     │
│  • File upload input → accept audio files                   │
│  • Visit type selector dropdown                             │
│  • Three-panel UI: Controls | Transcript | Report           │
│  • Polling: send audio chunks to API every ~20s             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS (Next.js API routes)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Next.js API Routes (server-side proxy)                      │
│  • POST /api/demo/transcribe — proxy to Azure Whisper API   │
│  • POST /api/demo/report — proxy to ANOTE backend /report   │
│  • Keys stay server-side, never exposed to browser          │
│  • Basic IP-based rate limiting (in-memory)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴───────────────┐
        ▼                            ▼
┌──────────────────┐   ┌──────────────────────────────┐
│ Azure Whisper API│   │ ANOTE Backend (FastAPI)       │
│ (transcription)  │   │ POST /report                  │
│ whisper model    │   │ gpt-5-chat / gpt-4-1-mini     │
└──────────────────┘   └──────────────────────────────┘
```

### Why a proxy layer?

- **Security**: Azure Whisper API key and ANOTE backend Bearer token stay server-side
- **CORS**: No cross-origin issues — browser only talks to its own origin
- **Rate limiting**: Can throttle abuse at the proxy level
- **Flexibility**: Can switch providers without changing frontend code

---

## 3. Audio Capture & Processing

### 3.1 Browser Recording

**API**: `MediaRecorder` with `getUserMedia({ audio: true })`

**Format**: `audio/webm;codecs=opus` (native browser format, smallest files)

**Chunking strategy** (for live transcription during recording):
- `MediaRecorder.start(timeslice)` with ~20-second intervals
- Each `ondataavailable` event yields a Blob chunk
- Accumulate chunks into a growing audio buffer
- Every 20s: send the **full accumulated audio** to `/api/demo/transcribe`
- On stop: send final complete audio for definitive transcription

**Why send full audio each time (not just new chunks)?**
- Whisper works best with full context (no boundary artifacts)
- For 10-minute max, the full audio is ≤25 MB — within Azure Whisper limits
- Simpler than implementing overlap/deduplication logic

**Max duration**: 10 minutes (enforced client-side with a visible countdown timer)

### 3.2 File Upload

**Accepted formats**: `.mp3`, `.wav`, `.m4a`, `.webm`, `.ogg`

**Max file size**: 25 MB (Azure Whisper API limit)

**Flow**:
1. User selects file via `<input type="file" accept="audio/*">`
2. File sent to `/api/demo/transcribe`
3. Full transcript returned
4. User clicks "Generate Report" or report auto-generates

### 3.3 Audio Format for Whisper API

Azure Whisper accepts the uploaded format directly — no client-side conversion needed. Supported: mp3, mp4, mpeg, mpga, m4a, wav, webm.

---

## 4. API Routes

### 4.1 `POST /api/demo/transcribe`

Proxies audio to Azure OpenAI Whisper API for transcription.

**Request**: `multipart/form-data`
- `file`: Audio blob/file (required)
- `language`: `"cs"` (default) — can add `"en"` later

**Response**:
```json
{
  "transcript": "Dobrý den, co vás trápí? ..."
}
```

**Error responses**:
```json
{ "error": "File too large (max 25 MB)" }         // 413
{ "error": "Invalid audio format" }                 // 400
{ "error": "Transcription failed" }                 // 502
{ "error": "Rate limit exceeded. Try again later."} // 429
```

**Server-side logic**:
```
1. Validate file size (≤25 MB) and MIME type
2. Check rate limit (IP-based, see §9)
3. Forward file to Azure Whisper API:
   POST {AZURE_WHISPER_ENDPOINT}
   Headers: api-key: {AZURE_WHISPER_KEY}
   Body: multipart — file=audio, language=cs
4. Return { transcript: response.text }
```

**Environment variables needed**:
```
AZURE_WHISPER_ENDPOINT=https://anote-openai.openai.azure.com/openai/deployments/whisper/audio/transcriptions?api-version=2024-06-01
AZURE_WHISPER_KEY=xxx
```

### 4.2 `POST /api/demo/report`

Proxies transcript to existing ANOTE backend for report generation.

**Request**: `application/json`
```json
{
  "transcript": "Dobrý den, co vás trápí? ...",
  "visit_type": "default"
}
```

**Response**:
```json
{
  "report": "Lékařská zpráva\n\nIdentifikace pacienta:\n..."
}
```

**Error responses**:
```json
{ "error": "Empty transcript" }                     // 400
{ "error": "Report generation failed" }             // 502
{ "error": "Rate limit exceeded. Try again later."} // 429
```

**Server-side logic**:
```
1. Validate transcript is non-empty
2. Check rate limit
3. Forward to ANOTE backend:
   POST {ANOTE_BACKEND_URL}/report
   Headers: Authorization: Bearer {ANOTE_API_TOKEN}
   Body: { transcript, language: "cs", visit_type }
4. Return { report: response.report }
```

**Environment variables needed**:
```
ANOTE_BACKEND_URL=https://anote-api.gentleriver-a61d304a.westus2.azurecontainerapps.io
ANOTE_API_TOKEN=xxx
```

---

## 5. Frontend UI Design

### 5.1 Page Layout

The demo page replaces the current placeholder at `/[lang]/demo/page.tsx`.

**Desktop** (≥768px): Three-column layout
```
┌────────────────────────────────────────────────────────────┐
│ PageHeader: "Vyzkoušejte ANOTE" / "Try ANOTE"             │
├──────────┬──────────────────────┬──────────────────────────┤
│ Controls │   Transcript Panel   │    Report Panel          │
│          │                      │                          │
│ [Record] │ Live transcript      │ Generated report         │
│ [Upload] │ appearing here...    │ appearing here...        │
│          │                      │                          │
│ Visit    │                      │ [Copy] [Download]        │
│ Type:    │ [Copy]               │                          │
│ [v Auto] │                      │                          │
│          │                      │                          │
│ Timer    │                      │                          │
│ 02:34    │                      │                          │
│ ──────── │                      │                          │
│ Max 10m  │                      │                          │
├──────────┴──────────────────────┴──────────────────────────┤
│ Disclaimer: "ANOTE není certifikovaný zdravotnický..."     │
└────────────────────────────────────────────────────────────┘
```

**Mobile** (<768px): Stacked panels with tab switching
```
┌────────────────────────────┐
│ PageHeader                 │
├────────────────────────────┤
│ Controls (always visible)  │
│ [🎤 Record] [📁 Upload]   │
│ Visit Type: [v Auto ▾]    │
│ Timer: 02:34 / 10:00      │
├────────────────────────────┤
│ [Přepis] [Zpráva]  ← tabs │
├────────────────────────────┤
│ Active tab content         │
│ (transcript or report)     │
│                            │
│ [Copy] [Download]          │
├────────────────────────────┤
│ Disclaimer                 │
└────────────────────────────┘
```

### 5.2 UI States

| State | Controls | Transcript Panel | Report Panel |
|-------|----------|-----------------|--------------|
| **Idle** | Record + Upload enabled | Empty / placeholder text | Empty / placeholder |
| **Recording** | Stop button + timer (pulsing red dot) | Transcript updating live every ~20s | Report preview updating every ~20s |
| **Processing** | Disabled, spinner | "Finalizing transcription..." | "Generating report..." |
| **Complete** | "New Recording" button | Final transcript + Copy button | Final report + Copy + Download |
| **Error** | Retry button | Error message | Error message |
| **Uploading** | Disabled, progress bar | "Transcribing..." with spinner | Empty |

### 5.3 Recording Controls

- **Record button**: Large, prominent, red pulsing animation when active
- **Stop button**: Replaces Record when recording
- **Upload button**: File picker icon, always available (disabled during recording)
- **Timer**: Shows elapsed time / 10:00 max. Auto-stops at 10 minutes.
- **Visit type dropdown**: "Automatická detekce", "Vstupní vyšetření", "Kontrolní návštěva", "Gastroskopie", "Koloskopie", "Ultrazvuk"
- **New Recording button**: Appears after completion, resets all state

### 5.4 Transcript Panel

- Read-only text display (no editing in demo — keeps it simple)
- Updates progressively during recording (new text fades in)
- Copy button (copies to clipboard)
- Subtle "Přepisujeme..." / "Transcribing..." label when processing

### 5.5 Report Panel

- Read-only formatted text
- Section headers visually distinct (bold, slightly larger)
- Updates during recording (preview report refreshes every ~20s)
- Copy button + Download as .txt button
- Shows visit type badge at top (e.g., "Vstupní vyšetření")

---

## 6. Client-Side State Machine

```
                    ┌─────────┐
                    │  IDLE   │◄──── reset()
                    └────┬────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         startRecording()      uploadFile()
              │                     │
              ▼                     ▼
        ┌───────────┐        ┌───────────┐
        │ RECORDING │        │ UPLOADING │
        │           │        │           │
        │ Every 20s:│        │ Send file │
        │ transcribe│        │ to API    │
        │ + report  │        │           │
        └─────┬─────┘        └─────┬─────┘
              │                     │
         stopRecording()      transcript ready
              │                     │
              ▼                     ▼
        ┌───────────┐        ┌───────────┐
        │PROCESSING │        │GENERATING │
        │           │        │           │
        │ Final     │        │ Generate  │
        │ transcribe│        │ report    │
        │ + report  │        │           │
        └─────┬─────┘        └─────┬─────┘
              │                     │
              ▼                     ▼
        ┌───────────────────────────┐
        │        COMPLETE           │
        │ transcript + report ready │
        └───────────────────────────┘
```

State managed via React `useReducer` in a custom `useDemoSession` hook.

**State shape**:
```typescript
interface DemoState {
  status: 'idle' | 'recording' | 'uploading' | 'processing' | 'generating' | 'complete' | 'error';
  transcript: string;
  report: string;
  visitType: VisitType;
  elapsedSeconds: number;
  error: string | null;
  isTranscribing: boolean;  // true while a transcription request is in-flight
  isGenerating: boolean;    // true while a report request is in-flight
}
```

---

## 7. Recording Flow (Detailed)

### 7.1 Live Recording Flow

```
1. User clicks Record
2. Request microphone permission (getUserMedia)
3. Create MediaRecorder (webm/opus)
4. Start recording with timeslice=20000 (20s chunks)
5. Start elapsed timer (1s interval)

EVERY ondataavailable (every ~20s):
  6. Accumulate chunk into audioChunks[]
  7. Create Blob from all chunks so far
  8. POST Blob to /api/demo/transcribe
  9. On response: update transcript state
  10. POST transcript to /api/demo/report (with visitType)
  11. On response: update report state (preview)

ON STOP (user clicks Stop OR 10-minute limit):
  12. Stop MediaRecorder
  13. Set status = 'processing'
  14. Create final Blob from all chunks
  15. POST final audio to /api/demo/transcribe
  16. Update transcript with final version
  17. POST final transcript to /api/demo/report
  18. Update report with final version
  19. Set status = 'complete'
```

### 7.2 File Upload Flow

```
1. User selects audio file
2. Validate: size ≤ 25 MB, audio MIME type
3. Set status = 'uploading'
4. POST file to /api/demo/transcribe
5. On response: update transcript, set status = 'generating'
6. POST transcript to /api/demo/report (with visitType)
7. On response: update report, set status = 'complete'
```

### 7.3 Abort Handling

- If user clicks "New Recording" during any state, abort all in-flight requests
- Use `AbortController` for fetch requests
- Reset all state to idle

---

## 8. Dictionary Keys

Add to `cs.json` / `en.json` under `demoPage`:

```json
{
  "demoPage": {
    "title": "Demo — ANOTE",
    "description": "...",
    "heading": "Vyzkoušejte ANOTE",
    "subtitle": "Nahrajte konverzaci nebo nahrajte audio soubor — ANOTE přepíše a vytvoří strukturovanou lékařskou zprávu.",

    "recordButton": "Nahrávat",
    "stopButton": "Zastavit",
    "uploadButton": "Nahrát soubor",
    "newRecordingButton": "Nové nahrávání",
    "generateReport": "Generovat zprávu",

    "visitTypeLabel": "Typ vyšetření",
    "visitTypes": {
      "default": "Automatická detekce",
      "initial": "Vstupní vyšetření",
      "followup": "Kontrolní návštěva",
      "gastroscopy": "Gastroskopie",
      "colonoscopy": "Koloskopie",
      "ultrasound": "Ultrazvuk"
    },

    "transcriptLabel": "Přepis",
    "reportLabel": "Zpráva",
    "transcriptPlaceholder": "Přepis se zobrazí po zahájení nahrávání...",
    "reportPlaceholder": "Zpráva se zobrazí po zpracování přepisu...",

    "transcribing": "Přepisujeme...",
    "generating": "Generujeme zprávu...",
    "processing": "Zpracováváme nahrávku...",
    "complete": "Hotovo",

    "copyButton": "Kopírovat",
    "downloadButton": "Stáhnout",
    "copied": "Zkopírováno!",

    "timerLabel": "Čas nahrávání",
    "maxDuration": "Max. 10 minut",

    "micPermissionTitle": "Přístup k mikrofonu",
    "micPermissionDesc": "Pro nahrávání potřebujeme přístup k vašemu mikrofonu.",
    "micDenied": "Přístup k mikrofonu byl zamítnut. Povolte ho v nastavení prohlížeče.",

    "errorTranscription": "Přepis se nezdařil. Zkuste to znovu.",
    "errorReport": "Generování zprávy selhalo. Zkuste to znovu.",
    "errorFileTooLarge": "Soubor je příliš velký (max 25 MB).",
    "errorInvalidFormat": "Nepodporovaný formát souboru.",
    "errorRateLimit": "Příliš mnoho požadavků. Zkuste to za chvíli.",

    "disclaimer": "ANOTE není certifikovaný zdravotnický prostředek. Demo slouží pouze pro demonstrační účely. Nepoužívejte pro skutečnou klinickou dokumentaci.",

    "uploadHint": "MP3, WAV, M4A, WebM — max 25 MB",
    "dragDropHint": "Přetáhněte soubor sem nebo klikněte pro výběr"
  }
}
```

(English equivalents in `en.json` analogously.)

---

## 9. Rate Limiting

Simple IP-based rate limiting in the API routes using an in-memory store (no external database needed for this traffic level).

**Limits**:
| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/demo/transcribe` | 20 requests | per hour per IP |
| `/api/demo/report` | 30 requests | per hour per IP |

**Implementation**: In-memory `Map<string, { count: number, resetAt: number }>` in a shared module. Reset counters when window expires.

On Azure Static Web Apps, API routes run as serverless functions — the in-memory store resets on cold starts. This is acceptable: it prevents sustained abuse but isn't fortress-grade. If abuse becomes a problem, upgrade to Redis or Azure Table Storage.

---

## 10. Environment Variables

Add to `.env.local` (and Azure SWA app settings):

```env
# Azure Whisper API (transcription)
AZURE_WHISPER_ENDPOINT=https://anote-openai.openai.azure.com/openai/deployments/whisper/audio/transcriptions?api-version=2024-06-01
AZURE_WHISPER_KEY=xxx

# ANOTE Backend (report generation)
ANOTE_BACKEND_URL=https://anote-api.gentleriver-a61d304a.westus2.azurecontainerapps.io
ANOTE_API_TOKEN=xxx
```

These are **server-side only** — never prefixed with `NEXT_PUBLIC_`, never exposed to the browser.

---

## 11. Component Structure

### New Files

| File | Type | Purpose |
|------|------|---------|
| `src/app/[lang]/demo/page.tsx` | Page | Replace placeholder, render DemoUI |
| `src/components/demo/DemoUI.tsx` | Client component | Main demo orchestrator |
| `src/components/demo/RecordingControls.tsx` | Client component | Record/Stop/Upload buttons + timer |
| `src/components/demo/TranscriptPanel.tsx` | Client component | Transcript display |
| `src/components/demo/ReportPanel.tsx` | Client component | Report display + copy/download |
| `src/components/demo/VisitTypeSelector.tsx` | Client component | Visit type dropdown |
| `src/hooks/useDemoSession.ts` | Hook | State machine + audio recording logic |
| `src/hooks/useMediaRecorder.ts` | Hook | MediaRecorder abstraction |
| `src/app/api/demo/transcribe/route.ts` | API route | Proxy to Azure Whisper |
| `src/app/api/demo/report/route.ts` | API route | Proxy to ANOTE backend |
| `src/lib/demo-rate-limit.ts` | Utility | IP-based rate limiter |

### Modified Files

| File | Change |
|------|--------|
| `src/app/[lang]/demo/page.tsx` | Replace placeholder with actual demo |
| `src/dictionaries/cs.json` | Expand `demoPage` keys |
| `src/dictionaries/en.json` | Expand `demoPage` keys |
| `.env.local` | Add Whisper + backend env vars |

---

## 12. SEO & Metadata

The demo page already has `generateMetadata`. Update the description:

```typescript
// cs
title: "Demo — ANOTE",
description: "Vyzkoušejte ANOTE přímo v prohlížeči. Nahrajte konverzaci s pacientem a sledujte, jak AI vytvoří strukturovanou lékařskou zprávu za sekundy."

// en
title: "Demo — ANOTE",
description: "Try ANOTE right in your browser. Record a patient conversation and watch AI create a structured medical report in seconds."
```

---

## 13. Accessibility

- Record/Stop buttons have clear `aria-label`
- Timer uses `aria-live="polite"` for screen reader updates
- Transcript and Report panels use `role="status"` and `aria-live="polite"`
- File upload has associated `<label>`
- All interactive elements keyboard-accessible
- Visit type dropdown uses native `<select>` or accessible custom component

---

## 14. Browser Compatibility

**MediaRecorder** is supported in all modern browsers:
- Chrome 49+, Firefox 25+, Safari 14.1+, Edge 79+

**Fallback**: If `MediaRecorder` is not available (very old browsers), show only the file upload option with a message: "Your browser doesn't support live recording. Please upload an audio file."

**getUserMedia** requires HTTPS (already the case on Azure SWA).

---

## 15. What Does NOT Change

- Existing ANOTE FastAPI backend — no modifications needed
- Homepage, navigation, other pages — untouched
- Existing API routes (`/api/contact`, `/api/admin/submissions`) — untouched
- Design system, animations, UI components — reused as-is
- Analytics — add new demo-specific events (see §16)

---

## 16. Analytics Events

| Event | When | Properties |
|-------|------|-----------|
| `demo_start_recording` | User starts recording | `{ visitType }` |
| `demo_stop_recording` | User stops recording | `{ durationSeconds, visitType }` |
| `demo_upload_file` | User uploads audio file | `{ fileType, fileSizeMB }` |
| `demo_transcription_complete` | Transcription finishes | `{ wordCount, method: 'live' \| 'upload' }` |
| `demo_report_complete` | Report generation finishes | `{ visitType, method: 'live' \| 'upload' }` |
| `demo_copy_transcript` | User copies transcript | — |
| `demo_copy_report` | User copies report | — |
| `demo_download_report` | User downloads report | — |
| `demo_error` | Any error occurs | `{ type, message }` |

---

## 17. Implementation Plan

### Phase 1: API Routes (backend proxy)

- [ ] Create `src/lib/demo-rate-limit.ts` — IP-based rate limiter
- [ ] Create `src/app/api/demo/transcribe/route.ts` — proxy to Azure Whisper
- [ ] Create `src/app/api/demo/report/route.ts` — proxy to ANOTE backend
- [ ] Add environment variables to `.env.local`
- [ ] Test both routes with curl

### Phase 2: Hooks & State Management

- [ ] Create `src/hooks/useMediaRecorder.ts` — MediaRecorder abstraction
- [ ] Create `src/hooks/useDemoSession.ts` — full state machine (idle → recording → processing → complete)
- [ ] Handle abort/cleanup on unmount

### Phase 3: UI Components

- [ ] Create `src/components/demo/VisitTypeSelector.tsx`
- [ ] Create `src/components/demo/RecordingControls.tsx` — Record/Stop/Upload/Timer
- [ ] Create `src/components/demo/TranscriptPanel.tsx` — live transcript display
- [ ] Create `src/components/demo/ReportPanel.tsx` — report display + copy/download
- [ ] Create `src/components/demo/DemoUI.tsx` — orchestrator that composes all panels

### Phase 4: Page Integration

- [ ] Replace `src/app/[lang]/demo/page.tsx` — render DemoUI with dict props
- [ ] Update dictionaries (cs.json, en.json) with full `demoPage` keys
- [ ] Add disclaimer at bottom of page

### Phase 5: Polish

- [ ] Add loading skeletons / animations for panels
- [ ] Add mobile responsive layout (stacked with tabs)
- [ ] Add drag-and-drop for file upload
- [ ] Add analytics events
- [ ] Handle MediaRecorder unsupported (show upload-only fallback)
- [ ] Test in Chrome, Firefox, Safari

### Phase 6: Verify & Ship

- [ ] Run `npm run build` — all routes generate
- [ ] Test live recording → transcription → report flow
- [ ] Test file upload → transcription → report flow
- [ ] Test rate limiting
- [ ] Test error states (network failure, large file, etc.)
- [ ] Push to main

---

## 18. Cost Estimate

| Service | Unit Cost | Per 10-min Demo Session |
|---------|-----------|------------------------|
| Azure Whisper API | ~$0.006/min | ~$0.06 (final transcription) |
| Live transcription updates (6× during recording) | ~$0.006/min × growing audio | ~$0.12 (cumulative) |
| Report generation (gpt-5-chat) | ~$0.003/report | ~$0.02 (preview + final) |
| **Total per session** | | **~$0.20** |

At 10 demos/day = ~$60/month. At 100 demos/day = ~$600/month. Manageable at early-stage traffic.

**Optimization**: Reduce live transcription frequency from 20s to 30s to cut Whisper costs by ~40%.

---

## 19. Security Considerations

- API keys are server-side only (Next.js API routes, not `NEXT_PUBLIC_`)
- Rate limiting prevents billing abuse (20 transcriptions/hr per IP)
- File upload validated server-side (size + MIME type)
- No patient data stored — transcripts and reports are ephemeral (in browser memory only)
- Medical disclaimer displayed prominently
- CORS handled by Next.js (same-origin API routes)

---

## 20. Out of Scope

- **Transcript editing** — demo is read-only for simplicity (mobile app supports editing)
- **Report editing / regeneration** — future enhancement
- **Email sending** — not needed for demo
- **Recording history / persistence** — session-only, no IndexedDB
- **On-device Whisper (WASM)** — too slow for good UX, cloud-only
- **Multi-language transcription** — Czech only for now
- **WebSocket streaming** — polling is simpler and sufficient for demo
