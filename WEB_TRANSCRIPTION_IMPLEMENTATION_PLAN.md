# ANOTE Web Demo — Transcription Upgrade Implementation Plan

**Date:** 19 April 2026  
**Status:** Ready for implementation

---

## Objective

Implement the highest-value web demo improvements in this order:

1. **Upgrade the transcription backend first**
   - model switch
   - Czech medical prompt
   - hallucination filter

2. **Then improve robustness**
   - 8 kHz normalization
   - overlap-based chunk stitching
   - safer rate-limit settings for demo usage

---

## Phase 1 — Core transcription upgrade

### 1. Switch to `gpt-4o-mini-transcribe`
**Priority:** High

#### Tasks
- update environment configuration to use the Sweden Central Azure OpenAI transcription deployment
- keep the existing web demo API route contract unchanged
- confirm the route still returns a simple transcript payload to the frontend

#### Expected result
Higher Czech transcription accuracy with fewer hallucinations than the old Whisper-based setup.

#### Deliverables
- updated demo transcription route
- updated environment variable documentation
- verified end-to-end transcription success

---

### 2. Add Czech medical terminology prompt
**Priority:** High

#### Tasks
- add the validated medical terminology prompt from the mobile findings
- include it in every transcription request
- keep `language=cs` explicitly set

#### Expected result
Better recognition of drug names, procedures, findings, and common Czech medical phrases.

#### Deliverables
- central prompt constant or utility
- prompt wired into transcription requests

---

### 3. Add hallucination filter
**Priority:** High

#### Tasks
- implement transcript cleanup for:
  - known hallucination phrases
  - URLs
  - emoji
- run cleanup on every transcript response before sending it back to the frontend
- ensure the filter is conservative and deterministic

#### Expected result
Cleaner transcript output, especially around silence/noise artifacts.

#### Deliverables
- transcript sanitization helper
- route integration with unit-level verification where practical

---

## Phase 2 — Robustness improvements

### 4. Add 8 kHz normalization
**Priority:** Medium

#### Tasks
- normalize uploaded/demo audio to mono 8 kHz WAV before transcription where feasible
- verify file size reduction and compatibility with Azure transcription
- ensure the preprocessing path does not break the current browser recording flow

#### Expected result
Lower upload cost and faster transfer without meaningful loss in speech transcription quality.

#### Deliverables
- audio preprocessing helper
- validation using a few real demo recordings

---

### 5. Implement overlap-based chunk stitching
**Priority:** Medium

#### Tasks
- define chunk boundaries for long audio handling
- add 10-second overlap between adjacent chunks
- compare the trailing words of the previous chunk with the start of the current chunk
- remove duplicated boundary text before assembling the final transcript

#### Expected result
Smoother long-form transcripts with fewer repeated or clipped phrases.

#### Deliverables
- overlap removal utility
- integrated final transcript assembly flow

---

### 6. Adjust demo-safe rate limits
**Priority:** Medium

#### Tasks
- review the current request cadence during a normal 10-minute recording session
- increase thresholds or refine rules so expected demo use is not blocked
- preserve abuse protection and clear user-facing errors

#### Expected result
A full live demo can complete without accidental 429 responses.

#### Deliverables
- updated demo rate-limit configuration
- verified session behavior under expected usage

---

## Suggested File Touchpoints

Likely implementation areas:
- demo transcription API route
- demo session chunk assembly logic
- audio recording/upload preprocessing utilities
- rate-limit configuration
- environment setup docs

---

## Execution Order

### Step 1
Implement the **backend transcription upgrade**:
- model switch
- prompt injection
- hallucination filtering

### Step 2
Verify:
- upload flow works
- live recording flow works
- transcript quality is improved on Czech samples

### Step 3
Implement **robustness improvements**:
- 8 kHz normalization
- overlap stitching
- rate-limit tuning

### Step 4
Re-verify end-to-end demo behavior with:
- short recording
- long recording
- uploaded audio file

---

## Test and Verification Checklist

### Core checks
- [ ] transcription API responds successfully with the new Azure deployment
- [ ] Czech language remains explicitly enforced
- [ ] medical terms improve on representative samples
- [ ] hallucinated junk phrases are removed from results

### Robustness checks
- [ ] processed audio uploads successfully after normalization
- [ ] long transcript assembly does not duplicate overlap text
- [ ] 10-minute demo flow does not hit the rate limiter in normal use

### Regression checks
- [ ] demo page loads normally
- [ ] microphone recording still starts and stops correctly
- [ ] file upload still works
- [ ] report generation still works after transcript changes
- [ ] production build remains clean

---

## Rollout Notes

- deploy backend-facing environment changes first
- verify the Sweden Central transcription deployment is reachable before enabling broadly
- if needed, keep the old path as a temporary rollback option during rollout

---

## Definition of Done

The work is complete when:
- the web demo is using `gpt-4o-mini-transcribe`
- the Czech medical prompt is active
- hallucination cleanup is applied to every transcript
- robustness improvements are shipped for normalization, overlap handling, and rate-limit safety
- end-to-end demo verification passes
