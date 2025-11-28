'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import Header from '../../components/Header';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import ImageCarousel from '../../components/ImageCarousel';
import ShareButton from '../../components/ShareButton';

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
    contentType: string;
    size: number;
    uploadedAt?: string;
  }>;
  images?: Array<{
    filename: string;
    contentType: string;
    size: number;
    uploadedAt?: string;
    order?: number;
  }>;
  content?: string;
  isVisible: boolean;
}

interface Props {
  event: Event;
}

export default function EventDetailClient({ event }: Props) {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPdfModal) {
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

  return (
    <div className="container">
      <Header />
      <Navigation />
      
      <section className="event-detail-section">
        <p>
          <Link href="/events" className="event-detail-back-link">← Back to All Events</Link>
        </p>
        
        <article className="event-detail-article">
          <header className="event-detail-article-header">
            <h1 className="event-detail-topic">
              {event.topic}
              {' '}
              <span className="event-detail-actions">
                <a 
                  href={`/api/events/${event._id}/ical`}
                  download
                  className="event-calendar-icon-large"
                  title="Add to calendar"
                >
                  📅
                </a>
                <ShareButton 
                  url={`/events/${event._id}`}
                  title={event.topic}
                  description={`Join us on ${formatDate(event.date)} at ${event.time} for ${event.topic}${event.presenter ? ` with ${event.presenter}` : ''}.`}
                />
              </span>
            </h1>
            
            <div className="event-detail-datetime">
              <strong>{formatDate(event.date)} at {event.time}</strong>
            </div>
            
            {event.presenter && (
              <div className="event-detail-presenter-container">
                <strong>Presenter: </strong>
                {event.presenterUrl ? (
                  <a 
                    href={event.presenterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="event-detail-presenter-link"
                  >
                    {event.presenter}
                  </a>
                ) : (
                  <span>{event.presenter}</span>
                )}
              </div>
            )}
            
            <div className="event-detail-location-container">
              <strong>Location: </strong>
              {event.locationUrl ? (
                <a 
                  href={event.locationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="event-detail-location-link"
                >
                  {event.location}
                </a>
              ) : (
                <span>{event.location}</span>
              )}
            </div>
            
            {event.presentations && event.presentations.length > 0 && (
              <div className="event-detail-presentations-container">
                <strong>Presentations ({event.presentations.length}):</strong>
                <div className="event-detail-presentations-list">
                  {event.presentations.map((presentation, index) => (
                    <div 
                      key={index}
                      className="event-detail-presentation-item"
                    >
                      <div className="event-detail-presentation-info">
                        <span className="event-detail-presentation-icon">📄</span>
                        <div>
                          <div className="event-detail-presentation-name">
                            {presentation.filename}
                          </div>
                          <div className="event-detail-presentation-size">
                            {formatFileSize(presentation.size)}
                          </div>
                        </div>
                      </div>
                      <div className="event-detail-presentation-actions">
                        <a 
                          href={`/api/events/${event._id}/presentations/${index}?download=true`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="event-detail-download-link"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => {
                            setSelectedPresentation(index.toString());
                            setShowPdfModal(true);
                          }}
                          className="event-detail-view-button"
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

          {event.images && event.images.length > 0 && (
            <div className="event-detail-images">
              <ImageCarousel images={event.images} eventId={event._id} />
            </div>
          )}

          {event.content && (
            <div className="event-detail-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({node, ...props}) => <h2 {...props} />,
                  h2: ({node, ...props}) => <h3 {...props} />,
                  h3: ({node, ...props}) => <h4 {...props} />,
                  a: ({node, ...props}) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                }}
              >
                {event.content}
              </ReactMarkdown>
            </div>
          )}
        </article>
      </section>

      <Footer />

      {/* PDF Modal */}
      {showPdfModal && selectedPresentation !== null && (
        <div 
          className="modal-overlay"
          onClick={() => {
            setShowPdfModal(false);
            setSelectedPresentation(null);
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close-button"
              onClick={() => {
                setShowPdfModal(false);
                setSelectedPresentation(null);
              }}
            >
              ✕
            </button>
            <iframe
              src={`/api/events/${event._id}/presentations/${selectedPresentation}`}
              className="modal-iframe"
              title="Presentation Viewer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
