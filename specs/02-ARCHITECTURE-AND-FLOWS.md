# Technical Architecture & Protocol Flows

This document defines Nudu Clear component boundaries and expected flows. Fields marked **proposed** are an integration profile, not a claim about an already standardized Cardano x402 wire contract. Decisions still open are listed in [Validation & Open Decisions](04-VALIDATION-AND-OPEN-DECISIONS.md).

## 1. System architecture

```text
AI agent runtime (MCP / Claude / LangChain / custom)
        │ @cardano-agent-pay/sdk
        ▼
402 parser + request/challenge binding
        ▼
Deterministic Policy Engine ─────► HITL approval service (optional)
        │ allow + constraints
        ▼
Multi-rail router
   ┌────┴──────────────┬────────────────┐
   ▼                   ▼                ▼
Cardano x402       Masumi task/     Agentcard / Yuno
adapter             escrow adapter  checkout adapter
   └───────────────────┴────────────────┘
                       │ rail evidence/reference
                       ▼
       encrypted off-chain audit service
                       │ commitment + minimal metadata
                       ▼
                   Cardano anchor
```

Nudu Clear owns normalization, pre-sign policy, approval orchestration, rail selection, and the audit reference. It does not own Cardano consensus, provider identity, signing keys, merchant acquiring, or another network’s escrow lifecycle.

## 2. Core modules

### 2.1 Agent client

`agent.fetchWithPayment(url, options)` performs an ordinary request first. On a 402 it invokes a configured parser, binds the challenge to the original request, evaluates policy, obtains approval when required, selects an eligible adapter, and retries only with the adapter’s proof headers.

The client must not equate HTTP 402 with authorization, accept arbitrary provider headers as proof, infer finality from an HTTP response, or retry a non-replayable body without rebuilding it. A concrete adapter owns protocol-specific serialization and idempotency.

### 2.2 Deterministic Policy Engine

Pure evaluation over a normalized payment request and an immutable, versioned policy snapshot. It uses integer minor units, an explicit currency/asset, and stable reason codes. Suggested outcomes:

```ts
type PolicyDecision =
  | { outcome: "allow"; reason: "within_policy" }
  | { outcome: "require_approval"; reason: "approval_threshold"; amount: Money }
  | { outcome: "deny"; reason: string };
```

Evaluation order: validate amount/policy/challenge → scope/domain/recipient/operation → hard spend caps → threshold approval (`amount >= threshold`) → adapter eligibility. No parser result, invalid currency, or missing policy means deny.

The current `packages/shared-types` contract and `packages/sdk` evaluator are foundational subsets: they implement session/per-action checks and a threshold, but daily aggregation, allowed domains/rails, concurrency reservations, persisted policies, and approval-service lifecycle are not yet implemented.

### 2.3 HITL approval service

An approval request freezes the normalized action, amount, currency/asset, recipient/provider, selected rail, policy version, and expiry. Approval is bound to that exact tuple; any change requires reevaluation and a new approval. Webhooks are server-side, authenticated, replay-protected, and idempotent. Timeout, rejection, malformed response, or changed details fail closed.

### 2.4 Router and adapters

An adapter advertises supported schemes, networks, assets/currencies, operations, and challenge shapes. The router filters by both provider capability and policy before selection. Never switch to a different rail after an uncertain settlement unless an idempotency/reconciliation protocol proves the first attempt did not settle and policy explicitly allows the fallback.

- **Cardano x402:** settlement/facilitator integration target; exact facilitator and proof contract are open.
- **Masumi:** identity/task discovery and escrow/task lifecycle. Treat this as a distinct task integration unless a concrete adapter documents otherwise.
- **Agentcard/Yuno:** external checkout adapters subject to provider capability, API terms, and explicit operator policy.

## 3. HTTP 402 / x402 flow

1. Agent sends its original request.
2. Provider returns `402 Payment Required` with the x402 V2 payment-required header described below.
3. Parser validates size/version and normalizes accepted schemes, network, asset, amount, payee, timeout/expiry, challenge ID, and resource binding.
4. Policy engine checks the exact normalized action, budget, provider, rail, and threshold.
5. If required, the action pauses for approval bound to the immutable payment details.
6. Router selects an eligible adapter or returns a typed denial.
7. Adapter/facilitator/wallet delegates construction, signing, and submission according to its contract.
8. Adapter returns protocol-specific proof headers and authoritative settlement evidence/status.
9. SDK safely retries/completes the request using the selected x402 profile.
10. Audit service encrypts its record and may anchor a commitment/reference.

