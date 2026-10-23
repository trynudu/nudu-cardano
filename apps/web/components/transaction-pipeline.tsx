"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Circle, LockKeyhole, Terminal, ArrowRight, ShieldCheck } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const stages = [
  {
    step: "01",
    title: "Set the authority",
    text: "An operator defines a $100 session budget, allowed actions, and a $40 human approval threshold before the agent initiates any connection.",
    phase: "POLICY MATRIX SNAPSHOT",
    log: [
      "policy.version     = 4.2.0-cardano",
      "session.allowance  = USD 100.00 (USDM)",
      "approval.ceiling   = USD 40.00",
      "replay.nonce       = 0x4f8992ad1c",
      "decision.state     = READY_ARMED",
    ],
    method: "POST",
    path: "/agent/session",
    label: "NO PAYMENT AUTHORIZED",
    hex: "0x5345 545f 4155 5448 4f52 4954 595f 5634",
  },
  {
    step: "02",
    title: "Pay for research (x402)",
    text: "Research API responds with HTTP 402 Payment Required. Nudu Clear validates the challenge parameters, then signs a 1.5 USDM settlement via Cardano x402.",
    phase: "HTTP 402 → CARDANO x402",
    log: [
      "PAYMENT-REQUIRED    : x402 V2 · USDM",
      "challenge.amount   : 1.500000 USDM",
      "policy.evaluation  : ALLOW (WITHIN_BUDGET)",
      "eutxo.witness      : PLUTUS_V3_SCRIPT",
      "tx.anchor.label    : 4020 (demo only)",
    ],
    method: "GET",
    path: "/v1/research?q=shoes",
    label: "DEMO LABEL · 4020",
    hex: "0x7834 3032 5f43 4152 4441 4e4f 5f53 4554",
  },
  {
    step: "03",
    title: "Compare, then choose",
    text: "The agent processes research results locally and selects a catalog item priced at $42.00 from an online vendor.",
    phase: "RESULT PARSING & BUDGET DEDUCTION",
    log: [
      "catalog[0].price   = USD 42.00",
      "provider.endpoint  = northstar.shop/api",
      "budget.deduction   = USD 1.50 spent (98.50 left)",
      "selection.id       = SKU_AGENT_PROD_07",
      "status             = PRE_CHECKOUT_PENDING",
    ],
    method: "POST",
    path: "/agent/selection",
    label: "POLICY RE-EVALUATED",
    hex: "0x434f 4d50 4152 455f 5345 4c45 4354 5f30",
  },
  {
    step: "04",
    title: "Route the checkout",
    text: "Provider requires Agentcard virtual checkout. The $42.00 action crosses the $40 operator threshold, triggering a fail-closed human escalation gate.",
    phase: "HUMAN APPROVAL REQUIRED",
    log: [
      "rail.selected      = AGENTCARD_ADAPTER",
      "action.amount      = USD 42.00",
      "approval.rule      = AMOUNT > THRESHOLD ($40)",
      "gate.status        = BLOCKED_FOR_APPROVAL",
      "escalation.channel = HUMAN_TELEGRAM_OR_DASHBOARD",
    ],
    method: "POST",
    path: "/checkout/authorize",
    label: "WAITING FOR APPROVAL",
    hex: "0x4855 4d41 4e5f 4150 5052 4f56 414c 5f52",
  },
  {
    step: "05",
    title: "Commit, not disclose",
    text: "Sensitive item details and credentials remain encrypted off-chain (AES-256-GCM). A salted Blake2b-256 commitment is anchored permanently to Cardano.",
    phase: "BLAKE2B-256 AUDIT COMMITMENT",
    log: [
      "payload.encryption = AES-256-GCM (OFF-CHAIN)",
      "audit.salt         = 0x93f4e198b10086bc",
      "blake2b.digest     = A9F28D91...4D187C02",
      "ledger.target      = CARDANO MAINNET / PREPROD",
      "proof.guarantee    = ZERO_KNOWLEDGE_LEAKAGE",
    ],
    method: "POST",
    path: "/audit/commit",
    label: "ENCRYPTED PAYLOAD · OFF-CHAIN",
    hex: "0x424c 414b 4532 425f 4155 4449 545f 3235",
  },
];

