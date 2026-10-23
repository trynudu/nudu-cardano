"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { blake2b } from "@noble/hashes/blake2b";
import {
  ArrowRight,
  Check,
  CircleAlert,
  LockKeyhole,
  ShieldCheck,
  Copy,
  Terminal,
  Cpu,
  RefreshCw,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

const operations = [
  { id: "api", label: "API query via x402", amount: 1.5, currency: "USDM", rail: "Cardano x402" },
  { id: "escrow", label: "Escrow task via Masumi", amount: 15, currency: "USDM", rail: "Masumi escrow" },
  { id: "checkout", label: "E-commerce checkout via Agentcard", amount: 65, currency: "USD", rail: "Agentcard adapter" },
] as const;

type Phase = "idle" | "policy" | "approval" | "routing" | "encrypting" | "complete" | "denied" | "rejected" | "error";

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function encryptAndCommit(operation: string, amount: number, rail: string) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const privateRecord = encoder.encode(
    JSON.stringify({
      operation,
      amount,
      rail,
      nonce: toHex(crypto.getRandomValues(new Uint8Array(16))),
      createdAt: new Date().toISOString(),
    })
  );
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, privateRecord));
  const commitment = blake2b(encoder.encode(`nudu-clear:audit:v1:${toHex(salt)}:${toHex(ciphertext)}`), { dkLen: 32 });
  return {
    commitment: toHex(commitment),
    salt: toHex(salt).substring(0, 16),
    ciphertextBytes: ciphertext.byteLength,
  };
}

