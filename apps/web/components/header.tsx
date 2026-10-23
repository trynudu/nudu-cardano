"use client";

import { ArrowUpRight } from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";

const links = [
  ["Architecture", "#architecture"],
  ["5-Step Flow", "#flow"],
  ["Policy Simulator", "#simulator"],
  ["Positioning", "#prime"],
  ["Read Specs", "/specs/01-PRD-PRODUCT-SPEC.md"],
] as const;

export function Header() {
  return (
    <header id="top" className="site-header">
      <div className="telemetry" aria-label="Simulated protocol status">
        <span>
          <i className="status-dot" />
          <span>STATUS: SIMULATED SANDBOX</span>
        </span>
        <span>RAILS: HTTP x402 + MASUMI</span>
        <span>AUDIT: BLAKE2B-256 COMMITMENT</span>
        <span className="telemetry-demo">NOT A LIVE TRANSACTION</span>
      </div>
      <nav className="navigation" aria-label="Main navigation">
        <a href="#top" className="brand" aria-label="Nudu Clear, back to top" data-interactive="true">
          <BrandLockup />
        </a>
        <div className="nav-links">
          {links.map(([label, href]) => (
            <a key={label} href={href} data-interactive="true">
              {label}
            </a>
          ))}
        </div>
        <a className="btn nav-action" href="#simulator" data-interactive="true">
          <span>Explore demo</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}