export function TransactionPipeline() {
  const section = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const terminalContentRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const lastIndex = useRef(0);

  const { contextSafe } = useGSAP(() => {
    const media = gsap.matchMedia();

    media.add(
      {
        isDesktop: "(min-width: 768px)",
        noReducedMotion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { isDesktop, noReducedMotion } = context.conditions as { isDesktop: boolean; noReducedMotion: boolean };
        if (!isDesktop || !noReducedMotion) return;

        ScrollTrigger.create({
          trigger: section.current,
          start: "top 108px",
          end: () => `+=${Math.max(1400, window.innerHeight * 1.8)}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = Math.min(stages.length - 1, Math.floor(self.progress * stages.length));
            if (progressBarRef.current) {
              gsap.set(progressBarRef.current, { scaleY: self.progress });
            }
            if (index !== lastIndex.current) {
              lastIndex.current = index;
              setActive(index);
              animateTerminalShift();
            }
          },
        });
      }
    );

    return () => media.revert();
  }, { scope: section });

  const animateTerminalShift = contextSafe(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !terminalContentRef.current) return;

    gsap.fromTo(
      terminalContentRef.current.querySelectorAll(".terminal-log-line"),
      { opacity: 0, x: 10 },
      { opacity: 1, x: 0, stagger: 0.04, duration: 0.22, ease: "power2.out" }
    );
  });

  function selectStage(index: number) {
    lastIndex.current = index;
    setActive(index);
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, { scaleY: (index + 1) / stages.length, duration: 0.3 });
    }
    animateTerminalShift();
  }

  const stage = stages[active];

  return (
    <section ref={section} id="flow" className="pipeline-section section-frame" aria-labelledby="flow-heading">
      <div className="pipeline-head" data-reveal>
        <div>
          <h2 id="flow-heading">
            A purchase, <span>with guardrails.</span>
          </h2>
        </div>
        <p>
          Follow an autonomous market-research agent from initial operator budget to on-chain audit commitment. Scroll to advance or select any stage.
        </p>
      </div>

      <div className="pipeline-layout">
        <div className="pipeline-story">
          {/* Vertical progress bar indicator */}
          <div className="pipeline-progress-rail" aria-hidden="true">
            <div ref={progressBarRef} className="pipeline-progress-fill" />
          </div>

          <ol className="stage-list" aria-label="Transaction stages">
            {stages.map((item, index) => (
              <li
                key={item.title}
                className={active === index ? "stage-item is-active" : "stage-item"}
              >
                <button
                  type="button"
                  onClick={() => selectStage(index)}
                  aria-current={active === index ? "step" : undefined}
                  data-interactive="true"
                >
                  <span className="stage-icon" aria-hidden="true">
                    {active > index ? (
                      <Check size={15} />
                    ) : (
                      <Circle size={8} fill={active === index ? "currentColor" : "none"} />
                    )}
                  </span>
                  <span>
                    <span className="stage-num tabular">STEP {item.step}</span>
                    <strong>{item.title}</strong>
                    <span className="stage-copy">{item.text}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="terminal-panel" aria-label="Simulated request and policy trace" data-reveal>
          <div className="terminal-top">
            <div>
              <i className="terminal-dot" />
              <i className="terminal-dot" />
              <i className="terminal-dot" />
            </div>
            <span>nudu-clear / execution.trace</span>
            <span className="terminal-live">
              <span className="live-blink" /> ACTIVE TRACE
            </span>
          </div>

          <div className="terminal-request">
            <span className="method">{stage.method}</span>
            <code>{stage.path}</code>
            <span className="terminal-state tabular">{stage.label}</span>
          </div>

          <div ref={terminalContentRef} className="terminal-section">
            <div className="terminal-section-header">
              <span className="terminal-label">{stage.phase}</span>
              <span className="terminal-hex-dump tabular">{stage.hex}</span>
            </div>
            <pre>
              {stage.log.map((line) => (
                <div key={line} className="terminal-log-line">
                  <span className="log-prompt" aria-hidden="true">&gt;</span>
                  <code>{line}</code>
                </div>
              ))}
            </pre>
          </div>

          <div className="terminal-bottom">
            <LockKeyhole size={14} aria-hidden="true" />
            <span>
              {active === 4
                ? "Sensitive payload encrypted via AES-256-GCM; Blake2b commitment anchored."
                : "Deterministic policy evaluated prior to transaction creation."}
            </span>
            <span className="tabular">{active + 1} / 5</span>
          </div>
        </div>
      </div>

      <div className="pipeline-footer-bar">
        <p className="pipeline-note">
          Simulated lifecycle demonstrator. Cardano transaction submission, x402 challenge resolution, and external adapter checkout are simulated in-memory.
        </p>
        <div className="pipeline-step-controls">
          <button
            type="button"
            className="step-ctrl-btn"
            disabled={active === 0}
            onClick={() => selectStage(Math.max(0, active - 1))}
            aria-label="Previous transaction stage"
          >
            ← PREV
          </button>
          <button
            type="button"
            className="step-ctrl-btn"
            disabled={active === stages.length - 1}
            onClick={() => selectStage(Math.min(stages.length - 1, active + 1))}
            aria-label="Next transaction stage"
          >
            NEXT →
          </button>
        </div>
      </div>
    </section>
  );
}
