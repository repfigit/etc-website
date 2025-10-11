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
        ) : (
          <p>No resources found.</p>
        )}
      </section>

      <Footer />
    </div>
  );
}

