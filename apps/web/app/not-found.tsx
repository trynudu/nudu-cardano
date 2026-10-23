import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found section-frame">
      <p className="eyebrow">Status 404</p>
      <h1>This route is not on the ledger.</h1>
      <p className="lede">The path does not exist in this prototype.</p>
      <Link href="/" className="btn">
        Back to Nudu Clear
      </Link>
    </main>
  );
}
