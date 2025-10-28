'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Resource {
  _id: string;
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  featured: boolean;
}

export default function ResourcesSection() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchResources() {
      try {
        const response = await fetch('/api/resources?featured=true');
        const data = await response.json();
        if (data.success) {
          setResources(data.data);
          // Get total count of all resources (not just featured)
          const allResponse = await fetch('/api/resources?limit=1');
          const allData = await allResponse.json();
          setTotalCount(allData.total || 0);
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
        <h2>Featured Resources</h2>
        <p>Access research papers, legislative updates, and white papers on emerging technologies.</p>
        {resources.length > 0 ? (
          <>
            <div className="resource-grid">
              {resources.map((resource) => (
                <a 
                  key={resource._id}
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="resource-card"
                >
                  {resource.thumbnail && (
                    <div className="resource-thumbnail-container">
                      <Image 
                        src={resource.thumbnail} 
                        alt={resource.title}
                        width={200}
                        height={150}
                        style={{ 
                          maxWidth: '100%', 
                          height: 'auto'
                        }}
                      />
                    </div>
                  )}
                  <strong className="resource-title">
                    {resource.title}
                  </strong>
                  {resource.description && (
                    <p className="resource-description">
                      {resource.description}
                    </p>
                  )}
                </a>
              ))}
            </div>
            <p className="resources-section-view-all">
              <Link href="/resources" className="resources-section-view-all-link">
                → View all {totalCount} resources
              </Link>
            </p>
          </>
        ) : (
          <p>No featured resources available at this time.</p>
        )}
      </div>
    </section>
  );
}

