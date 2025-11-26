'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface TechItem {
  _id: string;
  name: string;
  url: string;
}

export default function Marquee() {
  const [techItems, setTechItems] = useState<TechItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollingItems, setScrollingItems] = useState<Set<string>>(new Set());
  // Randomly choose ms-pac-man 10% of the time, otherwise use pac-man
  // Initialize with default to avoid hydration mismatch, then set randomly on client
  const [pacmanImage, setPacmanImage] = useState('/img/pac-man.gif');

  useEffect(() => {
    // Set pacman image randomly on client side only to avoid hydration mismatch
    setPacmanImage(Math.random() < 0.1 ? '/img/ms-pac-man.gif' : '/img/pac-man.gif');

    async function fetchTechItems() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tech-list');
        const data = await response.json();
        if (data.success) {
          // Shuffle the array
          const shuffled = [...data.data].sort(() => Math.random() - 0.5);
          setTechItems(shuffled);
          
          // Randomly select 10% of items to scroll
          const itemsToScroll = shuffled
            .filter(() => Math.random() < 0.1)
            .map(item => item._id);
          setScrollingItems(new Set(itemsToScroll));
        }
      } catch (error) {
        console.error('Error fetching tech items:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTechItems();
  }, []);


  const renderMarqueeContent = () => (
    <>
      <span className="pacman">
        <a href="https://pacman.live/play.html" target="_self" rel="noopener noreferrer">
          <Image src={pacmanImage} alt={pacmanImage === '/img/ms-pac-man.gif' ? 'Ms. Pac-Man' : 'Pac-Man'} width={16} height={16} unoptimized />
        </a>
      </span>
      <strong>Emerging Technologies</strong>
      {techItems.length > 0 ? (
        techItems.map((item) => {
          const shouldScroll = scrollingItems.has(item._id);
          return (
            <span key={item._id} className={shouldScroll ? 'marquee-item-scroll' : ''}>
              <span className="marquee-dots">· · ·</span>|<a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>|
            </span>
          );
        })
      ) : (
        <span className="marquee-loading">Loading technologies...</span>
      )}
      <span className="marquee-dots">· · ·</span>
    </>
  );

  return (
    <section className="marquee-section">
      <div className="marquee-watermark">Emerging Technologies</div>
      <div 
        className="marquee" 
        id="marquee"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`marquee-content ${isPaused ? 'paused' : ''}`}>
          {renderMarqueeContent()}
          {renderMarqueeContent()}
        </div>
      </div>
    </section>
  );
}

