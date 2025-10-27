'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import Header from '../../components/Header';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

interface Event {
  _id: string;
  date: string;
  time: string;
  presenter?: string;
  presenterUrl?: string;
  topic: string;
  location: string;
  locationUrl?: string;
  presentations?: Array<{
    filename: string;
    data: Buffer;
    contentType: string;
    size: number;
    uploadedAt: Date;
  }>;
  content?: string;
  isVisible: boolean;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setEvent(data.data);
        } else {
          setError(data.error || 'Event not found');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPdfModal) {
        setShowPdfModal(false);
        setSelectedPresentation(null);
      }
    };

    if (showPdfModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showPdfModal]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="container">
        <Header />
        <Navigation />
        <section style={{ display: 'block', marginTop: '2em' }}>
          <p>Loading event...</p>
        </section>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container">
        <Header />
        <Navigation />
        <section style={{ display: 'block', marginTop: '2em' }}>
          <h2>Event Not Found</h2>
          <p>{error || 'The requested event could not be found.'}</p>
          <p>
            <Link href="/events" style={{ fontSize: '0.9em' }}>← Back to All Events</Link>
          </p>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container">
      <Header />
      <Navigation />
      
      <section style={{ display: 'block', marginTop: '2em' }}>
        <p>
          <Link href="/events" style={{ fontSize: '0.9em' }}>← Back to All Events</Link>
        </p>
        
        <article style={{ marginTop: '2em' }}>
          <header style={{ marginBottom: '2em', paddingBottom: '1em', borderBottom: '2px solid #00ffcc' }}>
            <h1 style={{ marginBottom: '0.5em', color: '#00ffcc' }}>{event.topic}</h1>
            
            <div style={{ fontSize: '1.1em', marginBottom: '1em' }}>
              <strong>{formatDate(event.date)} at {event.time}</strong>
            </div>
            
            {event.presenter && (
              <div style={{ marginBottom: '0.5em' }}>
                <strong>Presenter: </strong>
                {event.presenterUrl ? (
                  <a 
                    href={event.presenterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#00ffcc' }}
                  >
                    {event.presenter}
                  </a>
                ) : (
                  <span>{event.presenter}</span>
                )}
              </div>
            )}
            
            <div>
              <strong>Location: </strong>
              {event.locationUrl ? (
                <a 
                  href={event.locationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#00ffcc' }}
                >
                  {event.location}
                </a>
              ) : (
                <span>{event.location}</span>
              )}
            </div>
            
            {event.presentations && event.presentations.length > 0 && (
              <div style={{ marginTop: '1em' }}>
                <strong>Presentations ({event.presentations.length}):</strong>
                <div style={{ marginTop: '0.5em' }}>
                  {event.presentations.map((presentation, index) => (
                    <div 
                      key={index}
                      style={{ 
                        marginBottom: '0.5em',
                        padding: '0.75em',
                        background: '#001a1a',
                        border: '1px solid #00ffcc',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                        <span style={{ color: '#ff4444', fontSize: '1.2em' }}>📄</span>
                        <div>
                          <div style={{ color: '#00ffcc', fontWeight: 'bold' }}>
                            {presentation.filename}
                          </div>
                          <div style={{ color: '#888', fontSize: '0.8em' }}>
                            {formatFileSize(presentation.size)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5em' }}>
                        <a 
                          href={`/api/events/${event._id}/presentations/${index}?download=true`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#00ffcc',
                            textDecoration: 'underline',
                            fontSize: '0.9em',
                            padding: '0.25em 0.5em',
                            border: '1px solid #00ffcc',
                            borderRadius: '3px'
                          }}
                        >
                          Download
                        </a>
                        <button
                          onClick={() => {
                            setSelectedPresentation(index.toString());
                            setShowPdfModal(true);
                          }}
                          style={{
                            background: '#00ffcc',
                            color: '#000',
                            border: '1px solid #00ffcc',
                            padding: '0.25em 0.5em',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: 'bold',
                            fontSize: '0.9em',
                            borderRadius: '3px'
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </header>

          {event.content && (
            <div style={{ 
              marginTop: '2em',
              lineHeight: '1.6',
              fontSize: '1.1em',
              animation: 'none',
              textShadow: 'none',
              transform: 'none'
            }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children }) => <h1 style={{ color: '#00ffcc', marginTop: '2em', marginBottom: '1em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ color: '#00ffcc', marginTop: '1.5em', marginBottom: '0.8em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ color: '#00ffcc', marginTop: '1.2em', marginBottom: '0.6em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</h3>,
                  p: ({ children }) => <p style={{ marginBottom: '1em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ marginBottom: '1em', paddingLeft: '2em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ marginBottom: '1em', paddingLeft: '2em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</ol>,
                  li: ({ children }) => <li style={{ marginBottom: '0.5em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</li>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code style={{ 
                        background: '#333', 
                        padding: '0.2em 0.4em', 
                        borderRadius: '3px',
                        fontSize: '0.9em'
                      }}>
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre style={{ 
                      background: '#1a1a1a', 
                      padding: '1em', 
                      borderRadius: '5px', 
                      overflow: 'auto',
                      marginBottom: '1em',
                      border: '1px solid #333'
                    }}>
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote style={{ 
                      borderLeft: '4px solid #00ffcc', 
                      paddingLeft: '1em', 
                      marginLeft: '0',
                      marginBottom: '1em',
                      fontStyle: 'italic',
                      animation: 'none',
                      textShadow: 'none',
                      transform: 'none'
                    }}>
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#00ffcc', textDecoration: 'underline' }}
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div style={{ overflowX: 'auto', marginBottom: '1em' }}>
                      <table style={{ 
                        borderCollapse: 'collapse', 
                        width: '100%',
                        border: '1px solid #333'
                      }}>
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th style={{ 
                      border: '1px solid #333', 
                      padding: '0.5em', 
                      background: '#333',
                      textAlign: 'left'
                    }}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td style={{ 
                      border: '1px solid #333', 
                      padding: '0.5em'
                    }}>
                      {children}
                    </td>
                  ),
                }}
              >
                {event.content}
              </ReactMarkdown>
            </div>
          )}

          {!event.content && (
            <div style={{ 
              marginTop: '2em', 
              padding: '2em', 
              border: '2px dashed #666', 
              textAlign: 'center',
              color: '#999'
            }}>
              <p>No detailed information available for this event.</p>
            </div>
          )}

        </article>
      </section>

      {/* PDF Modal */}
      {showPdfModal && event.presentations && selectedPresentation !== null && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2em'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPdfModal(false);
              setSelectedPresentation(null);
            }
          }}
        >
          <div style={{
            backgroundColor: '#000',
            border: '2px solid #00ffcc',
            borderRadius: '8px',
            width: '90%',
            height: '90%',
            maxWidth: '1200px',
            maxHeight: '800px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: '#00ffcc',
              color: '#000',
              padding: '1em',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #00ffcc'
            }}>
              <span style={{ fontSize: '1.1em' }}>
                📄 {event.presentations[parseInt(selectedPresentation)].filename}
              </span>
              <div style={{ display: 'flex', gap: '0.5em' }}>
                <a 
                  href={`/api/events/${event._id}/presentations/${selectedPresentation}?download=true`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#000',
                    textDecoration: 'underline',
                    fontSize: '0.9em',
                    padding: '0.25em 0.5em',
                    border: '1px solid #000',
                    borderRadius: '3px',
                    background: '#fff'
                  }}
                >
                  Download
                </a>
                <button
                  onClick={() => {
                    setShowPdfModal(false);
                    setSelectedPresentation(null);
                  }}
                  style={{
                    background: '#000',
                    color: '#00ffcc',
                    border: '2px solid #000',
                    padding: '0.25em 0.5em',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.9em',
                    borderRadius: '3px'
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
            
            {/* PDF Viewer */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <iframe
                src={`/api/events/${event._id}/presentations/${selectedPresentation}`}
                width="100%"
                height="100%"
                style={{
                  border: 'none',
                  background: '#fff'
                }}
                title={`Presentation: ${event.presentations[parseInt(selectedPresentation)].filename}`}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
