# Spec Validation & Open Decisions

**Purpose:** record what was checked against Cardano, x402, and Masumi, and which decisions stay open before a live adapter.  
**Reviewed:** 2026-10-23.  
**Scope:** documentation and protocol-contract review. This is not a security audit and not a deployment sign-off.

## 1. Summary

Nudu Clear does not replace Cardano x402 or Masumi. It adds a policy check before signature, rail selection, human approval, and an encrypted off-chain audit with an optional public commitment.

Three points are already settled in the architecture spec:

1. **HTTP transport.** x402 V2 uses `PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE`, and `PAYMENT-RESPONSE`. `WWW-Authenticate: x402` is legacy demo copy, not the V2 header.
2. **Masumi.** The Cardano `exact` scheme can lock funds with the `masumi` transfer method. MIP-003 is a broader service lifecycle. An adapter must say which one it calls.
3. **Metadata.** Label `674` is a CIP-20 memo, not a Nudu Clear namespace. `4020` is demo data until a CIP-10 label is chosen. A hash commitment is not encryption and does not prove that a payment settled.

## 2. Claims checked against primary references

| Topic | Validation | Spec treatment |
| --- | --- | --- |
| Cardano x402 exists | **Confirmed.** Cardano Foundation documents `@x402/cardano` and an `exact` Cardano scheme. | Treat Cardano x402 as the primary integration target, not a speculative standard. A production Nudu Clear adapter is still not implemented in this repo. |
| Cardano payment signing | **Confirmed with correction.** The documented model is client-signed, facilitator-submitted: the client builds/signs the complete transaction; the facilitator verifies and relays/submits it. It is described as non-custodial and does not require facilitator-held funds. | Do not say the Nudu Clear facilitator constructs/signs for the payer. Keep wallet signing outside the generic policy engine. |
| Cardano x402 transfer methods | **Confirmed.** The Cardano exact scheme documents `default` address payment, `masumi` escrow, and `script` seller-defined contract transfer methods via `extra.assetTransferMethod`. | Model Masumi escrow as a native Cardano x402 transfer method when using that scheme, not only as a separate rail. |
| Masumi’s broader role | **Confirmed.** Masumi provides agent identity/registry/discovery, payments, escrow, and traceability. Its on-chain agent identity is an NFT; `policyId` and `agentIdentifier` are used by its APIs. DIDs/VCs are a richer identity/credential layer. | Do not hard-code `did:cardano` as the Masumi identifier. Use the documented `agentIdentifier`/DID mechanism for the selected Masumi integration. |
| Masumi escrow vs. direct x402 | **Confirmed distinction.** Direct address x402 is a fixed signed payment and is final on settlement; the Masumi transfer method adds escrow/refund/dispute behavior. MIP-003 is also a broader Agentic Service/payment lifecycle. | Choose direct x402 for low-risk per-call access; choose Masumi escrow or MIP-003 semantics when the job needs delivery conditions/refunds/disputes. Keep the lifecycle explicit. |
| x402 HTTP headers | **Confirmed correction.** Current x402 V2 HTTP docs specify `PAYMENT-REQUIRED` (server→client), `PAYMENT-SIGNATURE` (client→server), and `PAYMENT-RESPONSE` (server→client), with Base64-encoded protocol objects. | Make V2 the default target in architecture examples. Do not call `WWW-Authenticate: x402` the V2 header. If retained in the landing trace to honor the initial visual brief, label it legacy/proposed and not normative. |
| x402 payload names | **Profile/version dependent.** Current V2 examples use an `accepts` array with `scheme`, `network`, `amount`, `asset`, `payTo`, and timeout/extra data. Cardano server configuration examples nest amount/asset under `price`. | Normalize through an adapter; do not standardize `maxAmountRequired` or a hand-written Cardano shape without pinning the exact package/version. |
| x402 version | **Needs pinning.** Current docs are V2; the first user-authored example used `x402Version: 1`. | Pin the protocol/package version and test its wire types before implementing a facilitator. Shared types may accept a version number, but examples and integrations must not mix V1/V2 fields. |
| CIP-20 / label 674 | **Confirmed.** CIP-20 defines label `674` for a `msg` array of UTF-8 strings, each at most 64 bytes. | Do not use `674` for opaque Nudu Clear commitment metadata; it conflicts with the memo convention. |
| CIP-83 | **Confirmed.** CIP-83 adds an `enc` field to CIP-20 encrypted message metadata. Its documented `basic` mode is salted AES-256-CBC and includes a public default passphrase for compatibility. | Do not treat CIP-83 as confidential storage for sensitive Nudu Clear payloads. Use managed-key authenticated encryption off-chain; no public/default passphrase. |
| Metadata label 4020 | **Not verified as a Nudu Clear/CIP standard.** The earlier notes and UI use it as an example, but the reviewed sources do not establish a Nudu Clear allocation. | Keep 4020 only as labeled demo data. Check CIP-10 registry and chain usage, then select/register an application label before production. |
| Commitment semantics | **Correction to overclaims.** A hash commitment can bind bytes/context; it does not prove those bytes are true, that a policy was executed, or that funds settled. | Say “verifiable commitment to a disclosed encrypted record,” not “proof the agent followed policy,” unless an attestation/ZK proof is added. |
| Asset units | **Partly confirmed.** Cardano x402 examples show USDM amounts in atomic units and a six-decimal example. | Keep decimals asset-specific and adapter-verified; do not assume USDA/DJED/other assets are supported or share USDM decimals. |
| Agentcard vs. Yuno | **Different products.** Agentcard documents virtual-card/cardholder APIs; Yuno is a payment orchestration/checkout API. | Give them separate adapters and security boundaries; do not promise one generic API or imply either is a Cardano rail. |
| $45 / $42 / $65 | **Different illustrative scenarios in the source notes.** PRD notes use $45; the original landing flow uses $42; the simulator uses $65. | Keep each amount attached to its scenario and label all as examples. Do not infer real pricing. |

