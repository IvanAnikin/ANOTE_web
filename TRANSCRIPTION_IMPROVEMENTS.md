# Transcription Improvements — Summary from Mobile App Session

**Date:** April 2026
**Source:** ANOTE mobile app (`ANOTE_mobile`) session findings
**Purpose:** Apply these improvements to the ANOTE web app demo

---

## 1. Switch from Whisper to gpt-4o-mini-transcribe

### Why
We ran a proper evaluation on 12 Czech FLEURS test samples (read speech, CC-BY licensed). Results:

| Model | Avg WER | Avg CER | Won samples |
|---|---|---|---|
| **gpt-4o-mini-transcribe** | **5.0%** | **1.1%** | **7 / 11** |
| whisper | 14.1% | 3.5% | 2 / 11 |

gpt-4o-mini-transcribe is **2.8× better** on WER. On one Hurvínek test clip, whisper had **100% WER** (complete hallucination) while gpt-4o-mini-transcribe was near-perfect.

### Azure deployment details
- **Resource:** `anote-openai-swe` (Sweden Central region)
- **Deployment name:** `gpt-4o-mini-transcribe`
- **SKU:** GlobalStandard
- **Endpoint:** `https://anote-openai-swe.openai.azure.com/openai/deployments/gpt-4o-mini-transcribe/audio/transcriptions?api-version=2024-06-01`
- **API key:** (same key used in mobile app's `secrets.dart`)

> **Note:** West Europe does NOT support GlobalStandard SKU for this model. Sweden Central works.

### API request format (unchanged from Whisper)
The request format is identical — multipart form-data with these fields:
- `file`: WAV audio (we downsample 16kHz→8kHz to halve upload size)
- `language`: `cs`
- `response_format`: `json`
- `prompt`: Czech medical terminology prompt (see below)

### Medical terminology prompt
This prompt steers the model toward correct Czech medical vocabulary:

```
Lékařská prohlídka, anamnéza pacienta, nynější onemocnění.
Homansovo znamení, Murphyho znamení, Lasègueovo znamení.
Hluboká žilní trombóza, plicní embolie, infarkt myokardu, fibrilace síní.
CT angiografie, RTG plic, EKG, echokardiografie, gastroskopie, kolonoskopie.
Chrůpky, krepitace, vrzoty, dýchání sklípkové, poklep plný jasný.
Krevní tlak, tepová frekvence, saturace kyslíkem, dechová frekvence.
Metformin, Prestarium, bisoprolol, atorvastatin, warfarin, heparin, furosemid.
Cirhóza, pneumonie, cholecystitida, appendicitida, pankreatitida.
Alergická anamnéza, farmakologická anamnéza, rodinná anamnéza.
Hypertenze, diabetes mellitus, hypercholesterolémie.
Objektivní nález, subjektivní potíže, pracovní diagnóza.
```

---

## 2. Whisper Hallucination Filter (post-processing)

Whisper (and to a lesser degree gpt-4o-mini-transcribe) can hallucinate text during silence or noise. We built a post-processing filter that should be applied to **all** transcription output.

### What it removes
1. **Known hallucination phrases** (case-insensitive, diacritics-stripped matching):
   - `titulky vytvoril johnyx`
   - `titulky vytvoril`
   - `dekuji za zhlednuti`
   - `navstevy navstevani`
   - `hraje hudba`
   - `hudba hraje`
   - `subtitrari`
   - `napisy vytvoril`

2. **URLs** — regex: `https?://\S+|www\.\S+`
   - Whisper commonly hallucinates `www.htradeckralove.cz` and similar URLs

3. **Emoji** — full Unicode emoji ranges (Whisper sometimes injects random emoji)

### Python implementation for the web backend

```python
import re
import unicodedata

HALLUCINATION_PHRASES = [
    "titulky vytvoril johnyx",
    "titulky vytvoril",
    "dekuji za zhlednuti",
    "navstevy navstevani",
    "hraje hudba",
    "hudba hraje",
    "subtitrari",
    "napisy vytvoril",
]

URL_PATTERN = re.compile(r'https?://\S+|www\.\S+', re.IGNORECASE)

EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002600-\U000026FF"  # misc symbols
    "\U00002700-\U000027BF"  # dingbats
    "\U0001F900-\U0001F9FF"  # supplemental
    "\U0000200D"             # zero width joiner
    "\U000020E3"             # combining enclosing keycap
    "\U000FE00-\U000FE0F"    # variation selectors
    "\U000E0020-\U000E007F"  # tags
    "]+",
    flags=re.UNICODE,
)


def _strip_diacritics(text: str) -> str:
    """Remove diacritics for comparison (č→c, ř→r, etc.)"""
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def remove_hallucinations(text: str) -> str:
    """Remove known Whisper hallucination artifacts from transcription text."""
    if not text:
        return text

    # Remove URLs
    result = URL_PATTERN.sub("", text)

    # Remove emoji
    result = EMOJI_PATTERN.sub("", result)

    # Remove known hallucinated phrases (diacritics-insensitive)
    words = result.split()
    for phrase in HALLUCINATION_PHRASES:
        phrase_words = phrase.split()
        phrase_len = len(phrase_words)
        cleaned = []
        i = 0
        while i < len(words):
            if i + phrase_len <= len(words):
                window = [_strip_diacritics(w).lower() for w in words[i:i + phrase_len]]
                if window == phrase_words:
                    i += phrase_len
                    continue
            cleaned.append(words[i])
            i += 1
        words = cleaned

    return " ".join(words).strip()
```

---

## 3. Long Audio Chunking Strategy

For recordings longer than ~10 minutes, chunk the audio with overlap and deduplicate at boundaries:

- **Max chunk:** 10 minutes (at 16kHz = 9,600,000 samples)
- **Overlap:** 10 seconds (160,000 samples) between consecutive chunks
- **Deduplication:** After transcribing each chunk, compare the last ~30 words of the previous chunk with the beginning of the current chunk to remove duplicated text at the boundary

### Overlap removal algorithm (simplified)

```python
def remove_overlap(previous_tail: str, current_text: str) -> str:
    """Remove duplicated text at chunk boundaries.
    
    previous_tail: last ~30 words of previous chunk's transcription
    current_text: full transcription of current chunk
    """
    if not previous_tail or not current_text:
        return current_text
    
    tail_words = previous_tail.lower().split()
    current_words = current_text.split()
    current_lower = [w.lower() for w in current_words]
    
    # Find longest suffix of tail_words that matches a prefix of current_words
    best_match = 0
    for length in range(min(len(tail_words), len(current_lower)), 0, -1):
        if tail_words[-length:] == current_lower[:length]:
            best_match = length
            break
    
    if best_match > 0:
        return " ".join(current_words[best_match:])
    return current_text
```

---

## 4. Audio Preprocessing

- **Downsample 16kHz → 8kHz** before uploading to reduce upload size by 50%. Speech quality is preserved for transcription.
- WAV encoding at 8kHz mono, 32-bit float PCM

---

## 5. Key Architecture Decisions

| Decision | Rationale |
|---|---|
| Use `gpt-4o-mini-transcribe` over `whisper` | 2.8× lower WER on Czech, far fewer hallucinations |
| Deploy in **Sweden Central** | West Europe doesn't support GlobalStandard SKU |
| Keep hallucination filter even with new model | Still catches rare artifacts; defense in depth |
| Set `language=cs` explicitly | Prevents auto-detection errors on medical jargon |
| Use medical terminology prompt | Reduces misrecognition of drug names, procedures, anatomical terms |
| Downsample to 8kHz | Halves upload time with no accuracy loss for speech |
| Chunk at 10min with 10s overlap | API limit handling + smooth boundary stitching |

---

## 6. Evaluation Dataset

12 Czech samples from Google FLEURS (CC-BY 4.0), stored in `backend/eval_dataset/`:
- Files: `fleurs_00.wav` through `fleurs_11.wav` + `manifest.json` with ground-truth transcripts
- Total duration: ~141 seconds
- Use `comparison_results.json` for per-sample WER/CER results
- Evaluation uses `jiwer` library for WER/CER computation

You can reuse this dataset to validate the web app's transcription pipeline.

---

## Quick Checklist for Web App

- [ ] Switch transcription endpoint from whisper to `gpt-4o-mini-transcribe` (Sweden Central)
- [ ] Add hallucination filter as post-processing on transcription results
- [ ] Set `language=cs` and include the medical terminology prompt in requests
- [ ] Implement chunking + overlap removal for long recordings (>10 min)
- [ ] Downsample audio to 8kHz before upload
- [ ] Run evaluation against FLEURS Czech test samples to verify
