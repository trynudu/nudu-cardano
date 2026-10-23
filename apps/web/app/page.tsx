import { BrandLockup } from "@/components/brand-lockup";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ValueGrid } from "@/components/value-grid";
import { TransactionPipeline } from "@/components/transaction-pipeline";
import { PolicySimulator } from "@/components/policy-simulator";
import { PrimePositioning } from "@/components/prime-positioning";
import { PageMotion } from "@/components/page-motion";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <PageMotion>
        <main id="main">
          <Hero />
          <ValueGrid />
          <TransactionPipeline />
          <PolicySimulator />
          <PrimePositioning />
        </main>
        <footer className="site-footer">
          <div className="section-frame footer-inner">
            <a href="#top" className="brand" aria-label="Nudu Clear, back to top">
              <BrandLockup tone="white" />
            </a>
            <p>A Nudu subproduct. Policy before payment. The audit stays off-chain; the ledger keeps the commitment.</p>
          </div>
        </footer>
      </PageMotion>
    </>
  );
}
