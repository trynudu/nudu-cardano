const values = [
  { name: "Don't Make Me Think", line: "One call. One policy boundary.", body: "Wrap fetch once. The SDK handles a validated x402 challenge, pre-sign policy evaluation, and adapter selection.", className: "value-one" },
  { name: "You've Got My Attention!", line: "Commerce that can act.", body: "Let agents discover paid APIs and complete scoped tasks with explicit budgets, challenge binding, and replay-aware settlement.", className: "value-two" },
  { name: "Show Me the Value!", line: "Receipts without the payload.", body: "Keep the detailed audit encrypted off-chain. Anchor a salted Blake2b-256 commitment and minimal metadata when verification is needed.", className: "value-three" },
  { name: "Trust Without Friction", line: "Control before signature.", body: "Set per-session budgets, per-action limits, allowlists, and human approval thresholds before any adapter is asked to settle.", className: "value-four" },
  { name: "Build Once. Integrate Everywhere.", line: "One policy. Eligible rails.", body: "Route between Cardano x402, Masumi task escrow, and enabled Agentcard/Yuno checkout adapters without moving policy into each provider.", className: "value-five" },
];

export function ValueGrid() {
  return (
    <section id="architecture" className="values-section section-frame" aria-labelledby="values-heading">
      <div className="section-intro">
        <div><h2 id="values-heading">Useful autonomy.<br /><span>Bounded by design.</span></h2></div>
        <p>Every product value maps to a system boundary: developer surface, payment protocol, policy, routing, or evidence.</p>
      </div>
      <div className="values-grid">
        {values.map((value) => (
          <article className={`value-cell ${value.className}`} key={value.name}>
            <div><h3>{value.name}</h3><p className="value-line">{value.line}</p><p className="value-body">{value.body}</p></div>
          </article>
        ))}
      </div>
      <p className="section-footnote">Cardano records commitments and settlement references, not private request payloads.</p>
    </section>
  );
}