### 3.1 V2 HTTP transport

Use x402 V2 as the default target unless a pinned version says otherwise:

- `PAYMENT-REQUIRED` (server→client): Base64-encoded `PaymentRequired`.
- `PAYMENT-SIGNATURE` (client→server): Base64-encoded `PaymentPayload`.
- `PAYMENT-RESPONSE` (server→client): Base64-encoded `SettlementResponse`.

`WWW-Authenticate: x402` is legacy demo copy, not the V2 header. If the landing trace still shows it, the label must say so.

### 3.2 Cardano x402 transfer methods

The Cardano `exact` scheme supports three methods through `extra.assetTransferMethod`:

- `default`: address-to-address payment.
- `masumi`: funds locked into Masumi `vested_pay` escrow with refund/dispute mechanics.
- `script`: funds locked into any server-defined contract with an optional arbitrary datum.

The adapter must verify the configured method, asset, network, payee, timeout, and facilitator before settlement.

### 3.3 Illustrative Cardano profile — proposed, not normative

```http
HTTP/1.1 402 Payment Required
WWW-Authenticate: x402
Content-Type: application/json
```

```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "exact",
      "network": "cardano:preprod",
      "asset": "policyId.assetName",
      "amount": "1500000",
      "payTo": "addr_test1…",
      "extra": { "settlementMode": "instant" }
    }
  ],
  "description": "Market Research API"
}
```

This example is for design discussion only. Actual x402 versions may use a different amount field (including names such as `maxAmountRequired`), network identifier, header, or proof format. Adapter code must normalize the provider’s documented wire format to `X402PaymentRequiredPayload`, `PaymentRequest`, and integer `Money`; do not advertise the example as a Cardano standard.

Asset amounts are decimal strings in the verified smallest unit for that token. ADA, USDM, USDA, DJED, or any native asset is supported only if the selected adapter/facilitator confirms its policy ID, decimals, network, liquidity, and payment semantics.

### 3.4 Proof, retry, and finality

`X-Payment`, `X-Payment-Proof`, CBOR payload, transaction ID, UTxO reference, or other proof details are adapter-specific. `PaymentSettlement.paymentHeaders` is the contract boundary; no universal header is assumed. A submitted transaction is not necessarily confirmed. Report pending/submitted/confirmed/rejected states from the selected provider and define reconciliation for timeout and retry.

## 4. Masumi identity and task escrow

### 4.1 Identity

Masumi provides an on-chain NFT identity, registry/discovery, payment service, and escrow. Its agent identity is an NFT-derived `agentIdentifier` plus policy ID. DIDs and verifiable credentials may be layered on top. Do not hard-code `did:cardano` as if it were the only Masumi identifier. Escrow can be reached through the Cardano x402 `masumi` transfer method or through the broader MIP-003 Agentic Service API. The adapter must name which one it calls.

### 4.2 Task and escrow flow

1. Resolve provider identity and task terms through the documented Masumi integration.
2. Validate task scope, escrow amount, deadline, beneficiary/provider, and operator policy.
3. Obtain HITL approval if the policy requires it.
4. Masumi adapter creates/funds the task/escrow according to Masumi’s lifecycle.
5. Return task ID, completion evidence, and settlement status/reference.
6. Store sensitive audit data encrypted off-chain; optionally anchor a Nudu Clear commitment.

Do not assume a Masumi escrow lock is equivalent to an instant x402 transfer or embed it as `settlementMode: "masumi-escrow"` until a concrete facilitator/profile defines and verifies that behavior.

## 5. Traditional checkout flow

1. Agent identifies a product and provider checkout requirement.
2. Nudu Clear normalizes the merchant, amount, currency, and requested operation.
3. Policy checks domain/provider, budget, permitted rail, and HITL rules.
4. A user approves the frozen checkout action when required.
5. Agentcard/Yuno adapter performs the provider-specific checkout; Nudu Clear records the provider’s receipt/status.
6. Optional audit commitment is anchored on Cardano. Fiat settlement itself remains the provider’s responsibility.

Do not automatically fall back between card and crypto rails after an ambiguous result; reconcile first to avoid duplicate charges.

## 6. Policy schema target

