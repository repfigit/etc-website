'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function HeroSection() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const targetId = href.substring(2);
      
      // Check if we're on the home page
      const isHomePage = pathname === '/' || pathname === '';
      
      if (isHomePage) {
        // On home page, just scroll to the section
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Not on home page, navigate to home page with hash
        router.push(href);
      }
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-visual" aria-hidden="true" />
      <div className="hero-content">
        <p className="section-kicker">Bicameral. Bipartisan. Future-focused.</p>
        <h1 className="hero-title">
          New Hampshire Emerging Technologies Caucus
        </h1>
        <p className="hero-tagline">
          Helping policymakers understand emerging technologies before they reshape the economy.
        </p>
        <p className="hero-description">
          We convene lawmakers, technologists, entrepreneurs, educators, and civic leaders to advance
          thoughtful governance and practical innovation across the Granite State.
        </p>
        <div className="hero-cta">
          <a 
            href="/#events" 
            className="hero-button primary"
            onClick={(e) => handleSmoothScroll(e, '/#events')}
          >
            Explore Events
          </a>
          <a 
            href="/#resources" 
            className="hero-button secondary"
            onClick={(e) => handleSmoothScroll(e, '/#resources')}
          >
            View Resources
          </a>
        </div>
      </div>
    </section>
  );
}
