# PRD — Privacy-Preserving Agentic Payments for Cardano

**Product:** Nudu Clear, the Cardano settlement layer for Nudu.  
**Category:** Agentic commerce infrastructure: policy engine, multi-rail router, and x402 integration.  
**Status:** Requirements for an early prototype. This repository is not a production payment facilitator.

Read these documents in order. This PRD says who the product is for and what the prototype includes. [Architecture & Flows](02-ARCHITECTURE-AND-FLOWS.md) defines boundaries. [Monorepo Structure](03-MONOREPO-STRUCTURE.md) says which code exists today. [Validation & Open Decisions](04-VALIDATION-AND-OPEN-DECISIONS.md) records what was checked against Cardano, x402, and Masumi, and what is still open.

## 1. Executive summary and positioning

Nudu Clear sits between AI agents and payment services. It lets an agent discover paid APIs, complete delegated tasks, and request checkout through one SDK/MCP surface. Before authorizing payment, Nudu Clear evaluates the operator’s deterministic spending policy, obtains human approval when required, and routes only to an allowed adapter.

The product combines the low-friction HTTP 402 experience associated with x402 with Cardano’s eUTxO settlement model, and integrates with Masumi identity/task/escrow and external checkout providers such as Agentcard or Yuno. Nudu Clear adds the missing **pre-sign policy, cross-rail orchestration, and privacy-preserving audit layer**. It is not a consumer agent, a replacement for Masumi, or a new merchant processor.

The phrase “x402 facilitator” describes a target integration/category, not a claim that this repository already contains a production Cardano facilitator. A compatible Cardano x402 profile and provider must be selected before live settlement is claimed.

## 2. Problem and users

An HTTP 402 challenge can state payment terms, but it does not establish that an agent is permitted to pay, that the budget is available, that a human approved a high-risk action, or that the evidence is auditable without exposing private prompts and API data.

- **Agent developers:** want one `fetchWithPayment` API and reusable agent/MCP integration.
- **Agent operators:** need budgets, allowed providers/actions, rail rules, and approvals.
- **API/task providers:** need a payment proof or settlement reference they can verify.
- **Auditors/integrators:** need a commitment and controlled access to encrypted audit evidence.

## 3. Product pillars

| Product value | Component | MVP deliverable |
| --- | --- | --- |
| **Don’t Make Me Think** | Unified SDK and MCP surface | SDK foundation exposing `agent.fetchWithPayment(url, options)`; MCP server is a follow-on integration. |
| **You’ve Got My Attention!** | Programmable agent commerce | Validate HTTP 402 challenges and route only eligible actions. |
| **Show Me the Value!** | Audit/commitment service | Encrypt detailed records off-chain; optionally anchor a domain-separated Blake2b-256 commitment on Cardano. |
| **Trust Without Friction** | Policy engine and HITL | Per-call/session/daily limits, allowlists, approval gates, denial paths. |
| **Build Once. Integrate Everywhere.** | Adapter boundary | Cardano rail plus separately enabled Masumi and external checkout adapters. |

## 4. Core journey and example scenarios

### Paid research API

1. The operator sets a **100 USDM session budget**, auto-approval for payments **below 5 USDM**, and human approval for amounts **at or above 5 USDM** or for designated checkout rails.
2. The agent requests `GET /v1/market-data`.
3. The provider returns `402 Payment Required` with a challenge priced at **1.5 USDM** and a supported network/asset/payee.
4. Nudu Clear validates and binds the challenge to the request, then checks the policy. If the configured Cardano adapter supports the asset and profile, the 1.5 USDM action is eligible for auto-approval.
5. The selected adapter delegates transaction construction/signing/submission or facilitator handling. The exact proof header and confirmation source are adapter-specific.
6. Nudu Clear creates an encrypted off-chain audit record and may anchor a minimal commitment/reference on Cardano.
7. The SDK retries/completes the request according to the configured x402 profile and returns the resource plus settlement/audit references.

### Product checkout

