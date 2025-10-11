'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [showEventsMenu, setShowEventsMenu] = useState(false);

  return (
    <div className="nav-container">
      <nav>
        <a href="#mission">Mission</a>
        <a href="#initiatives">Initiatives</a>
        <div 
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseEnter={() => setShowEventsMenu(true)}
          onMouseLeave={() => setShowEventsMenu(false)}
        >
          <a href="/#events" style={{ cursor: 'pointer' }}>
            Events ▼
          </a>
          {showEventsMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: '#121212',
              border: '2px solid #00f7ff',
              minWidth: '200px',
              zIndex: 1000,
              boxShadow: '0 4px 8px rgba(0, 247, 255, 0.3)'
            }}>
              <a 
                href="/#events" 
                style={{ 
                  display: 'block',
                  padding: '0.5em 1em',
                  borderBottom: '1px solid #00ffcc'
                }}
              >
                Upcoming & Recent Events
              </a>
              <Link 
                href="/events"
                style={{ 
                  display: 'block',
                  padding: '0.5em 1em'
                }}
              >
                All Events
              </Link>
            </div>
          )}
        </div>
        <a href="#resources">Resources</a>
        <a href="#contact">Contact</a>
      </nav>
    </div>
  );
}

