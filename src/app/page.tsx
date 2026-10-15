"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function Mark() {
  return <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>;
}

function HeroVisual() {
  return (
    <div className="hero-visual">
      <div className="hero-backlight" aria-hidden="true" />
      <div className="hero-visual-glow" />
      <Image
        className="hero-person"
        src="/hero-professional-man.webp"
        alt="Professional man reviewing inventory information on a tablet"
        width={1536}
        height={1024}
        priority
        sizes="(max-width: 650px) 100vw, 58vw"
      />
      <div className="hero-interface hero-interface-main glass-panel" aria-label="Illustrative inventory interface">
        <div className="interface-reflection" />
        <div className="interface-kicker"><span className="interface-live-dot" /> INTERFACE PREVIEW</div>
        <strong>Stock overview</strong>
        <div className="interface-row"><span className="interface-mark interface-mark-blue" /> Product catalog <span>Connected</span></div>
        <div className="interface-row"><span className="interface-mark interface-mark-violet" /> Stock visibility <span>In view</span></div>
        <div className="interface-rule"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <small>Illustrative interface · no live figures</small>
      </div>
      <div className="hero-interface hero-interface-purchasing glass-panel" aria-label="Illustrative purchase activity interface">
        <div className="interface-reflection" />
        <div className="interface-kicker">PURCHASE ACTIVITY · PREVIEW</div>
        <strong>From order to stock</strong>
        <div className="purchase-mini-flow"><span>Ordered</span><i aria-hidden="true">→</i><span>Received</span></div>
      </div>
      <div className="hero-low-stock glass-panel"><span className="low-stock-indicator" /><span><small>ILLUSTRATIVE STATUS</small><strong>Low-stock review</strong></span><span className="low-stock-mark">↗</span></div>
      <span className="hero-visual-caption">ILUF&nbsp; / &nbsp;INVENTORY, IN FOCUS</span>
    </div>
  );
}

function InventoryClaritySection() {
  return (
    <section className="story-section clarity-section" id="clarity" aria-labelledby="clarity-title">
      <div className="clarity-copy">
        <span className="section-eyebrow"><i /> 01 / INVENTORY CLARITY</span>
        <h2 id="clarity-title">One clear picture of what you carry.</h2>
        <p>Products, categories, and stock belong in the same conversation. Keep the catalog organized and stock information easy to find.</p>
        <Link href="/admin/inventory" className="section-link">Explore inventory <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="clarity-visual" aria-label="How inventory information connects">
        <div className="clarity-orbit clarity-orbit-one" /><div className="clarity-orbit clarity-orbit-two" />
        <div className="clarity-center"><span className="clarity-center-mark"><i /><i /><i /><i /></span><strong>Inventory</strong><small>One connected view</small></div>
        <div className="clarity-node clarity-node-products"><span className="node-symbol">▦</span><small>CATALOG</small><strong>Products</strong></div>
        <div className="clarity-node clarity-node-categories"><span className="node-symbol">⌘</span><small>STRUCTURE</small><strong>Categories</strong></div>
        <div className="clarity-node clarity-node-stock"><span className="node-symbol">◌</span><small>VISIBILITY</small><strong>Stock levels</strong></div>
        <div className="clarity-note glass-panel"><span className="glass-sheen" aria-hidden="true" /><span className="note-check">✓</span><span><strong>Easy to follow</strong><small>Browse by item or category</small></span></div>
      </div>
    </section>
  );
}

