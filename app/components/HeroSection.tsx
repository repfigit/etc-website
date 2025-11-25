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
      <div className="hero-content">
        <h1 className="hero-title">
          New Hampshire Emerging Technologies Caucus
        </h1>
        <p className="hero-tagline">
          Fostering Innovation, Collaboration, and Progress
        </p>
        <p className="hero-description">
          Empowering New Hampshire&apos;s economy through emerging technologies, 
          thoughtful governance, and forward-thinking policymaking.
        </p>
        <div className="hero-cta">
          <a 
            href="/#mission" 
            className="hero-button primary"
            onClick={(e) => handleSmoothScroll(e, '/#mission')}
          >
            Learn More
          </a>
          <a 
            href="/#contact" 
            className="hero-button secondary"
            onClick={(e) => handleSmoothScroll(e, '/#contact')}
          >
            Get Involved
          </a>
        </div>
      </div>
    </section>
  );
}

