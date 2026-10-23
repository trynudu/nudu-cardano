# Monorepo Structure — Nudu Clear

## 1. Goals

Separate the public web prototype, shared protocol contracts, and framework-neutral SDK. Keep future facilitator services, payment adapters, and Aiken contracts outside the web app. The target architecture below distinguishes what exists today from what is only planned.

## 2. Current repository

```text
.
├── apps/
│   └── web/                         Next.js App Router landing + local simulator
│       ├── app/                     route, layout, global styles
│       ├── components/              isolated landing-page sections
│       ├── public/specs/            static web copies of the source specs
│       └── DESIGN.md                web design companion; not protocol source of truth
├── packages/
│   ├── shared-types/                @cardano-agent-pay/shared-types
│   │   └── src/index.ts             policy, x402, proof, audit, adapter contracts
│   └── sdk/                         @cardano-agent-pay/sdk
│       └── src/index.ts             fetchWithPayment + policy evaluator skeleton
├── specs/
│   ├── 01-PRD-PRODUCT-SPEC.md
│   ├── 02-ARCHITECTURE-AND-FLOWS.md
│   ├── 03-MONOREPO-STRUCTURE.md
│   └── 04-VALIDATION-AND-OPEN-DECISIONS.md
├── pnpm-workspace.yaml
└── turbo.json
```

`apps/web/public/specs/` mirrors the four source Markdown files because Next serves files from `public/`. Edit `specs/` first, then copy the updated files into the public directory. The files in `specs/` are canonical.

Local agent tooling (`.agents/`, `.taste-skill/`, `.playwright/`) and build output (`node_modules/`, `.next/`, `dist/`) stay out of the published tree.

## 3. Planned packages/services, not scaffolded

```text
apps/api/                   facilitator API, policy persistence, approval webhooks
packages/x402-middleware/   provider-side Hono/Express seller middleware
packages/adapters/          Cardano x402, Masumi, Agentcard, Yuno integrations
packages/contracts/         Aiken vault/validator only after threat-model review
services/audit/             KMS encryption, encrypted record store, anchor/indexer
```

Do not create these packages until API contracts, security boundaries, ownership, and deployment needs are agreed.

## 4. Package boundaries

### `@cardano-agent-pay/shared-types`

- Protocol-neutral TypeScript interfaces and normalized internal shapes.
- No runtime framework dependency.
- Use integer minor-unit strings for JSON and explicit currency/asset identifiers.
- Keep protocol wire-format differences in adapter parsers, not in generic policy types.

### `@cardano-agent-pay/sdk`

- Depends on shared types only; must not depend on Next.js, React, or browser UI.
- Provides `createAgentClient(...).fetchWithPayment(url, options)` and pure `evaluatePolicy` foundation.
- Does not contain production signers, custody, facilitator secrets, or a Cardano transaction builder.
- Adapter provides the proof headers; the generic client does not invent an x402 header.

### `apps/web`

- Next.js App Router, React, strict TypeScript, Tailwind CSS v4.
- Public explainer and local simulator only. No production wallet, payment, API, or Cardano node calls.
- Every synthetic network value, hash, receipt, and anchor must remain labeled as a demo.

## 5. Toolchain and commands

- **Package manager:** pnpm workspace.
- **Task runner:** Turborepo.
- **Web:** Next.js App Router + React + TypeScript + Tailwind CSS v4.
- **Motion:** `gsap`, `@gsap/react` (`useGSAP`), and ScrollTrigger.
- **Verification:** TypeScript checks, SDK policy tests, Taste-Skill inspector, and Playwright CLI.

```sh
pnpm install
pnpm --filter web dev
pnpm build
pnpm typecheck
pnpm test
```

## 6. Conventions

- ESM packages, strict TypeScript, explicit package exports.
- `Money` at authorization boundaries is integer minor units plus a verified currency/asset and decimals; never use floating point for signing decisions.
- `AgentSpendingPolicy`, `X402PaymentRequiredPayload`, `CardanoX402Proof`, `AuditCommitmentRecord`, and `PaymentRailAdapter` live in shared types.
- Policy evaluation happens before payment authorization; adapter settlement and confirmation are separate states.
- Use semantic links/buttons, labeled inputs, visible focus, `aria-live` for async outcomes, and reduced-motion fallbacks.
- `apps/web/DESIGN.md` points to design rules; product/protocol requirements remain in `specs/`.

## 7. Build and test dependencies

`turbo build` builds shared types and SDK before the web app. `turbo typecheck` and `turbo test` depend on package builds. Keep test fixtures synthetic; tests must not require a real wallet, provider API key, or Cardano network.
