# Environment Policy & Production Gates

## Runtime & Tooling

- **Node.js**: 22 (pinned via `.nvmrc` / `.node-version`)
- **Package Manager**: pnpm (pinned via `package.json#packageManager` + corepack)
- All environments (local, CI, production) MUST resolve identical dependency trees

## Cloud Accounts & Regions

| Environment | Provider | Region | Owner |
|-------------|----------|--------|-------|
| Development | (TBD) | ap-northeast-2 (Seoul) | DevOps Lead |
| Test/Staging | (TBD) | ap-northeast-2 (Seoul) | DevOps Lead |
| Production | (TBD) | ap-northeast-2 (Seoul) | CTO / Infrastructure Owner |

> **D6**: 1차 목표 시장은 한국 단일 시장. 모든 primary 데이터는 한국 리전에 상주.

## Credential Ownership & Rotation

| Credential | Owner | Rotation Cycle | Storage |
|-----------|-------|----------------|---------|
| Database URL | DevOps Lead | 90 days | Secret Manager |
| Supabase Service Role Key | DevOps Lead | On-demand | Secret Manager |
| AI Provider Keys | AI Tech Lead | 90 days | Secret Manager |
| Payment Gateway Secret | Finance Eng | 180 days | Secret Manager |

## Environment Boundary Rules

### Local & Test
- Synthetic credentials ONLY — real production secrets must NEVER appear
- Cloud service emulators and deterministic mocks are permitted
- Boot/CI MUST fail if production credentials or real external data is detected
- Detection: `ENVIRONMENT` env var must be `development` | `test`; if `production` secrets pattern is found in non-production env, abort

### Production
- All credentials must be sourced from the designated Secret Manager
- Direct environment variable injection from CI pipelines is prohibited
- Emulator/mock paths must be unreachable (build-time dead-code elimination + runtime check)

## Production Gate: Source License Evidence

Before ANY Provider data enters production ingestion:

1. **source URL** — link to the official data source page
2. **license identifier or text snapshot** — SPDX code OR full license text captured
3. **commercial use allowed** — boolean, verified against source
4. **redistribution allowed** — boolean, verified against source
5. **verified at / verified by** — timestamp + person who checked
6. **approved at / approved by** — timestamp + person who authorized

If `approvedAt` is NULL → production ingestion is BLOCKED for that Provider.
Unmasking of factor values is permitted ONLY when `approvedAt IS NOT NULL AND redistributionAllowed = true`.

## Production Gate: TLS Evidence

### App-Controlled / Configurable Endpoints
- TLS 1.3 MUST be enforced
- TLS 1.2 and below negotiation MUST be rejected at edge configuration
- Boot-time smoke test verifies minimum protocol version; failure = boot abort

### Managed Dependencies (Supabase, AI providers, payment gateways, etc.)
- Minimum TLS 1.2 guarantee MUST be documented with evidence
- Evidence: official documentation link, or probe result capturing negotiated version
- If evidence is absent or guarantee cannot be confirmed → production connection BLOCKED

| Managed Dependency | Min TLS Guarantee | Evidence |
|-------------------|-------------------|----------|
| Supabase (Postgres) | TLS 1.2+ | (link TBD) |
| AI Provider (primary) | TLS 1.2+ | (link TBD) |
| AI Provider (alternate) | TLS 1.2+ | (link TBD) |
| Payment Gateway | TLS 1.2+ | (link TBD) |

## Local Development: Emulators & Mocks

- Supabase local: `supabase start` (local Docker-based emulator)
- AI: deterministic mock returning canned responses (seeded)
- Payment: mock gateway returning success/failure by test card number
- Email: local SMTP capture (e.g., MailHog)

These paths are gated by `process.env.ENVIRONMENT !== 'production'`. If this check is bypassed or the env var is missing in production, the app refuses to start.
