# Workspace guide

- This is the Nudu Clear monorepo, the Cardano settlement subproduct of Nudu. The marketing app is `apps/web`; shared contracts live in `packages/shared-types`; the SDK skeleton is `packages/sdk`.
- Read `apps/web/DESIGN.md` before changing the landing page. Visual tokens are copied from the Nudu design system: carmine on cool graphite, Manrope, DM Sans, and IBM Plex Mono.
- Prefer semantic HTML, keyboard-operable controls, visible focus, stable layout, and reduced-motion support. Keep `tabular-nums` on numeric telemetry and comparisons.
- Demo values and network indicators are simulations. Never present them as live Cardano state or production transaction confirmations.
- Private audit payloads remain off-chain and encrypted; only a salted/domain-separated commitment is intended for the public ledger. A hash is not encryption.
