# ANOTE-web backend

App-3-owned FastAPI service powering the ANOTE-web demo. Runs as the
`anote-web-api` Container App (resource group `anote-rg`, West Europe).

Image: `ca859739e5daacr.azurecr.io/anote-web-api:<tag>`.

The mobile backend image (`anote-api`) and repo are unaffected by changes here.
This folder was seeded once from the mobile backend on 2026-04-25 and now
evolves independently inside ANOTE-web.

## Build & deploy (manual)

```bash
# Build & push to the existing ACR (creates the repo on first push).
az acr build \
  -r ca859739e5daacr \
  -t anote-web-api:<tag> \
  -t anote-web-api:latest \
  .

# Point the web Container App at the new tag.
az containerapp update \
  -n anote-web-api -g anote-rg \
  --image ca859739e5daacr.azurecr.io/anote-web-api:<tag>
```

Mobile (`anote-api` Container App) keeps pulling `anote-api:latest`. Do not
push to `anote-api`. Do not modify `anote-web-api` env vars from here without
matching change in `Knowledge.Healthcare/specs`.
