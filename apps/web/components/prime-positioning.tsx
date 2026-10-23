"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowRight, Layers, ShieldCheck, Cpu, ExternalLink } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

const comparisons = [
  {
    reuse: "Cardano x402",
    existing: "Native settlement rail & eUTxO ledger",
    added: "Pre-sign policy enforcement",
    detail: "Enforces session budgets, per-action caps, and approval rules before payment authorization is ever created.",
    badge: "SETTLEMENT",
  },
  {
    reuse: "Masumi Network",
    existing: "Agent identity, task discovery & escrow",
    added: "Policy-aware multi-rail routing",
    detail: "Evaluates task requirements and chooses eligible settlement adapters without rebuilding escrow or identity protocols.",
    badge: "DISCOVERY & ESCROW",
  },
  {
    reuse: "Agentcard / Yuno",
    existing: "External virtual card & merchant checkout",
    added: "Privacy-preserving audit commitments",
    detail: "Encrypts sensitive card & order payloads off-chain; anchors a salted 32-byte Blake2b commitment to Cardano for compliance.",
    badge: "EXTERNAL RAILS",
  },
];

export function PrimePositioning() {
  const root = useRef<HTMLElement>(null);

  const { contextSafe } = useGSAP(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Pulse the flow connectors continuously
    gsap.to(".flow-pulse-arrow", {
      x: 6,
      opacity: 0.9,
      duration: 1.1,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }, { scope: root });

  const onSideHover = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    gsap.to(e.currentTarget, { scale: 1.02, duration: 0.25, ease: "power2.out" });
  });

  const onSideLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.35, ease: "power2.out" });
  });

  return (
    <section ref={root} id="prime" className="prime-section section-frame" aria-labelledby="prime-heading">
      <div className="prime-heading" data-reveal>
        <div>
          <h2 id="prime-heading">
            Reuse vs. net-new<br />
            <span>infrastructure.</span>
          </h2>
          <p className="prime-context tabular">CARDANO PRIME · ARCHITECTURAL POSITIONING</p>
        </div>
        <p>
          Nudu Clear is not another monolithic identity layer or payment processor. It governs what an autonomous AI agent is authorized to do before handing execution to battle-tested infrastructure.
        </p>
      </div>

      <div
        className="prime-flow"
        data-ui=""
        data-reveal
        aria-label="Nudu Clear connects existing Cardano and checkout infrastructure with policy, routing, and audit layer"
      >
        <div
          className="flow-side existing-side"
          onMouseEnter={onSideHover}
          onMouseLeave={onSideLeave}
          data-interactive="true"
        >
          <div className="flow-side-top">
            <Layers size={15} aria-hidden="true" />
            <span className="flow-label">EXISTING FOUNDATION</span>
          </div>
          <strong>Cardano + Masumi Network</strong>
          <span>x402 native settlement · decentralized agent identity · eUTxO task escrow</span>
        </div>

        <div className="flow-connector" aria-hidden="true">
          <div className="flow-pulse-arrow">
            <ArrowRight size={22} />
          </div>
          <span className="tabular">ADAPTER INTERFACE</span>
        </div>

        <div
          className="flow-side clear-side"
          onMouseEnter={onSideHover}
          onMouseLeave={onSideLeave}
          data-interactive="true"
        >
          <div className="flow-side-top">
            <ShieldCheck size={15} aria-hidden="true" />
            <span className="flow-label">NET-NEW · NUDU CLEAR</span>
          </div>
          <strong>Policy + Routing + Cryptographic Audit</strong>
          <span>Pre-sign deterministic bounds · multi-rail decision matrix · Blake2b-256 commitments</span>
        </div>

        <div className="flow-connector" aria-hidden="true">
          <div className="flow-pulse-arrow">
            <ArrowRight size={22} />
          </div>
          <span className="tabular">POLICY AUTHORIZED</span>
        </div>

        <div
          className="flow-side external-side"
          onMouseEnter={onSideHover}
          onMouseLeave={onSideLeave}
          data-interactive="true"
        >
          <div className="flow-side-top">
            <Cpu size={15} aria-hidden="true" />
            <span className="flow-label">EXECUTION RAILS</span>
          </div>
          <strong>Cardano x402 · Agentcard · Yuno</strong>
          <span>Orchestrated dynamically based on merchant capabilities and agent constraints</span>
        </div>
      </div>

      <div className="position-table-wrap" data-ui="" data-reveal>
        <table className="position-table">
          <caption>Existing Cardano systems Nudu Clear integrates with and the new policy capabilities it adds.</caption>
          <thead>
            <tr>
              <th scope="col">REUSE TARGET</th>
              <th scope="col">FOUNDATIONAL ROLE</th>
              <th scope="col">NUDU CLEAR ADDS</th>
              <th scope="col">SECURITY BOUNDARY</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((row) => (
              <tr key={row.reuse} className="position-row">
                <th scope="row" data-label="Reuse">
                  <div className="reuse-cell">
                    <span>{row.reuse}</span>
                    <span className="reuse-badge tabular">{row.badge}</span>
                  </div>
                </th>
                <td data-label="Foundational role">{row.existing}</td>
                <td data-label="Nudu Clear adds">
                  <strong>{row.added}</strong>
                </td>
                <td data-label="Boundary">{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="prime-note">
          Masumi task escrow and Cardano x402 payment rails are distinct open standards. Nudu Clear coordinates them under a single client-side policy boundary without replacing either.
        </p>
      </div>

      <div className="prime-callout">
        <span className="callout-tag tabular">CRYPTOGRAPHIC BOUNDARY</span>
        <p>
          Private task payloads and sensitive checkout credentials remain fully encrypted off-chain. Cardano receives only the minimal 32-byte Blake2b-256 commitment. Label 4020 in this demo is illustrative until a CIP-10 label is chosen.
        </p>
        <a href="/specs/01-PRD-PRODUCT-SPEC.md" className="btn spec-button" data-interactive="true">
          <span>Read the specification</span>
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
