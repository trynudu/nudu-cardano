type Tone = "carmine" | "white";

export function BrandLockup({ tone = "carmine" }: { tone?: Tone }) {
  const src = tone === "white" ? "/brand/lockup-white.png" : "/brand/lockup-carmine.png";
  return (
    <span className={`brand-lockup brand-lockup--${tone}`}>
      <img src={src} alt="" width={112} height={28} />
      <span className="brand-chip">Clear</span>
    </span>
  );
}
