'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface Resource {
  _id: string;
  title: string;
  url: string;
  description?: string;
  thumbnail?: {
    filename: string;
    data: Buffer;
    contentType: string;
    size: number;
  };
  featured: boolean;
}

export default function ResourcesPageClient() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      try {
        const response = await fetch('/api/resources');
        const data = await response.json();
        if (data.success) {
          setResources(data.data);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

  return (
    <div className="container">
      <Header />
      <Navigation />
      
      <section className="resources-page-section">
        <h2>All Resources</h2>
        <p>
          <Link href="/#resources" className="resources-page-back-link">← Back to Home</Link>
        </p>
        
        {loading ? (
          <p>Loading resources...</p>
        ) : resources.length > 0 ? (
          <div className="resources-page-grid">
            {resources.map((resource) => (
                <a 
                  key={resource._id}
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="resources-page-card"
                >
                  {resource.featured && (
                    <div className="resources-page-featured-label">
                      FEATURED
                    </div>
                  )}
                  {resource.thumbnail && (
                    <div className="resources-page-thumbnail-container">
                      <img 
                        src={`/api/resources/${resource._id}/thumbnail`}
                        alt={resource.title}
                        className="resources-page-thumbnail"
                      />
                    </div>
                  )}
                <strong className="resources-page-title">
                  {resource.title}
                </strong>
                {resource.description && (
                  <p className="resources-page-description">
                    {resource.description}
                  </p>
                )}
              </a>
            ))}
          </div>
        ) : (
          <p>No resources found.</p>
        )}
      </section>

      <Footer />
    </div>
  );
}
