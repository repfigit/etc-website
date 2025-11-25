'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  const [showEventsMenu, setShowEventsMenu] = useState(false);
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      // Check if nav is sticky (scrolled past header)
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const shouldBeSticky = scrollY > 100;
      
      setIsSticky(shouldBeSticky);

      const sections = ['mission', 'initiatives', 'events', 'resources', 'contact'];
      const scrollPosition = scrollY + 150;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Check immediately on mount

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, []);

  // Handle scrolling to hash when navigating to home page
  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [pathname]);

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
    <div className={`nav-container sticky-nav ${isSticky ? 'is-sticky' : ''}`}>
      <nav>
        {isSticky && (
          <Link href="/" className="nav-logo-container">
            <Image
              className="nav-logo"
              src="/img/favicon/favicon.svg"
              alt="Logo"
              width={20}
              height={20}
            />
            <span className="nav-site-name">NH Emerging Tech Caucus</span>
          </Link>
        )}
        <div className="nav-menu-items">
          <a 
            href="/#mission" 
            className={activeSection === 'mission' ? 'active' : ''}
            onClick={(e) => handleSmoothScroll(e, '/#mission')}
          >
            Mission
          </a>
          <a 
            href="/#initiatives" 
            className={activeSection === 'initiatives' ? 'active' : ''}
            onClick={(e) => handleSmoothScroll(e, '/#initiatives')}
          >
            Initiatives
          </a>
          <div 
            className="nav-dropdown-container"
            onMouseEnter={() => setShowEventsMenu(true)}
            onMouseLeave={() => setShowEventsMenu(false)}
          >
            <a 
              href="/#events" 
              className={`nav-dropdown-cursor ${activeSection === 'events' ? 'active' : ''}`}
              onClick={(e) => handleSmoothScroll(e, '/#events')}
            >
              Events ▼
            </a>
            {showEventsMenu && (
              <div className="nav-dropdown-menu">
                <a 
                  href="/#events" 
                  className="nav-dropdown-item with-border"
                  onClick={(e) => handleSmoothScroll(e, '/#events')}
                >
                  Upcoming & Recent Events
                </a>
                <Link 
                  href="/events"
                  className="nav-dropdown-item"
                >
                  All Events
                </Link>
              </div>
            )}
          </div>
          <div 
            className="nav-dropdown-container"
            onMouseEnter={() => setShowResourcesMenu(true)}
            onMouseLeave={() => setShowResourcesMenu(false)}
          >
            <a 
              href="/#resources" 
              className={`nav-dropdown-cursor ${activeSection === 'resources' ? 'active' : ''}`}
              onClick={(e) => handleSmoothScroll(e, '/#resources')}
            >
              Resources ▼
            </a>
            {showResourcesMenu && (
              <div className="nav-dropdown-menu">
                <a 
                  href="/#resources" 
                  className="nav-dropdown-item with-border"
                  onClick={(e) => handleSmoothScroll(e, '/#resources')}
                >
                  Featured Resources
                </a>
                <Link 
                  href="/resources"
                  className="nav-dropdown-item"
                >
                  All Resources
                </Link>
              </div>
            )}
          </div>
          <a 
            href="/#contact" 
            className={activeSection === 'contact' ? 'active' : ''}
            onClick={(e) => handleSmoothScroll(e, '/#contact')}
          >
            Contact
          </a>
        </div>
      </nav>
    </div>
  );
}

