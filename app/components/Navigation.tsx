'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [showEventsMenu, setShowEventsMenu] = useState(false);
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);

  return (
    <div className="nav-container">
      <nav>
        <a href="/#mission">Mission</a>
        <a href="/#initiatives">Initiatives</a>
        <div 
          className="nav-dropdown-container"
          onMouseEnter={() => setShowEventsMenu(true)}
          onMouseLeave={() => setShowEventsMenu(false)}
        >
          <a href="/#events" className="nav-dropdown-cursor">
            Events ▼
          </a>
          {showEventsMenu && (
            <div className="nav-dropdown-menu">
              <a 
                href="/#events" 
                className="nav-dropdown-item with-border"
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
          <a href="/#resources" className="nav-dropdown-cursor">
            Resources ▼
          </a>
          {showResourcesMenu && (
            <div className="nav-dropdown-menu">
              <a 
                href="/#resources" 
                className="nav-dropdown-item with-border"
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
        <a href="/#contact">Contact</a>
      </nav>
    </div>
  );
}

