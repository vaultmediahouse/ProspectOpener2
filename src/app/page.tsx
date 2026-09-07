import Link from "next/link";

const Arrow = () => <span aria-hidden="true">↗</span>;

function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Vault Media House home">
      <span className="logo-mark"><i /><i /><i /></span>
      <span>VAULT<br /><b>MEDIA HOUSE</b></span>
    </Link>
  );
}

const fields = ["Business name", "Industry & location", "Website", "Business email", "Phone, when available", "Contact name, when available"];

export default function Home() {
  return (
    <main>
      <div className="announcement"><span>NEW</span> The smarter way to build your outreach pipeline <Arrow /></div>
      <nav className="nav container">
        <Logo />
        <div className="nav-links"><Link href="/how-it-works">How it works</Link><Link href="/leads">What’s in a lead</Link><Link href="/pricing">Pricing</Link><Link href="/faq">FAQ</Link></div>
        <div className="nav-actions"><Link href="/login" className="login-link">Log in</Link><Link href="/pricing" className="button button-small">Get leads <Arrow /></Link></div>
      </nav>

      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> Curated prospecting data for modern freelancers</div>
          <h1>Spend less time<br /><em>searching.</em> More time<br />selling.</h1>
          <p className="hero-text">Verified business leads for freelancers who are ready to do meaningful work — not spend their week hunting for someone to pitch.</p>
          <div className="hero-actions"><Link href="/pricing" className="button">Browse lead packages <Arrow /></Link><Link href="/how-it-works" className="text-link">See how it works <Arrow /></Link></div>
          <div className="trust-row"><div className="avatar-stack"><span>AK</span><span>RS</span><span>NP</span><span>+ </span></div><div><strong>Built for independent operators</strong><small>Clear data. No subscriptions. No noise.</small></div></div>
        </div>
        <div className="hero-visual">
          <div className="visual-label">A closer look at your next opportunity <span>✦</span></div>
          <div className="lead-card main-card">
            <div className="card-top"><span className="status-pill"><i /> VERIFIED LEAD</span><span className="card-id">#VMH-00842</span></div>
            <div className="lead-name-row"><div className="business-icon">S</div><div><h3>Sharma & Sons Trading Co.</h3><p>Wholesale · Pune, Maharashtra</p></div><span className="quality">Good fit</span></div>
            <div className="intent"><span>BUSINESS INTENT SIGNAL</span><strong>Looking to modernise operations</strong><div className="intent-line"><i /></div></div>
            <div className="lead-details"><div><small>WEBSITE</small><strong>sharmasons.co.in</strong></div><div><small>CONTACT</small><strong>Available</strong></div><div><small>RESEARCHED</small><strong>12 Jun 2026</strong></div></div>
            <div className="card-footer"><span>✓ Validated against public business information</span><span>View detail <Arrow /></span></div>
          </div>
          <div className="floating-note note-one"><span>01</span><div><b>Research-backed</b><small>Every record is checked before it reaches you.</small></div></div>
          <div className="floating-note note-two"><span>₹</span><div><b>From ₹9.98 / lead</b><small>Buy only what your pipeline needs.</small></div></div>
          <div className="visual-grid" />
        </div>
      </section>

      <section className="proof-strip"><div className="container proof-inner"><span>THE VAULT STANDARD</span><div><b>Structured</b> business information</div><div><b>Human-led</b> validation checks</div><div><b>Practical</b> for real outreach</div><div><b>Honest</b> about what a lead is</div></div></section>

      <section className="section container split-section"><div className="section-intro"><div className="section-number">01 / THE PROBLEM</div><h2>Your next client is out there. Finding them shouldn’t be your full-time job.</h2><p>Searching directories, opening tabs, checking websites, and collecting contact details is work before the work. Vault brings the first layer of prospecting together, so you can focus on the conversation.</p><Link href="/how-it-works" className="text-link">How Vault works <Arrow /></Link></div><div className="signal-board"><div className="board-head"><span>OUTREACH PIPELINE</span><span>JUNE 2026 ↗</span></div><div className="board-row muted"><span>01</span><div><b>Raw business list</b><small>Scattered across the internet</small></div><strong>—</strong></div><div className="board-row"><span className="green">02</span><div><b>Vault verification</b><small>Business details checked & structured</small></div><strong className="green">✓</strong></div><div className="board-row"><span className="green">03</span><div><b>Your outreach queue</b><small>Ready for your next thoughtful pitch</small></div><strong className="green">→</strong></div><div className="board-foot"><span>One less tab. One better conversation.</span><span className="pulse-dot" /></div></div></section>

      <section className="dark-section"><div className="container"><div className="dark-heading"><div className="section-number light">02 / WHAT YOU RECEIVE</div><h2>Not a random list.<br /><span>A considered starting point.</span></h2><p>Each lead is organised to help you understand who the business is, where they are, and how to begin a relevant conversation.</p></div><div className="fields-grid">{fields.map((field, index) => <div className="field-item" key={field}><span>0{index + 1}</span><b>{field}</b><small>When available and relevant</small></div>)}</div><div className="dark-bottom"><span>Field availability can vary based on publicly available business information.</span><Link href="/leads" className="button button-light">Explore lead details <Arrow /></Link></div></div></section>

      <section className="section container process-section"><div className="process-heading"><div><div className="section-number">03 / THE PROCESS</div><h2>From package to<br /><em>pipeline.</em></h2></div><p>No monthly plans. No automatic renewal. Pick a package, complete your purchase, and receive your leads in your customer dashboard.</p></div><div className="steps"><div><span>01</span><h3>Choose your package</h3><p>Start with 50 or 100 verified business leads, depending on the pace of your outreach.</p></div><div><span>02</span><h3>Complete your purchase</h3><p>A simple, secure one-time checkout. Your purchase history stays yours.</p></div><div><span>03</span><h3>Receive your leads</h3><p>Unique leads are assigned from available inventory and prepared for your work.</p></div><div><span>04</span><h3>Download & prospect</h3><p>Access your leads through the customer application and start reaching out.</p></div></div></section>

      <section className="pricing-preview"><div className="container pricing-layout"><div><div className="section-number">04 / SIMPLE PRICING</div><h2>Start with the<br /><em>right amount.</em></h2><p>Buy a fixed package when you need it. Scale your prospecting without signing up for another monthly bill.</p><Link href="/pricing" className="text-link">Compare packages <Arrow /></Link></div><div className="price-cards"><div className="price-card"><span>STARTER</span><strong>₹499</strong><p>50 verified leads</p><small>₹9.98 per lead</small><Link href="/checkout?plan=starter" className="button">Choose Starter <Arrow /></Link></div><div className="price-card featured"><div className="popular">MOST POPULAR</div><span>GROWTH</span><strong>₹999</strong><p>100 verified leads</p><small>₹9.99 per lead</small><Link href="/checkout?plan=growth" className="button">Choose Growth <Arrow /></Link></div></div></div></section>

      <section className="trust-section container"><div className="trust-mark">✦</div><div><div className="section-number">05 / A CLEAR PROMISE</div><h2>Verified is a process.<br /><em>Not a guarantee.</em></h2><p>Vault verifies information against defined checks before a lead enters our inventory. That means better starting data — not a promise that every prospect will become a client.</p><div className="definition-row"><div><b>Verified</b><span>Passed Vault’s validation process.</span></div><div><b>Qualified</b><span>Matches our target business criteria.</span></div><div><b>Guaranteed client</b><span className="no">Not what we sell.</span></div></div></div></section>

      <section className="cta-section"><div className="container cta-inner"><div className="eyebrow"><span className="eyebrow-dot" /> Your next conversation starts here</div><h2>Make your outreach<br /><em>more intentional.</em></h2><Link href="/pricing" className="button button-light">View lead packages <Arrow /></Link></div></section>
      <footer className="footer container"><Logo /><div className="footer-links"><Link href="/about">About</Link><Link href="/faq">FAQ</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div><span>© 2026 Vault Media House</span></footer>
    </main>
  );
}
