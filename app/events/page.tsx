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
      
      <section style={{ display: 'block', marginTop: '2em' }}>
        <h2>All Events</h2>
        <p>
          <Link href="/#events" style={{ fontSize: '0.9em' }}>← Back to Home</Link>
        </p>
        
        {loading ? (
          <p>Loading events...</p>
        ) : events.length > 0 ? (
          <ul>
            {events.map((event) => (
              <li key={event._id} style={{ marginBottom: '1.5em', padding: '1em', border: '1px solid #333', background: '#1a1a1a' }}>
                <Link href={`/events/${event._id}`} style={{ color: '#00ffcc', textDecoration: 'none' }}>
                  <strong style={{ textDecoration: 'underline', fontSize: '1.2em' }}>{event.topic}</strong>
                </Link>
                <br />
                {formatDate(event.date)} at {event.time}
                {event.presenter && (
                  <>
                    <br />
                    Presenter: {event.presenterUrl ? (
                      <a href={event.presenterUrl} target="_blank" rel="noopener noreferrer">{event.presenter}</a>
                    ) : (
                      event.presenter
                    )}
                  </>
                )}
                <br />
                Location: {event.locationUrl ? (
                  <a href={event.locationUrl} target="_blank" rel="noopener noreferrer">{event.location}</a>
                ) : (
                  event.location
                )}
                {event.content && (
                  <>
                    <br />
                    <span style={{ color: '#999', fontSize: '0.9em' }}>📝 Detailed information available</span>
                  </>
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

