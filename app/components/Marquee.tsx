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

  useEffect(() => {
    async function fetchTechItems() {
      try {
        const response = await fetch('/api/tech-list');
        const data = await response.json();
        if (data.success) {
          // Shuffle the array
          const shuffled = [...data.data].sort(() => Math.random() - 0.5);
          setTechItems(shuffled);
        }
      } catch (error) {
        console.error('Error fetching tech items:', error);
      }
    }

    fetchTechItems();
  }, []);

  return (
    <section>
      <div className="marquee" id="marquee">
        <div className="marquee-content">
          <strong>Emerging Technologies:</strong> |···
          {techItems.map((item) => (
            <span key={item._id}>
              |<a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>|···
            </span>
          ))}
          <span className="pacman">
            <Image src="/img/pac-man.gif" alt="Pac-Man" width={16} height={16} unoptimized />
          </span>
        </div>
      </div>
    </section>
  );
}

