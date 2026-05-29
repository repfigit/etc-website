'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import EventDateTime from '../components/EventDateTime';

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
  images?: {
    filename: string;
    contentType: string;
    size: number;
    order?: number;
  }[];
}

export default function EventsPageClient() {
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


  return (
    <div className="container">
      <Header />
      <Navigation />
      
      <section className="events-page-section">
        <h2>All Events</h2>
        <p>
          <Link href="/#events" className="events-page-back-link">Back to Home</Link>
        </p>
        
        {loading ? (
          <p>Loading events...</p>
        ) : events.length > 0 ? (
          <ul className="events-page-list">
            {events.map((event) => (
              <li key={event._id} className="event-card">
                <Link href={`/events/${event._id}`} className="event-card-link">
                  {/* Event Topic */}
                  <div className="event-topic-container">
                    <div className="event-topic-link">
                      <strong className="event-topic-text">{event.topic}</strong>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="event-details">
                    <strong className="event-detail-label">Date & Time:</strong> <EventDateTime date={event.date} time={event.time} variant="full" />
                  </div>

                  {/* Presenter */}
                  {event.presenter && (
                    <div className="event-presenter-container">
                      <strong className="event-detail-label">Presenter:</strong> {event.presenter}
                    </div>
                  )}

                  {/* Location */}
                  <div className="event-location-container">
                    <strong className="event-detail-label">Location:</strong> {event.location}
                  </div>

                  {/* Detailed Information Link */}
                  {event.content && (
                    <div className="event-detailed-info">
                      <span className="event-detailed-link">
                        Detailed information available
                      </span>
                    </div>
                  )}

                  {/* Image Thumbnails */}
                  {event.images && event.images.length > 0 && (
                    <div className="event-thumbnails">
                      {event.images.slice(0, 4).map((img, idx) => (
                        <div
                          key={idx}
                          className="event-thumbnail"
                        >
                          <img
                            src={`/api/events/${event._id}/images/${idx}`}
                            alt={img.filename}
                          />
                        </div>
                      ))}
                      {event.images.length > 4 && (
                        <div className="event-thumbnail event-thumbnail-more">
                          +{event.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
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