## 3. Corrected architecture position

```text
Cardano x402 exact scheme
  ├── default: address-to-address payment
  ├── masumi: escrow transfer method (refund/dispute lifecycle)
  └── script: seller-defined contract transfer method

Masumi MIP-003 / Agentic Service APIs
  └── broader service/payment lifecycle, identity, registry, escrow, and decisions

Nudu Clear policy/router/audit layer
  ├── validates and binds the x402 request
  ├── evaluates policy before the wallet/facilitator settlement step
  ├── requires exact-action HITL approval when configured
  ├── selects the Cardano transfer method or a distinct external checkout adapter
  └── stores encrypted audit data off-chain and optionally anchors a minimal commitment
```

The Masumi x402 transfer method and Masumi’s broader MIP-003 integration are related but not interchangeable. The chosen user journey must specify which one it invokes.

## 4. Decisions still open

1. Pin the supported x402 package/version and its Cardano exact scheme API.
2. Decide when Nudu Clear invokes Cardano `default`, `masumi`, or `script` transfer methods; define seller/job constraints for each.
3. Select the Cardano facilitator endpoint/provider and authoritative confirmation source for each network.
4. Pin supported assets and decimals; define how multi-currency policies handle FX instead of assuming USD ≈ USDM.
5. Select a metadata strategy: CIP-10 registered/custom application label or another documented proof/anchor format. Do not overload CIP-20 label 674.
6. Decide whether the first audit milestone is commitment-only or includes a verifiable execution attestation/ZK proof.
7. Specify concurrency reservations, daily-spend accounting, approval webhook auth, and retry reconciliation.
8. Define separate Agentcard and Yuno adapter capabilities and user-consent requirements.

## 5. References reviewed

- [Cardano Foundation — Agentic Commerce / x402](https://developers.cardano.org/x402)
- [x402 docs — HTTP 402 and V2 headers](https://docs.x402.org/core-concepts/http-402)
- [x402 docs — exact scheme, Cardano setup, and transfer methods](https://docs.x402.org/schemes/exact)
- [x402 Foundation — exact Cardano scheme specification](https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md)
- [Cardano Developer Portal — Masumi Network](https://developers.cardano.org/docs/developers/curriculum/dapps/ai-agents/masumi/)
- [Masumi — x402 Payments](https://www.masumi.network/dev/masumi/core-concepts/x402)
- [Masumi — Identity](https://www.masumi.network/dev/masumi/core-concepts/identity)
- [CIP-10 — Transaction Metadata Label Registry](https://cips.cardano.org/cip/CIP-10)
- [CIP-20 — Transaction message/comment metadata](https://cips.cardano.org/cip/CIP-20)
- [CIP-83 — Encrypted transaction message metadata](https://cips.cardano.org/cip/CIP-83)
- [Agentcard API](https://agentcard.com/api)
- [Yuno developer docs](https://docs.y.uno/docs/developers)

This review validates the notes and earlier generated specs against these references. It is not an independent security audit or a guarantee that third-party APIs will remain unchanged; re-check pinned versions and terms during implementation.
