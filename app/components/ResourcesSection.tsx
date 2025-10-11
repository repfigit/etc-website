'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Resource {
  _id: string;
  title: string;
  url: string;
  description?: string;
}

export default function ResourcesSection() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchResources() {
      try {
        const response = await fetch('/api/resources?limit=5');
        const data = await response.json();
        if (data.success) {
          setResources(data.data);
          setTotalCount(data.total || data.data.length);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    }

    fetchResources();
  }, []);

  return (
    <section id="resources">
      <div className="image-container">
        <Image src="/img/resources.webp" alt="Technology Resources" width={400} height={400} />
      </div>
      <div className="content-container">
        <h2>Resources</h2>
        <p>Access research papers, legislative updates, and white papers on emerging technologies.</p>
        {resources.length > 0 ? (
          <>
            <ul>
              {resources.map((resource) => (
                <li key={resource._id}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.title}
                  </a>
                  {resource.description && (
                    <> - {resource.description}</>
                  )}
                </li>
              ))}
            </ul>
            {totalCount > 5 && (
              <p style={{ marginTop: '1em', fontSize: '1.1em' }}>
                <Link href="/resources" style={{ fontWeight: 'bold' }}>
                  → View all {totalCount} resources
                </Link>
              </p>
            )}
          </>
        ) : (
          <p>No resources available at this time.</p>
        )}
      </div>
    </section>
  );
}