export function PolicySimulator() {
  const root = useRef<HTMLElement>(null);
  const commitmentRef = useRef<HTMLElement>(null);
  const [budget, setBudget] = useState(100);
  const [threshold, setThreshold] = useState(50);
  const [operationId, setOperationId] = useState<(typeof operations)[number]["id"]>("checkout");
  const [phase, setPhase] = useState<Phase>("idle");
  const [commitment, setCommitment] = useState("");
  const [saltPreview, setSaltPreview] = useState("");
  const [error, setError] = useState("");
  const [cipherBytes, setCipherBytes] = useState(0);
  const [copiedHash, setCopiedHash] = useState(false);
  const actionRef = useRef<{ amount: number; rail: string; operation: string } | null>(null);

  const { contextSafe } = useGSAP(() => {}, { scope: root });

  const operation = operations.find((item) => item.id === operationId) ?? operations[0];
  const approvalRequired = operation.amount >= threshold;
  const overBudget = operation.amount > budget;
  const isBusy = ["policy", "routing", "encrypting"].includes(phase);

  // Scramble text effect on commitment reveal
  const runScrambleReveal = contextSafe((finalHash: string) => {
    const el = commitmentRef.current;
    if (!el) return;

    const chars = "0123456789ABCDEF";
    const len = finalHash.length;
    let iteration = 0;

    const interval = setInterval(() => {
      el.textContent = finalHash
        .split("")
        .map((char, index) => {
          if (index < iteration) return finalHash[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("")
        .match(/.{1,8}/g)
        ?.join(" ") || finalHash;

      if (iteration >= len) {
        clearInterval(interval);
        // Flash shockwave on complete
        gsap.fromTo(
          el,
          { color: "#c1183f" },
          { color: "#ffffff", duration: 0.6, ease: "power2.out" }
        );
      }
      iteration += 4;
    }, 28);
  });

  const animatePhase = contextSafe((next: Phase, label: string) => {
    setPhase(next);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = root.current?.querySelector(`[data-phase="${label}"]`);
    if (!reduced && target) {
      gsap.fromTo(
        target,
        { y: 8, opacity: 0.4 },
        { y: 0, opacity: 1, duration: 0.32, ease: "power2.out" }
      );
    }
  });

  const triggerDenialShake = contextSafe(() => {
    const box = root.current?.querySelector(".sim-controls");
    if (box) {
      gsap.fromTo(
        box,
        { x: -8 },
        { x: 8, duration: 0.08, repeat: 5, yoyo: true, ease: "none", onComplete: () => gsap.set(box, { x: 0 }) }
      );
    }
  });

  const finishAction = contextSafe(() => {
    const action = actionRef.current;
    if (!action) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const routeNode = root.current?.querySelector('[data-phase="routing"]');
    const encryptNode = root.current?.querySelector('[data-phase="encrypting"]');

    const runCommit = async () => {
      try {
        const result = await encryptAndCommit(action.operation, action.amount, action.rail);
        setCommitment(result.commitment);
        setSaltPreview(result.salt);
        setCipherBytes(result.ciphertextBytes);
        setError("");
        setPhase("complete");
        runScrambleReveal(result.commitment);
      } catch {
        setError("This browser could not execute Web Crypto. Ensure HTTPS or localhost execution context.");
        setPhase("error");
      }
    };

    if (!routeNode || !encryptNode || reduced) {
      void runCommit();
      return;
    }

    gsap.timeline()
      .call(() => setPhase("routing"))
      .fromTo(routeNode, { y: 8, opacity: 0.5 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" })
      .call(() => setPhase("encrypting"))
      .fromTo(encryptNode, { y: 8, opacity: 0.5 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" })
      .call(() => { void runCommit(); });
  });

  async function executeAction() {
    setCommitment("");
    setCipherBytes(0);
    setError("");
    actionRef.current = { amount: operation.amount, rail: operation.rail, operation: operation.label };

    animatePhase("policy", "policy");

    if (overBudget) {
      triggerDenialShake();
      setError("Action Denied: Requested transaction exceeds the remaining session budget. Fail-closed state triggered.");
      setPhase("denied");
      return;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 380));

    if (approvalRequired) {
      animatePhase("approval", "approval");
      return;
    }

    finishAction();
  }

  async function copyHash() {
    if (!commitment) return;
    try {
      await navigator.clipboard.writeText(commitment);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch {
      setCopiedHash(false);
    }
  }

  const phaseItems: { key: string; label: string; active: boolean; done: boolean; failed: boolean }[] = [
    {
      key: "policy",
      label: "Deterministic Policy Gate",
      active: phase === "policy",
      done: ["approval", "routing", "encrypting", "complete", "rejected", "error"].includes(phase),
      failed: phase === "denied",
    },
    {
      key: "approval",
      label: "Human-in-the-Loop Approval",
      active: phase === "approval",
      done: ["routing", "encrypting", "complete", "error"].includes(phase),
      failed: phase === "rejected",
    },
    {
      key: "routing",
      label: "Multi-Rail Adapter Routing",
      active: phase === "routing",
      done: ["encrypting", "complete", "error"].includes(phase),
      failed: false,
    },
    {
      key: "encrypting",
      label: "AES-256-GCM & Blake2b-256",
      active: phase === "encrypting",
      done: phase === "complete",
      failed: phase === "error",
    },
  ];

  return (
    <section ref={root} id="simulator" className="simulator-section section-frame" aria-labelledby="sim-heading">
      <div className="simulator-heading" data-reveal>
        <div>
          <h2 id="sim-heading">
            Interactive policy <span>simulator.</span>
          </h2>
        </div>
        <p>
          Configure the autonomous agent parameters and execute a simulated payment. Web Crypto AES-GCM encryption and Noble Blake2b-256 commitments run live in your browser sandbox.
        </p>
      </div>

      <div className="simulator-layout">
        {/* Controls form */}
        <form
          className="sim-controls"
          data-ui=""
          data-reveal
          onSubmit={(event) => {
            event.preventDefault();
            void executeAction();
          }}
        >
          <div className="control-heading">
            <span>POLICY ENGINE INPUTS</span>
            <span className="policy-state">
              <i className="status-dot" /> ACTIVE SANDBOX
            </span>
          </div>

          <label className="range-control" htmlFor="budget-range">
            <span className="range-label">
              <span>Session budget</span>
              <output className="tabular" htmlFor="budget-range">
                ${budget} USDM
              </output>
            </span>
            <input
              id="budget-range"
              name="session-budget"
              type="range"
              min="10"
              max="500"
              step="5"
              value={budget}
              disabled={isBusy || phase === "approval"}
              onChange={(event) => setBudget(Number(event.target.value))}
              data-interactive="true"
            />
            <span className="range-bounds tabular">
              <span>$10 MIN</span>
              <span>$500 MAX</span>
            </span>
          </label>

          <label className="range-control" htmlFor="threshold-range">
            <span className="range-label">
              <span>Human approval ceiling</span>
              <output className="tabular" htmlFor="threshold-range">
                ${threshold} USD
              </output>
            </span>
            <input
              id="threshold-range"
              name="approval-threshold"
              type="range"
              min="5"
              max="100"
              step="5"
              value={threshold}
              disabled={isBusy || phase === "approval"}
              onChange={(event) => setThreshold(Number(event.target.value))}
              data-interactive="true"
            />
            <span className="range-bounds tabular">
              <span>$5 AUTO</span>
              <span>$100 STRICT</span>
            </span>
          </label>

          <label className="select-control" htmlFor="operation-select">
            <span>Autonomous agent task type</span>
            <select
              id="operation-select"
              name="operation-type"
              value={operationId}
              disabled={isBusy || phase === "approval"}
              onChange={(event) => setOperationId(event.target.value as typeof operationId)}
              data-interactive="true"
            >
              {operations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} [{item.amount} {item.currency}]
                </option>
              ))}
            </select>
          </label>

          <div
            className={`decision-preview ${
              overBudget ? "preview-denied" : approvalRequired ? "preview-escalate" : "preview-allow"
            }`}
            aria-live="polite"
          >
            <ShieldCheck size={18} aria-hidden="true" />
            <span>
              {overBudget
                ? "EXCEEDS BUDGET · FAIL-CLOSED"
                : approvalRequired
                ? "ESCALATION: OPERATOR APPROVAL REQUIRED"
                : "PRE-SIGN EVALUATION: ALLOWED"}
            </span>
            <strong className="tabular">
              {operation.amount} {operation.currency}
            </strong>
          </div>

          <button
            className="btn execute-button"
            type="submit"
            disabled={isBusy || phase === "approval"}
            data-interactive="true"
          >
            <span>
              {isBusy
                ? "Computing Cryptographic Gates..."
                : phase === "complete"
                ? "Run Another Simulation"
                : "Execute Autonomous Agent Action"}
            </span>
            {isBusy ? (
              <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight size={16} aria-hidden="true" />
            )}
          </button>

          <p className="sim-disclaimer">
            In-browser sandbox demonstrator. Real Web Crypto execution; no remote Cardano RPC or external payment provider is contacted.
          </p>
        </form>

        {/* Execution trace and cryptographic output */}
        <div className="sim-output" data-ui="" aria-label="Simulated policy engine execution trace">
          <div className="output-top">
            <span>EXECUTION TRACE &amp; CRYPTOGRAPHY</span>
            <span className="tabular">NUDU CLEAR // SANDBOX // NO-STORAGE</span>
          </div>

          <ol className="phase-list" aria-live="polite">
            {phaseItems.map((item) => (
              <li
                key={item.key}
                className={
                  item.failed
                    ? "phase-row is-failed"
                    : item.active
                    ? "phase-row is-active"
                    : item.done
                    ? "phase-row is-done"
                    : "phase-row"
                }
                data-phase={item.key}
              >
                <span className="phase-icon" aria-hidden="true">
                  {item.failed ? (
                    <CircleAlert size={14} />
                  ) : item.done ? (
                    <Check size={14} />
                  ) : item.active ? (
                    <i className="phase-spinner" />
                  ) : (
                    <span />
                  )}
                </span>
                <span>{item.label}</span>
                <span className="phase-result tabular">
                  {item.failed
                    ? phase === "rejected"
                      ? "USER_REJECTED"
                      : "DENIED"
                    : item.done
                    ? "VERIFIED_DONE"
                    : item.active
                    ? "EVALUATING..."
                    : "WAITING"}
                </span>
              </li>
            ))}
          </ol>

          {phase === "approval" && (
            <div className="approval-prompt" data-phase="approval">
              <CircleAlert size={18} aria-hidden="true" />
              <div>
                <strong>Operator Approval Required</strong>
                <span>
                  Action on {operation.rail} for {operation.amount} {operation.currency} exceeds your ${threshold} threshold setting.
                </span>
              </div>
              <div className="approval-actions">
                <button
                  type="button"
                  className="approve-button"
                  onClick={() => finishAction()}
                  data-interactive="true"
                >
                  Approve Transaction
                </button>
                <button
                  type="button"
                  className="reject-button"
                  onClick={() => {
                    setPhase("rejected");
                    setError("Approval declined by human operator. Zero funds moved.");
                  }}
                  data-interactive="true"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {(phase === "denied" || phase === "error") && (
            <div className="result-message error-message" role="alert">
              <CircleAlert size={18} aria-hidden="true" />
              <span>{error || "Action denied by deterministic policy gate."}</span>
            </div>
          )}

          {phase === "rejected" && (
            <div className="result-message" role="status">
              <CircleAlert size={18} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {phase === "complete" && (
            <div className="commitment-output" data-phase="complete">
              <div className="commitment-title">
                <LockKeyhole size={15} aria-hidden="true" />
                <span>BLAKE2B-256 AUDIT COMMITMENT (LOCAL)</span>
                <button
                  type="button"
                  onClick={copyHash}
                  className="copy-hash-btn"
                  title="Copy 64-character hex commitment"
                  data-interactive="true"
                >
                  {copiedHash ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedHash ? "COPIED" : "COPY HASH"}</span>
                </button>
              </div>

              <code ref={commitmentRef} className="tabular">
                {commitment.match(/.{1,8}/g)?.join(" ")}
              </code>

              <div className="commitment-meta tabular">
                <span>AES-256-GCM: {cipherBytes} BYTES CIPHERTEXT</span>
                <span>SALT: 0x{saltPreview}</span>
                <span>DIGEST: 32 BYTES (256-BIT)</span>
              </div>

              <div className="commitment-explainer">
                <p>
                  <strong>Private payload remains local.</strong> All request parameters and task secrets are encrypted off-chain. Only the salted Blake2b-256 digest is the public commitment. Metadata label 4020 in this sandbox is illustrative.
                </p>
              </div>
            </div>
          )}

          {phase === "idle" && (
            <div className="output-empty">
              <span className="empty-orbit" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <p>Configure agent policy parameters and trigger an execution to inspect live cryptographic evaluation.</p>
            </div>
          )}

          <div className="output-footer tabular">
            <span>
              <i className="status-dot" /> ENCRYPTED MEMORY BOUNDARY · ZERO-KNOWLEDGE PROOF COMPATIBLE
            </span>
            <span>NO REMOTE TELEMETRY LOGGED</span>
          </div>
        </div>
      </div>
    </section>
  );
}