The user’s policy notes call for per-transaction, daily, and session limits; allowed rails/domains; and HITL. This is the **target shape**, not a claim that every field is implemented in the current SDK.

```ts
type Money = { currency: string; amountMinor: string };

interface AgentSpendingPolicy {
  policyId: string;
  version: number;
  agentId?: string;
  maxPerTransaction?: Money;
  maxDailySpend?: Money;
  maxSessionSpend: Money;
  spentToday: Money;
  spentThisSession: Money;
  allowedRails: string[];
  allowedDomains?: string[];
  allowedRecipients?: string[];
  approvalThreshold?: Money; // amount >= threshold requires approval
  approvalRequiredRails?: string[];
  expiresAt?: string;
}
```

Store webhook credentials server-side rather than embedding a raw `webhookUrl` in a client-visible policy. Define whether “daily” means UTC calendar day or rolling 24 hours. Use atomic spend reservations/idempotency so concurrent requests cannot overrun the same remaining balance. FX conversion is a separately configured, auditable policy input; never compare currencies as if equal without an explicit rule.

## 7. Privacy-preserving audit design

### Record and encryption

Version and canonically serialize an audit record containing only fields required for audit: agent/session reference, task/request context, policy version/decision, rail, amount, timestamps, and settlement receipt. Encrypt it off-chain with authenticated encryption (AES-256-GCM is the current design target) and managed keys. Use unique IVs, key rotation, access control, retention/deletion policy, and encrypted storage. Never place raw prompts, PII, API responses, payment credentials, or keys in Cardano metadata.

The web simulator only encrypts ephemeral local demo content. There is no production vault, key management, or persistent audit store in this repository.

### Commitment and verification

Candidate construction:

```text
ciphertextDigest = SHA-256(canonicalEncryptedRecord)
commitment = BLAKE2b-256(
  "nudu-clear:audit:v1" || randomSalt || sessionScope || policyVersion || ciphertextDigest
)
```

Use a distinct random salt and domain separation. Prefer a per-session pseudonym to a stable public agent DID unless linkability is explicitly accepted. Do not publish a plaintext-record hash: low-entropy values can be guessed. A hash is not encryption.

An authorized auditor with the ciphertext/key can recompute the commitment and check that matching bytes were anchored. The commitment alone does not prove that the record is true, that policy code ran honestly, that funds settled, or that policy was followed. Execution attestations or a ZK policy proof are future work.

### Cardano metadata label

The notes name both labels `674` and `4020`; neither is selected as a Nudu Clear standard. Validate applicable CIP semantics, label usage/collision, indexer support, and network conventions before mainnet. Configure the chosen label per deployment. The UI’s `4020` is illustrative only.

## 8. Trust boundaries and failure handling

| Component | Trust for | Never trust for |
| --- | --- | --- |
| Agent runtime | Request intent | Spend authorization or claimed spend state |
| Provider | Challenge/task terms | Truth of its own settlement claims |
| Policy engine | Pure decision over validated inputs | Signing or identity truth |
| Approval service | Explicit approval for fixed terms | Changed details or replayed approval |
| Rail adapter | Its documented protocol/evidence | Cross-rail policy decisions |
| Audit store/KMS | Confidentiality under access controls | Public proof without authorized record/key |
| Cardano | Public transaction ordering/metadata persistence | Confidentiality or truth of private payload |

Required controls: payload bounds; request/challenge binding; expiry validation; SSRF-safe URL/domain checks; integer amounts; replay protection; idempotency; fail-closed behavior; no browser secrets; authenticated approval webhooks; authoritative confirmation sources; and reconciliation after uncertain settlement.

## 9. Flow diagrams and open protocol questions

```text
Agent → 402 challenge → normalize/bind → evaluate policy
                                      ├─ deny → stop
                                      ├─ approval required → approve exact action or stop
                                      └─ allow → choose capable rail → settle → proof/retry
                                                     ↓
                                       encrypt audit → optional Cardano commitment
```

Open choices before live integration: x402 version and Cardano profile; facilitator; exact challenge/proof headers; network and asset identifiers; token units; Masumi identity and escrow API/version; external checkout APIs; metadata label; node/indexer and confirmation source; KMS/store; concurrency model; and stable policy persistence. See [Validation & Open Decisions](04-VALIDATION-AND-OPEN-DECISIONS.md).
