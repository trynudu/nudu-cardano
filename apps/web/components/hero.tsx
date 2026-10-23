"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowDown, Check, Copy, Pause, Play, Zap, Info } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface NodeDetail {
  title: string;
  type: string;
  detail: string;
  metrics: string;
}

const nodeDetails: Record<string, NodeDetail> = {
  agent: {
    title: "AI AGENT RUNTIME",
    type: "BUDGET ORIGIN",
    detail: "Autonomous agent requests an API or product. Evaluates task value against session allowance before signing.",
    metrics: "BUDGET: $100.00 USDM · REPLAY NONCE: 0x82f4",
  },
  policy: {
    title: "PRE-SIGN POLICY GATE",
    type: "DETERMINISTIC EVALUATION",
    detail: "Deterministic rules run before payment authorization: budget ceiling, per-action cap, allowlists, human escalation.",
    metrics: "MAX PER-ACTION: $50.00 · APPROVAL THRESHOLD: $40.00",
  },
  cardano: {
    title: "CARDANO x402 ADAPTER",
    type: "NATIVE SETTLEMENT RAIL",
    detail: "Handles HTTP 402 Payment Required challenges via Cardano native assets (USDM / ADA) with Masumi escrow.",
    metrics: "PROTOCOL: HTTP x402 · SETTLEMENT: eUTxO PARALLEL",
  },
  checkout: {
    title: "AGENTCARD CHECKOUT",
    type: "EXTERNAL CHECKOUT ADAPTER",
    detail: "Orchestrates external card or fiat checkout rails when merchant does not support on-chain x402 endpoints.",
    metrics: "PCI-DSS ISOLATED · EPHEMERAL VIRTUAL CARD",
  },
  audit: {
    title: "LEDGER AUDIT ANCHOR",
    type: "BLAKE2B-256 ZERO-LEAKAGE",
    detail: "Encrypted transaction payload stays off-chain (AES-256-GCM). Only domain-separated Blake2b-256 commitment is anchored on Cardano.",
    metrics: "COMMITMENT: 32-BYTE HASH · DEMO LABEL 4020",
  },
};

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [paused, setPaused] = useState(false);
  const [activeNode, setActiveNode] = useState<string>("policy");
  const [routingState, setRoutingState] = useState<string>("READY · IDLE");

  const { contextSafe } = useGSAP(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Master Hero Entrance Timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".signal-label", { y: -16, opacity: 0, duration: 0.6 })
      .from("#hero-title", { y: 28, opacity: 0, duration: 0.8, ease: "power4.out" }, "-=0.3")
      .from(".hero-thesis", { y: 18, opacity: 0, duration: 0.7 }, "-=0.4")
      .from(".hero-actions > *", { y: 14, opacity: 0, stagger: 0.1, duration: 0.5 }, "-=0.3")
      .from(".install-line", { y: 12, opacity: 0, duration: 0.5 }, "-=0.2")
      .from(".hero-visual", { scale: 0.96, opacity: 0, duration: 0.9, ease: "power2.out" }, "-=0.7")
      .from(".graph-node", { scale: 0.9, opacity: 0, stagger: 0.08, transformOrigin: "center" }, "-=0.4");

    // Continuous packet flows and rhythmic pulses
    gsap.to(".packet-path", { strokeDashoffset: -34, duration: 1.4, ease: "none", repeat: -1 });
    gsap.to(".node-pulse", { scale: 1.35, opacity: 0.3, transformOrigin: "center", duration: 1.8, ease: "sine.inOut", repeat: -1, yoyo: true });
    gsap.to(".laser-scanline", { y: 460, duration: 3.5, ease: "none", repeat: -1 });
  }, { scope: root });

  // Interactive high-velocity packet dispatch along the circuit
  const pulseRoute = contextSafe((railChoice: "cardano" | "checkout" = "cardano") => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    setRoutingState(`DISPATCHING PACKET → ${railChoice.toUpperCase()}`);

    const photon = root.current?.querySelector("#circuit-photon");
    if (!photon) return;

    const photonTl = gsap.timeline({
      onComplete: () => {
        setRoutingState("ANCHORED TO CARDANO · 0x4D18");
        gsap.to("#block-shockwave", { scale: 1.8, opacity: 0, transformOrigin: "center", duration: 0.6, clearProps: "all" });
        setTimeout(() => setRoutingState("READY · IDLE"), 2500);
      },
    });

    // Animate photon along wire coordinates
    // Step 1: Agent (150, 220) to Policy Gate (295, 220)
    photonTl
      .set(photon, { opacity: 1, cx: 150, cy: 220, r: 6 })
      .to(photon, { cx: 295, cy: 220, duration: 0.35, ease: "power2.inOut" })
      .call(() => {
        setRoutingState("EVALUATING PRE-SIGN POLICY GATE...");
        gsap.fromTo("#policy-gate-highlight", { opacity: 0.8 }, { opacity: 0, duration: 0.4 });
      });

    // Step 2: Policy Gate to Fork (410, 220)
    photonTl.to(photon, { cx: 410, cy: 220, duration: 0.25, ease: "power1.inOut" });

    // Step 3: Route depending on railChoice
    if (railChoice === "cardano") {
      photonTl
        .to(photon, { cy: 112, duration: 0.25, ease: "power1.inOut" })
        .to(photon, { cx: 536, duration: 0.25, ease: "power1.inOut" })
        .call(() => {
          setRoutingState("CARDANO x402: MASUMI ESCROW VERIFYING...");
          gsap.fromTo("#cardano-rail-highlight", { opacity: 0.8 }, { opacity: 0, duration: 0.4 });
        })
        .to(photon, { cx: 650, duration: 0.25, ease: "power1.inOut" })
        .to(photon, { cy: 214, duration: 0.2, ease: "power1.inOut" });
    } else {
      photonTl
        .to(photon, { cy: 329, duration: 0.25, ease: "power1.inOut" })
        .to(photon, { cx: 541, duration: 0.25, ease: "power1.inOut" })
        .call(() => {
          setRoutingState("AGENTCARD: VIRTUAL CARD AUTHORIZED...");
          gsap.fromTo("#checkout-rail-highlight", { opacity: 0.8 }, { opacity: 0, duration: 0.4 });
        })
        .to(photon, { cx: 650, duration: 0.25, ease: "power1.inOut" })
        .to(photon, { cy: 214, duration: 0.2, ease: "power1.inOut" });
    }

    // Step 4: Into Audit Anchor Block
    photonTl.to(photon, { cx: 680, cy: 214, duration: 0.2, ease: "power2.out" })
      .to(photon, { opacity: 0, scale: 2, transformOrigin: "center", duration: 0.25 });
  });

  const inspectNode = contextSafe((nodeKey: string) => {
    setActiveNode(nodeKey);
    const target = root.current?.querySelector(`.${nodeKey}-node`);
    if (target) {
      gsap.fromTo(
        target,
        { scale: 0.95 },
        { scale: 1.04, duration: 0.22, ease: "back.out(2)", yoyo: true, repeat: 1 }
      );
    }
  });

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText("pnpm add @cardano-agent-pay/sdk");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function toggleMotion() {
    const nextPaused = !paused;
    setPaused(nextPaused);
    gsap.globalTimeline.getChildren().forEach((tween) => {
      if (tween.vars.repeat === -1) nextPaused ? tween.pause() : tween.resume();
    });
  }

  const activeInfo = nodeDetails[activeNode] || nodeDetails.policy;

  return (
    <section ref={root} className="hero section-frame" aria-labelledby="hero-title">
      <div className="hero-copy">
        
        <h1 id="hero-title">
          Policy before<br />the signature.
        </h1>
        <p className="hero-thesis lede">
          Nudu Clear is the settlement layer under Nudu. An agent clears a deterministic policy gate, settles on Cardano x402 or an allowed checkout rail, and anchors a commitment while the audit stays encrypted off-chain.
        </p>

        <div className="hero-actions">
          <a className="btn" href="#simulator" data-interactive="true">
            Launch interactive sandbox <ArrowDown size={16} aria-hidden="true" />
          </a>
          <button
            className="btn btn--secondary motion-toggle"
            type="button"
            onClick={toggleMotion}
            aria-label={paused ? "Resume network animation" : "Pause network animation"}
            data-interactive="true"
          >
            {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
            {paused ? "Resume motion" : "Pause motion"}
          </button>
        </div>

        <div className="install-line">
          <code>pnpm add @cardano-agent-pay/sdk</code>
          <button
            onClick={copyInstall}
            type="button"
            aria-label="Copy SDK install command"
            className="copy-button"
            data-interactive="true"
          >
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? "Install command copied" : ""}
          </span>
        </div>
      </div>

      <div
        className="hero-visual"

        role="region"
        aria-label="Interactive architecture diagram: agent budget through policy gate into Cardano x402 or Agentcard adapter."
      >
        <div className="graph-heading">
          <div className="graph-router-title">
            <span className="router-name">PAYMENT ROUTER // eUTxO CONDUIT</span>
            <span className="graph-status-badge">
              <i className="status-dot" /> {routingState}
            </span>
          </div>

          <div className="graph-controls-quick">
            <button
              type="button"
              className="pulse-packet-btn"
              onClick={() => pulseRoute("cardano")}
              title="Test routing a live simulated packet through Cardano x402"
              data-interactive="true"
            >
              <Zap size={13} aria-hidden="true" />
              <span>TEST x402 PULSE</span>
            </button>
            <button
              type="button"
              className="pulse-packet-btn alt-pulse"
              onClick={() => pulseRoute("checkout")}
              title="Test routing a live simulated packet through Agentcard"
              data-interactive="true"
            >
              <Zap size={13} aria-hidden="true" />
              <span>CHECKOUT</span>
            </button>
          </div>
        </div>

        <div className="graph-shell">
          <svg className="network-graph" viewBox="0 0 740 460" aria-hidden="true">
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0H0V24" fill="none" stroke="rgba(14,17,20,.08)" strokeWidth="1" />
              </pattern>
              <linearGradient id="railFill" x1="0" x2="1">
                <stop offset="0" stopColor="#9b1134" stopOpacity=".16" />
                <stop offset="1" stopColor="#fbeef1" stopOpacity=".4" />
              </linearGradient>
            </defs>

            {/* Background Grid */}
            <rect x="0" y="0" width="740" height="460" fill="url(#grid)" />

            {/* Subtle GSAP sweeping laser scanline */}
            <line className="laser-scanline" x1="0" y1="0" x2="740" y2="0" stroke="rgba(155, 17, 52, 0.22)" strokeWidth="1.5" />

            {/* Base circuit lines */}
            <path className="graph-line" d="M150 220H237M353 220H410M410 220V112H470M410 220V329H470M602 112H650V214M602 329H650V214H680" />
            <path className="packet-path" d="M150 220H237M353 220H410M410 220V112H470M410 220V329H470M602 112H650V214M602 329H650V214H680" />

            {/* Dynamic photon particle driven by GSAP */}
            <circle id="circuit-photon" cx="150" cy="220" r="5" fill="#9b1134" opacity="0" />

            {/* Static pulse nodes */}
            <circle className="node-pulse" cx="410" cy="220" r="7" fill="#9b1134" opacity=".75" />
            <circle id="block-shockwave" cx="704" cy="214" r="22" stroke="#2f7d55" strokeWidth="1.5" fill="none" opacity="0" />

            {/* Node Highlights for animation */}
            <rect id="policy-gate-highlight" x="235" y="162" width="120" height="116" rx="3" fill="none" stroke="#9b1134" strokeWidth="2" opacity="0" />
            <rect id="cardano-rail-highlight" x="468" y="63" width="136" height="98" rx="3" fill="none" stroke="#9b1134" strokeWidth="2" opacity="0" />
            <rect id="checkout-rail-highlight" x="468" y="280" width="136" height="98" rx="3" fill="none" stroke="#9b1134" strokeWidth="2" opacity="0" />

            {/* Node 1: AI AGENT */}
            <g
              className="graph-node agent-node cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label="Inspect AI Agent node"
              onClick={() => inspectNode("agent")}
              onKeyDown={(e) => e.key === "Enter" && inspectNode("agent")}
            >
              <rect x="24" y="164" width="126" height="112" rx="2" className={activeNode === "agent" ? "node-active" : ""} />
              <path d="M52 196h18l11 12-11 12H52l-11-12zM93 196h18v24H93z" />
              <text x="87" y="246" textAnchor="middle">AI AGENT</text>
              <text className="node-sub" x="87" y="263" textAnchor="middle">BUDGET · $100</text>
            </g>

            {/* Node 2: POLICY GATE */}
            <g
              className="graph-node policy-node cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label="Inspect Policy Gate node"
              onClick={() => inspectNode("policy")}
              onKeyDown={(e) => e.key === "Enter" && inspectNode("policy")}
            >
              <rect x="237" y="164" width="116" height="112" rx="2" className={activeNode === "policy" ? "node-active" : ""} />
              <path d="M295 184l23 9v18c0 17-11 28-23 34-12-6-23-17-23-34v-18z" />
              <path d="M284 211l8 8 15-16" />
              <text x="295" y="258" textAnchor="middle">POLICY GATE</text>
            </g>

            {/* Node 3: CARDANO x402 */}
            <g
              className="graph-node rail-node cardano-node cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label="Inspect Cardano x402 node"
              onClick={() => inspectNode("cardano")}
              onKeyDown={(e) => e.key === "Enter" && inspectNode("cardano")}
            >
              <rect x="470" y="65" width="132" height="94" rx="2" fill="url(#railFill)" className={activeNode === "cardano" ? "node-active" : ""} />
              <circle cx="493" cy="91" r="9" />
              <path d="M489 91h8m-4-4v8" />
              <text x="536" y="116" textAnchor="middle">CARDANO x402</text>
              <text className="node-sub" x="536" y="136" textAnchor="middle">MASUMI · eUTxO</text>
            </g>

            {/* Node 4: CHECKOUT */}
            <g
              className="graph-node rail-node checkout-node cursor-pointer"
              transform="translate(0 217)"
              tabIndex={0}
              role="button"
              aria-label="Inspect Checkout Agentcard node"
              onClick={() => inspectNode("checkout")}
              onKeyDown={(e) => e.key === "Enter" && inspectNode("checkout")}
            >
              <rect x="470" y="65" width="132" height="94" rx="2" className={activeNode === "checkout" ? "node-active" : ""} />
              <rect x="485" y="82" width="18" height="15" rx="2" />
              <path d="M489 87h10M489 92h6" />
              <text x="541" y="116" textAnchor="middle">CHECKOUT</text>
              <text className="node-sub" x="541" y="136" textAnchor="middle">AGENTCARD ADAPTER</text>
            </g>

            {/* Node 5: AUDIT NODE */}
            <g
              className="graph-node audit-node cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label="Inspect Audit Block node"
              onClick={() => inspectNode("audit")}
              onKeyDown={(e) => e.key === "Enter" && inspectNode("audit")}
            >
              <rect x="680" y="177" width="47" height="74" rx="2" className={activeNode === "audit" ? "node-active" : ""} />
              <path d="M691 193h25M691 201h25M691 209h18M691 225h25M691 233h15" />
              <text className="node-sub" x="704" y="270" textAnchor="middle">BLOCK</text>
            </g>

            <g className="graph-note">
              <text x="31" y="38">PRE-SIGN EVALUATION</text>
              <text x="512" y="397">OFF-CHAIN ENCRYPTION</text>
              <text x="512" y="415">BLAKE2B-256 COMMITMENT</text>
            </g>
            <path className="audit-dash" d="M670 354h42v-93" />
            <text className="block-hash" x="679" y="340">A9F2…4D18</text>
          </svg>

          {/* Interactive Node Telemetry Inspector */}
          <div className="node-inspector-drawer" aria-live="polite">
            <div className="inspector-head">
              <span className="inspector-title">
                <Info size={14} aria-hidden="true" />
                <strong>{activeInfo.title}</strong>
              </span>
              <span className="inspector-type">{activeInfo.type}</span>
            </div>
            <p className="inspector-detail">{activeInfo.detail}</p>
            <div className="inspector-metric tabular">{activeInfo.metrics}</div>
          </div>

          <div className="mobile-flow" aria-hidden="true">
            <div className="mobile-node">
              <span>AI AGENT</span>
              <strong>$100 session budget</strong>
            </div>
            <ArrowDown size={15} aria-hidden="true" />
            <div className="mobile-node mobile-policy">
              <span>DETERMINISTIC POLICY GATE</span>
              <strong>Pre-sign evaluation · approval rules</strong>
            </div>
            <ArrowDown size={15} aria-hidden="true" />
            <div className="mobile-rails">
              <div className="mobile-node mobile-cardano">
                <span>CARDANO x402</span>
                <strong>Masumi task escrow</strong>
              </div>
              <div className="mobile-node">
                <span>CHECKOUT</span>
                <strong>Agentcard adapter</strong>
              </div>
            </div>
            <ArrowDown size={15} aria-hidden="true" />
            <div className="mobile-node mobile-audit">
              <span>PRIVATE AUDIT</span>
              <strong>AES-GCM off-chain · Blake2b-256 anchor</strong>
            </div>
          </div>

          <span className="graph-cross cross-tl" aria-hidden="true">+</span>
          <span className="graph-cross cross-br" aria-hidden="true">+</span>
        </div>

        <div className="graph-legend">
          <span><i className="legend-dot legend-dot--policy" /> POLICY DECISION</span>
          <span><i className="legend-dot legend-dot--settle" /> SETTLEMENT ROUTE</span>
          <span>CLICK ANY NODE TO INSPECT BOUNDARY</span>
        </div>
      </div>
    </section>
  );
}
