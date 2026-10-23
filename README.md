# Nudu Clear

Cardano settlement layer for Nudu. Agents clear a deterministic policy gate, settle on an allowed rail, and anchor a commitment while the audit stays encrypted off-chain. This repository currently contains product/architecture specs, shared TypeScript contracts, an SDK foundation, and a simulated landing page.

```sh
pnpm install
pnpm --filter web dev
pnpm build
pnpm typecheck
pnpm test
```

Read the Nudu Clear specifications in `specs/` (`01-PRD-PRODUCT-SPEC.md`, `02-ARCHITECTURE-AND-FLOWS.md`, `03-MONOREPO-STRUCTURE.md`, `04-VALIDATION-AND-OPEN-DECISIONS.md`). Demo network state and transactions are simulated; no production payment adapter is included.
