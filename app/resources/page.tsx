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
  thumbnail?: string;
  featured: boolean;
}

export default function ResourcesPage() {
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
      
      <section style={{ display: 'block', marginTop: '2em' }}>
        <h2>All Resources</h2>
        <p>
          <Link href="/#resources" style={{ fontSize: '0.9em' }}>← Back to Home</Link>
        </p>
        
        {loading ? (
          <p>Loading resources...</p>
        ) : resources.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
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
                  transition: 'all 0.3s',
                  position: 'relative'
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
                {resource.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5em',
                    right: '0.5em',
                    background: '#ffff00',
                    color: '#000',
                    padding: '0.25em 0.5em',
                    fontSize: '0.75em',
                    fontWeight: 'bold'
                  }}>
                    FEATURED
                  </div>
                )}
                {resource.thumbnail && (
                  <div style={{ marginBottom: '0.75em', textAlign: 'center' }}>
                    <img 
                      src={resource.thumbnail} 
                      alt={resource.title}
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        maxHeight: '150px',
                        border: '1px solid #00ffcc'
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
        ) : (
          <p>No resources found.</p>
        )}
      </section>

      <Footer />
    </div>
  );
}

