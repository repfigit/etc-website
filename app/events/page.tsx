'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface Event {
  _id: string;
  date: string;
  time: string;
  presenter?: string;
  presenterUrl?: string;
  topic: string;
  location: string;
  locationUrl?: string;
  content?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        if (data.success) {
          setEvents(data.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container">
      <Header />
      <Navigation />
      
      <section className="events-page-section">
        <h2>All Events</h2>
        <p>
          <Link href="/#events" className="events-page-back-link">← Back to Home</Link>
        </p>
        
        {loading ? (
          <p>Loading events...</p>
        ) : events.length > 0 ? (
          <ul className="events-page-list">
            {events.map((event) => (
              <li key={event._id} className="event-card">
                {/* Event Topic */}
                <div className="event-topic-container">
                  <Link href={`/events/${event._id}`} className="event-topic-link">
                    <strong className="event-topic-text">{event.topic}</strong>
                  </Link>
                </div>

                {/* Event Details */}
                <div className="event-details">
                  <strong className="event-detail-label">📅 Date & Time:</strong> {formatDate(event.date)} at {event.time}
                </div>

                {/* Presenter */}
                {event.presenter && (
                  <div className="event-presenter-container">
                    <strong className="event-detail-label">👤 Presenter:</strong>                         {event.presenterUrl ? (
                          <a 
                            href={event.presenterUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="event-presenter-link"
                          >
                            {event.presenter}
                          </a>
                        ) : (
                          <span>{event.presenter}</span>
                        )}
                  </div>
                )}

                {/* Location */}
                <div className="event-location-container">
                    <strong className="event-detail-label">📍 Location:</strong> {event.locationUrl ? (
                        <a 
                          href={event.locationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="event-location-link"
                        >
                          {event.location}
                        </a>
                      ) : (
                        <span>{event.location}</span>
                      )}
                </div>

                {/* Detailed Information Link */}
                {event.content && (
                  <div className="event-detailed-info">
                    <Link
                      href={`/events/${event._id}`}
                      className="event-detailed-link"
                    >
                      📝 Detailed information available
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No events found.</p>
        )}
      </section>

      <Footer />
    </div>
  );
}