After research, the agent selects a product and requests a fiat checkout. The policy engine pauses execution when the configured threshold or rail rule requires a person. Only after approval for the exact provider, amount, and action may an enabled Agentcard/Yuno adapter proceed. A fiat checkout must not be silently retried through a crypto rail after an uncertain provider result.

The amounts in this document, the landing flow, and the simulator are separate examples. They are not production prices and they are not protocol constants.

## 5. MVP requirements

### Functional

- Parse a bounded, versioned HTTP 402 challenge; treat response headers/body as untrusted input.
- Bind challenge, recipient, amount, operation, network, and expiry to the original request.
- Evaluate a policy before payment authorization. Use integer minor units and an explicit asset/currency; no floating point for authorization.
- Support per-transaction, session, and daily limits; allowed operations/domains/recipients/rails; and scoped human approval.
- Define the threshold rule as `amount >= threshold` requires approval.
- Fail closed on malformed/mismatched amounts, expired policy/challenge, denied provider, no capable adapter, approval timeout/rejection, or ambiguous settlement status.
- Make retries idempotent and prevent concurrent actions from overspending a shared budget.
- Keep raw prompts, PII, API responses, credentials, and keys off public Cardano metadata.
- Label every landing-page network state, transaction/hash, and rail result as simulated.

### Non-functional

- TypeScript strict mode, pnpm workspace, and Turborepo tasks.
- Keyboard access, semantic DOM, visible focus, reduced-motion behavior, stable layout, and WCAG AA contrast.
- Responsive at 390px, tablet widths, and 1440px without horizontal page overflow.
- GSAP `useGSAP`/ScrollTrigger cleanup; compositor-friendly motion and a static/reduced-motion fallback.

### Protocol positioning correction

Nudu Clear targets the current **x402 V2 HTTP transport** (`PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE`, `PAYMENT-RESPONSE`) while allowing a separately labeled legacy/proposed challenge shape for demos. The Cardano x402 `exact` scheme documents three transfer methods: `default` address payment, `masumi` escrow, and `script` custom contract transfer. Nudu Clear can select among them, but only when the configured facilitator/adapter supports the method and asset.

The first user journey should explicitly choose:

- **Direct Cardano x402 (`default`)** for low-risk, fixed-price API calls.
- **Masumi x402 transfer method (`masumi`)** when the job needs escrow/refund/dispute mechanics.
- **Masumi MIP-003** for broader agent-service lifecycle, identity/registry, and escrow semantics.
- **Agentcard/Yuno adapters** only as externally verified checkout providers.

## 6. Scope boundaries

### Prototype includes

- Landing page that explains x402/Cardano, Masumi, policy, routing, and audit boundaries.
- Local policy simulator with approval, denial, rail selection, ephemeral AES-GCM encryption, and a computed Blake2b-256 digest.
- Shared TypeScript contracts and an SDK policy/client skeleton.

### Not included yet

- Mainnet/testnet transaction construction, wallet signing, submission, or confirmation.
- Production x402 Cardano facilitator, Masumi API integration, Agentcard/Yuno adapter, or MCP server.
- Aiken spend validator, on-chain policy vault, KMS, encrypted audit store, or audit indexer.
- Claims that a public hash is private, proves payment, or proves policy execution.

## 7. Product success criteria

- Integrators understand what Nudu Clear reuses and what it adds.
- Policy decisions are deterministic, auditable, fail-closed, and happen before authorization.
- Approval/denial, no-adapter, timeout, and retry paths are represented and testable.
- Private audit data is encrypted off-chain; only minimal commitment metadata may be public.
- The simulator never presents a local computation as a Cardano transaction.
- SDK/shared types build and typecheck; policy threshold/budget boundary tests pass.

For protocol examples, security assumptions, repository boundaries, design tokens, and unresolved integration decisions, see [Architecture & Flows](02-ARCHITECTURE-AND-FLOWS.md), [Monorepo Structure](03-MONOREPO-STRUCTURE.md), and [Validation & Open Decisions](04-VALIDATION-AND-OPEN-DECISIONS.md).