function PurchasingSection() {
  return (
    <section className="story-section purchasing-section" id="purchasing" aria-labelledby="purchasing-title">
      <div className="purchasing-visual" aria-label="Illustrative purchase receiving workflow">
        <span className="glass-sheen" aria-hidden="true" />
        <div className="workflow-topline"><span>OPERATIONS FLOW</span><span>ILLUSTRATIVE</span></div>
        <div className="workflow-line" />
        <div className="workflow-steps">
          <div className="workflow-step"><span className="workflow-icon">S</span><small>01 / SOURCE</small><strong>Supplier</strong><p>Choose who you order from.</p></div>
          <span className="workflow-arrow" aria-hidden="true">→</span>
          <div className="workflow-step"><span className="workflow-icon">P</span><small>02 / PREPARE</small><strong>Purchase order</strong><p>Group products and quantities.</p><div className="workflow-detail"><span>Purchase items</span><i aria-hidden="true">···</i></div></div>
          <span className="workflow-arrow" aria-hidden="true">→</span>
          <div className="workflow-step workflow-step-receive"><span className="workflow-icon">✓</span><small>03 / RECEIVE</small><strong>Update stock</strong><p>Record what has arrived.</p></div>
        </div>
        <div className="workflow-foot"><span className="workflow-pulse" /> Receiving connects purchasing to inventory.</div>
      </div>
      <div className="purchasing-copy">
        <span className="section-eyebrow"><i /> 02 / SMARTER PURCHASING</span>
        <h2>From supplier to stock, with fewer loose ends.</h2>
        <p>Keep suppliers, purchase orders, line items, and receiving together. When an order arrives, record it through the receiving workflow to update inventory.</p>
        <Link href="/admin/purchases" className="section-link">View purchasing <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}

function VisionSection() {
  return (
    <section className="story-section vision-section" id="vision" aria-labelledby="vision-title">
      <div className="vision-copy">
        <span className="section-eyebrow"><i /> 03 / A THOUGHTFUL NEXT STEP</span>
        <h2 id="vision-title">A clearer foundation for intelligent operations.</h2>
        <p>The current workspace brings product, category, inventory, and purchasing operations together. More assisted planning and automation remain a future direction—not a feature claim today.</p>
        <Link href="/admin" className="home-primary vision-cta">Explore the workspace <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="vision-visual" aria-label="Current foundation and planned future capabilities">
        <div className="vision-light vision-light-a" /><div className="vision-light vision-light-b" />
        <div className="vision-rings"><i /><i /><i /><i /></div>
        <div className="vision-core"><span className="vision-core-mark"><i /><i /><i /><i /></span><strong>Inventory<br />intelligence</strong><small>Built on clear operations</small></div>
        <div className="vision-label vision-current glass-panel"><span className="glass-sheen" aria-hidden="true" /><span className="vision-label-dot" /><small>IN THE WORKSPACE</small><strong>Products · Stock · Purchasing</strong></div>
        <div className="vision-label vision-planned glass-panel"><span className="glass-sheen" aria-hidden="true" /><span className="planned-tag">PLANNED</span><small>FUTURE DIRECTION</small><strong>Assisted decisions<br />and automation</strong></div>
      </div>
    </section>
  );
}

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    gsap.registerPlugin(ScrollTrigger);
    const isMobile = window.matchMedia("(max-width: 650px)").matches;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const ambient = gsap.timeline({ paused: true, repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
        ambient
          .to(".home-color-field-lavender", { x: isMobile ? 14 : 34, y: isMobile ? -10 : -20, scale: 1.05, opacity: isMobile ? 0.74 : 0.9, duration: isMobile ? 23 : 19 }, 0)
          .to(".home-color-field-azure", { x: isMobile ? -10 : -22, y: isMobile ? -9 : -18, scale: 1.04, opacity: isMobile ? 0.74 : 0.86, duration: isMobile ? 25 : 21 }, 0)
          .to(".home-light-bands:not(.home-light-bands-secondary)", { x: isMobile ? -8 : -16, y: isMobile ? -9 : -18, opacity: 0.72, duration: 16 }, 1)
          .to(".hero-visual-glow", { scale: 1.12, opacity: 0.84, duration: 12 }, 1);
        if (!isMobile) {
          ambient
            .to(".home-color-field-violet", { x: -30, y: 22, scale: 1.035, opacity: 0.84, duration: 23 }, 0)
            .to(".home-color-field-periwinkle", { x: 25, y: 17, scale: 1.03, opacity: 0.82, duration: 25 }, 0)
            .to(".home-light-bands-secondary", { x: 18, y: 15, opacity: 0.48, duration: 21 }, 2)
            .to(".hero-backlight", { xPercent: 26, opacity: 0.28, duration: 18 }, 0)
            .to(".vision-light-a", { x: 18, y: -12, duration: 17 }, 2)
            .to(".vision-light-b", { x: -17, y: 10, duration: 19 }, 1);
        }
        gsap.fromTo(isMobile ? ".interface-reflection" : ".interface-reflection, .glass-sheen", { xPercent: -220, autoAlpha: 0.04 }, { xPercent: 220, autoAlpha: 0.42, duration: isMobile ? 8 : 7, stagger: 0.85, repeat: -1, repeatDelay: isMobile ? 6 : 6.5, ease: "sine.inOut" });

        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .fromTo(".home-base", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9 }, 0)
          .fromTo(".home-color-field-lavender", { autoAlpha: 0, x: 48, y: 18, scale: 0.94 }, { autoAlpha: isMobile ? 0.78 : 1, x: 0, y: 0, scale: 1, duration: 1.75 }, 0.12)
          .fromTo(".home-color-field-violet", { autoAlpha: 0, x: -52, y: 22, scale: 0.94 }, { autoAlpha: isMobile ? 0.72 : 1, x: 0, y: 0, scale: 1, duration: 1.85 }, 0.28)
          .fromTo(".home-color-field-azure", { autoAlpha: 0, x: -40, y: -24, scale: 0.95 }, { autoAlpha: isMobile ? 0.78 : 1, x: 0, y: 0, scale: 1, duration: 1.9 }, 0.38)
          .fromTo(".home-color-field-periwinkle", { autoAlpha: 0, x: 32, y: 26, scale: 0.95 }, { autoAlpha: isMobile ? 0.72 : 1, x: 0, y: 0, scale: 1, duration: 1.85 }, 0.54)
          .fromTo(".home-light-bands:not(.home-light-bands-secondary)", { autoAlpha: 0, scaleY: 0.68 }, { autoAlpha: 1, scaleY: 1, duration: 1.45, transformOrigin: "50% 0%" }, 0.95)
          .fromTo(".home-light-bands-secondary", { autoAlpha: 0, scaleY: 0.78 }, { autoAlpha: 1, scaleY: 1, duration: 1.45, transformOrigin: "50% 0%" }, 1.22)
          .fromTo(".home-nav", { autoAlpha: 0, y: -12, filter: "blur(5px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.72 }, 0.38)
          .fromTo(".hero-backlight", { autoAlpha: 0, xPercent: -90 }, { autoAlpha: 1, xPercent: 95, duration: isMobile ? 1.1 : 1.6, ease: "sine.inOut" }, 1.45)
          .fromTo(".hero-person", { autoAlpha: 0, x: isMobile ? 12 : 24, clipPath: "inset(0% 0% 100% 0%)" }, { autoAlpha: 1, x: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 1.65, ease: "power2.out" }, 1.8)
          .fromTo(".home-eyebrow", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.48 }, 3.0)
          .fromTo(".home-title-line > span", { yPercent: 112 }, { yPercent: 0, duration: 0.78, stagger: 0.14, ease: "power3.out" }, 3.12)
          .fromTo(".home-copy > p", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.62 }, 3.72)
          .fromTo(".hero-interface-main, .hero-interface-purchasing, .hero-low-stock", { autoAlpha: 0, x: 12, y: 16, scale: 0.985, filter: "blur(8px)" }, { autoAlpha: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)", duration: 0.72, stagger: 0.16 }, 3.5)
          .fromTo(".home-feature", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.13 }, 4.02)
          .fromTo(".home-footer", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 4.0)
          .fromTo(".home-actions > *", { autoAlpha: 0, y: 12, filter: "blur(4px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.52, stagger: 0.12, ease: "power2.out" }, 4.38)
          .call(() => ambient.play(), [], 5.08);

        gsap.to(".hero-person", {
          y: isMobile ? -8 : -26,
          ease: "none",
          scrollTrigger: { trigger: ".home-hero", start: "top top", end: "bottom top", scrub: 1 },
        });
        gsap.to(".hero-interface-main", {
          y: isMobile ? -6 : -16,
          ease: "none",
          scrollTrigger: { trigger: ".home-hero", start: "top top", end: "bottom top", scrub: 1 },
        });
        gsap.to(".hero-interface-purchasing", {
          y: isMobile ? 7 : 18,
          ease: "none",
          scrollTrigger: { trigger: ".home-hero", start: "top top", end: "bottom top", scrub: 1 },
        });
        gsap.to(".home-atmosphere", {
          y: isMobile ? -12 : -34,
          opacity: 0.92,
          ease: "none",
          scrollTrigger: { trigger: ".home-page", start: "top top", end: "bottom bottom", scrub: 1.2 },
        });
        gsap.to(".home-light-bands:not(.home-light-bands-secondary)", {
          y: isMobile ? 10 : 22,
          ease: "none",
          scrollTrigger: { trigger: ".home-page", start: "top top", end: "bottom bottom", scrub: 1.4 },
        });
        gsap.to(".home-light-bands-secondary", {
          y: isMobile ? -9 : -19,
          ease: "none",
          scrollTrigger: { trigger: ".home-page", start: "top top", end: "bottom bottom", scrub: 1.6 },
        });

        gsap.fromTo("#clarity .clarity-copy > *", { autoAlpha: 0, y: isMobile ? 18 : 26 }, {
          autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: "#clarity", start: "top 74%", toggleActions: "play none none reverse" },
        });
        gsap.fromTo("#clarity .clarity-center, #clarity .clarity-node, #clarity .clarity-note", { autoAlpha: 0, y: 20, scale: 0.97 }, {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.72, stagger: 0.12, ease: "power2.out",
          scrollTrigger: { trigger: ".clarity-visual", start: "top 76%", toggleActions: "play none none reverse" },
        });
        gsap.fromTo(".clarity-orbit", { autoAlpha: 0, scale: 0.94 }, {
          autoAlpha: 0.62, scale: 1, duration: 0.88, stagger: 0.14, ease: "power2.out",
          scrollTrigger: { trigger: ".clarity-visual", start: "top 78%", toggleActions: "play none none reverse" },
        });
        gsap.to(".clarity-orbit-one", {
          rotation: -10, y: isMobile ? -5 : -14, ease: "none",
          scrollTrigger: { trigger: "#clarity", start: "top bottom", end: "bottom top", scrub: 1.2 },
        });
        gsap.to(".clarity-orbit-two", {
          rotation: 64, y: isMobile ? 5 : 14, ease: "none",
          scrollTrigger: { trigger: "#clarity", start: "top bottom", end: "bottom top", scrub: 1.4 },
        });

        gsap.fromTo("#purchasing .purchasing-copy > *", { autoAlpha: 0, y: isMobile ? 18 : 26 }, {
          autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: "#purchasing", start: "top 74%", toggleActions: "play none none reverse" },
        });
        const purchasingSequence = gsap.timeline({
          scrollTrigger: { trigger: ".purchasing-visual", start: "top 72%", toggleActions: "play none none reverse" },
          defaults: { ease: "power2.out" },
        });
        purchasingSequence
          .fromTo(".workflow-step:nth-of-type(1)", { autoAlpha: 0, y: isMobile ? 15 : 23 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0)
          .fromTo(".workflow-line", { scaleX: 0 }, { scaleX: 1, duration: 1.4, transformOrigin: "left center" }, 0.1)
          .fromTo(".workflow-step:nth-of-type(2)", { autoAlpha: 0, y: isMobile ? 15 : 23 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.38)
          .fromTo(".workflow-step:nth-of-type(2) .workflow-detail", { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: 0.36 }, 0.72)
          .fromTo(".workflow-step:nth-of-type(3)", { autoAlpha: 0, y: isMobile ? 15 : 23 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.82)
          .fromTo(".workflow-step-receive > small", { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.3 }, 1.08)
          .fromTo(".workflow-step-receive > strong", { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.32 }, 1.24)
          .fromTo(".workflow-arrow", { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.22 }, 0.26)
          .fromTo(".workflow-foot", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.42 }, 1.55);
        gsap.to(".purchasing-visual", {
          y: isMobile ? -6 : -16, ease: "none",
          scrollTrigger: { trigger: "#purchasing", start: "top bottom", end: "bottom top", scrub: 1.3 },
        });

        gsap.fromTo("#vision .vision-copy > *", { autoAlpha: 0, y: isMobile ? 18 : 26 }, {
          autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.11, ease: "power2.out",
          scrollTrigger: { trigger: "#vision", start: "top 74%", toggleActions: "play none none reverse" },
        });
        const visionSequence = gsap.timeline({
          scrollTrigger: { trigger: ".vision-visual", start: "top 74%", toggleActions: "play none none reverse" },
          defaults: { ease: "power2.out" },
        });
        visionSequence
          .fromTo(".vision-light", { autoAlpha: 0, scale: 0.88 }, { autoAlpha: 1, scale: 1, duration: 0.7, stagger: 0.12 }, 0)
          .fromTo(".vision-rings", { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.75 }, 0.16)
          .fromTo(".vision-rings i", { autoAlpha: 0.25, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.56, stagger: 0.09 }, 0.38)
          .fromTo(".vision-core", { autoAlpha: 0, scale: 0.94, y: 12 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.66 }, 0.62)
          .fromTo(".vision-label", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.14 }, 0.88);
        gsap.to(".vision-rings", {
          rotation: 2, y: isMobile ? -5 : -13, ease: "none",
          scrollTrigger: { trigger: "#vision", start: "top bottom", end: "bottom top", scrub: 1.3 },
        });
        gsap.fromTo(".vision-cta", { autoAlpha: 0, y: 12 }, {
          autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: ".vision-cta", start: "top 88%", toggleActions: "play none none reverse" },
        });
      }, page);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <main className="home-page" ref={pageRef}>
      <div className="home-atmosphere" aria-hidden="true">
        <div className="home-base" />
        <div className="home-color-fields">
          <div className="home-color-field home-color-field-lavender" />
          <div className="home-color-field home-color-field-violet" />
          <div className="home-color-field home-color-field-azure" />
          <div className="home-color-field home-color-field-periwinkle" />
        </div>
        <div className="home-light-bands" />
        <div className="home-light-bands home-light-bands-secondary" />
      </div>
      <nav className="home-nav glass-panel" aria-label="Main navigation">
        <Link href="/" className="home-brand" aria-label="ILUF home"><Mark /><span>ILU<span>F</span></span></Link>
        <div className="home-nav-links"><Link href="#clarity">Inventory</Link><Link href="#purchasing">Purchasing</Link><Link href="#vision">Our direction</Link></div>
        <Link href="/admin" className="home-login">Dashboard <span aria-hidden="true">↗</span></Link>
      </nav>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-copy">
          <div className="home-eyebrow"><span aria-hidden="true">✳</span> INVENTORY, WITH MORE INTELLIGENCE</div>
          <h1 id="home-title"><span className="home-title-line"><span>Inventory</span></span><span className="home-title-line"><span>intelligence.</span></span><span className="home-title-line home-title-accent"><span>Reimagined.</span></span></h1>
          <p>Products, categories, stock, and purchasing in one clear workspace—built to make everyday inventory work easier to follow.</p>
          <div className="home-actions"><Link href="/admin" className="home-primary">Explore Dashboard <span aria-hidden="true">↗</span></Link><Link href="/admin/products" className="home-secondary">Browse Products <span aria-hidden="true">→</span></Link></div>
          <div className="home-features" aria-label="Inventory capabilities">
            <div className="home-feature"><span>01</span><strong>Product<br />catalog</strong></div>
            <div className="home-feature"><span>02</span><strong>Category<br />organization</strong></div>
            <div className="home-feature"><span>03</span><strong>Stock<br />visibility</strong></div>
          </div>
        </div>
        <HeroVisual />
      </section>
      <InventoryClaritySection />
      <PurchasingSection />
      <VisionSection />
      <footer className="home-footer"><span>ILUF / INVENTORY, IN A NEW LIGHT</span><span>BUILT FOR CLEARER OPERATIONS</span></footer>
    </main>
  );
}
