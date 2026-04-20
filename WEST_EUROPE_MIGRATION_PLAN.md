# ANOTE Web — West Europe Migration Plan

Date: 18 April 2026
Status: Draft for approval
Owner: GitHub Copilot execution after confirmation

## 1. Objective

Move the entire public web stack for ANOTE Web to West Europe in Azure so that:

- the Static Web App hosting resource runs in West Europe
- the live backend stays in West Europe
- Azure OpenAI stays in West Europe
- production traffic is cut over safely with rollback available

## 2. Verified current state

Verified from the live Azure subscription:

- Static Web App: **anote-web**
- Static Web App region: **East US 2**
- Resource group: **anote-rg**
- Default hostname: **ashy-sea-04ea79a0f.1.azurestaticapps.net**
- Current backend app setting points to: **https://anote-web-api.ambitiousglacier-2f728603.westeurope.azurecontainerapps.io**
- Azure OpenAI resource: **anote-openai** in **westeurope**
- Current bound custom hostnames on the SWA resource: **none returned by Azure CLI**

## 3. Important constraint

Azure Static Web Apps are not typically moved across regions in place.

### Recommended migration pattern

Use a **blue/green replacement**:

1. create a brand-new Static Web App in **West Europe**
2. copy the current production settings
3. deploy the same GitHub repo to it
4. validate the new hostname end to end
5. switch production traffic and domain over
6. remove the old East US 2 app only after sign-off

This is the safest and lowest-risk approach.

## 4. Proposed target architecture

- Static Web App hosting: **West Europe**
- API backend: **West Europe**
- Azure OpenAI: **West Europe**
- Optional custom domain: **anote.cz** and **www.anote.cz** attached to the new SWA after validation

## 5. Migration plan

### Phase A — Pre-migration snapshot

Purpose: preserve the current production setup and collect everything needed for a no-surprise cutover.

Actions:

- export current app settings from the live Static Web App
- record current resource metadata and default hostname
- confirm the GitHub repo and branch used for deployment
- keep the current East US 2 app untouched during the migration

Current deployment inputs already confirmed:

- GitHub repo: https://github.com/IvanAnikin/ANOTE_web.git
- Branch: main
- Required app settings keys:
  - AZURE_WHISPER_ENDPOINT
  - AZURE_WHISPER_KEY
  - ANOTE_BACKEND_URL
  - ANOTE_API_TOKEN
  - ADMIN_SECRET
  - CONTACT_EMAIL_TO
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_SECURE
  - SMTP_USER
  - SMTP_PASS
  - SMTP_FROM

### Phase B — Create the replacement Static Web App in West Europe

Create a new production candidate resource, for example:

- anote-web-weu

Suggested CLI shape:

```bash
az staticwebapp create \
  --name anote-web-weu \
  --resource-group anote-rg \
  --location westeurope \
  --source https://github.com/IvanAnikin/ANOTE_web.git \
  --branch main \
  --app-location / \
  --output-location .next \
  --sku Free \
  --login-with-github
```

Notes:

- if desired, a new resource group can be used instead of reusing **anote-rg**
- a temporary resource name is fine; the public domain does not need to match the Azure resource name

### Phase C — Reapply production configuration

Copy the current production settings into the new West Europe SWA.

Key live values to preserve:

- ANOTE_BACKEND_URL should remain the **West Europe** Container App URL
- AZURE_WHISPER_ENDPOINT should remain the **anote-openai** Azure OpenAI endpoint
- SMTP and admin/contact values should be copied exactly

Suggested CLI shape:

```bash
az staticwebapp appsettings set \
  --name anote-web-weu \
  --resource-group anote-rg \
  --setting-names \
    "AZURE_WHISPER_ENDPOINT=..." \
    "AZURE_WHISPER_KEY=..." \
    "ANOTE_BACKEND_URL=..." \
    "ANOTE_API_TOKEN=..." \
    "ADMIN_SECRET=..." \
    "CONTACT_EMAIL_TO=..." \
    "SMTP_HOST=..." \
    "SMTP_PORT=..." \
    "SMTP_SECURE=..." \
    "SMTP_USER=..." \
    "SMTP_PASS=..." \
    "SMTP_FROM=..."
```

### Phase D — Fix stale regional references in the repo

Before or during the cutover, clean up the repo so the web app no longer references the old West US 2 endpoint in configuration/documentation.

Known stale reference already identified:

- the CSP connect-src in staticwebapp.config.json still includes the older West US 2 backend URL

Recommended update:

- replace the old West US 2 URL with the active West Europe backend URL
- optionally use a stable custom API domain later so future region changes do not require another CSP update

### Phase E — Validate the new West Europe deployment

Smoke tests to run on the new SWA hostname:

1. homepage loads correctly
2. Czech and English routes load
3. live demo can reach transcription and report generation
4. contact form submission works
5. admin route still respects ADMIN_SECRET
6. browser console shows no CSP or network region issues
7. response headers are still correct

Azure verification to run:

- confirm the new SWA resource location is **West Europe**
- confirm the new SWA app settings point only to West Europe services

### Phase F — Production cutover

There are two safe cutover choices.

#### Option 1 — GitHub token cutover only

Use when the default Azure hostname is acceptable temporarily.

Steps:

- switch the GitHub deployment secret to the new SWA deployment token
- trigger a production deployment from main
- validate again

#### Option 2 — Full domain cutover

Use when anote.cz or www.anote.cz should immediately point to the new West Europe app.

Steps:

- add the custom domain to the new SWA
- update DNS records
- wait for validation and propagation
- verify HTTPS certificate issuance
- re-check the public site and demo flows

### Phase G — Post-cutover verification

Success criteria:

- Static Web App location is West Europe
- backend calls resolve to West Europe
- Azure OpenAI calls resolve to West Europe
- production pages and demo work normally
- no dependency remains on the East US 2 SWA

### Phase H — Decommission old resource

Only after explicit sign-off:

- keep the old East US 2 SWA for a short rollback window
- if no issues appear, delete the old Static Web App

## 6. Rollback plan

If anything fails during validation or after cutover:

- switch GitHub deployment token back to the old SWA
- if DNS was switched, point the domain back to the previous endpoint
- keep the old East US 2 app online until the new West Europe app is proven stable

Rollback is low risk because the old app remains untouched during migration.

## 7. What I can execute after approval

After your confirmation, I can perform the migration end to end:

1. create the new West Europe SWA
2. copy the live settings
3. update the repo config for the West Europe backend references
4. verify the deployment
5. prepare or execute the cutover
6. confirm the final Azure resource locations with CLI evidence

## 8. Approval checklist

Please confirm these decisions before execution:

- preferred new SWA resource name: **anote-web-weu** or another name
- keep using **anote-rg** or create a separate resource group
- whether to cut over only the Azure hostname first or also switch the production custom domain immediately
- whether the old East US 2 resource should be deleted right away or kept for a rollback window
