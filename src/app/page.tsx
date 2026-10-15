import Link from "next/link";

function Mark() {
  return <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>;
}

function HeroArtwork() {
  return (
    <div className="home-art" aria-hidden="true">
      <div className="art-halo art-halo-a" /><div className="art-halo art-halo-b" />
      <div className="art-orbit art-orbit-a" /><div className="art-orbit art-orbit-b" />
      <div className="preview-window glass-panel">
        <div className="preview-top"><span className="preview-dots"><i /><i /><i /></span><span>STOCKAI / OVERVIEW</span><span className="preview-status" /></div>
        <div className="preview-title">Inventory, in focus <span>01</span></div>
        <div className="preview-chart">
          <div className="preview-chart-label"><span>Illustrative movement</span><span>CONCEPT</span></div>
          <svg viewBox="0 0 440 140" fill="none"><defs><linearGradient id="home-area" x1="220" y1="18" x2="220" y2="140" gradientUnits="userSpaceOnUse"><stop stopColor="#8275df" stopOpacity=".2"/><stop offset="1" stopColor="#8275df" stopOpacity="0"/></linearGradient></defs><path d="M0 111C35 105 39 82 75 88S114 107 145 75 190 84 222 66 265 94 294 56 337 64 361 42 403 45 440 20V140H0V111Z" fill="url(#home-area)"/><path d="M0 111C35 105 39 82 75 88S114 107 145 75 190 84 222 66 265 94 294 56 337 64 361 42 403 45 440 20" stroke="#7B70D8" strokeWidth="2.5" strokeLinecap="round"/><circle cx="361" cy="42" r="5" fill="#fff" stroke="#7B70D8" strokeWidth="3"/></svg>
          <div className="preview-axis"><span>Stock patterns</span><span>Illustrative visual</span></div>
        </div>
        <div className="preview-bottom"><span className="preview-spark">✳</span><span><strong>See the whole picture</strong><small>Clear signals, connected.</small></span><span className="preview-arrow">↗</span></div>
      </div>
      <div className="art-chip art-chip-one"><span className="art-chip-icon">✧</span><span><small>STOCK VISIBILITY</small><strong>Clarity at a glance</strong></span></div>
      <div className="art-chip art-chip-two"><span className="art-chip-icon art-chip-lavender">⌁</span><span><small>AI-POWERED INSIGHTS</small><strong>Decisions with context</strong></span></div>
      <span className="art-node art-node-one" /><span className="art-node art-node-two" /><span className="art-node art-node-three" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="home-page">
      <div className="home-glow home-glow-one" /><div className="home-glow home-glow-two" />
      <nav className="home-nav glass-panel" aria-label="Main navigation">
        <Link href="/" className="home-brand" aria-label="StockAI home"><Mark /><span>Stock<span>AI</span></span></Link>
        <span className="home-nav-caption"><i /> INVENTORY INTELLIGENCE</span>
        <Link href="/login" className="home-login">Login <span aria-hidden="true">↗</span></Link>
      </nav>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-copy">
          <div className="home-eyebrow"><span>✳</span> INVENTORY, WITH MORE INTELLIGENCE</div>
          <h1 id="home-title">AI-Powered<br /><em>Inventory</em><br />Management<span className="home-title-dot">.</span></h1>
          <p>Know what you have, what is changing, and what to do next. Monitor stock, understand your data, and find intelligent insights in one clear view.</p>
          <div className="home-actions"><Link href="/admin" className="home-primary">Go to Dashboard <span aria-hidden="true">↗</span></Link><Link href="/login" className="home-secondary">Login <span aria-hidden="true">→</span></Link></div>
          <div className="home-footnote"><span /> MADE FOR CLEARER DECISIONS</div>
        </div>
        <HeroArtwork />
      </section>
      <div className="home-footer"><span>INVENTORY, IN A NEW LIGHT</span><span className="home-footer-mid"><i /> INTELLIGENCE THAT MOVES WITH YOU</span><span>STOCKAI / 01</span></div>
    </main>
  );
}
