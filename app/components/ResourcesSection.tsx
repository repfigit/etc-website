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
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '1.5em',
              margin: '1.5em 0'
            }}>
              {resources.map((resource) => (
                <a 
                  key={resource._id}
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    border: '2px solid #00ffcc',
                    padding: '1em',
                    textDecoration: 'none',
                    background: '#121212',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#ff6700';
                    e.currentTarget.style.boxShadow = '0 0 10px #00f7ff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#00ffcc';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {resource.thumbnail && (
                    <div style={{ 
                      marginBottom: '0.75em', 
                      textAlign: 'center',
                      background: '#0f5200',
                      padding: '0.5em',
                      border: '1px solid #00ffcc'
                    }}>
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
                  <strong style={{ display: 'block', marginBottom: '0.5em' }}>
                    {resource.title}
                  </strong>
                  {resource.description && (
                    <p style={{ fontSize: '0.9em', margin: 0 }}>
                      {resource.description}
                    </p>
                  )}
                </a>
              ))}
            </div>
            <p style={{ marginTop: '1em', fontSize: '1.1em' }}>
              <Link href="/resources" style={{ fontWeight: 'bold' }}>
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

