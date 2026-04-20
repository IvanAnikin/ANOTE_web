# ANOTE Web Demo — Transcription Upgrade Tech Spec

**Date:** 19 April 2026  
**Status:** Proposed  
**Owner:** ANOTE web

---

## 1. Purpose

This document defines the technical changes needed to bring the ANOTE web demo transcription pipeline in line with the validated mobile improvements.

The goal is to improve:
- Czech medical transcription accuracy
- robustness against hallucinations
- upload efficiency and long-audio handling
- demo reliability during live usage

---

## 2. Scope

### In scope
1. Switch the web demo transcription backend from Whisper to **gpt-4o-mini-transcribe** deployed in **Sweden Central**.
2. Add the validated Czech **medical terminology prompt** to every transcription request.
3. Add **hallucination filtering** to all transcript output.
4. Improve robustness with:
   - **8 kHz mono WAV normalization** before upload
   - **overlap-based chunk stitching** for long audio
   - **safer rate-limit settings** for real demo usage

### Out of scope
- report-generation prompt redesign
- EHR integrations
- mobile app changes
- UI redesign beyond minimal demo-state messaging

---

## 3. Current State

The current web demo:
- uses the older Whisper transcription path
- forces Czech via `language=cs`
- uploads recorded or user-provided audio to the demo transcription API
- does **not** apply a medical prompt
- does **not** filter hallucinated phrases, URLs, or emoji
- does **not** deduplicate transcript overlap across long segments
- uses conservative in-memory rate limits that may be too tight for a longer live demo session

---

## 4. Target Architecture

### 4.1 Transcription model
Replace the current Azure Whisper endpoint with the Sweden Central Azure OpenAI deployment:
- **Model:** `gpt-4o-mini-transcribe`
- **Region:** Sweden Central
- **Deployment type:** GlobalStandard

The request remains multipart form-data and is compatible with the existing backend route shape.

### 4.2 Required request fields
Each transcription request should include:
- `file`
- `language=cs`
- `response_format=json`
- `prompt=<validated Czech medical terminology prompt>`

### 4.3 Post-processing pipeline
Every returned transcript must pass through a cleanup layer that removes:
- known hallucination phrases
- URLs
- emoji and non-speech junk artifacts

This filtering should apply to:
- live chunk transcription results
- uploaded-file transcription results
- final stitched transcription output

### 4.4 Audio normalization
Before transcription, audio should be normalized to:
- **mono**
- **8 kHz** sample rate
- WAV container suitable for Azure transcription upload

This is expected to reduce payload size and improve demo responsiveness while keeping speech quality adequate for transcription.

### 4.5 Long-audio stitching
For recordings or uploads longer than the ideal single-request window:
- segment audio into chunks
- add **10-second overlap** between adjacent chunks
- remove repeated text at boundaries using overlap matching on the transcript text

This prevents clipped sentences and duplicate words near chunk edges.

### 4.6 Rate-limit behavior
The demo rate-limit logic should be adjusted so real demo sessions are not blocked prematurely.

Safer behavior options:
- raise the allowed request count for transcription and report generation
- optionally distinguish between live chunk updates and full upload processing
- keep user-facing protection against abuse while avoiding false positives during ordinary use

---

## 5. Functional Requirements

### FR-1 Model upgrade
The web demo must send transcription requests to `gpt-4o-mini-transcribe` instead of the older Whisper deployment.

### FR-2 Czech medical prompt
The backend must include the approved Czech medical terminology prompt in every transcription request.

### FR-3 Hallucination cleanup
The backend must sanitize all transcripts before returning them to the frontend.

### FR-4 Output compatibility
The API response contract must remain compatible with the current frontend:

```json
{
  "transcript": "..."
}
```

### FR-5 Robust long-audio behavior
Longer recordings and uploads must produce a single coherent transcript without repeated overlap text.

### FR-6 Efficient upload preprocessing
The demo should reduce audio payload size through normalization/downsampling before sending to Azure.

### FR-7 Demo-safe limits
A normal live demo session of up to 10 minutes should not hit rate limiting under expected usage.

---

## 6. Non-Functional Requirements

- **Accuracy:** measurable improvement for Czech medical language over the old Whisper-based setup
- **Reliability:** no regression in the existing demo record/upload flow
- **Performance:** shorter upload time for processed audio where possible
- **Safety:** keep transcript cleanup conservative and avoid deleting legitimate medical content
- **Backward compatibility:** existing frontend components should not require major structural changes

---

## 7. Proposed Backend Changes

### A. Transcription API route
Update the demo transcription route to:
- use the new Sweden Central endpoint/key configuration
- send `response_format=json`
- send the Czech medical prompt
- clean returned text through the hallucination filter

### B. Transcript cleanup utilities
Add a reusable transcript sanitation utility with:
- phrase blacklist matching
- diacritics-insensitive comparison
- URL stripping
- emoji stripping

### C. Audio preprocessing utility
Add a preprocessing layer to normalize input audio before upload.

Implementation can be done either:
- client-side before sending the file, or
- server-side before forwarding to Azure

For the demo, the preferred path should minimize complexity while still reducing payload size.

### D. Chunk-stitching logic
Add overlap removal to the assembly of chunk transcripts so final transcript output is smoother and less repetitive.

### E. Rate-limit tuning
Revise limit thresholds to reflect the actual live demo cadence.

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Sweden Central endpoint misconfigured | transcription unavailable | add explicit env validation and fallback error messaging |
| Prompt causes unexpected formatting bias | minor transcript changes | keep prompt terminology-focused, not instruction-heavy |
| Over-aggressive hallucination filter removes valid words | content loss | limit blacklist to verified artifacts and test on sample transcripts |
| Audio normalization adds latency | slower first upload on weak devices | keep preprocessing lightweight and benchmark on real demo files |
| Rate limits too loose | abuse risk | keep IP-based guardrails and log request counts |

---

## 9. Validation Plan

### Must verify
1. transcription requests succeed against the Sweden Central deployment
2. Czech medical terms are transcribed more accurately than before
3. junk phrases/URLs/emoji are removed from returned transcripts
4. long recordings do not contain duplicated overlap text
5. demo recording and upload flows still work end-to-end
6. a full demo session can complete without rate-limit errors

### Suggested evaluation
- reuse the Czech FLEURS evaluation set from the mobile investigation
- compare before/after WER and CER where available
- run a small manual set of Czech medical dictation samples

---

## 10. Success Criteria

This work is considered successful when:
- the web demo uses `gpt-4o-mini-transcribe`
- the medical prompt and hallucination filter are active in production demo flow
- long audio handling is more robust
- demo reliability improves without UX regressions
- quality is materially closer to the improved mobile behavior
